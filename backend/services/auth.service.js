const https = require('https')
const crypto = require('crypto')
const browserService = require('./browser.service')
const config = require('../config/config')

const sslAgent = new https.Agent({
  rejectUnauthorized: false,
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT
})

const sessions = new Map()
const initialStoredSession = browserService.loadStoredSession()
let activeLoggedInUser = initialStoredSession && initialStoredSession.username ? initialStoredSession.username : null

function cleanOldSessions() {
  const now = Date.now()
  for (const [id, s] of sessions.entries()) {
    if (now - s.createdAt > 15 * 60 * 1000) {
      sessions.delete(id)
    }
  }
}

function mergeCookies(existingCookieStr, setCookieHeaders) {
  if (!setCookieHeaders) return existingCookieStr
  const cookieMap = {}
  if (existingCookieStr) {
    existingCookieStr.split(';').forEach(part => {
      const trimmed = part.trim()
      if (trimmed) {
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx !== -1) {
          const k = trimmed.slice(0, eqIdx).trim()
          const v = trimmed.slice(eqIdx + 1).trim()
          cookieMap[k] = v
        }
      }
    })
  }
  const headersArr = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders]
  headersArr.forEach(h => {
    const main = h.split(';')[0].trim()
    const eqIdx = main.indexOf('=')
    if (eqIdx !== -1) {
      const k = main.slice(0, eqIdx).trim()
      const v = main.slice(eqIdx + 1).trim()
      cookieMap[k] = v
    }
  })
  return Object.keys(cookieMap).map(k => `${k}=${cookieMap[k]}`).join('; ')
}

function createLoginSession() {
  return new Promise((resolve) => {
    cleanOldSessions()
    const req = https.request({
      hostname: 'banglarbhumi.gov.in',
      port: 443,
      path: `${config.portal.contextPath}/viewLoginAreaAction`,
      method: 'POST',
      agent: sslAgent,
      headers: {
        'User-Agent': config.portal.userAgent,
        'Origin': config.portal.baseUrl,
        'Referer': `${config.portal.baseUrl}${config.portal.contextPath}/Home`,
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 15000
    }, res => {
      let rawCookies = res.headers['set-cookie'] || []
      let cookieStr = mergeCookies('', rawCookies)
      let data = ''
      res.on('data', c => data += c)
      res.on('end', async () => {
        const saltMatch = data.match(/name="saltHashtext"\s+value="([^"]+)"/i)
        const salt = saltMatch ? saltMatch[1] : ''
        const sessionId = crypto.randomBytes(16).toString('hex')

        const captchaRes = await fetchCaptchaImage(cookieStr)
        if (captchaRes.cookieStr) {
          cookieStr = mergeCookies(cookieStr, [captchaRes.cookieStr])
        }

        sessions.set(sessionId, {
          cookieStr,
          salt,
          createdAt: Date.now(),
          userType: '2',
          username: '',
          password: '',
          encryptedPass: '',
          encryptedUser: '',
          authenticated: false
        })

        resolve({
          success: true,
          sessionId,
          salt,
          captchaImage: captchaRes.dataUrl
        })
      })
    })

    req.on('error', err => {
      resolve({ success: false, message: err.message })
    })

    req.on('timeout', () => {
      req.destroy()
      resolve({ success: false, message: 'Portal session request timed out.' })
    })

    req.end()
  })
}

function fetchCaptchaImage(cookieStr) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'banglarbhumi.gov.in',
      port: 443,
      path: `${config.portal.contextPath}/generateCaptcha?${Date.now()}`,
      method: 'GET',
      agent: sslAgent,
      headers: {
        'User-Agent': config.portal.userAgent,
        'Referer': `${config.portal.baseUrl}${config.portal.contextPath}/Home`,
        'Cookie': cookieStr
      },
      timeout: 15000
    }, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const buf = Buffer.concat(chunks)
        const mime = res.headers['content-type'] || 'image/png'
        const dataUrl = `data:${mime};base64,${buf.toString('base64')}`
        const setCookie = res.headers['set-cookie']
        resolve({ dataUrl, cookieStr: setCookie ? setCookie.join('; ') : '' })
      })
    })

    req.on('error', () => resolve({ dataUrl: '', cookieStr: '' }))
    req.on('timeout', () => {
      req.destroy()
      resolve({ dataUrl: '', cookieStr: '' })
    })

    req.end()
  })
}

async function refreshCaptcha(sessionId) {
  const session = sessions.get(sessionId)
  if (!session) {
    return { success: false, message: 'Session expired. Please reopen sign-in.' }
  }
  const captchaRes = await fetchCaptchaImage(session.cookieStr)
  if (captchaRes.cookieStr) {
    session.cookieStr = mergeCookies(session.cookieStr, [captchaRes.cookieStr])
  }
  return {
    success: true,
    captchaImage: captchaRes.dataUrl
  }
}

function sendLoginOtp(sessionId, { userType, username, password, captchaText }) {
  return new Promise((resolve) => {
    const session = sessions.get(sessionId)
    if (!session) {
      return resolve({ success: false, message: 'Session expired. Please reopen sign-in.' })
    }

    const salt = session.salt
    const cleanUserType = String(userType || '2').trim()
    const cleanUsername = String(username || '').trim()
    const cleanPassword = String(password || '').trim()
    const cleanCaptcha = String(captchaText || '').trim()

    if (!cleanUsername || !cleanPassword || !cleanCaptcha) {
      return resolve({ success: false, message: 'Please fill in Username, Password, and Captcha.' })
    }

    const md5Pass = crypto.createHash('md5').update(cleanPassword).digest('hex')
    const md5PassSalt = crypto.createHash('md5').update(md5Pass + salt).digest('hex')
    const encPass = crypto.createHash('sha256').update(md5PassSalt).digest('hex')

    const md5User = crypto.createHash('md5').update(cleanUsername).digest('hex')
    const md5UserSalt = crypto.createHash('md5').update(md5User + salt).digest('hex')
    const encUser = crypto.createHash('sha256').update(md5UserSalt).digest('hex')

    session.userType = cleanUserType
    session.username = cleanUsername
    session.encryptedPass = encPass
    session.encryptedUser = encUser

    const params = new URLSearchParams({
      userType: cleanUserType,
      username: cleanUsername,
      txtInput: cleanCaptcha,
      password: encPass,
      saltHashtext: salt,
      ajax: 'true'
    })

    const body = params.toString()

    const req = https.request({
      hostname: 'banglarbhumi.gov.in',
      port: 443,
      path: `${config.portal.contextPath}/loginOTPGenerationAction.action`,
      method: 'POST',
      agent: sslAgent,
      headers: {
        'User-Agent': config.portal.userAgent,
        'Origin': config.portal.baseUrl,
        'Referer': `${config.portal.baseUrl}${config.portal.contextPath}/Home`,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': Buffer.byteLength(body),
        'Cookie': session.cookieStr
      },
      timeout: 18000
    }, res => {
      if (res.headers['set-cookie']) {
        session.cookieStr = mergeCookies(session.cookieStr, res.headers['set-cookie'])
      }
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.message === 'OK') {
            resolve({
              success: true,
              message: 'OTP has been dispatched to your registered mobile and email.',
              checkmsg: parsed.checkmsg || 'OK'
            })
          } else {
            resolve({
              success: false,
              message: parsed.message || 'Portal could not generate OTP. Please verify your credentials and captcha.'
            })
          }
        } catch (e) {
          resolve({
            success: false,
            message: 'Invalid response from Banglarbhumi authentication gateway.'
          })
        }
      })
    })

    req.on('error', err => {
      resolve({ success: false, message: err.message })
    })

    req.on('timeout', () => {
      req.destroy()
      resolve({ success: false, message: 'OTP generation request timed out.' })
    })

    req.write(body)
    req.end()
  })
}

function verifyLoginOtp(sessionId, otp) {
  return new Promise((resolve) => {
    const session = sessions.get(sessionId)
    if (!session) {
      return resolve({ success: false, message: 'Session expired. Please reopen sign-in.' })
    }

    const cleanOtp = String(otp || '').trim()
    if (!cleanOtp) {
      return resolve({ success: false, message: 'Please enter the received OTP.' })
    }

    const encodedUserType = 'RGxycyMxMjM=' + Buffer.from(session.userType).toString('base64')
    const encodedUserId = 'RGxycyMxMjM=' + Buffer.from(session.username).toString('base64')

    const params = new URLSearchParams({
      userType: encodedUserType,
      username: encodedUserId,
      password: session.encryptedPass,
      saltHashtext: session.salt,
      retypepassword: session.encryptedUser,
      txtOTP: cleanOtp,
      ajax: 'true'
    })

    const body = params.toString()

    const req = https.request({
      hostname: 'banglarbhumi.gov.in',
      port: 443,
      path: `${config.portal.contextPath}/login.action`,
      method: 'POST',
      agent: sslAgent,
      headers: {
        'User-Agent': config.portal.userAgent,
        'Origin': config.portal.baseUrl,
        'Referer': `${config.portal.baseUrl}${config.portal.contextPath}/Home`,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': Buffer.byteLength(body),
        'Cookie': session.cookieStr
      },
      timeout: 20000
    }, res => {
      if (res.headers['set-cookie']) {
        session.cookieStr = mergeCookies(session.cookieStr, res.headers['set-cookie'])
      }
      let data = ''
      res.on('data', c => data += c)
      res.on('end', async () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.checkmsg === 'success') {
            session.authenticated = true
            activeLoggedInUser = session.username
            const finalizedCookieStr = await completeAfterLogin(session.cookieStr)
            session.cookieStr = finalizedCookieStr
            browserService.setCachedSessionCookie(finalizedCookieStr, session.username)

            syncToChromeBrowser(finalizedCookieStr).catch(() => {})

            resolve({
              success: true,
              message: 'Citizen login successful! Active session established.',
              username: session.username
            })
          } else {
            resolve({
              success: false,
              message: parsed.message || parsed.exception || 'OTP verification failed. Check the entered OTP.'
            })
          }
        } catch (e) {
          resolve({
            success: false,
            message: 'Unexpected response during login verification.'
          })
        }
      })
    })

    req.on('error', err => {
      resolve({ success: false, message: err.message })
    })

    req.on('timeout', () => {
      req.destroy()
      resolve({ success: false, message: 'OTP verification request timed out.' })
    })

    req.write(body)
    req.end()
  })
}

function completeAfterLogin(cookieStr) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'banglarbhumi.gov.in',
      port: 443,
      path: `${config.portal.contextPath}/AfterLogin.action`,
      method: 'GET',
      agent: sslAgent,
      headers: {
        'User-Agent': config.portal.userAgent,
        'Referer': `${config.portal.baseUrl}${config.portal.contextPath}/Home`,
        'Cookie': cookieStr
      },
      timeout: 10000
    }, res => {
      let updatedCookies = cookieStr
      if (res.headers['set-cookie']) {
        updatedCookies = mergeCookies(cookieStr, res.headers['set-cookie'])
      }
      res.on('data', () => {})
      res.on('end', () => resolve(updatedCookies))
    })
    req.on('error', () => resolve(cookieStr))
    req.on('timeout', () => {
      req.destroy()
      resolve(cookieStr)
    })
    req.end()
  })
}

async function syncToChromeBrowser(cookieStr) {
  try {
    const browser = await browserService.getBrowser({ autoLaunch: false })
    if (!browser || !browser.isConnected()) return
    const pages = await browser.pages()
    const page = pages.find(p => p.url().includes('banglarbhumi.gov.in'))
    if (!page) return

    const cookieObjects = cookieStr.split(';').map(part => {
      const trimmed = part.trim()
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) return null
      return {
        name: trimmed.slice(0, eqIdx).trim(),
        value: trimmed.slice(eqIdx + 1).trim(),
        domain: 'banglarbhumi.gov.in',
        path: '/'
      }
    }).filter(Boolean)

    if (cookieObjects.length > 0) {
      await page.setCookie(...cookieObjects)
    }
  } catch (e) {}
}

async function getAuthStatus() {
  const cookieStr = await browserService.getActiveSessionCookie()
  if (!cookieStr) {
    activeLoggedInUser = null
  } else if (!activeLoggedInUser) {
    const stored = browserService.loadStoredSession()
    activeLoggedInUser = stored && stored.username ? stored.username : null
  }
  return {
    authenticated: !!cookieStr && !!activeLoggedInUser,
    username: activeLoggedInUser
  }
}

function logout() {
  activeLoggedInUser = null
  browserService.clearStoredSession()
  return { success: true, message: 'Logged out successfully.' }
}

module.exports = {
  createLoginSession,
  refreshCaptcha,
  sendLoginOtp,
  verifyLoginOtp,
  getAuthStatus,
  logout
}
