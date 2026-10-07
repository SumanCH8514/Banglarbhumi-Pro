const browserService = require('../services/browser.service')

async function getScraperStatus(req, reply) {
  const status = await browserService.getStatus()
  return status
}

async function openBrowser(req, reply) {
  try {
    const res = await browserService.openPortalWindow()
    return res
  } catch (err) {
    return { success: false, message: err.message }
  }
}

module.exports = {
  getScraperStatus,
  openBrowser
}
