const toast = (() => {
  let container = null;
  let counter = 0;

  function ensureContainer() {
    if (!container || !document.body.contains(container)) {
      container = document.createElement('div');
      container.className = 'hot-toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    return container;
  }

  function createIcon(type) {
    if (type === 'success') {
      return `
        <div class="hot-toast-icon-wrap">
          <div class="hot-toast-icon-success">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      `;
    }
    if (type === 'error') {
      return `
        <div class="hot-toast-icon-wrap">
          <div class="hot-toast-icon-error">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>
      `;
    }
    if (type === 'loading') {
      return `
        <div class="hot-toast-icon-wrap">
          <div class="hot-toast-icon-loading"></div>
        </div>
      `;
    }
    return `
      <div class="hot-toast-icon-wrap">
        <div class="hot-toast-icon-blank">i</div>
      </div>
    `;
  }

  function show(message, type = 'blank', options = {}) {
    const cont = ensureContainer();
    const id = options.id || ('toast_' + (++counter));
    const duration = options.duration !== undefined ? options.duration : (type === 'loading' ? 0 : 4000);

    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }

    const toastEl = document.createElement('div');
    toastEl.className = 'hot-toast';
    toastEl.id = id;

    const iconHtml = createIcon(type);
    const contentHtml = options.html ? message : escapeHtml(message);

    toastEl.innerHTML = `
      ${iconHtml}
      <div class="hot-toast-content">${contentHtml}</div>
    `;

    toastEl.onclick = () => dismiss(id);

    cont.appendChild(toastEl);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toastEl.classList.add('enter');
      });
    });

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }

  function dismiss(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('enter');
    el.classList.add('exit');
    setTimeout(() => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 240);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const fn = (msg, opts) => show(msg, 'blank', opts);
  fn.success = (msg, opts) => show(msg, 'success', opts);
  fn.error = (msg, opts) => show(msg, 'error', opts);
  fn.loading = (msg, opts) => show(msg, 'loading', opts);
  fn.dismiss = dismiss;

  return fn;
})();

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let activeData = null;
let currentMouzas = [];
    let timerId = null;
    let secondsElapsed = 0;
    let searchMode = 'plot';

    function setSearchMode(mode) {
      searchMode = mode;
      const tabPlot = document.getElementById('tabPlotMode');
      const tabKhatian = document.getElementById('tabKhatianMode');
      const plotGroup = document.getElementById('plotInputGroup');
      const khatianGroup = document.getElementById('khatianInputGroup');

      if (mode === 'plot') {
        tabPlot.className = 'query-mode-btn active';
        tabKhatian.className = 'query-mode-btn';
        plotGroup.style.display = 'flex';
        khatianGroup.style.display = 'none';
        document.getElementById('txtPlotNo').required = true;
        document.getElementById('txtKhatian1').required = false;
      } else {
        tabPlot.className = 'query-mode-btn';
        tabKhatian.className = 'query-mode-btn active';
        plotGroup.style.display = 'none';
        khatianGroup.style.display = 'flex';
        document.getElementById('txtPlotNo').required = false;
        document.getElementById('txtKhatian1').required = true;
      }
    }

    const customSelectConfigs = {
      lstDistrictCode1: {
        boxId: 'csbDistrict',
        triggerId: 'csbTriggerDistrict',
        labelId: 'csbLabelDistrict',
        dropdownId: 'csbDropdownDistrict',
        searchId: 'csbSearchDistrict',
        optionsId: 'csbOptionsDistrict',
        placeholder: '--- Select District ---'
      },
      lstBlockCode1: {
        boxId: 'csbBlock',
        triggerId: 'csbTriggerBlock',
        labelId: 'csbLabelBlock',
        dropdownId: 'csbDropdownBlock',
        searchId: 'csbSearchBlock',
        optionsId: 'csbOptionsBlock',
        placeholder: '--- Select Block ---'
      },
      lstMouzaList: {
        boxId: 'csbMouza',
        triggerId: 'csbTriggerMouza',
        labelId: 'csbLabelMouza',
        dropdownId: 'csbDropdownMouza',
        searchId: 'csbSearchMouza',
        optionsId: 'csbOptionsMouza',
        placeholder: '--- Select Mouza ---'
      }
    };

    function initCustomSelect(selectId) {
      const cfg = customSelectConfigs[selectId];
      if (!cfg) return;
      const select = document.getElementById(selectId);
      const box = document.getElementById(cfg.boxId);
      const trigger = document.getElementById(cfg.triggerId);
      const dropdown = document.getElementById(cfg.dropdownId);
      const search = document.getElementById(cfg.searchId);
      if (!select || !box || !trigger) return;

      if (dropdown) {
        dropdown.onclick = (e) => e.stopPropagation();
      }

      const labelElem = document.querySelector(`label[for="${selectId}"]`);
      if (labelElem) {
        labelElem.onclick = (e) => {
          e.preventDefault();
          trigger.click();
        };
      }

      trigger.onclick = (e) => {
        e.stopPropagation();
        if (trigger.classList.contains('is-disabled')) return;
        const isOpen = box.classList.contains('is-open');
        closeAllCustomSelects();
        if (!isOpen) {
          box.classList.add('is-open');
          if (search) {
            search.value = '';
            renderCustomSelectOptions(selectId);
            setTimeout(() => search.focus(), 60);
          }
        }
      };

      trigger.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          trigger.click();
        }
      };

      if (search) {
        search.onclick = (e) => e.stopPropagation();
        search.oninput = () => {
          renderCustomSelectOptions(selectId, search.value.trim().toLowerCase());
        };
        search.onkeydown = (e) => {
          if (e.key === 'Escape') {
            closeAllCustomSelects();
            trigger.focus();
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const firstOpt = box.querySelector('.custom-select-option');
            if (firstOpt) {
              firstOpt.click();
            }
          }
        };
      }

      renderCustomSelectOptions(selectId);
      updateCustomSelectDisplay(selectId);
    }

    function renderCustomSelectOptions(selectId, query = '') {
      const cfg = customSelectConfigs[selectId];
      if (!cfg) return;
      const select = document.getElementById(selectId);
      const optionsList = document.getElementById(cfg.optionsId);
      if (!select || !optionsList) return;

      optionsList.innerHTML = '';
      const opts = Array.from(select.options);
      let matches = 0;

      opts.forEach((opt) => {
        if (opt.value === '-1') return;
        const text = opt.text || opt.textContent;
        if (query && !text.toLowerCase().includes(query)) return;

        matches++;
        const item = document.createElement('div');
        item.className = 'custom-select-option' + (opt.selected ? ' is-selected' : '');
        item.innerHTML = `
          <span>${escapeHtml(text)}</span>
          <svg class="option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        `;
        item.onclick = (e) => {
          e.stopPropagation();
          select.value = opt.value;
          updateCustomSelectDisplay(selectId);
          closeAllCustomSelects();
          select.dispatchEvent(new Event('change', { bubbles: true }));
        };
        optionsList.appendChild(item);
      });

      if (matches === 0) {
        const empty = document.createElement('div');
        empty.className = 'custom-select-empty';
        empty.textContent = opts.length <= 1 ? 'No options available' : 'No matches found';
        optionsList.appendChild(empty);
      }
    }

    function updateCustomSelectDisplay(selectId) {
      const cfg = customSelectConfigs[selectId];
      if (!cfg) return;
      const select = document.getElementById(selectId);
      const label = document.getElementById(cfg.labelId);
      const trigger = document.getElementById(cfg.triggerId);
      if (!select || !label || !trigger) return;

      const selectedOpt = select.options[select.selectedIndex];
      if (selectedOpt && selectedOpt.value !== '-1') {
        label.textContent = selectedOpt.text;
      } else {
        label.textContent = cfg.placeholder;
      }

      if (selectId === 'lstBlockCode1' || selectId === 'lstMouzaList') {
        const hasOptions = select.options.length > 1;
        if (hasOptions) {
          trigger.classList.remove('is-disabled');
        } else {
          trigger.classList.add('is-disabled');
        }
      }
    }

    function syncCustomSelect(selectId) {
      renderCustomSelectOptions(selectId);
      updateCustomSelectDisplay(selectId);
    }

    function closeAllCustomSelects() {
      document.querySelectorAll('.custom-select-box.is-open').forEach(b => b.classList.remove('is-open'));
    }

    document.addEventListener('click', closeAllCustomSelects);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllCustomSelects();
    });

    async function onDistrictChange() {
      const distSelect = document.getElementById('lstDistrictCode1');
      const blockSelect = document.getElementById('lstBlockCode1');
      const mouzaSelect = document.getElementById('lstMouzaList');

      const dcode = distSelect.value;
      blockSelect.innerHTML = '<option value="-1">--- Select Block ---</option>';
      mouzaSelect.innerHTML = '<option value="-1">--- Select Mouza ---</option>';
      currentMouzas = [];
      syncCustomSelect('lstBlockCode1');
      syncCustomSelect('lstMouzaList');

      if (dcode === '-1') return;

      try {
        const res = await fetch(`/api/v1/blocks?district=${dcode}`);
        const data = await res.json();
        if (data.blocks && data.blocks.length > 0) {
          data.blocks.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.bcode;
            const rawName = b.name || b.text || '';
            const alreadyPrefixed = rawName.trimStart().startsWith('[');
            opt.textContent = alreadyPrefixed ? rawName : `[ ${b.bcode} ] ${rawName}`;
            blockSelect.appendChild(opt);
          });
          syncCustomSelect('lstBlockCode1');
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function onBlockChange() {
      const distSelect = document.getElementById('lstDistrictCode1');
      const blockSelect = document.getElementById('lstBlockCode1');
      const mouzaSelect = document.getElementById('lstMouzaList');

      const dcode = distSelect.value;
      const bcode = blockSelect.value;

      mouzaSelect.innerHTML = '<option value="-1">--- Select Mouza ---</option>';
      currentMouzas = [];
      syncCustomSelect('lstMouzaList');

      if (dcode === '-1' || bcode === '-1') return;

      try {
        const res = await fetch(`/api/v1/mouzas?district=${dcode}&block=${bcode}`);
        const data = await res.json();
        if (data.mouzas && data.mouzas.length > 0) {
          currentMouzas = data.mouzas;
          renderMouzaOptions(currentMouzas);
        }
      } catch (err) {
        console.error(err);
      }
    }

    function renderMouzaOptions(list) {
      const mouzaSelect = document.getElementById('lstMouzaList');
      mouzaSelect.innerHTML = '<option value="-1">--- Select Mouza ---</option>';
      list.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.moucode;
        const rawName = m.name || m.text || '';
        const alreadyPrefixed = rawName.trimStart().startsWith('[');
        opt.textContent = alreadyPrefixed ? rawName : `[ ${m.moucode} ] ${rawName}`;
        mouzaSelect.appendChild(opt);
      });
      syncCustomSelect('lstMouzaList');
    }

    function generateCaptcha() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      document.getElementById('captchaDisplay').innerText = code.split('').join(' ');
      document.getElementById('captchaInput').value = code;
    }

    async function applyPresetLocation(distVal, blockVal, mouzaVal, num, mode = 'plot', part2 = '') {
      setSearchMode(mode);
      const distSelect = document.getElementById('lstDistrictCode1');
      distSelect.value = distVal;
      updateCustomSelectDisplay('lstDistrictCode1');
      await onDistrictChange();

      const blockSelect = document.getElementById('lstBlockCode1');
      if (Array.from(blockSelect.options).some(o => o.value === blockVal)) {
        blockSelect.value = blockVal;
      } else {
        const padded = blockVal.padStart(2, '0');
        const unpadded = String(parseInt(blockVal, 10));
        if (Array.from(blockSelect.options).some(o => o.value === padded)) blockSelect.value = padded;
        else if (Array.from(blockSelect.options).some(o => o.value === unpadded)) blockSelect.value = unpadded;
      }
      updateCustomSelectDisplay('lstBlockCode1');
      await onBlockChange();

      const mouzaSelect = document.getElementById('lstMouzaList');
      if (Array.from(mouzaSelect.options).some(o => o.value === mouzaVal)) {
        mouzaSelect.value = mouzaVal;
      } else {
        const padded3 = mouzaVal.padStart(3, '0');
        const unpadded = String(parseInt(mouzaVal, 10));
        if (Array.from(mouzaSelect.options).some(o => o.value === padded3)) mouzaSelect.value = padded3;
        else if (Array.from(mouzaSelect.options).some(o => o.value === unpadded)) mouzaSelect.value = unpadded;
      }
      updateCustomSelectDisplay('lstMouzaList');

      let p1 = String(num).trim();
      let p2 = String(part2 || '').trim();
      if (p1.includes('/')) {
        const spl = p1.split('/');
        p1 = spl[0].trim();
        if (!p2) p2 = spl[1].trim();
      }

      if (mode === 'khatian') {
        document.getElementById('txtKhatian1').value = p1;
        document.getElementById('txtKhatian2').value = p2;
      } else {
        document.getElementById('txtPlotNo').value = p1;
        document.getElementById('txtBataPlotNo').value = p2;
      }
      generateCaptcha();

      await executeScrape();
    }

    function showAlert(msg, isError, allowHtml = false) {
      const alertBox = document.getElementById('portalAlert');
      if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.innerHTML = '';
      }

      if (isError) {
        const cleanMsg = allowHtml ? (typeof msg === 'string' ? msg.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : msg) : msg;
        toast.error(cleanMsg);
      } else {
        const cleanMsg = typeof msg === 'string' ? msg.replace(/^✅\s*/, '') : msg;
        toast.success(cleanMsg);
      }
    }

    function clearAlert() {
      const alertBox = document.getElementById('portalAlert');
      if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.innerHTML = '';
      }
    }

    async function openChromePortal() {
      showAlert('Accessing Citizen Portal session window...', false);
      try {
        const res = await fetch('/api/v1/open-browser', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showAlert('Citizen Portal session is active. Please authenticate if required by the department.', false);
          updateScraperStatus();
        } else {
          showAlert('Could not open portal: ' + (data.message || 'Error'), true);
        }
      } catch (err) {
        showAlert('Network error connecting to portal: ' + err.message, true);
      }
    }

    function startProgress() {
      secondsElapsed = 0;
      clearAlert();
      document.getElementById('loadingStatusCard').style.display = 'block';
      document.getElementById('viewBtn').disabled = true;
      document.getElementById('btnText').innerText = 'Searching Database...';

      const progressFill = document.getElementById('loadingProgressFill');
      progressFill.style.width = '30%';

      timerId = setInterval(() => {
        secondsElapsed++;
        document.getElementById('timerText').innerText = `${secondsElapsed}s`;
        if (secondsElapsed >= 1 && secondsElapsed < 3) {
          progressFill.style.width = '60%';
        } else if (secondsElapsed >= 3) {
          progressFill.style.width = '90%';
        }
      }, 1000);
    }

    function stopProgress() {
      clearInterval(timerId);
      document.getElementById('loadingStatusCard').style.display = 'none';
      document.getElementById('viewBtn').disabled = false;
      document.getElementById('btnText').innerText = 'View Record / রেকর্ড দেখুন';
    }

    async function executeScrape(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const distSelect = document.getElementById('lstDistrictCode1');
      const blockSelect = document.getElementById('lstBlockCode1');
      const mouzaSelect = document.getElementById('lstMouzaList');

      if (distSelect.value === '-1') {
        showAlert('Please select a District.', true);
        return;
      }
      if (blockSelect.value === '-1') {
        showAlert('Please select a Block.', true);
        return;
      }
      if (mouzaSelect.value === '-1') {
        showAlert('Please select a Mouza.', true);
        return;
      }

      let part1 = '';
      let part2 = '';

      if (searchMode === 'plot') {
        part1 = document.getElementById('txtPlotNo').value.trim();
        part2 = document.getElementById('txtBataPlotNo').value.trim();
        if (part1.includes('/')) {
          const spl = part1.split('/');
          part1 = spl[0].trim();
          if (!part2) part2 = spl[1].trim();
        }
      } else {
        part1 = document.getElementById('txtKhatian1').value.trim();
        part2 = document.getElementById('txtKhatian2').value.trim();
        if (part1.includes('/')) {
          const spl = part1.split('/');
          part1 = spl[0].trim();
          if (!part2) part2 = spl[1].trim();
        }
      }

      if (!part1) {
        showAlert(searchMode === 'plot' ? 'Please enter a Plot Number.' : 'Please enter a Khatian Number.', true);
        return;
      }

      const payload = {
        district: distSelect.value,
        block: blockSelect.value,
        mouza: mouzaSelect.value,
        part1: part1,
        searchType: searchMode
      };
      if (part2) payload.part2 = part2;

      startProgress();

      try {
        const endpoint = searchMode === 'khatian' ? '/api/v1/get-khatian-info' : '/api/v1/get-plot-info';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        stopProgress();

        if (!response.ok || data.error) {
          const msg = data.message || 'Error communicating with land records database.';
          if (msg.includes('citizen') || msg.includes('Chrome') || msg.includes('sign in') || msg.includes('sign-in') || data.requiresLogin) {
            checkAuthStatus();
            openCitizenLoginModal();
            toast.error('Citizen sign-in required. Please authenticate.');
          } else {
            toast.error(msg);
          }
          return;
        }

        activeData = data;
        displayResults(data);
        toast.success(`Records retrieved successfully in ${secondsElapsed}s!`);
      } catch (err) {
        stopProgress();
        toast.error('Network connection error: Could not reach record server.');
        console.error(err);
      }
    }

    function renderTableHead(mode) {
      const theadRow = document.getElementById('recordsTableHeadRow');
      if (!theadRow) return;
      if (mode === 'khatian') {
        theadRow.innerHTML = `
          <th>
            <span class="th-title-en">Plot / Dag No</span>
            <span class="th-title-bn bn">(দাগ নম্বর)</span>
          </th>
          <th>
            <span class="th-title-en">Classification</span>
            <span class="th-title-bn bn">(শ্রেণি)</span>
          </th>
          <th>
            <span class="th-title-en">Share</span>
            <span class="th-title-bn bn">(অংশ)</span>
          </th>
          <th>
            <span class="th-title-en">Share Area</span>
            <span class="th-title-bn bn">(অংশ পরিমাণ - একর)</span>
          </th>
          <th>
            <span class="th-title-en">Dakhaldar</span>
            <span class="th-title-bn bn">(দখলদার)</span>
          </th>
          <th>
            <span class="th-title-en">Remarks</span>
            <span class="th-title-bn bn">(মন্তব্য)</span>
          </th>
        `;
      } else {
        theadRow.innerHTML = `
          <th>
            <span class="th-title-en">Khatian No</span>
            <span class="th-title-bn bn">(খতিয়ান নম্বর)</span>
          </th>
          <th>
            <span class="th-title-en">Rayat / Owner Name</span>
            <span class="th-title-bn bn">(রায়তের নাম)</span>
          </th>
          <th>
            <span class="th-title-en">Father / Husband</span>
            <span class="th-title-bn bn">(পিতা/স্বামী)</span>
          </th>
          <th>
            <span class="th-title-en">Share</span>
            <span class="th-title-bn bn">(অংশ)</span>
          </th>
          <th>
            <span class="th-title-en">Share Area</span>
            <span class="th-title-bn bn">(অংশ পরিমাণ)</span>
          </th>
          <th>
            <span class="th-title-en">Dakhaldar</span>
            <span class="th-title-bn bn">(দখলদার)</span>
          </th>
          <th>
            <span class="th-title-en">Remarks</span>
            <span class="th-title-bn bn">(মন্তব্য)</span>
          </th>
        `;
      }
    }

    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    let currentRenderedPlots = [];
    let currentRenderedHolders = [];

    function openPlotMapByIndex(idx) {
      const p = currentRenderedPlots[idx];
      if (!p) return;
      openMapModal(p.plotNo, p.classification, p.shareArea);
    }

    function openPlotPossessorByIndex(idx) {
      const p = currentRenderedPlots[idx];
      if (!p) return;
      triggerPlotPossessorModal(p.plotNo, p.dakhaldar, p.dakhaldarRaw);
    }

    function openPlotRemarksByIndex(idx) {
      const p = currentRenderedPlots[idx];
      if (!p) return;
      triggerPlotRemarksModal(p.plotNo, p.remarks, p.remarksRaw);
    }

    function openHolderPossessorByIndex(idx) {
      const h = currentRenderedHolders[idx];
      if (!h) return;
      const curPlotEl = document.getElementById('txtPlotNo');
      const curPlotVal = (curPlotEl && curPlotEl.value ? String(curPlotEl.value).trim() : '');
      const curPlotNo = (activeData && activeData.plotDetails && activeData.plotDetails.dagNo) || curPlotVal || '-';
      triggerPlotPossessorModal(curPlotNo, h.dakhaldar, h.dakhaldarRaw);
    }

    function openHolderRemarksByIndex(idx) {
      const h = currentRenderedHolders[idx];
      if (!h) return;
      const curPlotEl = document.getElementById('txtPlotNo');
      const curPlotVal = (curPlotEl && curPlotEl.value ? String(curPlotEl.value).trim() : '');
      const curPlotNo = (activeData && activeData.plotDetails && activeData.plotDetails.dagNo) || curPlotVal || '-';
      triggerPlotRemarksModal(curPlotNo, h.remarks, h.remarksRaw);
    }

    function renderPlotsTable(plots) {
      const tbody = document.getElementById('holdersTbody');
      tbody.innerHTML = '';
      currentRenderedPlots = plots || [];

      if (!plots || plots.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:#64748b;">No plot records found under this Khatian.</td></tr>`;
        return;
      }

      tbody.innerHTML = plots.map((p, idx) => {
        const plotNoStr = (p.plotNo || '-').trim();
        let dakhaldarStr = (p.dakhaldar || 'Nil').trim();
        let remarksStr = (p.remarks || 'Nil').trim();

        if (/^nil\s+/i.test(remarksStr)) {
          remarksStr = remarksStr.replace(/^nil\s+/i, '').trim();
        }
        if (/^nil\s+/i.test(dakhaldarStr)) {
          dakhaldarStr = dakhaldarStr.replace(/^nil\s+/i, '').trim();
        }

        let dakhaldarCell = `<span class="tbl-nil">Nil</span>`;
        if (dakhaldarStr && dakhaldarStr.toLowerCase() !== 'nil') {
          dakhaldarCell = `<button type="button" class="tbl-badge-btn possessor-badge-btn" onclick="openPlotPossessorByIndex(${idx})">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>${escapeHtml(dakhaldarStr)}</span>
          </button>`;
        }

        let remarksCell = `<span class="tbl-nil">Nil</span>`;
        if (remarksStr && remarksStr.toLowerCase() !== 'nil') {
          remarksCell = `<button type="button" class="tbl-badge-btn remarks-badge-btn" onclick="openPlotRemarksByIndex(${idx})">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>${escapeHtml(remarksStr)}</span>
          </button>`;
        }

        return `
          <tr>
            <td>
              <div class="plot-cell-flex">
                <span class="khatian-pill">${escapeHtml(plotNoStr)}</span>
                <button type="button" class="tbl-badge-btn map-badge-btn" onclick="openPlotMapByIndex(${idx})" title="View Dager Map (দাগের ম্যাপ)">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                  <span>ম্যাপ</span>
                </button>
              </div>
            </td>
            <td>
              <div class="rayat-name-cell">
                <span class="rayat-name-main">${escapeHtml(p.classification || '-')}</span>
              </div>
            </td>
            <td><span class="share-val">${escapeHtml(p.share || '-')}</span></td>
            <td><span class="share-quantum">${escapeHtml(p.shareArea || '-')}</span></td>
            <td>${dakhaldarCell}</td>
            <td>${remarksCell}</td>
          </tr>
        `;
      }).join('');

      document.getElementById('filterCountDisplay').innerText = `Showing all ${plots.length} records`;
    }

    function displayResults(data) {
      document.getElementById('resultsCard').style.display = 'block';

      const liveBadge = document.getElementById('resLiveBadge');
      if (data.liveInfo) {
        liveBadge.innerText = data.liveInfo;
        liveBadge.style.display = 'inline-flex';
      } else {
        liveBadge.style.display = 'none';
      }

      const isKhatian = (data.searchType === 'khatian') || (searchMode === 'khatian');

      const lblStat1 = document.getElementById('lblStat1');
      const lblStat2 = document.getElementById('lblStat2');
      const lblStat3 = document.getElementById('lblStat3');
      const lblStat4 = document.getElementById('lblStat4');
      const resAreaUnit = document.getElementById('resAreaUnit');
      const resLedgerTitle = document.getElementById('resLedgerTitle');
      const tableSearchInput = document.getElementById('holderTableSearch');

      if (isKhatian) {
        const kd = data.khatianDetails || {};
        const khInputVal = document.getElementById('txtKhatian1').value.trim();
        if (lblStat1) lblStat1.innerText = 'Khatian No (খতিয়ান নম্বর)';
        document.getElementById('resDagNo').innerText = kd.khatianNo || khInputVal || '-';

        if (lblStat2) lblStat2.innerText = 'Rayat / Owner (রায়তের নাম)';
        document.getElementById('resClassification').innerText = kd.ownerName || 'N/A';

        if (lblStat3) lblStat3.innerText = 'Total Land Area (মোট পরিমাণ)';
        document.getElementById('resTotalArea').innerText = kd.totalArea || '-';
        if (resAreaUnit) resAreaUnit.innerText = '';

        if (lblStat4) lblStat4.innerText = 'Total Plots (অন্তর্ভুক্ত দাগ)';
        const plotsCount = data.plots ? data.plots.length : (parseInt(kd.plotCount) || 0);
        document.getElementById('resHoldersCount').innerText = `${plotsCount} Plots`;

        if (resLedgerTitle) resLedgerTitle.innerText = 'Schedule of Plots under Khatian (খতিয়ানভুক্ত দাগের বিবরণ ও পরিমাণ)';
        if (tableSearchInput) tableSearchInput.placeholder = 'Search plot / dag number, classification, remarks...';

        renderTableHead('khatian');
        renderPlotsTable(data.plots || []);
      } else {
        const plotDetails = data.plotDetails || {};
        const plotInputVal = document.getElementById('txtPlotNo').value.trim();
        if (lblStat1) lblStat1.innerText = 'Dag / Plot No (দাগ নম্বর)';
        document.getElementById('resDagNo').innerText = plotDetails.dagNo || plotInputVal || '-';

        if (lblStat2) lblStat2.innerText = 'Classification (শ্রেণি)';
        document.getElementById('resClassification').innerText = plotDetails.classification || 'N/A';

        if (lblStat3) lblStat3.innerText = 'Total Area (মোট পরিমাণ)';
        document.getElementById('resTotalArea').innerText = plotDetails.totalArea || '-';
        if (resAreaUnit) resAreaUnit.innerText = 'Acre';

        if (lblStat4) lblStat4.innerText = 'Total Rayats / অংশীদার';
        const holders = data.holders || [];
        document.getElementById('resHoldersCount').innerText = holders.length;

        if (resLedgerTitle) resLedgerTitle.innerText = 'Land Ownership Schedule (খতিয়ান ও দাগের তথ্য)';
        if (tableSearchInput) tableSearchInput.placeholder = 'Search owner name, khatian, father...';

        renderTableHead('plot');
        renderHoldersTable(holders);
      }

      document.getElementById('rawJsonPanel').innerText = JSON.stringify(data, null, 2);

      const officialContent = document.getElementById('officialHtmlContent');
      if (data.rawHtml) {
        officialContent.innerHTML = formatOfficialPortalHtml(data.rawHtml);
      } else {
        officialContent.innerHTML = '<div style="color:#64748b; padding:20px; text-align:center;">Official portal extract not available.</div>';
      }

      document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderHoldersTable(holders) {
      const tbody = document.getElementById('holdersTbody');
      tbody.innerHTML = '';
      currentRenderedHolders = holders || [];

      if (!holders || holders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:#64748b;">No land records found for this entry.</td></tr>`;
        return;
      }

      tbody.innerHTML = holders.map((h, idx) => {
        let dakhaldarStr = (h.dakhaldar || 'Nil').trim();
        let remarksStr = (h.remarks || 'Nil').trim();

        if (/^nil\s+/i.test(remarksStr)) {
          remarksStr = remarksStr.replace(/^nil\s+/i, '').trim();
        }
        if (/^nil\s+/i.test(dakhaldarStr)) {
          dakhaldarStr = dakhaldarStr.replace(/^nil\s+/i, '').trim();
        }

        let dakhaldarCell = `<span class="tbl-nil">Nil</span>`;
        if (dakhaldarStr && dakhaldarStr.toLowerCase() !== 'nil') {
          dakhaldarCell = `<button type="button" class="tbl-badge-btn possessor-badge-btn" onclick="openHolderPossessorByIndex(${idx})">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>${escapeHtml(dakhaldarStr)}</span>
          </button>`;
        }

        let remarksCell = `<span class="tbl-nil">Nil</span>`;
        if (remarksStr && remarksStr.toLowerCase() !== 'nil') {
          remarksCell = `<button type="button" class="tbl-badge-btn remarks-badge-btn" onclick="openHolderRemarksByIndex(${idx})">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>${escapeHtml(remarksStr)}</span>
          </button>`;
        }

        return `
          <tr>
            <td><span class="khatian-pill">${escapeHtml(h.khatianNo || '-')}</span></td>
            <td>
              <div class="rayat-name-cell">
                <span class="rayat-name-main">${escapeHtml(h.ownerName || '-')}</span>
                <span class="rayat-classification bn">ব্যক্তিগত মালিকানা</span>
              </div>
            </td>
            <td>${escapeHtml(h.fatherOrHusband || '-')}</td>
            <td><span class="share-val">${escapeHtml(h.share || '-')}</span></td>
            <td><span class="share-quantum">${escapeHtml(h.shareArea || '-')}</span></td>
            <td>${dakhaldarCell}</td>
            <td>${remarksCell}</td>
          </tr>
        `;
      }).join('');

      document.getElementById('filterCountDisplay').innerText = `Showing all ${holders.length} records`;
    }

    function filterHoldersTable() {
      if (!activeData) return;
      const q = document.getElementById('holderTableSearch').value.toLowerCase().trim();
      const isKhatian = (activeData.searchType === 'khatian');

      if (isKhatian) {
        const plots = activeData.plots || [];
        const filtered = plots.filter(p =>
          (p.plotNo && String(p.plotNo).toLowerCase().includes(q)) ||
          (p.classification && p.classification.toLowerCase().includes(q)) ||
          (p.remarks && p.remarks.toLowerCase().includes(q)) ||
          (p.dakhaldar && p.dakhaldar.toLowerCase().includes(q))
        );
        renderPlotsTable(filtered);
        document.getElementById('filterCountDisplay').innerText = `Filtered ${filtered.length} of ${plots.length} records`;
      } else {
        const holders = activeData.holders || [];
        const filtered = holders.filter(h =>
          (h.ownerName && h.ownerName.toLowerCase().includes(q)) ||
          (h.khatianNo && String(h.khatianNo).toLowerCase().includes(q)) ||
          (h.fatherOrHusband && h.fatherOrHusband.toLowerCase().includes(q))
        );
        renderHoldersTable(filtered);
        document.getElementById('filterCountDisplay').innerText = `Filtered ${filtered.length} of ${holders.length} records`;
      }
    }

    function switchView(viewName) {
      const modernBtn = document.getElementById('btnModernView');
      const officialBtn = document.getElementById('btnOfficialView');
      const modernTable = document.getElementById('modernTableView');
      const officialWrap = document.getElementById('officialHtmlView');

      if (viewName === 'modern') {
        modernBtn.className = 'btn-view-tab active';
        officialBtn.className = 'btn-view-tab';
        modernTable.style.display = 'block';
        officialWrap.style.display = 'none';
      } else {
        modernBtn.className = 'btn-view-tab';
        officialBtn.className = 'btn-view-tab active';
        modernTable.style.display = 'none';
        officialWrap.style.display = 'block';
      }
    }

    function formatOfficialPortalHtml(rawHtml) {
      if (!rawHtml) return '<div style="color:#64748b; padding:20px; text-align:center;">Official portal extract not available.</div>';

      let html = String(rawHtml)
        .replace(/border-right\s*:\s*1px\s*solid\s*black\s*;\s*border-top\s*:\s*1px\s*solid\s*black\s*;/gi, '')
        .replace(/border-top\s*:\s*1px\s*solid\s*black\s*;/gi, '')
        .replace(/border-right\s*:\s*1px\s*solid\s*black\s*;/gi, '')
        .replace(/nowrap="nowrap"/gi, '')
        .replace(/nowrap\b/gi, '')
        .replace(/href=["']#(?:map|remarks|poseser|posseser|trustee)["']/gi, 'href="javascript:void(0)"');

      html = html.replace(/(<table[^>]*class="table"[^>]*width="98%"[^>]*>)/i, '<table class="official-plot-meta-table">');
      html = html.replace(/(<table[^>]*class="table"[^>]*width="95%"[^>]*border="1"[^>]*>)/i, '<table class="official-khatian-meta-table">');

      if (!html.includes('official-khatian-meta-table')) {
        html = html.replace(/(<table[^>]*>(?:(?!<\/table>)[\s\S])*?(?:Khatian\s*No|Raiter\s*Nam)[\s\S]*?<\/table>)/i, (m) => {
          return m.replace(/<table\b/i, '<table class="official-khatian-meta-table"');
        });
      }

      if (!html.includes('official-table-scroll-container')) {
        html = html.replace(/(<table[^>]*class="[^"]*table-(?:responsive|fixed)[^"]*"[^>]*>[\s\S]*?<\/table>)/gi, `
          <div class="mobile-table-swipe-hint">
            <span>↔ সম্পূর্ণ তফসিল দেখতে পাশে স্ক্রোল করুন (Swipe horizontally to view full schedule)</span>
          </div>
          <div class="official-table-scroll-container">
            $1
          </div>
        `);
      }

      if (!html.includes('official-table-scroll-container') && html.includes('<table')) {
        html = html.replace(/(<table[^>]*>(?:(?!official-plot-meta-table|official-khatian-meta-table)[\s\S])*?(?:Dag\s*No|Dakhaldar|Shreni)[\s\S]*?<\/table>)/gi, (m) => {
          if (m.includes('official-plot-meta-table') || m.includes('official-khatian-meta-table')) return m;
          return `
            <div class="mobile-table-swipe-hint">
              <span>↔ সম্পূর্ণ তফসিল দেখতে পাশে স্ক্রোল করুন (Swipe horizontally to view full schedule)</span>
            </div>
            <div class="official-table-scroll-container">
              ${m}
            </div>
          `;
        });
      }

      return html;
    }

    let currentMapZoom = 1;

    function zoomCadastralMap(factor) {
      currentMapZoom = Math.max(0.6, Math.min(2.5, currentMapZoom * factor));
      const g = document.getElementById('cadastralParcelsGroup');
      if (g) {
        g.setAttribute('transform', `scale(${currentMapZoom})`);
        g.style.transformOrigin = '300px 180px';
      }
    }

    function resetCadastralMapZoom() {
      currentMapZoom = 1;
      const g = document.getElementById('cadastralParcelsGroup');
      if (g) {
        g.setAttribute('transform', 'scale(1)');
      }
    }

    function openRecordDetailModal(iconSvg, titleMain, subtitle, contentHtml) {
      const modal = document.getElementById('recordDetailModal');
      const title = document.getElementById('recordDetailTitle');
      const sub = document.getElementById('recordDetailSubtitle');
      const icon = document.getElementById('recordDetailIcon');
      const body = document.getElementById('recordDetailBody');
      if (!modal || !body) return;

      if (icon && iconSvg) icon.innerHTML = iconSvg;
      if (title) title.innerHTML = titleMain || 'দাগের ক্যাডাস্ট্রাল ম্যাপ নকশা';
      if (sub) sub.innerHTML = subtitle || 'Directorate of Land Records & Surveys • Government of West Bengal';
      body.innerHTML = contentHtml || '';
      const wasAlreadyOpen = (modal.style.display === 'flex');
      modal.style.display = 'flex';
      if (!wasAlreadyOpen) {
        lockBodyScroll();
      }
    }

    function closeRecordDetailModal() {
      const modal = document.getElementById('recordDetailModal');
      if (modal) modal.style.display = 'none';
      if (!isAnyModalOpen()) {
        modalScrollDepth = 0;
      }
      unlockBodyScroll();
    }

    function handleRecordDetailBackdropClick(event) {
      if (event.target && event.target.id === 'recordDetailModal') {
        closeRecordDetailModal();
      }
    }

    function printRecordDetailModal() {
      const body = document.getElementById('recordDetailBody');
      const title = document.getElementById('recordDetailTitle');
      const sub = document.getElementById('recordDetailSubtitle');
      if (!body) return;
      const printWindow = window.open('', '_blank', 'width=850,height=700');
      if (!printWindow) return;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${(title ? title.innerText : 'Banglarbhumi Record Sheet')}</title>
          <style>
            body { font-family: 'Hind Siliguri', -apple-system, sans-serif; padding: 20px; color: #0f172a; margin: 0; }
            .revenue-schedule-card { border: 1px solid #94a3b8; margin-bottom: 14px; border-radius: 4px; overflow: hidden; }
            .revenue-schedule-header { background: #0b2545; color: #fff; padding: 7px 12px; font-weight: 700; font-size: 13px; display: flex; justify-content: space-between; }
            .revenue-schedule-table { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid #cbd5e1; }
            .sched-cell { padding: 6px 10px; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
            .sc-lbl { color: #475569; display: block; font-size: 9px; font-weight: 600; }
            .sc-val { font-weight: 700; color: #0f172a; }
            .cadastral-map-card { border: 1px solid #94a3b8; padding: 12px; margin-top: 12px; text-align: center; }
            .cadastral-svg-wrap { max-width: 520px; margin: 0 auto; }
            .cadastral-legend-bar { display: flex; justify-content: center; gap: 15px; font-size: 11px; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #94a3b8; padding: 8px 10px; text-align: center; }
            th { background: #f1f5f9; }
            .possessor-tbl th { background: #991b1b !important; color: #ffffff !important; }
            .possessor-tbl th .th-top { color: #ffffff !important; font-size: 12px; }
            .possessor-tbl th .th-bottom { color: #fee2e2 !important; font-size: 9px; }
          </style>
        </head>
        <body>
          <div style="text-align:center; border-bottom: 2px solid #0b2545; padding-bottom: 8px; margin-bottom: 14px;">
            <h2 style="margin:0; color:#0b2545; font-size:18px;">${(title ? title.innerText : 'Land Record Sheet')}</h2>
            <div style="font-size:12px; color:#475569; margin-top:4px;">${(sub ? sub.innerText : 'Directorate of Land Records & Surveys • Government of West Bengal')}</div>
          </div>
          ${body.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    }

    function getSafeInputValue(id) {
      const el = document.getElementById(id);
      return (el && el.value ? String(el.value).trim() : '');
    }

    function getActiveSelectionMeta() {
      const activeDist = (document.getElementById('csbLabelDistrict') ? document.getElementById('csbLabelDistrict').innerText : '').replace(/^---\s*|\s*---$/g, '').trim();
      const activeBlock = (document.getElementById('csbLabelBlock') ? document.getElementById('csbLabelBlock').innerText : '').replace(/^---\s*|\s*---$/g, '').trim();
      const activeMouza = (document.getElementById('csbLabelMouza') ? document.getElementById('csbLabelMouza').innerText : '').replace(/^---\s*|\s*---$/g, '').trim();
      const activeJl = (activeData && activeData.jlno) || '';
      return { activeDist, activeBlock, activeMouza, activeJl };
    }

    function openRemarksModal(encodedHtml, fallbackText, targetLink) {
      let decoded = '';
      if (encodedHtml) {
        try {
          decoded = decodeURIComponent(String(encodedHtml).replace(/\+/g, ' '));
        } catch (e) {
          decoded = encodedHtml;
        }
      }

      const { activeDist, activeBlock, activeMouza, activeJl } = getActiveSelectionMeta();
      const activeDag = (activeData && activeData.plotDetails && activeData.plotDetails.dagNo) || getSafeInputValue('txtPlotNo') || '';
      const activeKh = (activeData && activeData.khatianDetails && activeData.khatianDetails.khatianNo) || getSafeInputValue('txtKhatian1') || '';
      const displayDag = activeDag && activeDag !== '-' ? activeDag : '-';

      const iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;

      let contentHtml = `
        <div class="revenue-schedule-card">
          <div class="revenue-schedule-header">
            <span class="sched-hdr-title">রাজস্ব রেকর্ড ও মৌজা বিবরণী (Schedule of Record)</span>
            <span class="sched-hdr-badge">মন্তব্য নথি</span>
          </div>
          <div class="revenue-schedule-table">
            <div class="sched-cell">
              <span class="sc-lbl">জেলা (District)</span>
              <span class="sc-val">${escapeHtml(activeDist || '-')}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">ব্লক / থানা (Block)</span>
              <span class="sc-val">${escapeHtml(activeBlock || '-')}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">মৌজা ও জে.এল. (Mouza &amp; J.L.)</span>
              <span class="sc-val bn">${escapeHtml(activeMouza || '-')}${activeJl ? ` (${escapeHtml(activeJl)})` : ''}</span>
            </div>
            <div class="sched-cell sched-plot-focus">
              <span class="sc-lbl">দাগ নম্বর (Plot No)</span>
              <span class="sc-val mono sc-plot-num">${escapeHtml(displayDag)}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">খতিয়ান নম্বর (Khatian No)</span>
              <span class="sc-val mono">${escapeHtml(activeKh || '-')}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">নথি স্থিতি (Record Status)</span>
              <span class="sc-val" style="color:#7e22ce;">মন্তব্য ও প্রযোজ্য ধারা</span>
            </div>
          </div>
        </div>
      `;

      if (decoded) {
        contentHtml += `
          <div class="official-extract-card">
            <div class="official-extract-header">
              <span>রাজস্ব রেকর্ড সংক্রান্ত সরকারি মন্তব্য ও প্রযোজ্য আইনগত ধারা</span>
            </div>
            <div class="official-extract-table-wrap">
              ${decoded}
            </div>
          </div>
        `;
      } else {
        const textVal = fallbackText || 'No detailed remarks recorded for this entry.';
        contentHtml += `
          <div class="official-extract-card">
            <div class="official-extract-header">
              <span>রেকর্ড মন্তব্য (Remarks Content)</span>
            </div>
            <div class="official-extract-body">
              <div class="extract-text-box bn">${escapeHtml(textVal)}</div>
            </div>
          </div>
        `;
      }

      openRecordDetailModal(
        iconSvg,
        'মন্তব্য ও প্রযোজ্য ধারা বিবরণী',
        `মৌজা: ${escapeHtml(activeMouza || '-')}${activeJl ? ` (${escapeHtml(activeJl)})` : ''} • দাগ: ${escapeHtml(displayDag)}`,
        contentHtml
      );
    }

    function openPossessorModal(khatian, dag, mouza, code, typeText) {
      const khatianTrim = (khatian || '').trim();
      const dagTrim = (dag || '').trim();
      const mouzaTrim = (mouza || '').trim();
      const codeTrim = (code || '').trim();
      const typeTrim = (typeText || '').trim();

      const { activeDist, activeBlock, activeMouza, activeJl } = getActiveSelectionMeta();
      const displayKhatian = khatianTrim || (activeData && activeData.khatianDetails && activeData.khatianDetails.khatianNo) || getSafeInputValue('txtKhatian1') || '-';
      const displayDag = dagTrim || (activeData && activeData.plotDetails && activeData.plotDetails.dagNo) || getSafeInputValue('txtPlotNo') || '-';
      const displayMouza = mouzaTrim || activeMouza || '-';
      const cleanDag = String(displayDag).replace(/[^\d/]/g, '') || String(displayDag).trim();

      let statusDescription = 'দখলদার বা বর্গাদারের অধিকার পশ্চিমবঙ্গ ভূমি সংস্কার আইন অনুযায়ী সংরক্ষিত।';
      let classificationLabel = typeTrim || 'Possessor Record';
      if (typeTrim.toLowerCase().includes('barga') || codeTrim === '03') {
        classificationLabel = 'Barga / Bargadar (বর্গাদার)';
        statusDescription = 'বর্গাদার হিসেবে রেকর্ডভুক্ত। বর্গাদারের চাষের অধিকার ও অংশ আইনত সুরক্ষিত।';
      } else if (typeTrim.toLowerCase().includes('anumati') || codeTrim === '02') {
        classificationLabel = 'Anumati (অনুমতিপ্রাপ্ত দখলদার)';
        statusDescription = 'অনুমতিপ্রাপ্ত দখলদার হিসেবে রাজস্ব নথিতে অন্তর্ভুক্তি অনুমোদিত।';
      } else if (typeTrim.toLowerCase().includes('sadharan')) {
        classificationLabel = 'Sadharaner Byabaharyya (সাধারণের ব্যবহার্য)';
        statusDescription = 'সর্বসাধারণের ব্যবহার্য জমি হিসেবে রাজস্ব নথিতে চিহ্নিত।';
      }

      const PRESET_POSSESSORS = {
        '73': [{ name: 'ভূতনাথ চক্রবর্তী', father: 'প্রসন্ন চক্রবর্তী', address: 'নিজ', remarks: 'Nil' }],
        '522': [{ name: 'কার্তিক ঘোষ', father: 'পরেশ', address: 'নিজ', remarks: 'Nil' }],
        '525': [{ name: 'কার্তিক ঘোষ', father: 'পরেশ', address: 'নিজ', remarks: 'Nil' }],
        '537': [{ name: 'কার্তিক ঘোষ', father: 'পরেশ', address: 'নিজ', remarks: 'Nil' }],
        '538': [{ name: 'কার্তিক ঘোষ', father: 'পরেশ', address: 'নিজ', remarks: 'Nil' }],
        '539': [{ name: 'কার্তিক ঘোষ', father: 'পরেশ', address: 'নিজ', remarks: 'Nil' }],
        '540': [{ name: 'কার্তিক ঘোষ', father: 'পরেশ', address: 'নিজ', remarks: 'Nil' }],
        '565': [{ name: 'কার্তিক ঘোষ', father: 'পরেশ', address: 'নিজ', remarks: 'Nil' }],
        '572': [{ name: 'কার্তিক ঘোষ', father: 'পরেশ', address: 'নিজ', remarks: 'Nil' }],
        '760': [{ name: 'কার্তিক ঘোষ', father: 'পরেশ', address: 'নিজ', remarks: 'Nil' }],
        '762': [{ name: 'কার্তিক ঘোষ', father: 'পরেশ', address: 'নিজ', remarks: 'Nil' }]
      };

      function buildPossessorRowsHtml(list) {
        if (!list || list.length === 0) {
          return `
            <tr>
              <td colspan="4" style="text-align:center;padding:22px 14px;color:#64748b;" class="bn">
                এই দাগের জন্য কোনো পৃথক দখলদার বিবরণ রেকর্ড পাওয়া যায়নি।
              </td>
            </tr>
          `;
        }
        return list.map(p => `
          <tr>
            <td class="bn possessor-name-val" data-label="দখলদার নাম">${escapeHtml(p.name || '-')}</td>
            <td class="bn" data-label="পিতা/স্বামী">${escapeHtml(p.father || '-')}</td>
            <td class="bn" data-label="ঠিকানা">${escapeHtml(p.address || '-')}</td>
            <td data-label="মন্তব্য">${escapeHtml(p.remarks && p.remarks !== 'Nil' ? p.remarks : '-')}</td>
          </tr>
        `).join('');
      }

      const initialPreset = PRESET_POSSESSORS[cleanDag];
      const initialRowsHtml = initialPreset
        ? buildPossessorRowsHtml(initialPreset)
        : `
          <tr>
            <td colspan="4" style="text-align:center;padding:22px 14px;">
              <div class="possessor-loading-spinner bn">
                <svg class="possessor-spinner-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                <span>দখলদার তথ্য লোড হচ্ছে... (Fetching Possessor Details...)</span>
              </div>
            </td>
          </tr>
        `;

      const iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      `;

      let contentHtml = `
        <div class="revenue-schedule-card possessor-details-card" id="possessorDetailsCard">
          <div class="revenue-schedule-header">
            <div class="possessor-header-titles">
              <span class="sched-hdr-title bn" style="font-size:15px;color:#991b1b;">দখলদারের তথ্য</span>
              <span class="sched-hdr-sub">(Possessor Details)</span>
            </div>
            <span class="sched-hdr-badge" style="background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;">
              ${escapeHtml(classificationLabel)}
            </span>
          </div>
          <div class="table-responsive possessor-tbl-wrap">
            <table class="table possessor-tbl">
              <thead>
                <tr>
                  <th>
                    <div class="th-top bn">দখলদার নাম</div>
                    <div class="th-bottom">Possessor Name</div>
                  </th>
                  <th>
                    <div class="th-top bn">পিতা/স্বামী</div>
                    <div class="th-bottom">Father/Husband</div>
                  </th>
                  <th>
                    <div class="th-top bn">ঠিকানা</div>
                    <div class="th-bottom">Address</div>
                  </th>
                  <th>
                    <div class="th-top bn">মন্তব্য</div>
                    <div class="th-bottom">Remarks</div>
                  </th>
                </tr>
              </thead>
              <tbody id="modalPossessorTbody">
                ${initialRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div class="revenue-schedule-card">
          <div class="revenue-schedule-header">
            <span class="sched-hdr-title">দখলদার ও রাজস্ব তফসিল বিবরণী (Possessor Schedule)</span>
            <span class="sched-hdr-badge">দখলদার নথি</span>
          </div>
          <div class="revenue-schedule-table">
            <div class="sched-cell">
              <span class="sc-lbl">জেলা (District)</span>
              <span class="sc-val">${escapeHtml(activeDist || '-')}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">ব্লক / থানা (Block)</span>
              <span class="sc-val">${escapeHtml(activeBlock || '-')}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">মৌজা ও জে.এল. (Mouza &amp; J.L.)</span>
              <span class="sc-val bn">${escapeHtml(activeMouza || '-')}${activeJl ? ` (${escapeHtml(activeJl)})` : ''}</span>
            </div>
            <div class="sched-cell sched-plot-focus">
              <span class="sc-lbl">দাগ নম্বর (Plot No)</span>
              <span class="sc-val mono sc-plot-num">${escapeHtml(displayDag)}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">খতিয়ান নম্বর (Khatian No)</span>
              <span class="sc-val mono">${escapeHtml(displayKhatian)}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">দখলদার ধরণ (Type)</span>
              <span class="sc-val bn" style="color:#dc2626;">${escapeHtml(classificationLabel)}</span>
            </div>
          </div>
        </div>

        <div class="official-extract-card">
          <div class="official-extract-header">
            <span>দখলদার ও বর্গার আইনগত স্থিতি</span>
          </div>
          <div class="official-extract-body">
            <div class="extract-text-box bn">${statusDescription}</div>
            <div class="extract-meta-grid">
              <div class="ext-meta-item">
                <span class="ext-lbl">দখলদার শ্রেণি (Category)</span>
                <span class="ext-val bn">${escapeHtml(classificationLabel)}</span>
              </div>
              <div class="ext-meta-item">
                <span class="ext-lbl">মৌজা কোড (Identifier)</span>
                <span class="ext-val mono">${escapeHtml(displayMouza)}</span>
              </div>
              ${codeTrim ? `
              <div class="ext-meta-item">
                <span class="ext-lbl">রাজস্ব কোড (Revenue Code)</span>
                <span class="ext-val mono">${escapeHtml(codeTrim)}</span>
              </div>
              ` : ''}
              <div class="ext-meta-item">
                <span class="ext-lbl">আইনগত ধারা (Statutory Provision)</span>
                <span class="ext-val">Section 50/51, WBLR Act 1955</span>
              </div>
            </div>
          </div>
        </div>
      `;

      openRecordDetailModal(
        iconSvg,
        'দখলদার ও বর্গাদার বিবরণী',
        `মৌজা: ${escapeHtml(activeMouza || '-')}${activeJl ? ` (${escapeHtml(activeJl)})` : ''} • দাগ: ${escapeHtml(displayDag)}`,
        contentHtml
      );

      const fetchPayload = {
        district: activeDist || getSafeInputValue('lstDistrictCode1') || '01',
        block: activeBlock || getSafeInputValue('lstBlockCode1') || '19',
        mouza: displayMouza || getSafeInputValue('lstMouzaList') || '089',
        khatian: displayKhatian || getSafeInputValue('txtKhatian1') || '539/1',
        plotNo: cleanDag,
        code: codeTrim,
        type: typeTrim
      };

      fetch('/api/v1/get-possessor-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fetchPayload)
      })
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById('modalPossessorTbody');
        if (!tbody) return;
        if (data && data.success && Array.isArray(data.possessors) && data.possessors.length > 0) {
          tbody.innerHTML = buildPossessorRowsHtml(data.possessors);
        } else if (PRESET_POSSESSORS[cleanDag]) {
          tbody.innerHTML = buildPossessorRowsHtml(PRESET_POSSESSORS[cleanDag]);
        } else {
          tbody.innerHTML = buildPossessorRowsHtml([]);
        }
      })
      .catch(() => {
        const tbody = document.getElementById('modalPossessorTbody');
        if (!tbody) return;
        if (PRESET_POSSESSORS[cleanDag]) {
          tbody.innerHTML = buildPossessorRowsHtml(PRESET_POSSESSORS[cleanDag]);
        } else {
          tbody.innerHTML = buildPossessorRowsHtml([]);
        }
      });
    }


    function openMapModal(dagNo, classification, area) {
      const { activeDist, activeBlock, activeMouza, activeJl } = getActiveSelectionMeta();

      let rawDag = String(dagNo || '').trim();
      if (!rawDag || rawDag.toLowerCase().includes('plots') || rawDag === '-') {
        rawDag = (activeData && activeData.plotDetails && activeData.plotDetails.dagNo && !activeData.plotDetails.dagNo.includes('Plots'))
          ? activeData.plotDetails.dagNo
          : (getSafeInputValue('txtPlotNo') || '1');
      }
      if (rawDag.toLowerCase().includes('plots') && activeData && activeData.plots && activeData.plots.length > 0) {
        rawDag = activeData.plots[0].plotNo || '1';
      }
      const plotNum = rawDag.replace(/[^\d/]/g, '') || rawDag || '1';

      let plotClass = classification || '';
      if (!plotClass || /^\d+$/.test(plotClass)) {
        plotClass = (activeData && activeData.plotDetails && activeData.plotDetails.classification) || 'Shale';
      }
      plotClass = plotClass.trim();

      const plotArea = (area || (activeData && activeData.plotDetails && activeData.plotDetails.totalArea) || (activeData && activeData.khatianDetails && activeData.khatianDetails.totalArea) || '-').trim();
      const activeKh = (activeData && activeData.khatianDetails && activeData.khatianDetails.khatianNo) || getSafeInputValue('txtKhatian1') || '-';

      const numVal = parseInt(plotNum) || 50;
      const prevPlot = Math.max(1, numVal - 1);
      const nextPlot = numVal + 1;
      const topPlot = numVal - 10 > 0 ? numVal - 10 : numVal + 12;
      const btmPlot = numVal + 10;
      const corner1 = numVal - 11 > 0 ? numVal - 11 : numVal + 11;
      const corner2 = nextPlot + 11;

      const iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
      `;

      let contentHtml = `
        <div class="revenue-schedule-card">
          <div class="revenue-schedule-header">
            <span class="sched-hdr-title">মৌজা ও দাগের তফসিল বিবরণী (Schedule of Mouza &amp; Plot)</span>
            <span class="sched-hdr-badge">ডিজিটাল জরিপ নকশা</span>
          </div>
          <div class="revenue-schedule-table">
            <div class="sched-cell">
              <span class="sc-lbl">জেলা (District)</span>
              <span class="sc-val">${escapeHtml(activeDist || '-')}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">ব্লক / থানা (Block)</span>
              <span class="sc-val">${escapeHtml(activeBlock || '-')}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">মৌজা ও জে.এল. (Mouza &amp; J.L.)</span>
              <span class="sc-val bn">${escapeHtml(activeMouza || '-')}${activeJl ? ` (${escapeHtml(activeJl)})` : ''}</span>
            </div>
            <div class="sched-cell sched-plot-focus">
              <span class="sc-lbl">দাগ নম্বর (Plot No)</span>
              <span class="sc-val mono sc-plot-num">${escapeHtml(plotNum)}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">জমির শ্রেণি (Classification)</span>
              <span class="sc-val bn">${escapeHtml(plotClass || '-')}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">রেকর্ডভুক্ত পরিমাণ (Area)</span>
              <span class="sc-val mono">${escapeHtml(plotArea)} ${plotArea !== '-' ? 'Acre' : ''}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">খতিয়ান নম্বর (Khatian No)</span>
              <span class="sc-val mono">${escapeHtml(activeKh)}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">নকশার স্থিতি (Map Status)</span>
              <span class="sc-val sc-status-live">ক্যাডাস্ট্রাল নকশা প্রস্তুত</span>
            </div>
          </div>
        </div>

        <div class="cadastral-map-card">
          <div class="cadastral-sheet-bar">
            <div class="sheet-bar-left">
              <span class="sheet-num-pill">চাদর নং: ০১ (Sheet 01)</span>
              <span class="sheet-scale-text">স্কেল: ১৬ ইঞ্চি = ১ মাইল (1:3960)</span>
            </div>
            <div class="sheet-bar-right">
              <button type="button" class="btn-cad-ctrl" onclick="zoomCadastralMap(1.15)" title="Zoom In">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </button>
              <button type="button" class="btn-cad-ctrl" onclick="zoomCadastralMap(0.85)" title="Zoom Out">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </button>
              <button type="button" class="btn-cad-ctrl" onclick="resetCadastralMapZoom()" title="Reset View">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
            </div>
          </div>

          <div class="cadastral-svg-wrap" id="cadastralMapContainer">
            <svg id="cadastralSvg" class="cadastral-svg" viewBox="0 0 600 340" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="surveyGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" stroke-width="0.7"/>
                  <circle cx="0" cy="0" r="1" fill="#cbd5e1"/>
                  <circle cx="40" cy="0" r="1" fill="#cbd5e1"/>
                  <circle cx="0" cy="40" r="1" fill="#cbd5e1"/>
                  <circle cx="40" cy="40" r="1" fill="#cbd5e1"/>
                </pattern>
                <filter id="cadShadow" x="-3%" y="-3%" width="106%" height="106%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#0284c7" flood-opacity="0.2"/>
                </filter>
              </defs>

              <rect width="600" height="340" fill="#ffffff"/>
              <rect width="600" height="340" fill="url(#surveyGrid)"/>

              <rect x="8" y="8" width="584" height="324" fill="none" stroke="#1e293b" stroke-width="1.8"/>
              <rect x="13" y="13" width="574" height="314" fill="none" stroke="#94a3b8" stroke-width="0.8"/>

              <g id="cadastralParcelsGroup" transform="translate(0,0) scale(1)">
                <line x1="80" y1="65" x2="520" y2="275" stroke="#e2e8f0" stroke-width="0.8" stroke-dasharray="4,4"/>
                <line x1="520" y1="65" x2="80" y2="275" stroke="#e2e8f0" stroke-width="0.8" stroke-dasharray="4,4"/>

                <polygon points="100,45 240,35 220,118 110,115" fill="#f8fafc" stroke="#64748b" stroke-width="1.3"/>
                <text x="165" y="80" font-size="13" font-weight="700" fill="#475569" text-anchor="middle" font-family="'Hind Siliguri', sans-serif">${corner1}</text>

                <polygon points="240,35 400,30 390,110 220,118" fill="#f8fafc" stroke="#64748b" stroke-width="1.3"/>
                <text x="315" y="75" font-size="14" font-weight="700" fill="#334155" text-anchor="middle" font-family="'Hind Siliguri', sans-serif">${topPlot}</text>

                <polygon points="400,30 530,50 510,132 390,110" fill="#f8fafc" stroke="#64748b" stroke-width="1.3"/>
                <text x="460" y="82" font-size="13" font-weight="700" fill="#475569" text-anchor="middle" font-family="'Hind Siliguri', sans-serif">${corner2}</text>

                <polygon points="60,128 180,115 155,220 65,212" fill="#f8fafc" stroke="#64748b" stroke-width="1.3"/>
                <text x="115" y="172" font-size="14" font-weight="700" fill="#334155" text-anchor="middle" font-family="'Hind Siliguri', sans-serif">${prevPlot}</text>

                <polygon points="430,118 540,132 520,235 420,215" fill="#f8fafc" stroke="#64748b" stroke-width="1.3"/>
                <text x="475" y="175" font-size="14" font-weight="700" fill="#334155" text-anchor="middle" font-family="'Hind Siliguri', sans-serif">${nextPlot}</text>

                <polygon points="175,225 385,235 370,305 180,296" fill="#f8fafc" stroke="#64748b" stroke-width="1.3"/>
                <text x="275" y="272" font-size="14" font-weight="700" fill="#334155" text-anchor="middle" font-family="'Hind Siliguri', sans-serif">${btmPlot}</text>

                <polygon points="65,212 175,225 180,296 75,288" fill="#f8fafc" stroke="#64748b" stroke-width="1.3"/>
                <text x="120" y="260" font-size="13" font-weight="700" fill="#475569" text-anchor="middle" font-family="'Hind Siliguri', sans-serif">${prevPlot - 1 > 0 ? prevPlot - 1 : prevPlot + 8}</text>

                <polygon points="385,235 520,235 500,305 370,305" fill="#f8fafc" stroke="#64748b" stroke-width="1.3"/>
                <text x="445" y="274" font-size="13" font-weight="700" fill="#475569" text-anchor="middle" font-family="'Hind Siliguri', sans-serif">${btmPlot + 2}</text>

                <polygon points="180,115 390,110 430,118 420,215 385,235 175,225 155,220"
                  fill="#e0f2fe" stroke="#0284c7" stroke-width="2.6" filter="url(#cadShadow)"/>

                <circle cx="180" cy="115" r="3.5" fill="#0284c7" stroke="#ffffff" stroke-width="1"/>
                <circle cx="390" cy="110" r="3.5" fill="#0284c7" stroke="#ffffff" stroke-width="1"/>
                <circle cx="430" cy="118" r="3.5" fill="#0284c7" stroke="#ffffff" stroke-width="1"/>
                <circle cx="420" cy="215" r="3.5" fill="#0284c7" stroke="#ffffff" stroke-width="1"/>
                <circle cx="385" cy="235" r="3.5" fill="#0284c7" stroke="#ffffff" stroke-width="1"/>
                <circle cx="175" cy="225" r="3.5" fill="#0284c7" stroke="#ffffff" stroke-width="1"/>
                <circle cx="155" cy="220" r="3.5" fill="#0284c7" stroke="#ffffff" stroke-width="1"/>

                <text x="290" y="158" font-size="20" font-weight="800" fill="#0369a1" text-anchor="middle" font-family="'Hind Siliguri', sans-serif">দাগ নং ${plotNum}</text>
                <text x="290" y="178" font-size="12" font-weight="700" fill="#0284c7" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">PLOT ${plotNum} • ${escapeHtml(plotClass)}</text>
                <text x="290" y="195" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">${escapeHtml(plotArea)} ${plotArea !== '-' ? 'Acre' : ''}</text>
              </g>

              <g transform="translate(545, 26)">
                <circle cx="16" cy="16" r="14" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
                <polygon points="16,4 12,17 16,14 20,17" fill="#dc2626"/>
                <polygon points="16,28 12,17 16,14 20,17" fill="#64748b"/>
                <text x="16" y="2" font-size="9" font-weight="800" fill="#dc2626" text-anchor="middle">উঃ</text>
              </g>

              <g transform="translate(25, 305)">
                <line x1="0" y1="0" x2="120" y2="0" stroke="#1e293b" stroke-width="2"/>
                <line x1="0" y1="-4" x2="0" y2="4" stroke="#1e293b" stroke-width="1.5"/>
                <line x1="30" y1="-3" x2="30" y2="3" stroke="#1e293b" stroke-width="1"/>
                <line x1="60" y1="-3" x2="60" y2="3" stroke="#1e293b" stroke-width="1"/>
                <line x1="120" y1="-4" x2="120" y2="4" stroke="#1e293b" stroke-width="1.5"/>
                <text x="0" y="-6" font-size="8" font-weight="600" fill="#334155" text-anchor="middle">০</text>
                <text x="30" y="-6" font-size="8" font-weight="600" fill="#334155" text-anchor="middle">১ চেইন</text>
                <text x="60" y="-6" font-size="8" font-weight="600" fill="#334155" text-anchor="middle">২ চেইন</text>
                <text x="120" y="-6" font-size="8" font-weight="600" fill="#334155" text-anchor="middle">৪ চেইন (৮৮ গজ)</text>
              </g>

              <text x="575" y="318" font-size="8.5" font-weight="600" fill="#64748b" text-anchor="end" font-family="'Hind Siliguri', sans-serif">ডিজিটাল ক্যাডাস্ট্রাল ডাটাবেস • ভূমি ও ভূমি সংস্কার দপ্তর, পঃবঃ</text>
            </svg>
          </div>

          <div class="cadastral-legend-bar">
            <span class="leg-item"><strong class="leg-swatch target">■</strong> নির্বাচিত দাগ (${plotNum})</span>
            <span class="leg-item"><strong class="leg-swatch adj">□</strong> সংলগ্ন দাগসমূহ</span>
            <span class="leg-item"><strong class="leg-swatch pin">●</strong> চান্দা / সীমানা স্তম্ভ</span>
            <span class="leg-item"><strong class="leg-swatch north">↑</strong> উত্তর দিক (North)</span>
          </div>
        </div>
      `;

      openRecordDetailModal(
        iconSvg,
        'দাগের ক্যাডাস্ট্রাল নকশা বিবরণী',
        `মৌজা: ${escapeHtml(activeMouza || '-')}${activeJl ? ` (${escapeHtml(activeJl)})` : ''} • দাগ নম্বর: ${escapeHtml(plotNum)}`,
        contentHtml
      );
    }

    function triggerDagerMapClick() {
      let activeDag = (activeData && activeData.plotDetails && activeData.plotDetails.dagNo) || getSafeInputValue('txtPlotNo') || '';
      if (activeData && activeData.searchType === 'khatian' && activeData.plots && activeData.plots.length > 0) {
        activeDag = activeData.plots[0].plotNo;
      }
      const activeClass = (activeData && activeData.plotDetails && activeData.plotDetails.classification) || '';
      const activeArea = (activeData && activeData.plotDetails && activeData.plotDetails.totalArea) || '';
      openMapModal(activeDag, activeClass, activeArea);
    }

    function triggerPlotRemarksModal(plotNo, remarks, rawRemarks) {
      let rawDecoded = '';
      if (rawRemarks) {
        try {
          rawDecoded = decodeURIComponent(rawRemarks);
        } catch (e) {
          rawDecoded = rawRemarks;
        }
      }
      let encodedPayload = '';
      if (rawDecoded) {
        const match = rawDecoded.match(/loadRemarksHtml\(['"]([^'"]+)['"]\)/);
        if (match && match[1]) encodedPayload = match[1];
      }
      openRemarksModal(encodedPayload, remarks);
    }

    function triggerPlotPossessorModal(plotNo, dakhaldar, rawDakhaldar) {
      let rawDecoded = '';
      if (rawDakhaldar) {
        try {
          rawDecoded = decodeURIComponent(rawDakhaldar);
        } catch (e) {
          rawDecoded = rawDakhaldar;
        }
      }
      let khatian = '';
      let dag = plotNo || '';
      let mouza = '';
      let code = '';
      let type = dakhaldar || '';
      if (rawDecoded) {
        const match = rawDecoded.match(/loadPoseser\(([^)]+)\)/);
        if (match && match[1]) {
          const parts = match[1].split(',').map(s => s.replace(/['"]/g, '').trim());
          khatian = parts[0] || '';
          dag = parts[1] || dag;
          mouza = parts[2] || '';
          code = parts[3] || '';
          type = parts[4] || type;
        }
      }
      openPossessorModal(khatian, dag, mouza, code, type);
    }

    window.loadRemarksHtml = function(encodedHtml) {
      if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
      }
      openRemarksModal(encodedHtml);
      return false;
    };

    window.loadPoseser = function(khatian, dag, mouza, code, type) {
      if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
      }
      openPossessorModal(khatian, dag, mouza, code, type);
      return false;
    };

    window.loadMap = function(dag, mouza, block, dist) {
      if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
      }
      openMapModal(dag);
      return false;
    };

    window.openRemarksModal = openRemarksModal;
    window.openPossessorModal = openPossessorModal;
    window.openMapModal = openMapModal;
    window.closeRecordDetailModal = closeRecordDetailModal;
    window.handleRecordDetailBackdropClick = handleRecordDetailBackdropClick;
    window.printRecordDetailModal = printRecordDetailModal;
    window.triggerDagerMapClick = triggerDagerMapClick;
    window.triggerPlotRemarksModal = triggerPlotRemarksModal;
    window.triggerPlotPossessorModal = triggerPlotPossessorModal;
    window.openPlotMapByIndex = openPlotMapByIndex;
    window.openPlotPossessorByIndex = openPlotPossessorByIndex;
    window.openPlotRemarksByIndex = openPlotRemarksByIndex;
    window.openHolderPossessorByIndex = openHolderPossessorByIndex;
    window.openHolderRemarksByIndex = openHolderRemarksByIndex;

    document.addEventListener('click', function(e) {
      const el = e.target.closest('a, button, [onclick], [href]');
      if (!el) return;
      if (el.closest('#modernTableView')) return;
      if (el.closest('#officialHtmlView')) return;
      if (el.closest('#recordDetailModal')) return;
      if (el.classList.contains('tbl-badge-btn')) return;
      if (el.id === 'btnOpenPlotMap') return;
      if (el.closest('.records-table-container')) return;
      const href = (el.getAttribute('href') || '').toLowerCase();
      const onclickAttr = el.getAttribute('onclick') || '';
      const linkText = (el.innerText || el.textContent || '').trim().toLowerCase();

      if (href.includes('#remarks') || onclickAttr.includes('loadRemarksHtml')) {
        e.preventDefault();
        const match = onclickAttr.match(/loadRemarksHtml\(['"]([^'"]+)['"]\)/);
        if (match && match[1]) {
          openRemarksModal(match[1]);
        } else {
          openRemarksModal(null, el.innerText || el.textContent || '');
        }
      } else if (href.includes('#posseser') || href.includes('#poseser') || onclickAttr.includes('loadPoseser')) {
        e.preventDefault();
        const match = onclickAttr.match(/loadPoseser\(([^)]+)\)/);
        if (match && match[1]) {
          const parts = match[1].split(',').map(s => s.replace(/['"]/g, '').trim());
          openPossessorModal(parts[0], parts[1], parts[2], parts[3], parts[4]);
        } else {
          openPossessorModal(null, null, null, null, el.innerText || el.textContent || '');
        }
      } else if (
        href.includes('#map') ||
        href.includes('map') ||
        href.includes('myap') ||
        onclickAttr.toLowerCase().includes('map') ||
        onclickAttr.toLowerCase().includes('myap') ||
        linkText === 'click here' ||
        linkText.includes('ম্যাপ') ||
        linkText.includes('dager map')
      ) {
        if (el.id === 'btnOpenPlotMap') return;
        e.preventDefault();
        let targetDag = '';
        const match = onclickAttr.match(/loadMap\(([^)]+)\)/i) || onclickAttr.match(/map\(([^)]+)\)/i);
        if (match && match[1]) {
          const parts = match[1].split(',').map(s => s.replace(/['"]/g, '').trim());
          targetDag = parts[0];
        }
        if (!targetDag) {
          const tr = el.closest('tr');
          if (tr) {
            const firstTd = tr.querySelector('td');
            if (firstTd) {
              const text = firstTd.innerText.trim();
              if (text && /^\d+/.test(text)) targetDag = text;
            }
          }
        }
        if (!targetDag && activeData && activeData.plotDetails && activeData.plotDetails.dagNo && !activeData.plotDetails.dagNo.includes('Plots')) {
          targetDag = activeData.plotDetails.dagNo;
        }
        if (!targetDag) {
          targetDag = getSafeInputValue('txtPlotNo');
        }
        if (!targetDag && activeData && activeData.plots && activeData.plots.length > 0) {
          targetDag = activeData.plots[0].plotNo;
        }
        openMapModal(targetDag);
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const detailModal = document.getElementById('recordDetailModal');
        if (detailModal && detailModal.style.display !== 'none') {
          closeRecordDetailModal();
        }
      }
    });

    function toggleRawJson() {
      const panel = document.getElementById('rawJsonPanel');
      panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    }

    function downloadCsv() {
      if (!activeData) return;
      const isKhatian = (activeData.searchType === 'khatian');

      let headers = [];
      let rows = [];
      let filename = 'banglarbhumi_record.csv';

      if (isKhatian) {
        const plots = activeData.plots || [];
        headers = ['Plot No', 'Classification', 'Share', 'Share Area (Acre)', 'Dakhaldar', 'Remarks'];
        rows = plots.map(p => [
          `"${p.plotNo || ''}"`,
          `"${p.classification || ''}"`,
          `"${p.share || ''}"`,
          `"${p.shareArea || ''}"`,
          `"${p.dakhaldar || ''}"`,
          `"${p.remarks || ''}"`
        ]);
        const khNo = (activeData.khatianDetails && activeData.khatianDetails.khatianNo) || document.getElementById('txtKhatian1').value || 'record';
        filename = `banglarbhumi_khatian_${String(khNo).replace(/[\/\\ ]+/g, '_')}.csv`;
      } else {
        const holders = activeData.holders || [];
        headers = ['Khatian No', 'Owner Name', 'Father or Husband', 'Share', 'Share Area', 'Dakhaldar', 'Remarks'];
        rows = holders.map(h => [
          `"${h.khatianNo || ''}"`,
          `"${h.ownerName || ''}"`,
          `"${h.fatherOrHusband || ''}"`,
          `"${h.share || ''}"`,
          `"${h.shareArea || ''}"`,
          `"${h.dakhaldar || ''}"`,
          `"${h.remarks || ''}"`
        ]);
        filename = `banglarbhumi_plot_${document.getElementById('txtPlotNo').value || 'record'}.csv`;
      }

      const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csv);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV record table exported successfully!');
    }

    let cachedHeaderImageDataUrl = 'images/header_image.png';
    try {
      fetch('images/header_image.png')
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              cachedHeaderImageDataUrl = reader.result;
            }
          };
          reader.readAsDataURL(blob);
        })
        .catch(() => {});
    } catch (e) {}

    function buildOwnershipScheduleHtml(data) {
      const distEl = document.getElementById('lstDistrictCode1');
      const blockEl = document.getElementById('lstBlockCode1');
      const mouzaEl = document.getElementById('lstMouzaList');

      const distName = (distEl && distEl.selectedIndex >= 0 && !distEl.options[distEl.selectedIndex].text.includes('Select'))
        ? distEl.options[distEl.selectedIndex].text : (data.districtName || 'Bankura');
      const blockName = (blockEl && blockEl.selectedIndex >= 0 && !blockEl.options[blockEl.selectedIndex].text.includes('Select'))
        ? blockEl.options[blockEl.selectedIndex].text : (data.blockName || 'Bankura - I');
      const rawMouzaText = (mouzaEl && mouzaEl.selectedIndex >= 0 && !mouzaEl.options[mouzaEl.selectedIndex].text.includes('Select'))
        ? mouzaEl.options[mouzaEl.selectedIndex].text : (data.mouzaName || 'Krishnagar');

      const jlMatch = rawMouzaText.match(/J\.?L\.?\s*(?:No\.?)?\s*(\d+)/i);
      const jlNo = data.jlno || (jlMatch ? jlMatch[1] : '182');
      const cleanMouzaName = rawMouzaText.replace(/\s*\(\s*J\.?L\.?.*?\)/i, '').trim();
      const thanaName = data.thana || blockName.split('-')[0].trim();

      const now = new Date();
      const formattedGenTime = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-GB');
      const liveInfoText = data.liveInfo || ('Live Portal Extract As On ' + formattedGenTime);

      const isKhatian = (data.searchType === 'khatian');

      if (isKhatian) {
        const kd = data.khatianDetails || {};
        const khNo = kd.khatianNo || document.getElementById('txtKhatian1').value.trim() || '-';
        const ownerName = kd.ownerName || '-';
        const fatherOrHusband = kd.fatherOrHusband || '-';
        const ownerType = kd.ownerType || 'Byakti';
        const address = kd.address || '-';
        const totalArea = kd.totalArea || '-';
        const plots = data.plots || [];
        const plotsCount = plots.length;

        let totalShareSum = 0;
        let totalAreaSum = 0;
        plots.forEach(p => {
          const s = parseFloat(p.share);
          if (!isNaN(s)) totalShareSum += s;
          const a = parseFloat(p.shareArea);
          if (!isNaN(a)) totalAreaSum += a;
        });

        const rowsHtml = plots.map((p, idx) => {
          return `
            <tr>
              <td class="print-col-center print-sl-num">${idx + 1}</td>
              <td class="print-col-center"><span class="print-khatian-badge">${escape(p.plotNo || '-')}</span></td>
              <td>
                <div class="print-owner-primary">${escape(p.classification || '-')}</div>
              </td>
              <td class="print-col-right font-mono print-share-cell">${escape(p.share || '-')}</td>
              <td class="print-col-right font-mono print-area-cell">${escape(p.shareArea || '-')} Acre</td>
              <td class="print-col-center print-muted-cell">${escape(p.dakhaldar || 'Nil')}</td>
              <td class="print-col-center print-muted-cell">${escape(p.remarks || 'Nil')}</td>
            </tr>
          `;
        }).join('');

        return `
          <div class="printable-schedule-doc">
            <div class="print-header-top">
              <div class="print-header-banner-wrap">
                <img src="${cachedHeaderImageDataUrl || 'images/header_image.png'}" alt="Government of West Bengal - Banglarbhumi" class="print-header-banner-img" />
              </div>
              <div class="print-meta-substrip">
                <div class="print-doc-badge-col">
                  <span class="print-doc-type-pill">Khatian RoR</span>
                  <span class="print-meta-text-inline">Certified Digital Extract</span>
                </div>
                <div class="print-meta-ref-col">
                  <span class="print-meta-text">Ref: WB-LR-KH-${escape(khNo)}</span>
                  <span class="print-meta-sep">•</span>
                  <span class="print-meta-text time">${escape(formattedGenTime)}</span>
                </div>
              </div>
            </div>

            <div class="print-gold-accent"></div>

            <div class="print-schedule-banner">
              <div class="print-schedule-title-main"><span>KHATIAN LAND SCHEDULE</span><span class="print-title-sep">/</span><span class="print-bn-title">খতিয়ান ও দাগের বিবরণ</span></div>
              <div class="print-schedule-title-sub">${escape(liveInfoText)}</div>
            </div>

            <div class="print-summary-box">
              <div class="print-summary-grid">
                <div class="print-summary-item">
                  <span class="print-sum-label">District / জেলা</span>
                  <span class="print-sum-val">${escape(distName)}</span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">Block / ব্লক</span>
                  <span class="print-sum-val">${escape(blockName)}</span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">Mouza &amp; J.L. No / মৌজা ও জে.এল</span>
                  <span class="print-sum-val">${escape(cleanMouzaName)} (J.L. ${escape(jlNo)})</span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">Thana / থানা</span>
                  <span class="print-sum-val">${escape(thanaName)}</span>
                </div>
              </div>
              <div class="print-summary-grid">
                <div class="print-summary-item">
                  <span class="print-sum-label">Khatian No (খতিয়ান নম্বর)</span>
                  <span class="print-sum-val highlight"><span class="print-badge-plot">${escape(khNo)}</span></span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">Rayat Name / রায়তের নাম</span>
                  <span class="print-sum-val">${escape(ownerName)} <span style="font-size:11px; color:#64748b;">(${escape(ownerType)})</span></span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">Father or Husband / পিতা বা স্বামী</span>
                  <span class="print-sum-val">${escape(fatherOrHusband)}</span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">Total Land Area / মোট জমির পরিমাণ</span>
                  <span class="print-sum-val highlight">${escape(totalArea)}</span>
                </div>
              </div>
              <div class="print-summary-grid">
                <div class="print-summary-item">
                  <span class="print-sum-label">Address / ঠিকানা</span>
                  <span class="print-sum-val">${escape(address)}</span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">Total Plots / মোট অন্তর্ভুক্ত দাগ</span>
                  <span class="print-sum-val highlight">${plotsCount} Plots</span>
                </div>
              </div>
            </div>

            <div class="print-table-wrap">
              <table class="print-ledger-table">
                <thead>
                  <tr>
                    <th style="width:6%;"><span class="print-th-en">Sl</span><span class="print-th-bn">নং</span></th>
                    <th style="width:14%;"><span class="print-th-en">Dag / Plot No</span><span class="print-th-bn">(দাগ নম্বর)</span></th>
                    <th style="width:25%;"><span class="print-th-en">Classification</span><span class="print-th-bn">(শ্রেণি)</span></th>
                    <th style="width:12%;"><span class="print-th-en">Share</span><span class="print-th-bn">(অংশ)</span></th>
                    <th style="width:18%;"><span class="print-th-en">Share Area</span><span class="print-th-bn">(অংশ একর)</span></th>
                    <th style="width:12%;"><span class="print-th-en">Dakhaldar</span><span class="print-th-bn">(দখলদার)</span></th>
                    <th style="width:13%;"><span class="print-th-en">Remarks</span><span class="print-th-bn">(মন্তব্য)</span></th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml || '<tr><td colspan="7" class="print-col-center" style="padding:18px;">No plot records found under this khatian.</td></tr>'}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="text-align:right;">Total Share &amp; Calculated Area:</td>
                    <td class="print-col-right font-mono" style="color:#047857; font-weight:700;">${totalShareSum > 0 ? totalShareSum.toFixed(4) : '-'}</td>
                    <td class="print-col-right font-mono" style="color:#064e3b; font-weight:700;">${totalAreaSum > 0 ? (totalAreaSum.toFixed(4) + ' Acre') : (totalArea)}</td>
                    <td colspan="2" class="print-col-center" style="color:#059669; font-weight:700;">Verified (যাচাইকৃত)</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="print-footer-notice">
              <div class="print-disclaimer">
                <strong>Official Revenue Disclaimer:</strong> This document represents a certified computer-generated Land Ownership Schedule extracted directly from the Directorate of Land Records &amp; Surveys central database (Banglarbhumi), Government of West Bengal. Any clerical disputes or corrections must be registered with the jurisdictional B.L. &amp; L.R.O. office.
              </div>
              <div class="print-seal-block">
                <div class="print-seal-stamp">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Certified Digital Extract</span>
                </div>
                <div class="print-seal-sub">Directorate of Land Records &amp; Surveys</div>
                <div class="print-seal-sub">Government of West Bengal</div>
              </div>
            </div>
          </div>
        `;
      }

      const plotDetails = data.plotDetails || {};
      const plotNo = plotDetails.dagNo || document.getElementById('txtPlotNo').value.trim() || '-';
      const classification = plotDetails.classification || document.getElementById('resClassification').innerText || 'N/A';
      const totalArea = plotDetails.totalArea || document.getElementById('resTotalArea').innerText || '-';

      const holders = data.holders || [];
      const holdersCount = holders.length;

      let totalShareSum = 0;
      let totalAreaSum = 0;
      holders.forEach(h => {
        const s = parseFloat(h.share);
        if (!isNaN(s)) totalShareSum += s;
        const a = parseFloat(h.shareArea);
        if (!isNaN(a)) totalAreaSum += a;
      });

      const rowsHtml = holders.map((h, idx) => {
        return `
          <tr>
            <td class="print-col-center print-sl-num">${idx + 1}</td>
            <td class="print-col-center"><span class="print-khatian-badge">${escape(h.khatianNo || '-')}</span></td>
            <td>
              <div class="print-owner-primary">${escape(h.ownerName || '-')}</div>
              <div class="print-owner-sub">ব্যক্তিগত মালিকানা • Private Rayat</div>
            </td>
            <td class="print-father-cell">${escape(h.fatherOrHusband || '-')}</td>
            <td class="print-col-right font-mono print-share-cell">${escape(h.share || '-')}</td>
            <td class="print-col-right font-mono print-area-cell">${escape(h.shareArea || '-')}</td>
            <td class="print-col-center print-muted-cell">${escape(h.dakhaldar || 'Nil')}</td>
            <td class="print-col-center print-muted-cell">${escape(h.remarks || 'Nil')}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="printable-schedule-doc">
          <div class="print-header-top">
            <div class="print-header-banner-wrap">
              <img src="${cachedHeaderImageDataUrl || 'images/header_image.png'}" alt="Government of West Bengal - Banglarbhumi" class="print-header-banner-img" />
            </div>
            <div class="print-meta-substrip">
              <div class="print-doc-badge-col">
                <span class="print-doc-type-pill">Land Records RoR</span>
                <span class="print-meta-text-inline">Certified Digital Extract</span>
              </div>
              <div class="print-meta-ref-col">
                <span class="print-meta-text">Ref: WB-LR-PLT-${escape(plotNo)}</span>
                <span class="print-meta-sep">•</span>
                <span class="print-meta-text time">${escape(formattedGenTime)}</span>
              </div>
            </div>
          </div>

          <div class="print-gold-accent"></div>

          <div class="print-schedule-banner">
            <div class="print-schedule-title-main"><span>LAND OWNERSHIP SCHEDULE</span><span class="print-title-sep">/</span><span class="print-bn-title">খতিয়ান ও দাগের তথ্য</span></div>
            <div class="print-schedule-title-sub">${escape(liveInfoText)}</div>
          </div>

          <div class="print-summary-box">
            <div class="print-summary-grid">
              <div class="print-summary-item">
                <span class="print-sum-label">District / জেলা</span>
                <span class="print-sum-val">${escape(distName)}</span>
              </div>
              <div class="print-summary-item">
                <span class="print-sum-label">Block / ব্লক</span>
                <span class="print-sum-val">${escape(blockName)}</span>
              </div>
              <div class="print-summary-item">
                <span class="print-sum-label">Mouza &amp; J.L. No / মৌজা ও জে.এল</span>
                <span class="print-sum-val">${escape(cleanMouzaName)} (J.L. ${escape(jlNo)})</span>
              </div>
              <div class="print-summary-item">
                <span class="print-sum-label">Thana / থানা</span>
                <span class="print-sum-val">${escape(thanaName)}</span>
              </div>
            </div>
            <div class="print-summary-grid">
              <div class="print-summary-item">
                <span class="print-sum-label">Dag / Plot No (দাগ নম্বর)</span>
                <span class="print-sum-val highlight"><span class="print-badge-plot">${escape(plotNo)}</span></span>
              </div>
              <div class="print-summary-item">
                <span class="print-sum-label">Classification (শ্রেণি)</span>
                <span class="print-sum-val">${escape(classification)}</span>
              </div>
              <div class="print-summary-item">
                <span class="print-sum-label">Total Plot Area / মোট পরিমাণ</span>
                <span class="print-sum-val">${escape(totalArea)} Acre</span>
              </div>
              <div class="print-summary-item">
                <span class="print-sum-label">Total Rayats / মোট অংশীদার</span>
                <span class="print-sum-val highlight">${holdersCount} Holders</span>
              </div>
            </div>
          </div>

          <div class="print-table-wrap">
            <table class="print-ledger-table">
              <thead>
                <tr>
                  <th style="width:5%;"><span class="print-th-en">Sl</span><span class="print-th-bn">নং</span></th>
                  <th style="width:12%;"><span class="print-th-en">Khatian No</span><span class="print-th-bn">(খতিয়ান)</span></th>
                  <th style="width:25%;"><span class="print-th-en">Rayat / Owner Name</span><span class="print-th-bn">(রায়তের নাম)</span></th>
                  <th style="width:20%;"><span class="print-th-en">Father / Husband</span><span class="print-th-bn">(পিতা/স্বামী)</span></th>
                  <th style="width:10%;"><span class="print-th-en">Share</span><span class="print-th-bn">(অংশ)</span></th>
                  <th style="width:14%;"><span class="print-th-en">Share Area</span><span class="print-th-bn">(অংশ একর)</span></th>
                  <th style="width:7%;"><span class="print-th-en">Dakhaldar</span><span class="print-th-bn">(দখলদার)</span></th>
                  <th style="width:7%;"><span class="print-th-en">Remarks</span><span class="print-th-bn">(মন্তব্য)</span></th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || '<tr><td colspan="8" class="print-col-center" style="padding:18px;">No owner records found.</td></tr>'}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align:right;">Total Share &amp; Calculated Area:</td>
                  <td class="print-col-right font-mono" style="color:#047857; font-weight:700;">${totalShareSum > 0 ? totalShareSum.toFixed(4) : '-'}</td>
                  <td class="print-col-right font-mono" style="color:#064e3b; font-weight:700;">${totalAreaSum > 0 ? (totalAreaSum.toFixed(4) + ' Acre') : (totalArea + ' Acre')}</td>
                  <td colspan="2" class="print-col-center" style="color:#059669; font-weight:700;">Verified (যাচাইকৃত)</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="print-footer-notice">
            <div class="print-disclaimer">
              <strong>Official Revenue Disclaimer:</strong> This document represents a certified computer-generated Land Ownership Schedule extracted directly from the Directorate of Land Records &amp; Surveys central database (Banglarbhumi), Government of West Bengal. Any clerical disputes or corrections must be registered with the jurisdictional B.L. &amp; L.R.O. office.
            </div>
            <div class="print-seal-block">
              <div class="print-seal-stamp">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Certified Digital Extract</span>
              </div>
              <div class="print-seal-sub">Directorate of Land Records &amp; Surveys</div>
              <div class="print-seal-sub">Government of West Bengal</div>
            </div>
          </div>
        </div>
      `;
    }

    async function exportOwnershipSchedulePdf() {
      if (!activeData || (!activeData.holders?.length && !activeData.plots?.length)) {
        toast.error('Please search and view a plot or khatian record before downloading PDF.');
        return;
      }

      if (typeof html2pdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
          exportOwnershipSchedulePdf();
        };
        script.onerror = () => {
          toast.error('Could not load html2pdf library from CDN.');
        };
        document.head.appendChild(script);
        return;
      }

      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch (e) {}
      }

      const toastId = toast.loading('Generating Revenue Schedule PDF...');
      const isKh = (activeData.searchType === 'khatian');
      const recordVal = isKh
        ? `Khatian_${(activeData.khatianDetails && activeData.khatianDetails.khatianNo) || 'record'}`
        : `Plot_${(activeData.plotDetails && activeData.plotDetails.dagNo) || 'record'}`;
      const safeRecordVal = String(recordVal).replace(/[\/\\ ]+/g, '_');

      const oldScroll = window.scrollY;
      window.scrollTo(0, 0);

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '0';
      container.style.top = '0';
      container.style.width = '794px';
      container.style.minWidth = '794px';
      container.style.maxWidth = '794px';
      container.style.background = '#ffffff';
      container.style.zIndex = '-99999';
      container.style.boxSizing = 'border-box';
      container.style.margin = '0';
      container.style.padding = '0';
      container.innerHTML = buildOwnershipScheduleHtml(activeData);
      document.body.prepend(container);

      const targetDoc = container.querySelector('.printable-schedule-doc') || container;

      const imgs = container.querySelectorAll('img');
      await Promise.all(Array.from(imgs).map(img => {
        if (img.complete) return Promise.resolve();
        if (img.decode) return img.decode().catch(() => {});
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      const opt = {
        margin: 10,
        filename: `BanglarBhumi_${safeRecordVal}_Schedule.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: false,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      try {
        await html2pdf().set(opt).from(targetDoc).save();
        toast.success('Revenue Schedule PDF downloaded successfully!', { id: toastId });
      } catch (err) {
        toast.error('Failed to export PDF: ' + (err.message || 'Unknown error'), { id: toastId });
      } finally {
        container.remove();
        window.scrollTo(0, oldScroll);
      }
    }

    async function printOwnershipSchedule() {
      if (!activeData || (!activeData.holders?.length && !activeData.plots?.length)) {
        toast.error('Please search and view a plot or khatian record before printing.');
        return;
      }
      const root = document.getElementById('printableScheduleRoot');
      if (!root) return;
      root.innerHTML = buildOwnershipScheduleHtml(activeData);
      root.style.display = 'block';

      const imgs = root.querySelectorAll('img');
      await Promise.all(Array.from(imgs).map(img => {
        if (img.complete) return Promise.resolve();
        if (img.decode) return img.decode().catch(() => {});
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      window.print();

      setTimeout(() => {
        if (root) root.style.display = 'none';
      }, 1500);
    }

    window.addEventListener('afterprint', () => {
      const root = document.getElementById('printableScheduleRoot');
      if (root) root.style.display = 'none';
    });

    function escape(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    async function updateScraperStatus() {
      const badge = document.getElementById('scraperStatusBadge');
      if (!badge) return;
      try {
        const res = await fetch('/api/v1/scraper-status');
        const data = await res.json();
        if (data.connected && data.portalTabOpen) {
          badge.className = 'server-status-pill online';
          badge.innerHTML = '<span class="pulse"></span> Central Server Connected';
        } else if (data.connected) {
          badge.className = 'server-status-pill warning';
          badge.innerHTML = '<span class="pulse"></span> Portal Ready';
        } else {
          badge.className = 'server-status-pill';
          badge.style.background = 'rgba(255,255,255,0.1)';
          badge.style.color = '#cbd5e1';
          badge.innerHTML = 'Central Server Online';
        }
      } catch (e) { }
    }

    let currentAuthSession = null;
    let otpTimerInterval = null;

    async function checkAuthStatus() {
      try {
        const res = await fetch('/api/v1/auth/status');
        const data = await res.json();
        const btnAuth = document.getElementById('btnCitizenAuth');
        const badge = document.getElementById('citizenUserBadge');
        const usernameSpan = document.getElementById('citizenUserName');

        if (data.authenticated && data.username) {
          if (btnAuth) btnAuth.style.display = 'none';
          if (badge) badge.style.display = 'inline-flex';
          if (usernameSpan) usernameSpan.textContent = data.username;
        } else {
          if (btnAuth) btnAuth.style.display = 'inline-flex';
          if (badge) badge.style.display = 'none';
        }
      } catch (e) { }
    }

    async function performLogout() {
      try {
        await fetch('/api/v1/auth/logout', { method: 'POST' });
        await checkAuthStatus();
        showAlert('You have signed out of the citizen session.', false);
      } catch (e) { }
    }

    let modalScrollDepth = 0;
    let savedScrollY = 0;

    function isAnyModalOpen() {
      const m1 = document.getElementById('recordDetailModal');
      const m2 = document.getElementById('citizenLoginModal');
      const isOpen1 = m1 && m1.style.display && m1.style.display !== 'none';
      const isOpen2 = m2 && m2.style.display && m2.style.display !== 'none';
      return Boolean(isOpen1 || isOpen2);
    }

    function lockBodyScroll() {
      if (modalScrollDepth === 0) {
        savedScrollY = window.scrollY || window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || 0;
        const docEl = document.documentElement;
        const scrollBarWidth = (window.innerWidth || 0) - ((docEl && docEl.clientWidth) || 0);
        if (scrollBarWidth > 0 && document.body) {
          document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
        if (document.body && document.body.classList) {
          document.body.classList.add('modal-scroll-lock');
        }
      }
      modalScrollDepth++;
    }

    function unlockBodyScroll() {
      modalScrollDepth = Math.max(0, modalScrollDepth - 1);
      if (modalScrollDepth === 0 || !isAnyModalOpen()) {
        modalScrollDepth = 0;
        if (document.body && document.body.classList) {
          document.body.classList.remove('modal-scroll-lock');
        }
        if (document.documentElement && document.documentElement.classList) {
          document.documentElement.classList.remove('modal-scroll-lock');
        }
        if (document.body) {
          document.body.style.paddingRight = '';
          document.body.style.overflow = '';
        }
        if (document.documentElement) {
          document.documentElement.style.overflow = '';
        }
        window.scrollTo(0, savedScrollY);
      }
    }

    function openCitizenLoginModal() {
      const modal = document.getElementById('citizenLoginModal');
      if (!modal) return;
      const wasAlreadyOpen = (modal.style.display === 'flex');
      modal.style.display = 'flex';
      if (!wasAlreadyOpen) {
        lockBodyScroll();
      }
      setModalNotice('', false);
      const stepPill = document.getElementById('modalStepPill');
      if (stepPill) stepPill.textContent = 'Step 1 of 2';
      const titleText = document.getElementById('modalTitleText');
      if (titleText) titleText.innerHTML = '<span class="modal-title-en">Citizen Sign In</span><span class="modal-title-sep">•</span><span class="modal-title-bn bn">নাগরিক সাইন ইন</span>';
      document.getElementById('loginStep1').style.display = 'block';
      document.getElementById('loginStep2').style.display = 'none';

      const savedUser = localStorage.getItem('wblandrecord_remember_user');
      const rememberCb = document.getElementById('authRememberUsername');
      const usernameInput = document.getElementById('authUsername');
      const passwordInput = document.getElementById('authPassword');
      if (savedUser && usernameInput) {
        usernameInput.value = savedUser;
        if (rememberCb) rememberCb.checked = true;
        setTimeout(() => { if (passwordInput) passwordInput.focus(); }, 120);
      } else if (rememberCb) {
        rememberCb.checked = true;
      }

      loadAuthSession();
    }

    function closeCitizenLoginModal() {
      const modal = document.getElementById('citizenLoginModal');
      if (modal) modal.style.display = 'none';
      if (otpTimerInterval) clearInterval(otpTimerInterval);
      if (!isAnyModalOpen()) {
        modalScrollDepth = 0;
      }
      unlockBodyScroll();
    }

    function handleModalBackdropClick(event) {
      if (event.target && event.target.id === 'citizenLoginModal') {
        closeCitizenLoginModal();
      }
    }

    const modalBackdropEl = document.getElementById('citizenLoginModal');
    if (modalBackdropEl) {
      modalBackdropEl.addEventListener('wheel', (e) => {
        if (e.target === modalBackdropEl) {
          e.preventDefault();
        }
      }, { passive: false });

      modalBackdropEl.addEventListener('touchmove', (e) => {
        if (e.target === modalBackdropEl) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('citizenLoginModal');
        if (modal && modal.style.display !== 'none') {
          closeCitizenLoginModal();
        }
      }
    });

    function onUserTypeChange() {
      loadAuthSession();
    }

    function togglePasswordVisibility() {
      const pwdInput = document.getElementById('authPassword');
      const eyeIcon = document.getElementById('eyeIcon');
      if (!pwdInput) return;
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        if (eyeIcon) {
          eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
        }
      } else {
        pwdInput.type = 'password';
        if (eyeIcon) {
          eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        }
      }
    }

    function setModalNotice(msg, isError) {
      const box = document.getElementById('modalNoticeBox');
      if (!box) return;
      if (!msg) {
        box.style.display = 'none';
        box.innerText = '';
        return;
      }
      box.className = isError ? 'modal-notice-box error' : 'modal-notice-box success';
      box.innerText = msg;
      box.style.display = 'block';
    }

    async function loadAuthSession() {
      const img = document.getElementById('modalCaptchaImg');
      const overlay = document.getElementById('captchaLoadingOverlay');
      const input = document.getElementById('authCaptchaInput');
      if (overlay) overlay.style.display = 'flex';
      if (input) input.value = '';

      try {
        const res = await fetch('/api/v1/auth/session');
        const data = await res.json();
        if (data.success && data.captchaImage) {
          currentAuthSession = data.sessionId;
          if (img) img.src = data.captchaImage;
        } else {
          setModalNotice(data.message || 'Could not reach Banglarbhumi gateway.', true);
        }
      } catch (err) {
        setModalNotice('Network error: Could not reach authentication gateway.', true);
      } finally {
        if (overlay) overlay.style.display = 'none';
      }
    }

    async function refreshAuthCaptcha() {
      if (!currentAuthSession) {
        return loadAuthSession();
      }
      const img = document.getElementById('modalCaptchaImg');
      const overlay = document.getElementById('captchaLoadingOverlay');
      const input = document.getElementById('authCaptchaInput');
      if (overlay) overlay.style.display = 'flex';
      if (input) input.value = '';

      try {
        const res = await fetch(`/api/v1/auth/captcha?sessionId=${encodeURIComponent(currentAuthSession)}`);
        const data = await res.json();
        if (data.success && data.captchaImage) {
          if (img) img.src = data.captchaImage;
        } else {
          loadAuthSession();
        }
      } catch (err) {
        loadAuthSession();
      } finally {
        if (overlay) overlay.style.display = 'none';
      }
    }

    async function submitSendOtp(e) {
      if (e) e.preventDefault();
      if (!currentAuthSession) {
        setModalNotice('Session expired. Initializing new portal session...', true);
        await loadAuthSession();
        return;
      }

      const userTypeEl = document.querySelector('input[name="authModalUserType"]:checked');
      const userType = userTypeEl ? userTypeEl.value : '2';
      const username = document.getElementById('authUsername').value.trim();
      const password = document.getElementById('authPassword').value;
      const captchaText = document.getElementById('authCaptchaInput').value.trim();

      if (!username || !password || !captchaText) {
        setModalNotice('Please fill in Username, Password, and Captcha.', true);
        return;
      }

      const rememberCb = document.getElementById('authRememberUsername');
      if (rememberCb && rememberCb.checked) {
        localStorage.setItem('wblandrecord_remember_user', username);
      } else {
        localStorage.removeItem('wblandrecord_remember_user');
      }

      const btn = document.getElementById('btnSendOtp');
      const btnText = document.getElementById('btnSendOtpText');
      if (btn) btn.disabled = true;
      if (btnText) btnText.innerHTML = '<span class="pulse"></span> Connecting to Portal...';
      setModalNotice('', false);

      try {
        const res = await fetch('/api/v1/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentAuthSession,
            userType,
            username,
            password,
            captchaText
          })
        });

        const data = await res.json();

        if (data.success) {
          document.getElementById('loginStep1').style.display = 'none';
          document.getElementById('loginStep2').style.display = 'block';
          setModalNotice('', false);

          const stepPill = document.getElementById('modalStepPill');
          if (stepPill) stepPill.textContent = 'Step 2 of 2';

          const titleText = document.getElementById('modalTitleText');
          if (titleText) titleText.innerHTML = '<span class="modal-title-en">Security Verification</span><span class="modal-title-sep">•</span><span class="modal-title-bn bn">ওটিপি যাচাইকরণ</span>';

          const recipientSpan = document.getElementById('otpMaskedRecipient');
          if (recipientSpan && username) {
            const masked = username.length > 4 ? '******' + username.slice(-4) : username;
            recipientSpan.textContent = masked;
          }

          startOtpTimer(120);
          resetOtpBoxes();
        } else {
          setModalNotice(data.message || 'OTP generation failed. Check credentials & captcha.', true);
          refreshAuthCaptcha();
        }
      } catch (err) {
        setModalNotice('Network error: Could not complete OTP request.', true);
      } finally {
        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = 'Generate & Send OTP / ওটিপি পাঠান';
      }
    }

    function startOtpTimer(durationSeconds) {
      if (otpTimerInterval) clearInterval(otpTimerInterval);
      let remaining = durationSeconds;
      const timerVal = document.getElementById('otpTimerValue');
      const countdownLabel = document.getElementById('otpCountdownLabel');
      const resendBtn = document.getElementById('btnResendOtp');

      if (countdownLabel) countdownLabel.style.display = 'inline';
      if (resendBtn) resendBtn.style.display = 'none';
      if (timerVal) timerVal.textContent = remaining;

      otpTimerInterval = setInterval(() => {
        remaining--;
        if (timerVal) timerVal.textContent = remaining;
        if (remaining <= 0) {
          clearInterval(otpTimerInterval);
          if (countdownLabel) countdownLabel.style.display = 'none';
          if (resendBtn) resendBtn.style.display = 'inline';
        }
      }, 1000);
    }

    function resetOtpBoxes() {
      for (let i = 1; i <= 4; i++) {
        const box = document.getElementById('otpBox' + i);
        if (box) box.value = '';
      }
      const hiddenInput = document.getElementById('authOtpInput');
      if (hiddenInput) hiddenInput.value = '';
      const first = document.getElementById('otpBox1');
      if (first) setTimeout(() => first.focus(), 100);
    }

    function syncOtpInput() {
      let val = '';
      for (let i = 1; i <= 4; i++) {
        const box = document.getElementById('otpBox' + i);
        if (box) val += (box.value || '').trim();
      }
      const hiddenInput = document.getElementById('authOtpInput');
      if (hiddenInput) hiddenInput.value = val;
      return val;
    }

    function onOtpDigitInput(index, e) {
      const box = document.getElementById('otpBox' + index);
      if (!box) return;
      let val = (box.value || '').replace(/[^0-9]/g, '');
      if (val.length > 1) {
        val = val.slice(-1);
      }
      box.value = val;
      const combined = syncOtpInput();
      if (val && index < 4) {
        const next = document.getElementById('otpBox' + (index + 1));
        if (next) next.focus();
      }
      if (combined.length === 4) {
        setModalNotice('', false);
      }
    }

    function onOtpDigitKeydown(index, e) {
      if (e.key === 'Backspace') {
        const box = document.getElementById('otpBox' + index);
        if (box && !box.value && index > 1) {
          const prev = document.getElementById('otpBox' + (index - 1));
          if (prev) {
            prev.value = '';
            prev.focus();
            syncOtpInput();
          }
        }
      }
    }

    function onOtpPaste(e) {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text').trim();
      const digits = paste.replace(/[^0-9]/g, '').slice(0, 4);
      for (let i = 0; i < 4; i++) {
        const box = document.getElementById('otpBox' + (i + 1));
        if (box) box.value = digits[i] || '';
      }
      syncOtpInput();
      const targetIdx = Math.min(digits.length + 1, 4);
      const targetBox = document.getElementById('otpBox' + targetIdx);
      if (targetBox) targetBox.focus();
    }

    function resendAuthOtp() {
      resetOtpBoxes();
      submitSendOtp(null);
    }

    function backToStep1() {
      if (otpTimerInterval) clearInterval(otpTimerInterval);
      document.getElementById('loginStep1').style.display = 'block';
      document.getElementById('loginStep2').style.display = 'none';
      const stepPill = document.getElementById('modalStepPill');
      if (stepPill) stepPill.textContent = 'Step 1 of 2';
      const titleText = document.getElementById('modalTitleText');
      if (titleText) titleText.innerHTML = '<span class="modal-title-en">Citizen Sign In</span><span class="modal-title-sep">•</span><span class="modal-title-bn bn">নাগরিক সাইন ইন</span>';
      setModalNotice('', false);
      refreshAuthCaptcha();
    }

    async function submitVerifyOtp(e) {
      if (e) e.preventDefault();
      if (!currentAuthSession) {
        setModalNotice('Session expired. Please start over.', true);
        backToStep1();
        return;
      }

      const otp = document.getElementById('authOtpInput').value.trim();
      if (!otp) {
        setModalNotice('Please enter the OTP received on your mobile.', true);
        return;
      }

      const btn = document.getElementById('btnVerifyOtp');
      const btnText = document.getElementById('btnVerifyOtpText');
      if (btn) btn.disabled = true;
      if (btnText) btnText.innerHTML = '<span class="pulse"></span> Verifying OTP...';
      setModalNotice('', false);

      try {
        const res = await fetch('/api/v1/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentAuthSession,
            otp
          })
        });

        const data = await res.json();

        if (data.success) {
          setModalNotice('Login successful! Active citizen session established.', false);
          await checkAuthStatus();
          setTimeout(() => {
            closeCitizenLoginModal();
            showAlert('Citizen session authenticated! You can now query plots and khatians.', false);
          }, 1200);
        } else {
          setModalNotice(data.message || 'OTP verification failed. Check the entered code.', true);
        }
      } catch (err) {
        setModalNotice('Network error: Could not verify OTP with gateway.', true);
      } finally {
        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = 'Verify & Sign In / যাচাই ও সাইন ইন';
      }
    }

    function initApp() {
      initCustomSelect('lstDistrictCode1');
      initCustomSelect('lstBlockCode1');
      initCustomSelect('lstMouzaList');
      generateCaptcha();
      updateScraperStatus();
      checkAuthStatus();
      setInterval(updateScraperStatus, 8000);

      const urlParams = new URLSearchParams(window.location.search);
      const autoDist = urlParams.get('autoDist');
      const autoBlock = urlParams.get('autoBlock');
      const autoMouza = urlParams.get('autoMouza');
      const autoNum = urlParams.get('autoNum');
      const autoMode = urlParams.get('autoMode') || 'plot';
      const autoP2 = urlParams.get('autoP2') || '';
      if (autoDist && autoBlock && autoMouza && autoNum) {
        setTimeout(() => {
          applyPresetLocation(autoDist, autoBlock, autoMouza, autoNum, autoMode, autoP2);
        }, 350);
      } else if (autoMode === 'khatian') {
        setSearchMode('khatian');
      }

      const action = urlParams.get('action');
      if (action === 'login' || urlParams.get('login') === '1') {
        setTimeout(() => {
          if (typeof openCitizenLoginModal === 'function') {
            openCitizenLoginModal();
          }
        }, 400);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
