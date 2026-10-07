const Fastify = require('fastify')
const buildApp = require('./app')
const config = require('./config/config')

const fastify = Fastify({
  logger: config.env === 'development'
})

async function startServer() {
  try {
    await buildApp(fastify)
    await fastify.listen(config.port, config.host)
    console.log(`🚀 BanglarBhumi Scraper Server listening at http://${config.host}:${config.port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

if (require.main === module) {
  startServer()
}

module.exports = { fastify, startServer }
