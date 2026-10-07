const path = require('path')

module.exports = {
  port: parseInt(process.env.PORT || process.env.BBS_HTTP_PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  env: process.env.NODE_ENV || 'development',
  portal: {
    baseUrl: 'https://banglarbhumi.gov.in',
    contextPath: '/BanglarBhumi',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  },
  chrome: {
    debuggingPort: parseInt(process.env.CHROME_DEBUG_PORT || '9222', 10),
    profileDir: path.resolve(__dirname, '..', '..', '.banglarbhumi-browser')
  }
}
