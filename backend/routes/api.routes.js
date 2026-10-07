const portalController = require('../controllers/portal.controller')
const browserController = require('../controllers/browser.controller')
const authController = require('../controllers/auth.controller')

async function apiRoutes(fastify, options) {

  fastify.get('/api/v1/districts', portalController.getDistricts)
  fastify.get('/api/v1/blocks', portalController.getBlocks)
  fastify.get('/api/v1/mouzas', portalController.getMouzas)

  fastify.post('/api/v1/get-plot-info', {
    schema: {
      body: {
        type: 'object',
        properties: {
          district: { type: 'string' },
          block: { type: 'string' },
          mouza: { type: 'string' },
          part1: { type: 'string' },
          part2: { type: 'string' },
          searchType: { type: 'string' }
        },
        required: ['district', 'block', 'mouza', 'part1']
      }
    }
  }, portalController.getPlotInfo)

  fastify.post('/api/v1/get-khatian-info', {
    schema: {
      body: {
        type: 'object',
        properties: {
          district: { type: 'string' },
          block: { type: 'string' },
          mouza: { type: 'string' },
          part1: { type: 'string' },
          part2: { type: 'string' },
          searchType: { type: 'string' }
        },
        required: ['district', 'block', 'mouza', 'part1']
      }
    }
  }, portalController.getKhatianInfo)

  fastify.post('/api/v1/get-possessor-info', portalController.getPossessorInfo)

  fastify.get('/api/v1/scraper-status', browserController.getScraperStatus)
  fastify.post('/api/v1/open-browser', browserController.openBrowser)

  fastify.get('/api/v1/auth/session', authController.initSession)
  fastify.get('/api/v1/auth/captcha', authController.refreshCaptcha)
  fastify.post('/api/v1/auth/send-otp', authController.sendOtp)
  fastify.post('/api/v1/auth/verify-otp', authController.verifyOtp)
  fastify.get('/api/v1/auth/status', authController.getStatus)
  fastify.post('/api/v1/auth/logout', authController.logout)
}

module.exports = apiRoutes
