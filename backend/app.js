const fs = require('fs')
const path = require('path')
const apiRoutes = require('./routes/api.routes')

const frontendDir = path.join(__dirname, '..', 'frontend')
const landingHtmlPath = path.join(frontendDir, 'index.html')
const appHtmlPath = path.join(frontendDir, 'app.html')
const aboutHtmlPath = path.join(frontendDir, 'about_project.html')

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
}

async function buildApp(fastify, opts = {}) {
  await fastify.register(apiRoutes)

  fastify.get('/', async (req, reply) => {
    reply.type('text/html; charset=UTF-8')
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    reply.header('Pragma', 'no-cache')
    reply.header('Expires', '0')
    if (fs.existsSync(landingHtmlPath)) {
      return fs.readFileSync(landingHtmlPath, 'utf8')
    }
    return fs.readFileSync(appHtmlPath, 'utf8')
  })

  fastify.get('/landing', async (req, reply) => {
    reply.type('text/html; charset=UTF-8')
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    reply.header('Pragma', 'no-cache')
    reply.header('Expires', '0')
    if (fs.existsSync(landingHtmlPath)) {
      return fs.readFileSync(landingHtmlPath, 'utf8')
    }
    return fs.readFileSync(appHtmlPath, 'utf8')
  })

  fastify.get('/app', async (req, reply) => {
    reply.type('text/html; charset=UTF-8')
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    reply.header('Pragma', 'no-cache')
    reply.header('Expires', '0')
    if (fs.existsSync(appHtmlPath)) {
      return fs.readFileSync(appHtmlPath, 'utf8')
    }
    return fs.readFileSync(landingHtmlPath, 'utf8')
  })

  fastify.get('/search', async (req, reply) => {
    reply.type('text/html; charset=UTF-8')
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    reply.header('Pragma', 'no-cache')
    reply.header('Expires', '0')
    if (fs.existsSync(appHtmlPath)) {
      return fs.readFileSync(appHtmlPath, 'utf8')
    }
    return fs.readFileSync(landingHtmlPath, 'utf8')
  })

  fastify.get('/about', async (req, reply) => {
    reply.type('text/html; charset=UTF-8')
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    reply.header('Pragma', 'no-cache')
    reply.header('Expires', '0')
    if (fs.existsSync(aboutHtmlPath)) {
      return fs.readFileSync(aboutHtmlPath, 'utf8')
    }
    return fs.readFileSync(landingHtmlPath, 'utf8')
  })

  fastify.get('/about_project', async (req, reply) => {
    reply.type('text/html; charset=UTF-8')
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    reply.header('Pragma', 'no-cache')
    reply.header('Expires', '0')
    if (fs.existsSync(aboutHtmlPath)) {
      return fs.readFileSync(aboutHtmlPath, 'utf8')
    }
    return fs.readFileSync(landingHtmlPath, 'utf8')
  })

  fastify.get('/*', async (req, reply) => {
    const safePath = path.normalize(req.params['*'] || '').replace(/^(\.\.[\/\\])+/, '')
    if (safePath === 'landing.html') {
      reply.type('text/html; charset=UTF-8')
      reply.header('Cache-Control', 'no-cache, no-store, must-revalidate')
      reply.header('Pragma', 'no-cache')
      reply.header('Expires', '0')
      return fs.createReadStream(landingHtmlPath)
    }
    const filePath = path.join(frontendDir, safePath)
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase()
      reply.type(mimeTypes[ext] || 'application/octet-stream')
      reply.header('Cache-Control', 'no-cache, no-store, must-revalidate')
      reply.header('Pragma', 'no-cache')
      reply.header('Expires', '0')
      return fs.createReadStream(filePath)
    }
    const htmlFilePath = filePath + '.html'
    if (fs.existsSync(htmlFilePath) && fs.statSync(htmlFilePath).isFile()) {
      reply.type('text/html; charset=UTF-8')
      reply.header('Cache-Control', 'no-cache, no-store, must-revalidate')
      reply.header('Pragma', 'no-cache')
      reply.header('Expires', '0')
      return fs.createReadStream(htmlFilePath)
    }
    reply.code(404).send('Not Found')
  })

  return fastify
}

module.exports = buildApp
