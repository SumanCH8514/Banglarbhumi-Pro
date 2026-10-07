function parsePlotMsgShow(msgHtml) {
  const result = {
    searchType: 'plot',
    liveInfo: '',
    jlno: '',
    thana: '',
    plotDetails: { dagNo: '-', classification: '-', totalArea: '-' },
    holders: [],
    plots: [],
    rawHtml: msgHtml
  }

  const liveMatch = msgHtml.match(/Live Data As On [^)<]+/i)
  if (liveMatch) result.liveInfo = liveMatch[0].trim()

  const jlMatch = msgHtml.match(/J\.l No<\/font><\/b>\s*(\d+)/i) || msgHtml.match(/J\.?l\s*No[^\d]*(\d+)/i)
  if (jlMatch) result.jlno = jlMatch[1]

  const thanaMatch = msgHtml.match(/Thana<\/font><\/b><font[^>]*>\s*([^<&]+)/i) || msgHtml.match(/Thana[^\w]*([A-Za-z\s]+?)(?:<|\/)/i)
  if (thanaMatch) result.thana = thanaMatch[1].trim()

  const plotRowMatch = msgHtml.match(/<tr[^>]*align="center"[^>]*>\s*<td>([^<]+)<\/td>\s*<td>(?:<font[^>]*>)?([^<]+)(?:<\/font>)?<\/td>\s*<td>([^<]+)<\/td>/i) ||
                       msgHtml.match(/<td>(\d+)<\/td>\s*<td>(?:<font[^>]*>)?([^<]+)(?:<\/font>)?<\/td>\s*<td>([\d.]+)<\/td>/i)
  if (plotRowMatch) {
    result.plotDetails = {
      dagNo: plotRowMatch[1].trim(),
      classification: plotRowMatch[2].trim(),
      totalArea: plotRowMatch[3].trim()
    }
  }

  const tbodyMatch = msgHtml.match(/<tbody>([\s\S]*?)<\/tbody>/i)
  if (tbodyMatch) {
    const tbody = tbodyMatch[1]
    const rowRegex = /<tr[^>]*>([\s\S]*?)(?=<tr|$)/gi
    let match
    while ((match = rowRegex.exec(tbody)) !== null) {
      const rowContent = match[1]
      const cells = []
      const rawCells = []
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
      let cellMatch
      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        rawCells.push(cellMatch[1])
        let cellText = cellMatch[1]
          .replace(/<br\s*\/?>/gi, ' ')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim()
        cells.push(cellText)
      }
      if (cells.length >= 5) {
        result.holders.push({
          khatianNo: cells[0] || '',
          ownerName: cells[1] || '',
          fatherOrHusband: cells[2] || '',
          share: cells[3] || '',
          shareArea: cells[4] || '',
          dakhaldar: cells[5] || 'Nil',
          remarks: cells[6] || 'Nil',
          dakhaldarRaw: rawCells[5] || '',
          remarksRaw: rawCells[6] || ''
        })
      }
    }
  }

  return result
}

function parseKhatianMsgShow(msgHtml) {
  const result = {
    searchType: 'khatian',
    liveInfo: '',
    jlno: '',
    thana: '',
    khatianDetails: {
      khatianNo: '',
      ownerName: '',
      fatherOrHusband: '',
      ownerType: '',
      address: '',
      totalArea: '',
      plotCount: ''
    },
    plotDetails: { dagNo: '-', classification: '-', totalArea: '-' },
    holders: [],
    plots: [],
    rawHtml: msgHtml
  }

  const liveMatch = msgHtml.match(/Live Data As On [^)<]+/i)
  if (liveMatch) result.liveInfo = liveMatch[0].trim()

  const jlMatch = msgHtml.match(/J\.?l\s*No[^\d]*(\d+)/i)
  if (jlMatch) result.jlno = jlMatch[1]

  const thanaMatch = msgHtml.match(/Thana\s*<\/font>\s*:\s*&nbsp;<\/b>\s*<font[^>]*>([^<]+)/i) ||
                     msgHtml.match(/Thana[^\w]*([A-Za-z\s]+?)(?:<|\/|&)/i)
  if (thanaMatch) result.thana = thanaMatch[1].trim()

  const khMatch = msgHtml.match(/Khatian\s*No\s*<\/font>[^<]*<\/div><\/th>\s*<th[^>]*><div[^>]*><font[^>]*>([^<]+)<\/font>/i) ||
                  msgHtml.match(/Khatian\s*No.*?(\d+)<\/font>/i)
  if (khMatch) result.khatianDetails.khatianNo = khMatch[1].trim()

  const ownerMatch = msgHtml.match(/Raiter\s*Nam\s*<\/font>[^<]*<\/td>\s*<td>\s*(?:<font[^>]*>)?([^<]+)(?:<\/font>)?<\/td>/i) ||
                     msgHtml.match(/Raiter\s*Nam.*?<td><font[^>]*>([^<]+)/i)
  if (ownerMatch) result.khatianDetails.ownerName = ownerMatch[1].trim()

  const fatherMatch = msgHtml.match(/Pita\/swami\s*<\/font>[^<]*<\/td>\s*<td[^>]*>\s*(?:<font[^>]*>)?([^<]+)(?:<\/font>)?<\/td>/i) ||
                      msgHtml.match(/Pita\/swami.*?<td[^>]*><font[^>]*>([^<]+)/i)
  if (fatherMatch) result.khatianDetails.fatherOrHusband = fatherMatch[1].trim()

  const ownerTypeMatch = msgHtml.match(/Raiter\s*Dharan\s*<\/font>[^<]*<\/td>\s*<td[^>]*>\s*(?:<font[^>]*>)?([^<]+)(?:<\/font>)?<\/td>/i) ||
                         msgHtml.match(/Raiter\s*Dharan.*?<td[^>]*><font[^>]*>([^<]+)/i)
  if (ownerTypeMatch) result.khatianDetails.ownerType = ownerTypeMatch[1].trim()

  const addressMatch = msgHtml.match(/Thikana\s*<\/font>[^<]*<\/td>\s*<td[^>]*>\s*(?:<font[^>]*>)?([^<]+)(?:<\/font>)?<\/td>/i) ||
                       msgHtml.match(/Thikana.*?<td[^>]*><font[^>]*>([^<]+)/i)
  if (addressMatch) result.khatianDetails.address = addressMatch[1].trim()

  const areaMatch = msgHtml.match(/Zamir\s*Pariman\s*<\/font>[^<]*<\/td>\s*<td[^>]*>\s*(?:<font[^>]*>)?([^<]+)(?:<\/font>)?<\/td>/i) ||
                    msgHtml.match(/Zamir\s*Pariman.*?<td[^>]*>([^<]+)/i)
  if (areaMatch) result.khatianDetails.totalArea = areaMatch[1].trim()

  const plotCountMatch = msgHtml.match(/Dager\s*Sankhyan\s*<\/font>[^<]*<\/td>\s*<td[^>]*>\s*(?:<font[^>]*>)?([^<]+)(?:<\/font>)?<\/td>/i) ||
                         msgHtml.match(/Dager\s*Sankhyan.*?<td[^>]*>([^<]+)/i)
  if (plotCountMatch) result.khatianDetails.plotCount = plotCountMatch[1].trim()

  result.plotDetails = {
    dagNo: result.khatianDetails.plotCount ? `${result.khatianDetails.plotCount} Plots` : '-',
    classification: result.khatianDetails.ownerType || 'Byakti',
    totalArea: result.khatianDetails.totalArea || '-'
  }

  const tbMatch = msgHtml.match(/table-fixed[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i) ||
                  msgHtml.match(/<tbody>([\s\S]*?)<\/tbody>/i)

  if (tbMatch) {
    const rawRows = tbMatch[1].split(/<tr/i).filter(r => r.includes('<td'))
    rawRows.forEach(r => {
      const rawCells = [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c => c[1])
      const cells = rawCells.map(c =>
        c.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
      )
      if (cells.length >= 4) {
        result.plots.push({
          plotNo: cells[0] || '',
          classification: cells[1] || '',
          share: cells[2] || '',
          shareArea: cells[3] || '',
          dakhaldar: cells[4] || 'Nil',
          remarks: cells[5] || 'Nil',
          dakhaldarRaw: rawCells[4] || '',
          remarksRaw: rawCells[5] || ''
        })
      }
    })
  }

  if (result.khatianDetails.ownerName) {
    result.holders.push({
      khatianNo: result.khatianDetails.khatianNo || '',
      ownerName: result.khatianDetails.ownerName || '',
      fatherOrHusband: result.khatianDetails.fatherOrHusband || '',
      share: '1.0000',
      shareArea: result.khatianDetails.totalArea || '',
      dakhaldar: result.khatianDetails.address || 'Nil',
      remarks: result.khatianDetails.ownerType || 'Nil'
    })
  }

  return result
}

function parseMsgShow(msgHtml, searchType = 'auto') {
  if (!msgHtml) {
    return {
      searchType: 'plot',
      plotDetails: { dagNo: '-', classification: '-', totalArea: '-' },
      holders: [],
      plots: [],
      khatianDetails: {},
      liveInfo: '',
      jlno: '',
      thana: '',
      rawHtml: ''
    }
  }

  const isKhatian = searchType === 'khatian' || (searchType === 'auto' && (
    msgHtml.includes('Dager Sankhyan') ||
    msgHtml.includes('Raiter Dharan') ||
    msgHtml.includes('Atrasbatber Dager Bibaran') ||
    msgHtml.includes('Khatian No </font>')
  ))

  if (isKhatian) {
    return parseKhatianMsgShow(msgHtml)
  } else {
    return parsePlotMsgShow(msgHtml)
  }
}

function parsePossessorData(data) {
  const possessors = []
  if (!data) return possessors

  if (data.pocTempList && Array.isArray(data.pocTempList) && data.pocTempList.length > 0) {
    for (const item of data.pocTempList) {
      const name = `${item.poc_fname || ''} ${item.poc_lname || ''}`.trim() || item.name || item.pocName || '-'
      const father = item.poc_father || item.father || '-'
      const address = item.poc_add || item.address || '-'
      const remarks = item.poc_remark || item.remarks || '-'
      possessors.push({ name, father, address, remarks })
    }
    return possessors
  }

  if (data.poc_fname || data.poc_father || data.poc_add) {
    const name = `${data.poc_fname || ''} ${data.poc_lname || ''}`.trim() || '-'
    const father = data.poc_father || '-'
    const address = data.poc_add || '-'
    const remarks = data.poc_remark || '-'
    possessors.push({ name, father, address, remarks })
    return possessors
  }

  const rawHtml = typeof data === 'string' ? data : (data.msgShow || data.raw || data.rawHtml || '')
  if (rawHtml && typeof rawHtml === 'string') {
    const rowMatches = rawHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)
    if (rowMatches) {
      for (const row of rowMatches) {
        if (row.includes('<th') || row.toLowerCase().includes('possessor name') || row.includes('দখলদার নাম')) {
          continue
        }
        const cellMatches = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
          m[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
        )
        if (cellMatches.length >= 3) {
          possessors.push({
            name: cellMatches[0] || '-',
            father: cellMatches[1] || '-',
            address: cellMatches[2] || '-',
            remarks: cellMatches[3] || '-'
          })
        }
      }
    }
  }

  return possessors
}

module.exports = {
  parseMsgShow,
  parsePlotMsgShow,
  parseKhatianMsgShow,
  parsePossessorData
}

