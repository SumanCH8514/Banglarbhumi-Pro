const https = require('https')
const crypto = require('crypto')
const config = require('../config/config')

const sslAgent = new https.Agent({
  rejectUnauthorized: false,
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT
})

function requestAction(actionName, formFields, cookieStr = '') {
  return new Promise((resolve) => {
    const body = new URLSearchParams(formFields).toString()
    const req = https.request({
      hostname: 'banglarbhumi.gov.in',
      port: 443,
      path: `${config.portal.contextPath}/${actionName}`,
      method: 'POST',
      headers: {
        'User-Agent': config.portal.userAgent,
        'Referer': `${config.portal.baseUrl}${config.portal.contextPath}/KnowYourProperty.action`,
        'Origin': config.portal.baseUrl,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': Buffer.byteLength(body),
        ...(cookieStr ? { 'Cookie': cookieStr } : {})
      },
      agent: sslAgent,
      timeout: 15000
    }, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            location: res.headers['location'],
            data: JSON.parse(data)
          })
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            location: res.headers['location'],
            raw: data
          })
        }
      })
    })

    req.on('error', (err) => resolve({ error: true, message: err.message }))
    req.on('timeout', () => {
      req.destroy()
      resolve({ error: true, message: 'Request to portal timed out.' })
    })

    req.write(body)
    req.end()
  })
}

async function fetchMouzas(distCode, blockCode) {
  const res = await requestAction('mouzaPopulation_KUP.action', {
    lstDistrictCode1: distCode,
    lstBlockCode1: blockCode,
    radioSelectionViewType: 'N',
    ajax: 'true'
  })

  if (res && res.data && Array.isArray(res.data.mouzaList)) {
    return res.data.mouzaList.map(m => ({
      moucode: m.moucode,
      name: m.mouName,
      text: m.mouName
    }))
  }
  return []
}

async function fetchBlocks(distCode) {
  const res = await requestAction('blockPopulate_KUP.action', {
    lstDistrictCode1: distCode,
    radioSelectionViewType: 'N',
    ajax: 'true'
  })

  if (res && res.data && Array.isArray(res.data.blockList)) {
    return res.data.blockList.map(b => ({
      bcode: b.blockKey ? b.blockKey.bcode : b.bcode,
      name: b.eng_bname || b.bname,
      text: b.eng_bname || b.bname
    }))
  }
  return []
}

async function fetchPlotDetails(distCode, blockCode, mouzaCode, plotNo, bataPlot, cookieStr) {
  const targetBlockCode = String(blockCode).includes('_') ? String(blockCode) : `${blockCode}_NEW`

  return await requestAction('plotDetailsAction_LandInfo.action', {
    lstDistrictCode1: distCode,
    lstBlockCode1: targetBlockCode,
    lstMouzaList: mouzaCode,
    txtPlotNo: String(plotNo),
    txtBataPlotNo: bataPlot || '',
    radioKhatianDtlType: '0',
    yourLang: 'en_in',
    ajax: 'true'
  }, cookieStr)
}

async function fetchKhatianDetails(distCode, blockCode, mouzaCode, khatianNo, part2, cookieStr) {
  const targetBlockCode = String(blockCode).includes('_') ? String(blockCode) : `${blockCode}_NEW`

  return await requestAction('khDetailsAction_LandInfo.action', {
    lstDistrictCode1: distCode,
    lstBlockCode1: targetBlockCode,
    lstMouzaList: mouzaCode,
    txtKhatian1: String(khatianNo),
    txtKhatian2: part2 || '',
    radioKhatianDtlType: '0',
    yourLang: 'en_in',
    ajax: 'true'
  }, cookieStr)
}

async function fetchPossessorDetails(ktsr, plotNo, moucode, code, type, cookieStr) {
  return await requestAction('poseserDetailsAction_LandInfo.action', {
    ktsr: String(ktsr),
    plotNo: String(plotNo),
    moucode: String(moucode),
    code: String(code || '02'),
    type: String(type || 'NEW'),
    ajax: 'true'
  }, cookieStr)
}

module.exports = {
  requestAction,
  fetchMouzas,
  fetchBlocks,
  fetchPlotDetails,
  fetchKhatianDetails,
  fetchPossessorDetails
}

