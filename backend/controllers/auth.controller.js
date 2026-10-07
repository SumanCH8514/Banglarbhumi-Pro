const authService = require('../services/auth.service')

async function initSession(req, reply) {
  const result = await authService.createLoginSession()
  return result
}

async function refreshCaptcha(req, reply) {
  const sessionId = req.query.sessionId
  if (!sessionId) {
    return { success: false, message: 'Session ID is required.' }
  }
  const result = await authService.refreshCaptcha(sessionId)
  return result
}

async function sendOtp(req, reply) {
  const { sessionId, userType, username, password, captchaText } = req.body || {}
  if (!sessionId) {
    return { success: false, message: 'Session ID is required.' }
  }
  const result = await authService.sendLoginOtp(sessionId, { userType, username, password, captchaText })
  return result
}

async function verifyOtp(req, reply) {
  const { sessionId, otp } = req.body || {}
  if (!sessionId || !otp) {
    return { success: false, message: 'Session ID and OTP are required.' }
  }
  const result = await authService.verifyLoginOtp(sessionId, otp)
  return result
}

async function getStatus(req, reply) {
  const status = await authService.getAuthStatus()
  return status
}

async function logout(req, reply) {
  const result = authService.logout()
  return result
}

module.exports = {
  initSession,
  refreshCaptcha,
  sendOtp,
  verifyOtp,
  getStatus,
  logout
}
