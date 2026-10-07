const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const puppeteer = require('puppeteer-extra')
const config = require('../config/config')

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

let sharedBrowser = null
let cachedSessionCookie = ''
const sessionFilePath = path.resolve(__dirname, '..', 'data', 'citizen_session.json')

function loadStoredSession() {
  try {
    if (fs.existsSync(sessionFilePath)) {
      const parsed = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'))
      if (parsed && parsed.cookieStr) {
        if (!parsed.savedAt || (Date.now() - parsed.savedAt < 8 * 60 * 60 * 1000)) {
          return parsed
        }
      }
    }
  } catch (e) {}
  return null
}

function saveStoredSession(cookieStr, username) {
  try {
    const dir = path.dirname(sessionFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    let existing = {}
    if (fs.existsSync(sessionFilePath)) {
      try { existing = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8')) || {} } catch (e) {}
    }
    const toSave = {
      username: username !== undefined && username !== null ? username : (existing.username || null),
      cookieStr: cookieStr || '',
      savedAt: Date.now()
    }
    fs.writeFileSync(sessionFilePath, JSON.stringify(toSave, null, 2), 'utf8')
  } catch (e) {}
}

function clearStoredSession() {
  cachedSessionCookie = ''
  try {
    if (fs.existsSync(sessionFilePath)) {
      fs.unlinkSync(sessionFilePath)
    }
  } catch (e) {}
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function isPortReady() {
  try {
    const res = await fetch(`http://127.0.0.1:${config.chrome.debuggingPort}/json/version`)
    return res.ok
  } catch (e) {
    return false
  }
}

function findSystemChromePath() {
  const customPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_BIN
  if (customPath && fs.existsSync(customPath)) return customPath

  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ]
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c
  }
  return null
}

async function getBrowser(options = {}) {
  const autoLaunch = options.autoLaunch === true
  const headless = options.headless !== false

  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser
  }

  if (await isPortReady()) {
    try {
      const browser = await puppeteer.connect({
        browserURL: `http://127.0.0.1:${config.chrome.debuggingPort}`,
        defaultViewport: null
      })
      sharedBrowser = browser
      sharedBrowser.on('disconnected', () => { sharedBrowser = null })
      return sharedBrowser
    } catch (e) {}
  }

  if (!autoLaunch) {
    return null
  }

  if (!fs.existsSync(config.chrome.profileDir)) {
    fs.mkdirSync(config.chrome.profileDir, { recursive: true })
  }

  if (!headless) {
    const chromeExe = findSystemChromePath()
    if (chromeExe) {
      const proc = spawn(chromeExe, [
        `--remote-debugging-port=${config.chrome.debuggingPort}`,
        `--user-data-dir=${config.chrome.profileDir}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--window-size=1280,900',
        `${config.portal.baseUrl}${config.portal.contextPath}/Home`
      ], {
        detached: true,
        stdio: 'ignore'
      })
      proc.unref()

      for (let i = 0; i < 30; i++) {
        await sleep(500)
        if (await isPortReady()) break
      }
    }
  }

  try {
    if (await isPortReady()) {
      const browser = await puppeteer.connect({
        browserURL: `http://127.0.0.1:${config.chrome.debuggingPort}`,
        defaultViewport: null
      })
      sharedBrowser = browser
      sharedBrowser.on('disconnected', () => { sharedBrowser = null })
      return sharedBrowser
    }
  } catch (err) {}

  const browser = await puppeteer.launch({
    headless: headless ? 'new' : false,
    userDataDir: config.chrome.profileDir,
    args: [
      `--remote-debugging-port=${config.chrome.debuggingPort}`,
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--window-size=1280,900'
    ],
    defaultViewport: null
  })
  sharedBrowser = browser
  sharedBrowser.on('disconnected', () => { sharedBrowser = null })
  return sharedBrowser
}

async function getActiveSessionCookie() {
  if (cachedSessionCookie) return cachedSessionCookie

  const stored = loadStoredSession()
  if (stored && stored.cookieStr) {
    cachedSessionCookie = stored.cookieStr
    return cachedSessionCookie
  }

  try {
    const browser = await getBrowser({ autoLaunch: false })
    if (browser && browser.isConnected()) {
      const pages = await browser.pages()
      const portalPage = pages.find(p => p.url().includes('banglarbhumi.gov.in'))
      if (portalPage) {
        const cookies = await portalPage.cookies()
        if (cookies && cookies.length > 0) {
          cachedSessionCookie = cookies.map(c => `${c.name}=${c.value}`).join('; ')
          saveStoredSession(cachedSessionCookie)
          return cachedSessionCookie
        }
      }
    }
  } catch (e) {}
  return ''
}

function setCachedSessionCookie(cookieStr, username) {
  cachedSessionCookie = cookieStr || ''
  if (cookieStr) {
    saveStoredSession(cookieStr, username)
  } else {
    clearStoredSession()
  }
}

async function getStatus() {
  try {
    const res = await fetch(`http://127.0.0.1:${config.chrome.debuggingPort}/json`)
    if (res.ok) {
      const tabs = await res.json()
      const portalTab = tabs.find(t => t.url && t.url.includes('banglarbhumi.gov.in'))
      return {
        connected: true,
        portalTabOpen: !!portalTab,
        portalUrl: portalTab ? portalTab.url : null
      }
    }
  } catch (e) {}
  return { connected: false, portalTabOpen: false }
}

async function openPortalWindow() {
  const browser = await getBrowser({ autoLaunch: true, headless: false })
  const pages = await browser.pages()
  let portalPage = pages.find(p => p.url().includes('banglarbhumi.gov.in'))
  if (!portalPage) {
    portalPage = pages.length > 0 ? pages[0] : await browser.newPage()
    await portalPage.goto(`${config.portal.baseUrl}${config.portal.contextPath}/Home`, {
      waitUntil: 'domcontentloaded'
    })
  } else {
    await portalPage.bringToFront()
  }

  await portalPage.evaluate(() => {
    const closeBtn = document.querySelector('#close-popup') || document.querySelector('button.close')
    if (closeBtn) closeBtn.click()
  }).catch(() => {})

  return { success: true, message: 'Chrome portal window is open and ready' }
}

module.exports = {
  getBrowser,
  getActiveSessionCookie,
  setCachedSessionCookie,
  clearStoredSession,
  loadStoredSession,
  getStatus,
  openPortalWindow
}
