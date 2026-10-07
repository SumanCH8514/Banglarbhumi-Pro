const net = require('net')
const Fastify = require('fastify')
const buildApp = require('./app')
const config = require('./config/config')

function isPortAvailable(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const s = net.createServer()
    s.once('error', () => resolve(false))
    s.listen(port, host, () => {
      s.close(() => resolve(true))
    })
  })
}

async function resolveAvailablePort(startPort, host) {
  let targetPort = startPort
  while (targetPort < startPort + 20) {
    const free = await isPortAvailable(targetPort, host)
    if (free) return targetPort
    targetPort++
  }
  return startPort
}

const fastify = Fastify({
  logger: config.env === 'development'
})

async function startServer() {
  try {
    await buildApp(fastify)
    const targetPort = await resolveAvailablePort(config.port, '127.0.0.1')
    await fastify.listen(targetPort, config.host)
    console.log(`\n🚀 BanglarBhumi Pro Server running at:`)
    console.log(`   Local:   http://localhost:${targetPort}/`)
    console.log(`   App:     http://localhost:${targetPort}/app`)
    console.log(`   Network: http://${config.host}:${targetPort}/\n`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

if (require.main === module) {
  startServer()
}

module.exports = { fastify, startServer }
