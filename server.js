const { fastify, startServer } = require('./backend/server')

if (require.main === module) {
  startServer()
}

module.exports = { fastify, startServer }
