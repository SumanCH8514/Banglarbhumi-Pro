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
          const rect = trigger.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          const spaceAbove = rect.top;
          if (spaceBelow < 280 && spaceAbove > spaceBelow) {
            box.classList.add('is-reverse');
          } else {
            box.classList.remove('is-reverse');
          }
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
      document.querySelectorAll('.custom-select-box').forEach(b => {
        b.classList.remove('is-open');
        b.classList.remove('is-reverse');
      });
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
          const sortedBlocks = [...data.blocks].sort((a, b) => {
            const numA = parseInt(String(a.bcode || '').replace(/\D/g, '') || '999999', 10);
            const numB = parseInt(String(b.bcode || '').replace(/\D/g, '') || '999999', 10);
            if (numA !== numB) return numA - numB;
            return (a.text || a.name || '').localeCompare(b.text || b.name || '');
          });
          sortedBlocks.forEach(b => {
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
          currentMouzas = [...data.mouzas].sort((a, b) => {
            const numA = parseInt(String(a.moucode || '').replace(/\D/g, '') || '999999', 10);
            const numB = parseInt(String(b.moucode || '').replace(/\D/g, '') || '999999', 10);
            if (numA !== numB) return numA - numB;
            return (a.text || a.name || '').localeCompare(b.text || b.name || '');
          });
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

    
    let currentScheduleLang = 'en';
    let prevModernLang = 'en';

    const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const EN_DIGITS_MAP = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };

    function toBengaliDigits(str) {
      if (str === null || str === undefined) return '';
      return String(str).replace(/[0-9]/g, d => BN_DIGITS[parseInt(d, 10)]);
    }

    function toEnglishDigits(str) {
      if (str === null || str === undefined) return '';
      return String(str).replace(/[০-৯]/g, d => EN_DIGITS_MAP[d] || d);
    }

    const CLASSIFICATION_MAP = {
      'shale': 'শালি',
      'sali': 'শালি',
      'saali': 'শালি',
      'bastu': 'বাস্তু',
      'vastu': 'বাস্তু',
      'danga': 'ডাঙা',
      'do': 'ডু',
      'pukur': 'পুকুর',
      'bagan': 'বাগান',
      'dhani': 'ধানি',
      'suna': 'সুনা',
      'boro': 'বোরো',
      'patit': 'পতিত',
      'doba': 'ডোবা',
      'karkhana': 'কারখানা',
      'bila': 'বিলা',
      'nayanjali': 'নয়ঞ্জলি',
      'khas': 'খাস',
      'rasta': 'রাস্তা',
      'khal': 'খাল',
      'gora': 'গোড়া',
      'palit': 'পালিত',
      'jol': 'জল',
      'jal': 'জল',
      'bathan': 'বাথান',
      'bhit': 'ভিটি',
      'bhiti': 'ভিটি',
      'dokan': 'দোকান',
      'mondir': 'মন্দির',
      'mandir': 'মন্দির',
      'masjid': 'মসজিদ',
      'chala': 'চালা',
      'khamar': 'খামার',
      'math': 'মাঠ',
      'haat': 'হাট',
      'ghat': 'ঘাট',
      'tada': 'তড়া',
      'torha': 'তড়া',
      'tora': 'তড়া',
      'baid': 'বাইদ',
      'sol': 'শোল'
    };

    const CLASSIFICATION_MAP_EN = {
      'শালি': 'Shale',
      'বাস্তু': 'Bastu',
      'ডাঙা': 'Danga',
      'ডু': 'Do',
      'পুকুর': 'Pukur',
      'বাগান': 'Bagan',
      'ধানি': 'Dhani',
      'সুনা': 'Suna',
      'বোরো': 'Boro',
      'পতিত': 'Patit',
      'ডোবা': 'Doba',
      'কারখানা': 'Karkhana',
      'বিলা': 'Bila',
      'নয়ঞ্জলি': 'Nayanjali',
      'খাস': 'Khas',
      'রাস্তা': 'Rasta',
      'খাল': 'Khal',
      'গোড়া': 'Gora',
      'পালিত': 'Palit',
      'জল': 'Jal',
      'বাথান': 'Bathan',
      'ভিটি': 'Bhiti',
      'দোকান': 'Dokan',
      'মন্দির': 'Mandir',
      'মসজিদ': 'Masjid',
      'তড়া': 'Tada',
      'বাইদ': 'Baid',
      'শোল': 'Sol'
    };

    function translateClassification(val, lang) {
      if (!val) return '-';
      const trimmed = String(val).trim();
      if (lang === 'bn') {
        return CLASSIFICATION_MAP[trimmed.toLowerCase()] || trimmed;
      }
      return CLASSIFICATION_MAP_EN[trimmed] || trimmed;
    }

    function translateDakhaldar(val, lang) {
      if (!val) return lang === 'bn' ? '—' : 'Nil';
      const trimmed = String(val).trim();
      const lower = trimmed.toLowerCase();
      if (lang === 'bn') {
        if (lower === 'nil' || lower === '-' || lower === 'none') return '—';
        if (lower === 'anumati') return 'অনুমতি';
        if (lower === 'barga') return 'বর্গা';
        if (lower === 'direct' || lower === 'nij') return 'নিজ দখল';
        return transliterateToBengali(trimmed);
      }
      if (trimmed === '—' || trimmed === 'নেই') return 'Nil';
      if (trimmed === 'অনুমতি') return 'Anumati';
      if (trimmed === 'বর্গা') return 'Barga';
      if (trimmed === 'নিজ দখল') return 'Direct';
      return trimmed;
    }

    function translateRemarks(val, lang) {
      if (!val) return lang === 'bn' ? '—' : 'Nil';
      const trimmed = String(val).trim();
      const lower = trimmed.toLowerCase();
      if (lang === 'bn') {
        if (lower === 'nil' || lower === '-' || lower === 'none') return '—';
        if (lower.includes('section 5(1)') || lower.includes('sec 5(1)')) return 'ধারা ৫(১)';
        if (lower.includes('section 4c') || lower.includes('sec 4c')) return 'ধারা ৪সি';
        if (lower.includes('court')) return 'আদালতের নির্দেশ';
        return transliterateToBengali(trimmed);
      }
      if (trimmed === '—' || trimmed === 'নেই') return 'Nil';
      if (trimmed.includes('ধারা ৫(১)')) return 'Section 5(1)';
      if (trimmed.includes('ধারা ৪সি')) return 'Section 4C';
      return trimmed;
    }

        const NAME_DICT = {
      'anil': 'অনিল',
      'tulsidas': 'তুলসীদাস',
      'tulsi': 'তুলসী',
      'durgadas': 'দুর্গাদাস',
      'durga': 'দুর্গা',
      'fakir': 'ফকির',
      'sunil': 'সুনীল',
      'shilla': 'শীলা',
      'shila': 'শীলা',
      'bankubihari': 'বাঁকুবিহারী',
      'banku': 'বাঁকু',
      'bihari': 'বিহারী',
      'bhaskar': 'ভাস্কর',
      'kalipada': 'কালীপদ',
      'kali': 'কালী',
      'bagala': 'বগলা',
      'bagla': 'বগলা',
      'ramdas': 'রামদাস',
      'ranjit': 'রঞ্জিত',
      'gopal': 'গোপাল',
      'paramanik': 'প্রামাণিক',
      'pramanik': 'প্রামাণিক',
      'sangeeta': 'সঙ্গীতা',
      'sangita': 'সঙ্গীতা',
      'satyagopal': 'সত্যগোপাল',
      'satya': 'সত্য',
      'saraswati': 'সরস্বতী',
      'bandyopadhyay': 'বন্দ্যোপাধ্যায়',
      'banerjee': 'ব্যানার্জী',
      'mukhopadhyay': 'মুখোপাধ্যায়',
      'mukherjee': 'মুখার্জী',
      'chattopadhyay': 'চট্টোপাধ্যায়',
      'chatterjee': 'চ্যাটার্জী',
      'gangopadhyay': 'গঙ্গোপাধ্যায়',
      'ganguly': 'গাঙ্গুলী',
      'bhattacharya': 'ভট্টাচার্য',
      'bhattacharjee': 'ভট্টাচার্য',
      'chakraborty': 'চক্রবর্তী',
      'chakrabarti': 'চক্রবর্তী',
      'ghosh': 'ঘোষ',
      'bose': 'বসু',
      'basu': 'বসু',
      'mitra': 'মিত্র',
      'dutta': 'দত্ত',
      'datta': 'দত্ত',
      'roy': 'রায়',
      'ray': 'রায়',
      'saha': 'সাহা',
      'karmakar': 'কর্মকার',
      'mondal': 'মণ্ডল',
      'mandal': 'মণ্ডল',
      'das': 'দাস',
      'dass': 'দাস',
      'pal': 'পাল',
      'paul': 'পাল',
      'sen': 'সেন',
      'dey': 'দে',
      'de': 'দে',
      'kundu': 'কুণ্ডু',
      'biswas': 'বিশ্বাস',
      'haldar': 'হালদার',
      'halder': 'হালদার',
      'sarkar': 'সরকার',
      'khan': 'খান',
      'mallick': 'মল্লিক',
      'singha': 'সিংহ',
      'singh': 'সিংহ',
      'samanta': 'সামন্ত',
      'santra': 'সাঁতরা',
      'bag': 'বাগ',
      'bauri': 'বাউরি',
      'mahato': 'মাহাতো',
      'chowdhury': 'চৌধুরী',
      'ali': 'আলি',
      'hossain': 'হোসেন',
      'hussain': 'হোসেন',
      'sekh': 'শেখ',
      'sheikh': 'শেখ',
      'molla': 'মোল্লা',
      'barman': 'বর্মন',
      'nirmal': 'নির্মল',
      'nirmmal': 'নির্মল',
      'nij': 'নিজ',
      'kumar': 'কুমার',
      'kumari': 'কুমারী',
      'devi': 'দেবী',
      'debi': 'দেবী',
      'prasad': 'প্রসাদ',
      'narayan': 'নারায়ণ',
      'mohan': 'মোহন',
      'ram': 'রাম',
      'shyam': 'শ্যাম',
      'hari': 'হরি',
      'krishna': 'কৃষ্ণ',
      'shiva': 'শিব',
      'ananda': 'আনন্দ',
      'babu': 'বাবু',
      'ajay': 'অজয়',
      'ajoy': 'অজয়',
      'amit': 'অমিত',
      'anup': 'অনুপ',
      'asit': 'অসিত',
      'babul': 'বাবুল',
      'bapi': 'বাপি',
      'bikash': 'বিকাশ',
      'bimal': 'বিমল',
      'binoy': 'বিনয়',
      'biswajit': 'বিশ্বজিৎ',
      'chandan': 'চন্দন',
      'debabrata': 'দেবব্রত',
      'debasis': 'দেবাশিস',
      'debasish': 'দেবাশিস',
      'dilip': 'দিলীপ',
      'dipak': 'দীপক',
      'dipankar': 'দীপঙ্কর',
      'gour': 'গৌর',
      'gouranga': 'গৌরাঙ্গ',
      'haripada': 'হরিপদ',
      'jagannath': 'জগন্নাথ',
      'kalyan': 'কল্যাণ',
      'kamal': 'কমল',
      'kanai': 'কানাই',
      'kartik': 'কার্তিক',
      'koushik': 'কৌশিক',
      'madan': 'মদন',
      'madhab': 'মাধব',
      'mahadev': 'মহাদেব',
      'manik': 'মানিক',
      'milan': 'মিলন',
      'nabin': 'নবীন',
      'nemai': 'নিমাই',
      'nimai': 'নিমাই',
      'nihar': 'নীহার',
      'niranjan': 'নিরঞ্জন',
      'nitai': 'নিতাই',
      'pankaj': 'পঙ্কজ',
      'paresh': 'পরেশ',
      'partha': 'পার্থ',
      'prabir': 'প্রবীর',
      'pradip': 'প্রদীপ',
      'prakash': 'প্রকাশ',
      'pranab': 'প্রণব',
      'prasanta': 'প্রশান্ত',
      'rabin': 'রবিন',
      'rabindra': 'রবীন্দ্র',
      'ratan': 'রতন',
      'rohit': 'রোহিত',
      'sadhan': 'সাধন',
      'samir': 'সমীর',
      'sandip': 'সন্দীপ',
      'sanjib': 'সঞ্জীব',
      'sankar': 'শঙ্কর',
      'santosh': 'সন্তোষ',
      'saroj': 'সরোজ',
      'sasanka': 'শশাঙ্ক',
      'shib': 'শিব',
      'shambhu': 'শম্ভু',
      'shyamal': 'শ্যামল',
      'subhas': 'সুভাষ',
      'subhash': 'সুভাষ',
      'subrata': 'সুব্রত',
      'sudhir': 'সুধীর',
      'sukumar': 'সুকুমার',
      'sumanta': 'সুমন্ত',
      'suman': 'সুমন',
      'sundar': 'সুন্দর',
      'surajit': 'সুরজিৎ',
      'suresh': 'সুরেশ',
      'swapan': 'স্বপন',
      'tarapada': 'তারাপদ',
      'tarun': 'তরুণ',
      'tapan': 'তপন',
      'uttam': 'উত্তম'
    };

    function phoneticToBengali(word) {
      if (!word) return '';
      const clean = word.toLowerCase().trim();
      if (NAME_DICT[clean]) return NAME_DICT[clean];
      if (/^[\u0980-\u09FF\s]+$/.test(word)) return word;

      let s = clean;
      const multi = [
        ['ksha', 'ক্ষ'], ['ksh', 'ক্ষ'],
        ['chha', 'ছা'], ['chh', 'ছ'],
        ['shya', 'শ্য'], ['shwa', 'শ্ব'],
        ['bha', 'ভা'], ['bh', 'ভ'],
        ['dha', 'ধা'], ['dh', 'ধ'],
        ['tha', 'থা'], ['th', 'থ'],
        ['gha', 'ঘা'], ['gh', 'ঘ'],
        ['kha', 'খা'], ['kh', 'খ'],
        ['cha', 'চা'], ['ch', 'চ'],
        ['jha', 'ঝা'], ['jh', 'ঝ'],
        ['pha', 'ফা'], ['ph', 'ফ'],
        ['sha', 'শা'], ['sh', 'শ'],
        ['rha', 'ঢ়া'], ['rh', 'ঢ়'],
        ['nga', 'ঙা'], ['ng', 'ঙ'],
        ['nya', 'ঞা'], ['ny', 'ঞ'],
        ['tra', 'ত্র'], ['tro', 'ত্র'],
        ['jna', 'জ্ঞ'], ['gya', 'জ্ঞ']
      ];
      for (let i = 0; i < multi.length; i++) {
        s = s.split(multi[i][0]).join(multi[i][1]);
      }

      const single = [
        ['k', 'ক'], ['g', 'গ'], ['j', 'জ'], ['t', 'ত'],
        ['d', 'দ'], ['n', 'ন'], ['p', 'প'], ['b', 'ব'],
        ['m', 'ম'], ['r', 'র'], ['l', 'ল'], ['s', 'স'],
        ['h', 'হ'], ['y', 'য়'], ['w', 'ওয়'], ['v', 'ভ'],
        ['z', 'য'], ['c', 'ক'], ['q', 'ক'], ['x', 'ক্স']
      ];
      for (let i = 0; i < single.length; i++) {
        s = s.split(single[i][0]).join(single[i][1]);
      }

      const vowels = [
        ['aa', 'া'], ['ee', 'ী'], ['oo', 'ূ'],
        ['ai', 'ৈ'], ['au', 'ৌ'], ['ou', 'ৌ'],
        ['oi', 'ৈ'], ['a', 'া'], ['i', 'ি'],
        ['u', 'ু'], ['e', 'ে'], ['o', 'ো']
      ];
      for (let i = 0; i < vowels.length; i++) {
        s = s.split(vowels[i][0]).join(vowels[i][1]);
      }

      s = s.replace(/^া/, 'আ')
           .replace(/^ি/, 'ই')
           .replace(/^ী/, 'ঈ')
           .replace(/^ু/, 'উ')
           .replace(/^ূ/, 'ঊ')
           .replace(/^ে/, 'এ')
           .replace(/^ৈ/, 'ঐ')
           .replace(/^ো/, 'ও')
           .replace(/^ৌ/, 'ঔ');

      return s;
    }

    function transliterateToBengali(text) {
      if (!text) return '';
      const sanitized = String(text)
        .replace(/\bbyakti\b/gi, '')
        .replace(/\bব্যক্তি(?:গত)?\b/gi, '')
        .trim();
      return sanitized.split(/\s+/).map(w => {
        if (!w) return '';
        if (/^[\u0980-\u09FF]+$/.test(w)) return w;
        const clean = w.toLowerCase().replace(/[^a-z]/g, '');
        if (NAME_DICT[clean]) return NAME_DICT[clean];
        return phoneticToBengali(clean) || w;
      }).join(' ');
    }

    
    function formatShareArea(val, isBn) {
      if (!val || val === '-') return '-';
      const str = String(val).trim();
      const match = str.match(/^([\d.]+)(?:\s*(?:ekar|acre|\u098f\u0995\u09b0)?\s*(?:\(([^)]+)\))?)?/i);
      if (!match) return isBn ? toBengaliDigits(str) : str;
      const num = match[1];
      const shreni = match[2] ? match[2].trim() : '';
      const numDisplay = isBn ? toBengaliDigits(num) : num;
      if (!shreni) {
        return isBn ? (numDisplay + ' \u098f\u0995\u09b0') : (numDisplay + ' Acre');
      }
      if (isBn) {
        const bnShreni = CLASSIFICATION_MAP[shreni.toLowerCase()] || shreni;
        return numDisplay + ' \u098f\u0995\u09b0 (\u09b6\u09cd\u09b0\u09c7\u09a3\u09bf: ' + bnShreni + ')';
      } else {
        const enShreni = CLASSIFICATION_MAP_EN[shreni] || (shreni === '\u09a4\u09dc\u09be' ? 'Tada' : shreni);
        return numDisplay + ' Acre (Class: ' + enShreni + ')';
      }
    }
  
    function setScheduleLanguage(lang, triggerRerender = true) {
      currentScheduleLang = (lang === 'bn') ? 'bn' : 'en';
      const btnEn = document.getElementById('btnSchedLangEn');
      const btnBn = document.getElementById('btnSchedLangBn');
      if (btnEn && btnBn) {
        if (currentScheduleLang === 'bn') {
          btnBn.classList.add('active');
          btnEn.classList.remove('active');
        } else {
          btnEn.classList.add('active');
          btnBn.classList.remove('active');
        }
      }

      const isBn = (currentScheduleLang === 'bn');

      const swipeHint = document.getElementById('swipeHintText');
      if (swipeHint) {
        swipeHint.innerText = isBn ? '\u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u09a4\u09ab\u09b8\u09bf\u09b2 \u09a6\u09c7\u0996\u09a4\u09c7 \u09aa\u09be\u09b6\u09c7 \u09b8\u09cd\u0995\u09cd\u09b0\u09cb\u09b2 \u0995\u09b0\u09c1\u09a8' : 'Swipe horizontally to view full schedule';
      }

      if (triggerRerender && activeData) {
        displayResults(activeData);
      }
    }

function renderTableHead(mode) {
      const theadRow = document.getElementById('recordsTableHeadRow');
      if (!theadRow) return;
      const isBn = (currentScheduleLang === 'bn');
      if (mode === 'khatian') {
        if (isBn) {
          theadRow.innerHTML = `
            <th>\u09a6\u09be\u0997 \u09a8\u09ae\u09cd\u09ac\u09b0</th>
            <th>\u099c\u09ae\u09bf\u09b0 \u09b6\u09cd\u09b0\u09c7\u09a3\u09bf</th>
            <th>\u0985\u0982\u09b6</th>
            <th>\u0985\u0982\u09b6 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3 (\u098f\u0995\u09b0)</th>
            <th>\u09a6\u0996\u09b2\u09a6\u09be\u09b0</th>
            <th>\u09ae\u09a8\u09cd\u09a4\u09ac\u09cd\u09af</th>
          `;
        } else {
          theadRow.innerHTML = `
            <th>Plot / Dag No</th>
            <th>Classification</th>
            <th>Share</th>
            <th>Share Area (Acre)</th>
            <th>Dakhaldar</th>
            <th>Remarks</th>
          `;
        }
      } else {
        if (isBn) {
          theadRow.innerHTML = `
            <th>\u0996\u09a4\u09bf\u09af\u09bc\u09be\u09a8 \u09a8\u09ae\u09cd\u09ac\u09b0</th>
            <th>\u09b0\u09be\u09af\u09bc\u09a4\u09c7\u09b0 \u09a8\u09be\u09ae</th>
            <th>\u09aa\u09bf\u09a4\u09be/\u09b8\u09cd\u09ac\u09be\u09ae\u09c0\u09b0 \u09a8\u09be\u09ae</th>
            <th>\u0985\u0982\u09b6</th>
            <th>\u0985\u0982\u09b6 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3 (\u098f\u0995\u09b0)</th>
            <th>\u09a6\u0996\u09b2\u09a6\u09be\u09b0</th>
            <th>\u09ae\u09a8\u09cd\u09a4\u09ac\u09cd\u09af</th>
          `;
        } else {
          theadRow.innerHTML = `
            <th>Khatian No</th>
            <th>Rayat / Owner Name</th>
            <th>Father / Husband</th>
            <th>Share</th>
            <th>Share Area (Acre)</th>
            <th>Dakhaldar</th>
            <th>Remarks</th>
          `;
        }
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
      triggerPlotPossessorModal(p.plotNo, p.dakhaldar, p.dakhaldarRaw, {
        classification: p.classification,
        area: p.shareArea
      });
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
      triggerPlotPossessorModal(curPlotNo, h.dakhaldar, h.dakhaldarRaw, {
        holderName: h.ownerName,
        fatherOrHusband: h.fatherOrHusband,
        khatianNo: h.khatianNo
      });
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

      const isBn = (currentScheduleLang === 'bn');
      if (!plots || plots.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:#64748b;">${isBn ? 'এই খতিয়ানের অধীনে কোনো দাগের রেকর্ড পাওয়া যায়নি।' : 'No plot records found under this Khatian.'}</td></tr>`;
        return;
      }

      tbody.innerHTML = plots.map((p, idx) => {
        const rawPlot = (p.plotNo || '-').trim();
        const plotNoDisplay = isBn ? toBengaliDigits(rawPlot) : rawPlot;
        const classDisplay = isBn ? translateClassification(p.classification, 'bn') : (p.classification || '-');
        const shareDisplay = isBn ? toBengaliDigits(p.share || '-') : (p.share || '-');
        const shareAreaDisplay = formatShareArea(p.shareArea, isBn);

        let dakhaldarStr = (p.dakhaldar || 'Nil').trim();
        let remarksStr = (p.remarks || 'Nil').trim();

        if (/^nil\s+/i.test(remarksStr)) {
          remarksStr = remarksStr.replace(/^nil\s+/i, '').trim();
        }
        if (/^nil\s+/i.test(dakhaldarStr)) {
          dakhaldarStr = dakhaldarStr.replace(/^nil\s+/i, '').trim();
        }

        let dakhaldarCell = `<span class="tbl-nil">${isBn ? '—' : 'Nil'}</span>`;
        if (dakhaldarStr && dakhaldarStr.toLowerCase() !== 'nil') {
          const isBarga = /barga|বর্গা/i.test(dakhaldarStr);
          const badgeClass = isBarga ? 'tbl-badge-btn possessor-badge-btn barga-badge-btn' : 'tbl-badge-btn possessor-badge-btn';
          const badgeText = isBn ? translateDakhaldar(dakhaldarStr, 'bn') : dakhaldarStr;
          dakhaldarCell = `<button type="button" class="${badgeClass}" onclick="openPlotPossessorByIndex(${idx})">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>${escapeHtml(badgeText)}</span>
          </button>`;
        }

        let remarksCell = `<span class="tbl-nil">${isBn ? '—' : 'Nil'}</span>`;
        if (remarksStr && remarksStr.toLowerCase() !== 'nil') {
          const remText = isBn ? translateRemarks(remarksStr, 'bn') : remarksStr;
          remarksCell = `<button type="button" class="tbl-badge-btn remarks-badge-btn" onclick="openPlotRemarksByIndex(${idx})">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>${escapeHtml(remText)}</span>
          </button>`;
        }

        return `
          <tr>
            <td>
              <div class="plot-cell-flex">
                <span class="khatian-pill">${escapeHtml(plotNoDisplay)}</span>
                <button type="button" class="tbl-badge-btn map-badge-btn" onclick="openPlotMapByIndex(${idx})" title="${isBn ? 'দাগের ক্যাডাস্ট্রাল ম্যাপ নকশা' : 'View Dager Map'}">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                  <span>${isBn ? 'ম্যাপ' : 'Map'}</span>
                </button>
              </div>
            </td>
            <td>
              <div class="rayat-name-cell">
                <span class="rayat-name-main">${escapeHtml(classDisplay)}</span>
              </div>
            </td>
            <td><span class="share-val">${escapeHtml(shareDisplay)}</span></td>
            <td><span class="share-quantum">${escapeHtml(shareAreaDisplay)}</span></td>
            <td>${dakhaldarCell}</td>
            <td>${remarksCell}</td>
          </tr>
        `;
      }).join('');

      const countEl = document.getElementById('filterCountDisplay');
      if (countEl) {
        countEl.innerText = isBn ? `মোট ${toBengaliDigits(plots.length)}টি রেকর্ড প্রদর্শিত হচ্ছে` : `Showing all ${plots.length} records`;
      }
    }

    function displayResults(data) {
      document.getElementById('resultsCard').style.display = 'block';

      const isBn = (currentScheduleLang === 'bn');
      const liveBadge = document.getElementById('resLiveBadge');
      if (data.liveInfo) {
        const cleanLive = String(data.liveInfo).replace(/Live\s*Data\s*As\s*On\s*:?/gi, '').trim();
        liveBadge.innerText = isBn ? ("\u09b8\u09b0\u09be\u09b8\u09b0\u09bf \u09a4\u09a5\u09cd\u09af: " + toBengaliDigits(cleanLive)) : (data.liveInfo.includes('Live Data') ? data.liveInfo : ("Live Data As On " + data.liveInfo));
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
        const rawKh = kd.khatianNo || khInputVal || '-';
        if (lblStat1) lblStat1.innerText = isBn ? 'খতিয়ান নম্বর' : 'Khatian No';
        document.getElementById('resDagNo').innerText = isBn ? toBengaliDigits(rawKh) : toEnglishDigits(rawKh);

        if (lblStat2) lblStat2.innerText = isBn ? 'রায়তের নাম' : 'Rayat / Owner';
        const rawOwner = kd.ownerName || 'N/A';
        document.getElementById('resClassification').innerText = isBn ? transliterateToBengali(rawOwner) : rawOwner;

        if (lblStat3) lblStat3.innerText = isBn ? 'মোট জমির পরিমাণ' : 'Total Land Area';
        const rawArea = kd.totalArea || '-';
        const cleanArea = String(rawArea).replace(/\s*(?:acre|ekar|\u098f\u0995\u09b0)\b/gi, '').trim();
        document.getElementById('resTotalArea').innerText = isBn ? toBengaliDigits(cleanArea) : toEnglishDigits(cleanArea);
        if (resAreaUnit) resAreaUnit.innerText = isBn ? '\u098f\u0995\u09b0' : 'Acre';

        if (lblStat4) lblStat4.innerText = isBn ? 'অন্তর্ভুক্ত দাগ' : 'Total Plots';
        const plotsCount = data.plots ? data.plots.length : (parseInt(kd.plotCount) || 0);
        document.getElementById('resHoldersCount').innerText = isBn ? `${toBengaliDigits(plotsCount)} টি দাগ` : `${plotsCount} Plots`;

        if (resLedgerTitle) {
          resLedgerTitle.innerText = isBn ? 'খতিয়ানভুক্ত দাগের বিবরণ ও পরিমাণ' : 'Schedule of Plots under Khatian';
        }
        if (tableSearchInput) {
          tableSearchInput.placeholder = isBn ? '\u09a6\u09be\u0997 \u09a8\u09ae\u09cd\u09ac\u09b0 \u09ac\u09be \u099c\u09ae\u09bf\u09b0 \u09b6\u09cd\u09b0\u09c7\u09a3\u09bf \u09a6\u09bf\u09af\u09bc\u09c7 \u0996\u09c1\u0981\u099c\u09c1\u09a8\u0987' : 'Search by plot no or classification...';
        }

        renderTableHead('khatian');
        renderPlotsTable(data.plots || []);
      } else {
        const plotDetails = data.plotDetails || {};
        const plotInputVal = document.getElementById('txtPlotNo').value.trim();
        const rawDag = plotDetails.dagNo || plotInputVal || '-';
        if (lblStat1) lblStat1.innerText = isBn ? 'দাগ নম্বর' : 'Plot / Dag No';
        document.getElementById('resDagNo').innerText = isBn ? toBengaliDigits(rawDag) : toEnglishDigits(rawDag);

        if (lblStat2) lblStat2.innerText = isBn ? 'জমির শ্রেণি' : 'Classification';
        const rawClass = plotDetails.classification || 'N/A';
        document.getElementById('resClassification').innerText = isBn ? translateClassification(rawClass, 'bn') : rawClass;

        if (lblStat3) lblStat3.innerText = isBn ? 'মোট পরিমাণ' : 'Total Area';
        const rawArea = plotDetails.totalArea || '-';
        const cleanArea = String(rawArea).replace(/\s*(?:acre|ekar|\u098f\u0995\u09b0)\b/gi, '').trim();
        document.getElementById('resTotalArea').innerText = isBn ? toBengaliDigits(cleanArea) : toEnglishDigits(cleanArea);
        if (resAreaUnit) resAreaUnit.innerText = isBn ? '\u098f\u0995\u09b0' : 'Acre';

        if (lblStat4) lblStat4.innerText = isBn ? 'মোট অংশীদার' : 'Total Rayats';
        const holders = data.holders || [];
        document.getElementById('resHoldersCount').innerText = isBn ? `${toBengaliDigits(holders.length)} জন` : holders.length;

        if (resLedgerTitle) {
          resLedgerTitle.innerText = isBn ? 'খতিয়ান ও দাগের তথ্য' : 'Land Ownership Schedule';
        }
        if (tableSearchInput) {
          tableSearchInput.placeholder = isBn ? '\u09ae\u09be\u09b2\u09bf\u0995, \u0996\u09a4\u09bf\u09af\u09bc\u09be\u09a8 \u09ac\u09be \u09aa\u09bf\u09a4\u09be \u09a6\u09bf\u09af\u09bc\u09c7 \u0996\u09c1\u0981\u099c\u09c1\u09a8...' : 'Search by owner, khatian, or father...';
        }

        renderTableHead('plot');
        renderHoldersTable(holders);
      }

      document.getElementById('rawJsonPanel').innerText = JSON.stringify(data, null, 2);

      const officialContent = document.getElementById('officialHtmlContent');
      if (data.rawHtml) {
        officialContent.innerHTML = formatOfficialPortalHtml(data.rawHtml, currentScheduleLang);
      } else {
        officialContent.innerHTML = `<div style="color:#64748b; padding:20px; text-align:center;">${isBn ? 'অফিসিয়াল পোর্টাল তথ্য উপলব্ধ নেই।' : 'Official portal extract not available.'}</div>`;
      }

      document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderHoldersTable(holders) {
      const tbody = document.getElementById('holdersTbody');
      tbody.innerHTML = '';
      currentRenderedHolders = holders || [];

      const isBn = (currentScheduleLang === 'bn');
      if (!holders || holders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:#64748b;">${isBn ? 'এই দাগের অধীনে কোনো রায়তের রেকর্ড পাওয়া যায়নি।' : 'No land records found for this entry.'}</td></tr>`;
        return;
      }

      tbody.innerHTML = holders.map((h, idx) => {
        const rawKh = (h.khatianNo || '-').trim();
        const khDisplay = isBn ? toBengaliDigits(rawKh) : rawKh;
        const cleanOwnerName = (h.ownerName || '-').replace(/\bbyakti\b/gi, '').replace(/\b\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf(?:\u0997\u09a4)?\b/gi, '').trim();
        const ownerDisplay = isBn ? transliterateToBengali(cleanOwnerName) : cleanOwnerName;
        const fatherDisplay = isBn ? transliterateToBengali(h.fatherOrHusband) : (h.fatherOrHusband || '-');
        const shareDisplay = isBn ? toBengaliDigits(h.share || '-') : (h.share || '-');
        const shareAreaDisplay = formatShareArea(h.shareArea, isBn);

        let dakhaldarStr = (h.dakhaldar || 'Nil').trim();
        let remarksStr = (h.remarks || 'Nil').trim();

        if (/^nil\s+/i.test(remarksStr)) {
          remarksStr = remarksStr.replace(/^nil\s+/i, '').trim();
        }
        if (/^nil\s+/i.test(dakhaldarStr)) {
          dakhaldarStr = dakhaldarStr.replace(/^nil\s+/i, '').trim();
        }

        let dakhaldarCell = `<span class="tbl-nil">${isBn ? '—' : 'Nil'}</span>`;
        if (dakhaldarStr && dakhaldarStr.toLowerCase() !== 'nil') {
          const isBarga = /barga|বর্গা/i.test(dakhaldarStr);
          const badgeClass = isBarga ? 'tbl-badge-btn possessor-badge-btn barga-badge-btn' : 'tbl-badge-btn possessor-badge-btn';
          const badgeText = isBn ? translateDakhaldar(dakhaldarStr, 'bn') : dakhaldarStr;
          dakhaldarCell = `<button type="button" class="${badgeClass}" onclick="openHolderPossessorByIndex(${idx})">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>${escapeHtml(badgeText)}</span>
          </button>`;
        }

        let remarksCell = `<span class="tbl-nil">${isBn ? '—' : 'Nil'}</span>`;
        if (remarksStr && remarksStr.toLowerCase() !== 'nil') {
          const remText = isBn ? translateRemarks(remarksStr, 'bn') : remarksStr;
          remarksCell = `<button type="button" class="tbl-badge-btn remarks-badge-btn" onclick="openHolderRemarksByIndex(${idx})">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>${escapeHtml(remText)}</span>
          </button>`;
        }

        return `
          <tr>
            <td><span class="khatian-pill">${escapeHtml(khDisplay)}</span></td>
            <td>
              <div class="rayat-name-cell">
                <span class="rayat-name-main">${escapeHtml(ownerDisplay)}</span>
                <span class="rayat-classification bn">${isBn ? 'ব্যক্তিগত মালিকানা' : 'Individual Ownership'}</span>
              </div>
            </td>
            <td>${escapeHtml(fatherDisplay)}</td>
            <td><span class="share-val">${escapeHtml(shareDisplay)}</span></td>
            <td><span class="share-quantum">${escapeHtml(shareAreaDisplay)}</span></td>
            <td>${dakhaldarCell}</td>
            <td>${remarksCell}</td>
          </tr>
        `;
      }).join('');

      const countEl = document.getElementById('filterCountDisplay');
      if (countEl) {
        countEl.innerText = isBn ? `মোট ${toBengaliDigits(holders.length)}টি রেকর্ড প্রদর্শিত হচ্ছে` : `Showing all ${holders.length} records`;
      }
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
        const isBnFilter = (currentScheduleLang === 'bn');
        document.getElementById('filterCountDisplay').innerText = isBnFilter ? ("\u09ae\u09cb\u099f " + toBengaliDigits(plots.length) + "\u099f\u09bf\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 " + toBengaliDigits(filtered.length) + "\u099f\u09bf \u09b0\u0987\u0995\u09b0\u09cd\u09a1 \u09aa\u09cd\u09b0\u09a6\u09b0\u09cd\u09b6\u09bf\u09a4 \u09b9\u099a\u09cd\u099b\u09c7") : ("Filtered " + filtered.length + " of " + plots.length + " records");
      } else {
        const holders = activeData.holders || [];
        const filtered = holders.filter(h =>
          (h.ownerName && h.ownerName.toLowerCase().includes(q)) ||
          (h.khatianNo && String(h.khatianNo).toLowerCase().includes(q)) ||
          (h.fatherOrHusband && h.fatherOrHusband.toLowerCase().includes(q))
        );
        renderHoldersTable(filtered);
        const isBnFilterH = (currentScheduleLang === 'bn');
        document.getElementById('filterCountDisplay').innerText = isBnFilterH ? ("\u09ae\u09cb\u099f " + toBengaliDigits(holders.length) + "\u099f\u09bf\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 " + toBengaliDigits(filtered.length) + "\u099f\u09bf \u09b0\u0987\u0995\u09b0\u09cd\u09a1 \u09aa\u09cd\u09b0\u09a6\u09b0\u09cd\u09b6\u09bf\u09a4 \u09b9\u099a\u09cd\u099b\u09c7") : ("Filtered " + filtered.length + " of " + holders.length + " records");
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
        setScheduleLanguage(prevModernLang || 'en', true);
      } else {
        modernBtn.className = 'btn-view-tab';
        officialBtn.className = 'btn-view-tab active';
        modernTable.style.display = 'none';
        officialWrap.style.display = 'block';
        prevModernLang = currentScheduleLang;
        setScheduleLanguage('bn', true);
      }
    }

    function formatOfficialPortalHtml(rawHtml, lang = currentScheduleLang) {
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

      if (lang === 'bn') {
        html = html
          .replace(/Khatian\s*No/gi, 'খতিয়ান নং')
          .replace(/Raiter\s*Nam/gi, 'রায়তের নাম')
          .replace(/Pita\/swami/gi, 'পিতা/স্বামীর নাম')
          .replace(/Raiter\s*Dharan/gi, 'রায়তের ধরন')
          .replace(/Thikana/gi, 'ঠিকানা')
          .replace(/Zamir\s*Moat\s*Pariman\s*\(ekar\)|Zamir\s*Moat\s*Pariman\s*\(একর\)|Zamir\s*Moat\s*Pariman/gi, 'জমির মোট পরিমাণ (একর)')
          .replace(/Zamir\s*Pariman\s*\(ekar\)|Zamir\s*Pariman\s*\(একর\)|Zamir\s*Pariman/gi, 'জমির পরিমাণ (একর)')
          .replace(/Dager\s*Myap|Dager\s*Map/gi, 'দাগের ম্যাপ')
          .replace(/Dager\s*Sankhyan/gi, 'দাগের সংখ্যা')
          .replace(/Dag\s*No/gi, 'দাগ নং')
          .replace(/Shreni/gi, 'শ্রেণি')
          .replace(/Ansh\s*Pariman\s*\(ekar\)|Ansh\s*Pariman\s*\(একর\)|Ansh\s*Pariman/gi, 'অংশ পরিমাণ (একর)')
          .replace(/<b>\s*Ansh\s*<\/b>|<center>\s*Ansh\s*<\/center>|\bAnsh\b/gi, 'অংশ')
          .replace(/Ongsho/gi, 'অংশ')
          .replace(/Dakhaldar/gi, 'দখলদার')
          .replace(/Mantaby|Montoobyo|Montobyo/gi, 'মন্তব্য')
          .replace(/Remarks/gi, 'মন্তব্য')
          .replace(/Area\(Acre\)|Zamir\s*Pariman\(Ekar\)/gi, 'জমির পরিমাণ (একর)')
          .replace(/Byakti/gi, 'ব্যক্তিগত')
          .replace(/Ekar\b|Acre\b/gi, 'একর')
          .replace(/Live\s*Data\s*As\s*On/gi, 'সরাসরি তথ্য:')
          .replace(/Thana/gi, 'থানা')
          .replace(/J\.?l\s*No/gi, 'জে.এল. নং')
          .replace(/Mouza/gi, 'মৌজা')
          .replace(/District/gi, 'জেলা')
          .replace(/Click\s*Here/gi, 'এখানে ক্লিক করুন')
          .replace(/Atrasbatber\s*Dager\s*Bibaran\s*O\s*Pariman:?/gi, 'অত্রস্বত্বের দাগের বিবরণ ও পরিমাণ:')
          .replace(/\(?\s*Exact\s+quantum\s+of\s+land\s+against\s+any\s+plot\s+will\s+be\s+determined\s+as\s+per\s+the\s+share\s+mentioned\s+in\s+respect\s+of\s+that\s+plot\.?\s*\)?/gi, '(যেকোনো দাগের ক্ষেত্রে জমির সঠিক পরিমাণ সেই দাগের উল্লিখিত অংশ অনুযায়ী নির্ধারিত হবে।)')
          .replace(/\(?\s*\*\s*Exact\s+quantum\s+of\s+land\s+in\s+respect\s+of\s+any\s+khatian\s+will\s+be\s+determined\s+as\s+per\s+the\s+share\s+mentioned\s+in\s+the\s+khatian\s+against\s+the\s+Plot\.?\s*\)?/gi, '(* যেকোনো খতিয়ানের ক্ষেত্রে জমির সঠিক পরিমাণ সেই দাগের বিপরীতে খতিয়ানে উল্লিখিত অংশ অনুযায়ী নির্ধারিত হবে।)')
          .replace(/(?:Thana|থানা)[\s\S]*?<font[^>]*>\s*([a-zA-Z\s]+)<\/font>/gi, (m, thanaName) => {
            const cleanThana = thanaName.trim();
            const lowerThana = cleanThana.toLowerCase();
            const thanaBn = lowerThana === 'bankura' ? 'বাঁকুড়া' : (lowerThana === 'kotulpur' ? 'কোতুলপুর' : transliterateToBengali(cleanThana));
            return m.replace(thanaName, thanaBn);
          });

        html = html.replace(/(?:রায়তের|রায়তের)\s*নাম\s*:\s*([a-zA-Z\s]+)/gi, (m, p1) => 'রায়তের নাম: ' + transliterateToBengali(p1));
        html = html.replace(/(পিতা\/স্বামীর\s*নাম\s*:\s*)([a-zA-Z\s]+)/gi, (m, p1, p2) => p1 + (p2.trim().toLowerCase() === 'nil' ? '—' : transliterateToBengali(p2)));

        html = html.replace(/(<td[^>]*>)([\s\S]*?)(<\/td>)/gi, (match, openTag, cellContent, closeTag) => {
          let newInner = cellContent;

          if (/byakti|ব্যক্তিগত/i.test(newInner)) {
            newInner = newInner.replace(/(?:<left[^>]*>)?\s*([a-zA-Z\s.'-]+?)\s*(?:<\/?br\s*\/?>|\s*<font)/i, (m, name) => {
              const cleanName = name.trim();
              if (cleanName && cleanName.length > 1 && !/^(?:nil|byakti)$/i.test(cleanName)) {
                return m.replace(name, transliterateToBengali(cleanName));
              }
              return m;
            });
          }

          let trimmed = newInner.replace(/<[^>]+>/g, '').trim();
          if (CLASSIFICATION_MAP[trimmed.toLowerCase()]) {
            newInner = newInner.replace(new RegExp('\\b' + trimmed + '\\b', 'gi'), CLASSIFICATION_MAP[trimmed.toLowerCase()]);
          } else if (/^nil$/i.test(trimmed)) {
            newInner = cellContent.replace(/nil/gi, '—');
          } else if (/^anumati$/i.test(trimmed)) {
            newInner = cellContent.replace(/anumati/gi, 'অনুমতি');
          } else if (/^barga$/i.test(trimmed)) {
            newInner = cellContent.replace(/barga/gi, 'বর্গা');
          } else if (/^sadharaner\s*byabaharyya$/i.test(trimmed)) {
            newInner = cellContent.replace(/sadharaner\s*byabaharyya/gi, 'সাধারণের ব্যবহার্য');
          } else if (/^direct|nij$/i.test(trimmed)) {
            newInner = cellContent.replace(/direct|nij/gi, 'নিজ দখল');
          } else if (/^[\d./]+$/.test(trimmed)) {
            newInner = toBengaliDigits(newInner);
          } else if (trimmed && /^[a-zA-Z\s]+$/.test(trimmed) && trimmed.length > 2 && !/<[a-z]/i.test(trimmed)) {
            newInner = transliterateToBengali(trimmed);
          }
          return openTag + newInner + closeTag;
        });

        html = html.replace(/(>)([^<]+)(<)/g, (m, p1, textNode, p3) => {
          let out = textNode.replace(/\bnil\b/gi, '—');
          out = out.replace(/[0-9]/g, d => BN_DIGITS[parseInt(d, 10)]);
          return p1 + out + p3;
        });
      } else {
        html = html
          .replace(/খতিয়ান নং|খতিয়ান নং/g, 'Khatian No')
          .replace(/রায়তের নাম|রায়তের নাম/g, 'Raiter Nam')
          .replace(/পিতা\/স্বামীর নাম/g, 'Pita/swami')
          .replace(/রায়তের ধরন|রায়তের ধরন/g, 'Raiter Dharan')
          .replace(/ঠিকানা/g, 'Thikana')
          .replace(/জমির মোট পরিমাণ \(একর\)|Zamir\s*Moat\s*Pariman\s*\(ekar\)/gi, 'Total Land Area (Acre)')
          .replace(/জমির পরিমাণ \(একর\)/g, 'Area(Acre)')
          .replace(/জমির পরিমাণ/g, 'Zamir Pariman')
          .replace(/দাগের ম্যাপ|Dager\s*Myap/gi, 'Plot Map')
          .replace(/দাগের সংখ্যা/g, 'Dager Sankhyan')
          .replace(/দাগ নং/g, 'Dag No')
          .replace(/শ্রেণি/g, 'Shreni')
          .replace(/অংশ পরিমাণ \(একর\)|Ansh\s*Pariman\s*\(ekar\)/gi, 'Share Area (Acre)')
          .replace(/অংশ/g, 'Share')
          .replace(/Ongsho/g, 'Share')
          .replace(/দখলদার/g, 'Dakhaldar')
          .replace(/মন্তব্য|Mantaby|Montobyo|Montoobyo/gi, 'Remarks')
          .replace(/ব্যক্তিগত/g, 'Byakti')
          .replace(/সরাসরি তথ্য:/g, 'Live Data As On')
          .replace(/থানা/g, 'Thana')
          .replace(/জে\.এল\. নং/g, 'J.l No')
          .replace(/মৌজা/g, 'Mouza')
          .replace(/জেলা/g, 'District')
          .replace(/অনুমতি/g, 'Anumati')
          .replace(/বর্গা/g, 'Barga')
          .replace(/সাধারণের ব্যবহার্য/g, 'Public Use')
          .replace(/নিজ দখল/g, 'Direct')
          .replace(/ক্লিক হেয়ার|এখানে ক্লিক করুন/g, 'Click Here')
          .replace(/অত্রস্বত্বের দাগের বিবরণ ও পরিমাণ:?/g, 'Schedule and Quantum of Plots under this Title:')
          .replace(/\(?যেকোনো দাগের ক্ষেত্রে জমির সঠিক পরিমাণ সেই দাগের উল্লিখিত অংশ অনুযায়ী নির্ধারিত হবে।\)?|\(?যেকোনো দাগের ক্ষেত্রে জমির সঠিক পরিমাণ সেই দাগের উল্লিখিত অংশ অনুযায়ী নির্ধারিত হবে।\)?/g, '(Exact quantum of land against any plot will be determined as per the share mentioned in respect of that plot.)')
          .replace(/\(?\*\s*যেকোনো খতিয়ানের ক্ষেত্রে জমির সঠিক পরিমাণ সেই দাগের বিপরীতে খতিয়ানে উল্লিখিত অংশ অনুযায়ী নির্ধারিত হবে।\)?/g, '(* Exact quantum of land in respect of any khatian will be determined as per the share mentioned in the khatian against the Plot.)');

        html = html.replace(/(<td[^>]*>)([\s\S]*?)(<\/td>)/gi, (match, openTag, cellContent, closeTag) => {
          let trimmed = cellContent.replace(/<[^>]+>/g, '').trim();
          let newInner = cellContent;
          if (CLASSIFICATION_MAP_EN[trimmed]) {
            newInner = cellContent.replace(new RegExp('\\b' + trimmed + '\\b', 'g'), CLASSIFICATION_MAP_EN[trimmed]);
          } else if (trimmed === '—') {
            newInner = cellContent.replace(/—/g, 'Nil');
          }
          return openTag + newInner + closeTag;
        });

        html = html.replace(/(>)([^<]+)(<)/g, (m, p1, textNode, p3) => {
          let out = textNode.replace(/[০-৯]/g, d => EN_DIGITS_MAP[d] || d);
          return p1 + out + p3;
        });
      }

      const swipeHintBn = 'সম্পূর্ণ তফসিল দেখতে পাশে স্ক্রোল করুন';
      const swipeHintEn = 'Swipe horizontally to view full schedule';
      const swipeText = (lang === 'bn') ? swipeHintBn : swipeHintEn;

      if (!html.includes('official-table-scroll-container')) {
        html = html.replace(/(<table[^>]*class="[^"]*table-(?:responsive|fixed)[^"]*"[^>]*>[\s\S]*?<\/table>)/gi, `
          <div class="mobile-table-swipe-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="display:inline-block; vertical-align:middle; flex-shrink:0;"><polyline points="7 8 3 12 7 16" /><polyline points="17 8 21 12 17 16" /><line x1="3" y1="12" x2="21" y2="12" /></svg><span>${swipeText}</span>
          </div>
          <div class="official-table-scroll-container">
            $1
          </div>
        `);
      }

      if (!html.includes('official-table-scroll-container') && html.includes('<table')) {
        html = html.replace(/(<table[^>]*>(?:(?!official-plot-meta-table|official-khatian-meta-table)[\s\S])*?(?:Dag\s*No|দাগ\s*নং|Dakhaldar|Shreni|শ্রেণি)[\s\S]*?<\/table>)/gi, (m) => {
          if (m.includes('official-plot-meta-table') || m.includes('official-khatian-meta-table')) return m;
          return `
            <div class="mobile-table-swipe-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="display:inline-block; vertical-align:middle; flex-shrink:0;"><polyline points="7 8 3 12 7 16" /><polyline points="17 8 21 12 17 16" /><line x1="3" y1="12" x2="21" y2="12" /></svg><span>${swipeText}</span>
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

    function openPossessorModal(khatian, dag, mouza, code, typeText, extraMeta) {
      const khatianTrim = (khatian || '').trim();
      const dagTrim = (dag || '').trim();
      const mouzaTrim = (mouza || '').trim();
      const codeTrim = (code || '').trim();
      const typeTrim = (typeText || '').trim();

      const { activeDist, activeBlock, activeMouza, activeJl } = getActiveSelectionMeta();
      let distCode = activeDist;
      let blockCode = activeBlock;
      let mouzaCode = mouzaTrim || activeMouza || '-';
      if (mouzaTrim.length >= 7) {
        distCode = mouzaTrim.substring(0, 2);
        blockCode = mouzaTrim.substring(2, 4);
        mouzaCode = mouzaTrim.substring(4);
      }
      const displayKhatian = khatianTrim || (activeData && activeData.khatianDetails && activeData.khatianDetails.khatianNo) || (extraMeta && extraMeta.khatianNo) || getSafeInputValue('txtKhatian1') || '-';
      const displayDag = dagTrim || (activeData && activeData.plotDetails && activeData.plotDetails.dagNo) || getSafeInputValue('txtPlotNo') || '-';
      const displayMouza = mouzaCode || '-';
      const cleanDag = String(displayDag).replace(/[^\d/]/g, '') || String(displayDag).trim();

      let statusDescription = 'দখলদার বা বর্গাদারের অধিকার পশ্চিমবঙ্গ ভূমি সংস্কার আইন অনুযায়ী সংরক্ষিত।';
      let classificationLabel = typeTrim || 'Possessor Record';
      if (typeTrim.toLowerCase().includes('barga') || codeTrim === '03') {
        classificationLabel = 'Barga / Bargadar (বর্গাদার)';
        statusDescription = 'বর্গাদার হিসেবে রেকর্ডভুক্ত। বর্গাদারের চাষের অধিকার ও ফসলের অংশ আইনত সুরক্ষিত।';
      } else if (typeTrim.toLowerCase().includes('anumati') || codeTrim === '02') {
        classificationLabel = 'Anumati (অনুমতিপ্রাপ্ত দখলদার)';
        statusDescription = 'অনুমতিপ্রাপ্ত দখলদার হিসেবে রাজস্ব নথিতে অন্তর্ভুক্তি অনুমোদিত।';
      } else if (typeTrim.toLowerCase().includes('sadharan')) {
        classificationLabel = 'Sadharaner Byabaharyya (সাধারণের ব্যবহার্য)';
        statusDescription = 'সর্বসাধারণের ব্যবহার্য জমি হিসেবে রাজস্ব নথিতে চিহ্নিত।';
      }

      function buildPossessorRowsHtml(list, notFoundMsg) {
        if (!list || list.length === 0) {
          return `
            <tr>
              <td colspan="4" style="text-align:center;padding:26px 14px;color:#64748b;" class="bn">
                ${escapeHtml(notFoundMsg || 'সরকারি ভূমি রেকর্ড অনুযায়ী এই দাগের কোনো পৃথক দখলদার বা বর্গাদার বিবরণ নথিবদ্ধ নেই (Record Not Found in Banglarbhumi)। জমিটি সম্পূর্ণভাবে রেকর্ডভুক্ত মূল রায়তের প্রত্যক্ষ খাস ও নিরঙ্কুশ দখলে স্থিত।')}
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

      const initialRowsHtml = `
        <tr>
          <td colspan="4" style="text-align:center;padding:22px 14px;">
            <div class="possessor-loading-spinner bn">
              <svg class="possessor-spinner-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <span>দখলদার তথ্য লোড হচ্ছে... (Fetching Dynamic Possessor Details...)</span>
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
            <span class="sched-hdr-badge" id="possessorHeaderBadge" style="background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;">
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
              <span class="sc-lbl">দখলদারের ধরন (Type)</span>
              <span class="sc-val bn" id="schedTypeCellVal" style="color:#dc2626;">${escapeHtml(classificationLabel)}</span>
            </div>
          </div>
        </div>

        <div class="official-extract-card">
          <div class="official-extract-header">
            <span>দখলদার ও বর্গার আইনগত স্থিতি</span>
          </div>
          <div class="official-extract-body">
            <div class="extract-text-box bn" id="extractStatusTextBox">${statusDescription}</div>
            <div class="extract-meta-grid">
              <div class="ext-meta-item">
                <span class="ext-lbl">দখলদার শ্রেণি (Category)</span>
                <span class="ext-val bn" id="extractCategoryVal">${escapeHtml(classificationLabel)}</span>
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
                <span class="ext-val" id="extractStatutoryProvision">Section 50/51, WBLR Act 1955</span>
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
        district: distCode || getSafeInputValue('lstDistrictCode1') || '01',
        block: blockCode || getSafeInputValue('lstBlockCode1') || '19',
        mouza: mouzaCode || getSafeInputValue('lstMouzaList') || '089',
        khatian: displayKhatian || getSafeInputValue('txtKhatian1') || '',
        plotNo: cleanDag,
        code: codeTrim,
        type: typeTrim,
        ktsr: khatianTrim || displayKhatian || '',
        ptsr: dagTrim || cleanDag,
        idn: (mouzaTrim.length >= 7 ? mouzaTrim : `${distCode || '01'}${blockCode || '19'}${mouzaCode || '089'}`),
        poc: codeTrim || '',
        dataType: 'NEW',
        holderName: (extraMeta && extraMeta.holderName) || '',
        fatherOrHusband: (extraMeta && extraMeta.fatherOrHusband) || '',
        classification: (extraMeta && extraMeta.classification) || '',
        area: (extraMeta && extraMeta.area) || ''
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
          tbody.innerHTML = buildPossessorRowsHtml(data.possessors, data.message);
          const isBargaPlot = (data.type === 'Barga' || data.code === '03');
          const isAnumatiPlot = (data.type === 'Anumati' || data.code === '02');
          const isSadharanPlot = (data.type && data.type.includes('Sadharan'));
          const dynamicLabel = isBargaPlot ? 'Barga / Bargadar (বর্গাদার)' : (isAnumatiPlot ? 'Anumati (অনুমতিপ্রাপ্ত দখলদার)' : (isSadharanPlot ? 'Sadharaner Byabaharyya (সাধারণের ব্যবহার্য)' : (data.type || 'Possessor Record')));
          const badgeEl = document.getElementById('possessorHeaderBadge');
          if (badgeEl) {
            badgeEl.innerText = dynamicLabel;
            badgeEl.style.background = '#fee2e2';
            badgeEl.style.color = '#991b1b';
            badgeEl.style.borderColor = '#fca5a5';
          }
          const schedTypeEl = document.getElementById('schedTypeCellVal');
          if (schedTypeEl) {
            schedTypeEl.innerText = dynamicLabel;
            schedTypeEl.style.color = '#dc2626';
          }
          const catEl = document.getElementById('extractCategoryVal');
          if (catEl) catEl.innerText = dynamicLabel;
          const provEl = document.getElementById('extractStatutoryProvision');
          if (provEl) {
            provEl.innerText = isBargaPlot ? 'Section 50/51, WBLR Act 1955 (Bargadar)' : (isAnumatiPlot ? 'Section 51, WBLR Act 1955 (Permitted)' : 'Section 50/51, WBLR Act 1955');
          }
        } else {
          tbody.innerHTML = buildPossessorRowsHtml([], data ? data.message : '');
          const badgeEl = document.getElementById('possessorHeaderBadge');
          if (badgeEl) {
            badgeEl.innerText = 'স্বত্বাধিকারী খাস দখল (Raiyat Khas)';
            badgeEl.style.background = '#dcfce7';
            badgeEl.style.color = '#15803d';
            badgeEl.style.borderColor = '#86efac';
          }
          const schedTypeEl = document.getElementById('schedTypeCellVal');
          if (schedTypeEl) {
            schedTypeEl.innerText = 'স্বত্বাধিকারী খাস দখল (Raiyat Khas)';
            schedTypeEl.style.color = '#15803d';
          }
          const extractDescEl = document.getElementById('extractStatusTextBox');
          if (extractDescEl) {
            extractDescEl.innerText = (data && data.message) || 'এই দাগের জন্য কোনো পৃথক দখলদার বা বর্গাদার নথিভুক্ত নেই। জমিটি সম্পূর্ণভাবে রেকর্ডভুক্ত মূল রায়তের প্রত্যক্ষ খাস ও নিরঙ্কুশ দখলে স্থিত।';
          }
          const catEl = document.getElementById('extractCategoryVal');
          if (catEl) catEl.innerText = 'রায়তের প্রত্যক্ষ খাস দখল (Unencumbered Ownership)';
          const provEl = document.getElementById('extractStatutoryProvision');
          if (provEl) provEl.innerText = 'Section 4 & 49, WBLR Act 1955';
        }
      })
      .catch(() => {
        const tbody = document.getElementById('modalPossessorTbody');
        if (!tbody) return;
        tbody.innerHTML = buildPossessorRowsHtml([]);
      });
    }

    function openMapModal(dagNo, classification, area, meta) {
      const metaSelection = getActiveSelectionMeta();
      const activeDist = (meta && meta.district) || metaSelection.activeDist;
      const activeBlock = (meta && meta.block) || metaSelection.activeBlock;
      const activeMouza = (meta && meta.mouza) || metaSelection.activeMouza;
      const activeJl = (meta && meta.jlNo) || metaSelection.activeJl;

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
              <span class="sc-val mono" id="cadAreaAcre">${escapeHtml(plotArea)} ${plotArea !== '-' ? 'Acre' : ''}</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">শতক ও কাঠা (Dec / Katha)</span>
              <span class="sc-val mono" id="cadAreaDecimal">-</span>
            </div>
            <div class="sched-cell">
              <span class="sc-lbl">বর্গফুট (Sq. Feet)</span>
              <span class="sc-val mono" id="cadAreaSqFt">-</span>
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
            <div style="padding:48px 20px;text-align:center;">
              <div class="possessor-loading-spinner bn">
                <svg class="possessor-spinner-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                <span>ক্যাডাস্ট্রাল নকশা ডাটাবেস থেকে প্রস্তুত হচ্ছে... (Loading Cadastral Parcel Map...)</span>
              </div>
            </div>
          </div>

          <div class="cadastral-legend-bar">
            <span class="leg-item"><strong class="leg-swatch target">■</strong> নির্বাচিত দাগ (${plotNum})</span>
            <span class="leg-item"><strong class="leg-swatch adj">□</strong> সংলগ্ন মৌজা দাগসমূহ</span>
            <span class="leg-item"><strong class="leg-swatch pin">●</strong> সার্ভে স্টেশন ও চান্দা</span>
            <span class="leg-item"><strong class="leg-swatch north">↑</strong> উত্তর দিক (North Meridian)</span>
          </div>
        </div>

        <div class="revenue-schedule-card" style="margin-top:14px;">
          <div class="revenue-schedule-header">
            <span class="sched-hdr-title bn">সীমানা ও সংলগ্ন দাগ তফসিল (Boundary Dimensions &amp; Adjacent Plots)</span>
            <span class="sched-hdr-badge">সার্ভে রেকর্ড</span>
          </div>
          <div class="table-responsive">
            <table class="table" style="margin:0;font-size:12px;">
              <thead>
                <tr>
                  <th style="background:#f8fafc;padding:7px 10px;text-align:left;">দিক (Direction)</th>
                  <th style="background:#f8fafc;padding:7px 10px;text-align:center;">সংলগ্ন দাগ (Adjacent Plot)</th>
                  <th style="background:#f8fafc;padding:7px 10px;text-align:center;">পরিমাপ (লিঙ্ক / Links)</th>
                  <th style="background:#f8fafc;padding:7px 10px;text-align:center;">দৈর্ঘ্য (ফুট / Feet)</th>
                  <th style="background:#f8fafc;padding:7px 10px;text-align:center;">কোণ (Bearing)</th>
                </tr>
              </thead>
              <tbody id="cadastralBoundaryTbody">
                <tr>
                  <td colspan="5" style="text-align:center;padding:16px;color:#64748b;" class="bn">
                    সীমানা বিবরণ লোড হচ্ছে...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;

      openRecordDetailModal(
        iconSvg,
        'দাগের ক্যাডাস্ট্রাল নকশা বিবরণী',
        `মৌজা: ${escapeHtml(activeMouza || '-')}${activeJl ? ` (${escapeHtml(activeJl)})` : ''} • দাগ নম্বর: ${escapeHtml(plotNum)}`,
        contentHtml
      );

      fetch('/api/v1/get-map-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: activeDist || getSafeInputValue('lstDistrictCode1') || '01',
          block: activeBlock || getSafeInputValue('lstBlockCode1') || '19',
          mouza: activeMouza || getSafeInputValue('lstMouzaList') || '089',
          jlNo: activeJl || '',
          plotNo: plotNum,
          khatian: activeKh,
          classification: plotClass,
          area: plotArea
        })
      })
      .then(res => res.json())
      .then(data => {
        if (!data || !data.success) return;
        const container = document.getElementById('cadastralMapContainer');
        if (container && data.svgMap) {
          container.innerHTML = data.svgMap;
        }
        const bTbody = document.getElementById('cadastralBoundaryTbody');
        if (bTbody && Array.isArray(data.boundaries)) {
          bTbody.innerHTML = data.boundaries.map(b => `
            <tr>
              <td class="bn" style="font-weight:600;padding:7px 10px;text-align:left;">${escapeHtml(b.direction)}</td>
              <td style="padding:7px 10px;text-align:center;"><span class="mono khatian-pill">${escapeHtml(b.adjacentPlot || '-')}</span></td>
              <td class="mono" style="font-weight:700;color:#0369a1;padding:7px 10px;text-align:center;">${escapeHtml(String(b.lengthLinks))} L</td>
              <td class="mono" style="padding:7px 10px;text-align:center;">${escapeHtml(String(b.lengthFeet))} ft</td>
              <td class="mono" style="color:#64748b;padding:7px 10px;text-align:center;">${escapeHtml(b.bearing || '-')}</td>
            </tr>
          `).join('');
        }
        if (data.area) {
          const decEl = document.getElementById('cadAreaDecimal');
          if (decEl) decEl.innerText = `${data.area.decimal} Dec (${data.area.katha} Katha)`;
          const sqftEl = document.getElementById('cadAreaSqFt');
          if (sqftEl) sqftEl.innerText = `${data.area.sqFt} Sq.Ft (${data.area.sqMtr} Sq.M)`;
        }
      })
      .catch(() => {
        const container = document.getElementById('cadastralMapContainer');
        if (container) {
          container.innerHTML = '<div style="padding:28px;text-align:center;color:#ef4444;" class="bn">নকশা ডাটাবেস থেকে লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।</div>';
        }
      });
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

    function triggerPlotPossessorModal(plotNo, dakhaldar, rawDakhaldar, extraMeta) {
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
      openPossessorModal(khatian, dag, mouza, code, type, extraMeta);
    }

    window.loadRemarksHtml = function(encodedHtml) {
      if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
      }
      const mapContainer = document.getElementById('map');
      const poseserContainer = document.getElementById('poseser');
      const remarksContainer = document.getElementById('remarks');
      const trusteeContainer = document.getElementById('trustee');

      if (mapContainer) mapContainer.style.display = 'none';
      if (poseserContainer) poseserContainer.style.display = 'none';
      if (trusteeContainer) trusteeContainer.style.display = 'none';

      let decoded = '';
      if (encodedHtml) {
        try {
          decoded = decodeURIComponent(encodedHtml.replace(/\+/g, ' '));
        } catch (e) {
          decoded = encodedHtml;
        }
      }

      if (remarksContainer) {
        remarksContainer.style.display = 'block';
        remarksContainer.innerHTML = `
          <div style="padding:6px 4px;">
            <div style="background:#fef2f2;border:1px solid #fecaca;padding:6px 10px;border-radius:4px;margin-bottom:8px;font-size:12px;font-weight:700;color:#991b1b;display:flex;justify-content:space-between;align-items:center;">
              <span>মন্তব্য ও প্রযোজ্য ধারা (Remarks Details)</span>
              <button type="button" onclick="document.getElementById('remarks').style.display='none'" style="border:none;background:transparent;cursor:pointer;font-weight:bold;color:#991b1b;">✕</button>
            </div>
            ${decoded || '<div style="padding:16px;text-align:center;color:#64748b;">কোনো প্রযোজ্য ধারা বা বিশেষ মন্তব্য নেই।</div>'}
          </div>
        `;
        if (window.innerWidth < 768) {
          remarksContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      openRemarksModal(encodedHtml);
      return false;
    };

    window.loadPoseser = function(khatian, dag, mouza, code, type) {
      if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
      }
      let rawKhatian = String(khatian || '').trim();
      let rawDag = String(dag || '').trim();
      let rawMouza = String(mouza || '').trim();
      let rawCode = String(code || '').trim();
      let rawType = String(type || '').trim();

      let distCode = '';
      let blockCode = '';
      let mouzaCode = rawMouza;

      if (rawMouza.length >= 7) {
        distCode = rawMouza.substring(0, 2);
        blockCode = rawMouza.substring(2, 4);
        mouzaCode = rawMouza.substring(4);
      }
      if (!distCode) distCode = getSafeInputValue('lstDistrictCode1') || '01';
      if (!blockCode) blockCode = getSafeInputValue('lstBlockCode1') || '19';
      if (!mouzaCode) mouzaCode = getSafeInputValue('lstMouzaList') || '089';

      const mapContainer = document.getElementById('map');
      const poseserContainer = document.getElementById('poseser');
      const remarksContainer = document.getElementById('remarks');
      const trusteeContainer = document.getElementById('trustee');

      if (mapContainer) mapContainer.style.display = 'none';
      if (remarksContainer) remarksContainer.style.display = 'none';
      if (trusteeContainer) trusteeContainer.style.display = 'none';

      if (poseserContainer) {
        poseserContainer.style.display = 'block';
        poseserContainer.innerHTML = `
          <div style="padding:28px 16px;text-align:center;">
            <div class="possessor-loading-spinner bn">
              <svg class="possessor-spinner-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <span>দখলদার ও বর্গাদার বিবরণ লোড হচ্ছে... (Loading Possessor Records...)</span>
            </div>
          </div>
        `;

        fetch('/api/v1/get-possessor-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            district: distCode,
            block: blockCode,
            mouza: mouzaCode,
            khatian: rawKhatian,
            plotNo: rawDag,
            code: rawCode,
            type: rawType,
            ktsr: rawKhatian,
            ptsr: rawDag,
            idn: (rawMouza.length >= 7 ? rawMouza : `${distCode}${blockCode}${mouzaCode}`),
            poc: rawCode,
            dataType: rawType || 'NEW'
          })
        })
        .then(res => res.json())
        .then(data => {
          if (!poseserContainer) return;
          if (data && data.success && Array.isArray(data.possessors) && data.possessors.length > 0) {
            let rowsHtml = data.possessors.map((p, idx) => `
              <tr align="center">
                <td>${idx + 1}</td>
                <td style="font-family:'BN BIDISHA Opentype', 'Hind Siliguri', sans-serif;"><b>${escapeHtml(p.name || '-')}</b></td>
                <td style="font-family:'BN BIDISHA Opentype', 'Hind Siliguri', sans-serif;">${escapeHtml(p.father || '-')}</td>
                <td>${escapeHtml(p.address || '-')}</td>
                <td><font color="red">${escapeHtml(p.remarks && p.remarks !== 'Nil' ? p.remarks : 'Nil')}</font></td>
              </tr>
            `).join('');

            poseserContainer.innerHTML = `
              <div style="padding:6px 4px;">
                <div style="background:#e0f2fe;border:1px solid #7dd3fc;padding:6px 10px;border-radius:4px;margin-bottom:8px;font-size:12px;font-weight:700;color:#0369a1;display:flex;justify-content:space-between;align-items:center;">
                  <span>দাগ নং: ${escapeHtml(rawDag)} • দখলদার ও বর্গাদার তফসিল (${escapeHtml(data.type || rawType || 'নথিভুক্ত')})</span>
                  <button type="button" onclick="document.getElementById('poseser').style.display='none'" style="border:none;background:transparent;cursor:pointer;font-weight:bold;color:#0369a1;">✕</button>
                </div>
                <table class="table table-bordered table-striped" width="100%" border="1" style="border-collapse:collapse;font-size:11.5px;background:#ffffff;">
                  <thead>
                    <tr bgcolor="#f1f5f9" style="font-weight:700;text-align:center;">
                      <th width="8%">ক্রমিক</th>
                      <th width="28%">দখলদারের নাম</th>
                      <th width="28%">পিতা / স্বামীর নাম</th>
                      <th width="20%">ঠিকানা</th>
                      <th width="16%">মন্তব্য</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsHtml}
                  </tbody>
                </table>
              </div>
            `;
          } else {
            poseserContainer.innerHTML = `
              <div style="padding:6px 4px;">
                <div style="background:#f1f5f9;border:1px solid #cbd5e1;padding:6px 10px;border-radius:4px;margin-bottom:8px;font-size:12px;font-weight:700;color:#334155;display:flex;justify-content:space-between;align-items:center;">
                  <span>দাগ নং: ${escapeHtml(rawDag)} • দখলদার রেকর্ড</span>
                  <button type="button" onclick="document.getElementById('poseser').style.display='none'" style="border:none;background:transparent;cursor:pointer;font-weight:bold;color:#334155;">✕</button>
                </div>
                <div style="padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;border-radius:4px;font-size:12.5px;text-align:center;" class="bn">
                  ${escapeHtml((data && data.message) || 'এই দাগের জন্য কোনো পৃথক দখলদার বা বর্গাদার নথিভুক্ত নেই। জমিটি সম্পূর্ণভাবে মূল রায়তের প্রত্যক্ষ খাস দখলে স্থিত।')}
                </div>
              </div>
            `;
          }
          if (window.innerWidth < 768) {
            poseserContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        })
        .catch(() => {
          if (poseserContainer) {
            poseserContainer.innerHTML = '<div style="padding:16px;color:#dc2626;text-align:center;">দখলদার বিবরণ লোড করতে ব্যর্থ হয়েছে।</div>';
          }
        });
      }

      openPossessorModal(rawKhatian, rawDag, mouzaCode, rawCode, rawType);
      return false;
    };

    window.loadMap = function(dag, mouza, block, dist) {
      if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
      }
      let rawDag = String(dag || '').trim();
      let rawMouza = String(mouza || '').trim();
      let distCode = String(dist || '').trim();
      let blockCode = String(block || '').trim();
      let mouzaCode = rawMouza;

      if (rawMouza.length >= 7) {
        distCode = rawMouza.substring(0, 2);
        blockCode = rawMouza.substring(2, 4);
        mouzaCode = rawMouza.substring(4);
      }
      if (!distCode) distCode = getSafeInputValue('lstDistrictCode1') || '01';
      if (!blockCode) blockCode = getSafeInputValue('lstBlockCode1') || '01';
      if (!mouzaCode) mouzaCode = getSafeInputValue('lstMouzaList') || '182';

      const mapContainer = document.getElementById('map');
      const mapFrame = document.getElementById('MapFrame');
      const poseserContainer = document.getElementById('poseser');
      const remarksContainer = document.getElementById('remarks');
      const trusteeContainer = document.getElementById('trustee');

      if (poseserContainer) poseserContainer.style.display = 'none';
      if (remarksContainer) remarksContainer.style.display = 'none';
      if (trusteeContainer) trusteeContainer.style.display = 'none';

      const frameUrl = `/api/v1/get-map-frame?plotNo=${encodeURIComponent(rawDag)}&mouza=${encodeURIComponent(mouzaCode)}&district=${encodeURIComponent(distCode)}&block=${encodeURIComponent(blockCode)}`;

      if (mapContainer && mapFrame) {
        mapContainer.style.display = 'block';
        mapFrame.src = frameUrl;
        if (window.innerWidth < 768) {
          mapContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      openMapModal(rawDag, null, null, { district: distCode, block: blockCode, mouza: mouzaCode });
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
      const isBn = (currentScheduleLang === 'bn');
      const isKhatian = (activeData.searchType === 'khatian');

      let headers = [];
      let rows = [];
      let filename = 'banglarbhumi_record.csv';

      if (isKhatian) {
        const plots = activeData.plots || [];
        headers = isBn
          ? ['\u09a6\u09be\u0997 \u09a8\u09ae\u09cd\u09ac\u09b0', '\u099c\u09ae\u09bf\u09b0 \u09b6\u09cd\u09b0\u09c7\u09a3\u09bf', '\u0985\u0982\u09b6', '\u0985\u0982\u09b6 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3 (\u098f\u0995\u09b0)', '\u09a6\u0996\u09b2\u09a6\u09be\u09b0', '\u09ae\u09a8\u09cd\u09a4\u09ac\u09cd\u09af']
          : ['Plot / Dag No', 'Classification', 'Share', 'Share Area (Acre)', 'Dakhaldar', 'Remarks'];
        rows = plots.map(p => {
          const plotNoVal = isBn ? toBengaliDigits(p.plotNo || '') : (p.plotNo || '');
          const classVal = isBn ? translateClassification(p.classification, 'bn') : translateClassification(p.classification, 'en');
          const shareVal = isBn ? toBengaliDigits(p.share || '') : (p.share || '');
          const shareAreaVal = isBn ? toBengaliDigits(p.shareArea || '') : (p.shareArea || '');
          const dakhaldarVal = isBn ? translateDakhaldar(p.dakhaldar, 'bn') : translateDakhaldar(p.dakhaldar, 'en');
          const remarksVal = isBn ? translateRemarks(p.remarks, 'bn') : translateRemarks(p.remarks, 'en');
          return [
            `"${plotNoVal}"`,
            `"${classVal}"`,
            `"${shareVal}"`,
            `"${shareAreaVal}"`,
            `"${dakhaldarVal}"`,
            `"${remarksVal}"`
          ];
        });
        const khNo = (activeData.khatianDetails && activeData.khatianDetails.khatianNo) || document.getElementById('txtKhatian1').value || 'record';
        const cleanKh = isBn ? toBengaliDigits(khNo) : khNo;
        filename = `banglarbhumi_khatian_${String(cleanKh).replace(/[\/\\ ]+/g, '_')}.csv`;
      } else {
        const holders = activeData.holders || [];
        headers = isBn
          ? ['\u0996\u09a4\u09bf\u09af\u09bc\u09be\u09a8 \u09a8\u09ae\u09cd\u09ac\u09b0', '\u09b0\u09be\u09af\u09bc\u09a4\u09c7\u09b0 \u09a8\u09be\u09ae', '\u09aa\u09bf\u09a4\u09be/\u09b8\u09cd\u09ac\u09be\u09ae\u09c0\u09b0 \u09a8\u09be\u09ae', '\u0985\u0982\u09b6', '\u0985\u0982\u09b6 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3 (\u098f\u0995\u09b0)', '\u09a6\u0996\u09b2\u09a6\u09be\u09b0', '\u09ae\u09a8\u09cd\u09a4\u09ac\u09cd\u09af']
          : ['Khatian No', 'Rayat / Owner Name', 'Father / Husband', 'Share', 'Share Area (Acre)', 'Dakhaldar', 'Remarks'];
        rows = holders.map(h => {
          const rawOwner = (h.ownerName || '').replace(/\bbyakti\b/gi, '').replace(/\b\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf(?:\u0997\u09a4)?\b/gi, '').trim();
          const khVal = isBn ? toBengaliDigits(h.khatianNo || '') : (h.khatianNo || '');
          const ownerVal = isBn ? transliterateToBengali(rawOwner) : rawOwner;
          const fatherVal = isBn ? transliterateToBengali(h.fatherOrHusband || '') : (h.fatherOrHusband || '');
          const shareVal = isBn ? toBengaliDigits(h.share || '') : (h.share || '');
          const shareAreaVal = formatShareArea(h.shareArea, isBn);
          const dakhaldarVal = isBn ? translateDakhaldar(h.dakhaldar, 'bn') : translateDakhaldar(h.dakhaldar, 'en');
          const remarksVal = isBn ? translateRemarks(h.remarks, 'bn') : translateRemarks(h.remarks, 'en');
          return [
            `"${khVal}"`,
            `"${ownerVal}"`,
            `"${fatherVal}"`,
            `"${shareVal}"`,
            `"${shareAreaVal}"`,
            `"${dakhaldarVal}"`,
            `"${remarksVal}"`
          ];
        });
        const plotNo = (activeData.plotDetails && activeData.plotDetails.dagNo) || document.getElementById('txtPlotNo').value || 'record';
        const cleanPlot = isBn ? toBengaliDigits(plotNo) : plotNo;
        filename = `banglarbhumi_plot_${String(cleanPlot).replace(/[\/\\ ]+/g, '_')}.csv`;
      }

      const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csv);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(isBn ? '\u09b8\u09ab\u09b2\u09ad\u09be\u09ac\u09c7 CSV \u09ab\u09be\u0987\u09b2 \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1 \u09b9\u09af\u09bc\u09c7\u099b\u09c7!' : 'CSV record table exported successfully!');
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
      const isBn = (currentScheduleLang === 'bn');

      const distEl = document.getElementById('lstDistrictCode1');
      const blockEl = document.getElementById('lstBlockCode1');
      const mouzaEl = document.getElementById('lstMouzaList');

      let distName = (distEl && distEl.selectedIndex >= 0 && !distEl.options[distEl.selectedIndex].text.includes('Select'))
        ? distEl.options[distEl.selectedIndex].text : (data.districtName || 'Bankura');
      let blockName = (blockEl && blockEl.selectedIndex >= 0 && !blockEl.options[blockEl.selectedIndex].text.includes('Select'))
        ? blockEl.options[blockEl.selectedIndex].text : (data.blockName || 'Bankura - I');
      let rawMouzaText = (mouzaEl && mouzaEl.selectedIndex >= 0 && !mouzaEl.options[mouzaEl.selectedIndex].text.includes('Select'))
        ? mouzaEl.options[mouzaEl.selectedIndex].text : (data.mouzaName || 'Krishnagar');

      const jlMatch = rawMouzaText.match(/J\.?L\.?\s*(?:No\.?)?\s*(\d+)/i);
      const jlNo = data.jlno || (jlMatch ? jlMatch[1] : '182');
      const cleanMouzaName = rawMouzaText.replace(/\s*\(\s*J\.?L\.?.*?\)/i, '').trim();
      const thanaName = data.thana || blockName.split('-')[0].trim();

      const distDisplay = isBn ? transliterateToBengali(distName) : distName;
      const blockDisplay = isBn ? transliterateToBengali(blockName) : blockName;
      const mouzaDisplay = isBn ? (transliterateToBengali(cleanMouzaName) + ' (\u099c\u09c7.\u098f\u09b2. \u09a8\u0982 ' + toBengaliDigits(jlNo) + ')') : (cleanMouzaName + ' (J.L. ' + jlNo + ')');
      const thanaDisplay = isBn ? transliterateToBengali(thanaName) : thanaName;

      const now = new Date();
      const rawDateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-GB');
      const formattedGenTime = isBn ? toBengaliDigits(rawDateStr) : rawDateStr;
      const rawLive = (data.liveInfo || ('Live Portal Extract As On ' + rawDateStr)).replace(/Live\s*Portal\s*Extract\s*As\s*On\s*:?|Live\s*Data\s*As\s*On\s*:?/gi, '').trim();
      const liveInfoText = isBn ? ('\u09b8\u09b0\u09be\u09b8\u09b0\u09bf \u09a4\u09a5\u09cd\u09af: ' + toBengaliDigits(rawLive)) : ('Live Portal Extract As On ' + rawLive);

      const isKhatian = (data.searchType === 'khatian');

      if (isKhatian) {
        const kd = data.khatianDetails || {};
        const rawKhNo = kd.khatianNo || document.getElementById('txtKhatian1').value.trim() || '-';
        const khNo = isBn ? toBengaliDigits(rawKhNo) : toEnglishDigits(rawKhNo);
        const rawOwner = kd.ownerName || '-';
        const ownerName = isBn ? transliterateToBengali(rawOwner) : rawOwner;
        const rawFather = kd.fatherOrHusband || '-';
        const fatherOrHusband = isBn ? (rawFather === '-' || rawFather.toLowerCase() === 'nil' ? '—' : transliterateToBengali(rawFather)) : rawFather;
        const ownerType = isBn ? '\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u09ae\u09be\u09b2\u09bf\u0995\u09be\u09a8\u09be' : 'Individual Ownership';
        const rawAddress = kd.address || '-';
        const address = isBn ? (rawAddress === '-' || rawAddress.toLowerCase() === 'nil' ? '—' : transliterateToBengali(rawAddress)) : rawAddress;
        const rawTotalArea = kd.totalArea || '-';
        const cleanTotalArea = String(rawTotalArea).replace(/\s*(?:acre|ekar|\u098f\u0995\u09b0)\b/gi, '').trim();
        const totalArea = isBn ? (toBengaliDigits(cleanTotalArea) + ' \u098f\u0995\u09b0') : (cleanTotalArea + ' Acre');
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
          const slDisplay = isBn ? toBengaliDigits(idx + 1) : (idx + 1);
          const plotNoDisplay = isBn ? toBengaliDigits(p.plotNo || '-') : toEnglishDigits(p.plotNo || '-');
          const classDisplay = isBn ? translateClassification(p.classification, 'bn') : translateClassification(p.classification, 'en');
          const shareDisplay = isBn ? toBengaliDigits(p.share || '-') : (p.share || '-');
          const shareAreaDisplay = isBn ? (toBengaliDigits(p.shareArea || '-') + ' \u098f\u0995\u09b0') : (p.shareArea ? (p.shareArea + ' Acre') : '-');
          const dakhaldarDisplay = isBn ? translateDakhaldar(p.dakhaldar, 'bn') : translateDakhaldar(p.dakhaldar, 'en');
          const remarksDisplay = isBn ? translateRemarks(p.remarks, 'bn') : translateRemarks(p.remarks, 'en');

          return `
            <tr>
              <td class="print-col-center print-sl-num">${escape(slDisplay)}</td>
              <td class="print-col-center"><span class="print-khatian-badge">${escape(plotNoDisplay)}</span></td>
              <td><div class="print-owner-primary">${escape(classDisplay)}</div></td>
              <td class="print-col-right font-mono print-share-cell">${escape(shareDisplay)}</td>
              <td class="print-col-right font-mono print-area-cell">${escape(shareAreaDisplay)}</td>
              <td class="print-col-center print-muted-cell">${escape(dakhaldarDisplay)}</td>
              <td class="print-col-center print-muted-cell">${escape(remarksDisplay)}</td>
            </tr>
          `;
        }).join('');

        const refText = isBn ? `\u09b8\u09c2\u09a4\u09cd\u09b0: WB-LR-KH-${khNo}` : `Ref: WB-LR-KH-${khNo}`;
        const docBadgeText = isBn ? '\u0996\u09a4\u09bf\u09af\u09bc\u09be\u09a8 \u09b0\u09c7\u0995\u09b0\u09cd\u09a1 (RoR)' : 'Khatian RoR';
        const docBadgeSub = isBn ? '\u09aa\u09cd\u09b0\u09be\u09ae\u09be\u09a3\u09cd\u09af \u09a1\u09bf\u099c\u09bf\u099f\u09be\u09b2 \u09ac\u09bf\u09ac\u09b0\u09a3\u09c0' : 'Certified Digital Extract';
        const bannerTitle = isBn ? '\u0996\u09a4\u09bf\u09af\u09bc\u09be\u09a8 \u0993 \u09a6\u09be\u0997\u09c7\u09b0 \u09ac\u09bf\u09ac\u09b0\u09a3' : 'KHATIAN LAND SCHEDULE';
        const totalPlotsDisplay = isBn ? `${toBengaliDigits(plotsCount)} \u099f\u09bf \u09a6\u09be\u0997` : `${plotsCount} Plots`;
        const totalShareSumDisplay = isBn ? toBengaliDigits(totalShareSum.toFixed(4)) : (totalShareSum > 0 ? totalShareSum.toFixed(4) : '-');
        const totalAreaSumDisplay = isBn ? (toBengaliDigits(totalAreaSum.toFixed(4)) + ' \u098f\u0995\u09b0') : (totalAreaSum > 0 ? (totalAreaSum.toFixed(4) + ' Acre') : totalArea);

        return `
          <div class="printable-schedule-doc">
            <div class="print-header-top">
              <div class="print-header-banner-wrap">
                <img src="${cachedHeaderImageDataUrl || 'images/header_image.png'}" alt="Government of West Bengal - Banglarbhumi" class="print-header-banner-img" />
              </div>
              <div class="print-meta-substrip">
                <div class="print-doc-badge-col">
                  <span class="print-doc-type-pill">${docBadgeText}</span>
                  <span class="print-meta-text-inline">${docBadgeSub}</span>
                </div>
                <div class="print-meta-ref-col">
                  <span class="print-meta-text">${refText}</span>
                  <span class="print-meta-sep">•</span>
                  <span class="print-meta-text time">${escape(formattedGenTime)}</span>
                </div>
              </div>
            </div>

            <div class="print-gold-accent"></div>

            <div class="print-schedule-banner">
              <div class="print-schedule-title-main"><span>${bannerTitle}</span></div>
              <div class="print-schedule-title-sub">${escape(liveInfoText)}</div>
            </div>

            <div class="print-summary-box">
              <div class="print-summary-grid">
                <div class="print-summary-item">
                  <span class="print-sum-label">${isBn ? '\u099c\u09c7\u09b2\u09be' : 'District'}</span>
                  <span class="print-sum-val">${escape(distDisplay)}</span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">${isBn ? '\u09ac\u09cd\u09b2\u0995' : 'Block'}</span>
                  <span class="print-sum-val">${escape(blockDisplay)}</span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">${isBn ? '\u09ae\u09cb\u099c\u09be \u0993 \u099c\u09c7.\u098f\u09b2' : 'Mouza & J.L. No'}</span>
                  <span class="print-sum-val">${escape(mouzaDisplay)}</span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">${isBn ? '\u09a5\u09be\u09a8\u09be' : 'Thana'}</span>
                  <span class="print-sum-val">${escape(thanaDisplay)}</span>
                </div>
              </div>
              <div class="print-summary-grid">
                <div class="print-summary-item">
                  <span class="print-sum-label">${isBn ? '\u0996\u09a4\u09bf\u09af\u09bc\u09be\u09a8 \u09a8\u09ae\u09cd\u09ac\u09b0' : 'Khatian No'}</span>
                  <span class="print-sum-val highlight"><span class="print-badge-plot">${escape(khNo)}</span></span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">${isBn ? '\u09b0\u09be\u09af\u09bc\u09a4\u09c7\u09b0 \u09a8\u09be\u09ae' : 'Rayat / Owner Name'}</span>
                  <span class="print-sum-val">${escape(ownerName)} <span style="font-size:11px; color:#64748b;">(${escape(ownerType)})</span></span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">${isBn ? '\u09aa\u09bf\u09a4\u09be \u09ac\u09be \u09b8\u09cd\u09ac\u09be\u09ae\u09c0\u09b0 \u09a8\u09be\u09ae' : 'Father / Husband'}</span>
                  <span class="print-sum-val">${escape(fatherOrHusband)}</span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">${isBn ? '\u09ae\u09cb\u099f \u099c\u09ae\u09bf\u09b0 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3' : 'Total Land Area'}</span>
                  <span class="print-sum-val highlight">${escape(totalArea)}</span>
                </div>
              </div>
              <div class="print-summary-grid">
                <div class="print-summary-item">
                  <span class="print-sum-label">${isBn ? '\u09a0\u09bf\u0995\u09be\u09a8\u09be' : 'Address'}</span>
                  <span class="print-sum-val">${escape(address)}</span>
                </div>
                <div class="print-summary-item">
                  <span class="print-sum-label">${isBn ? '\u09ae\u09cb\u099f \u0985\u09a8\u09cd\u09a4\u09b0\u09cd\u09ad\u09c1\u0995\u09cd\u09a4 \u09a6\u09be\u0997' : 'Total Plots'}</span>
                  <span class="print-sum-val highlight">${totalPlotsDisplay}</span>
                </div>
              </div>
            </div>

            <div class="print-table-wrap">
              <table class="print-ledger-table">
                <thead>
                  <tr>
                    <th style="width:6%;">${isBn ? '\u0995\u09cd\u09b0.\u09a8\u0982' : 'Sl No'}</th>
                    <th style="width:14%;">${isBn ? '\u09a6\u09be\u0997 \u09a8\u09ae\u09cd\u09ac\u09b0' : 'Plot / Dag No'}</th>
                    <th style="width:25%;">${isBn ? '\u099c\u09ae\u09bf\u09b0 \u09b6\u09cd\u09b0\u09c7\u09a3\u09bf' : 'Classification'}</th>
                    <th style="width:12%;">${isBn ? '\u0985\u0982\u09b6' : 'Share'}</th>
                    <th style="width:18%;">${isBn ? '\u0985\u0982\u09b6 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3 (\u098f\u0995\u09b0)' : 'Share Area (Acre)'}</th>
                    <th style="width:12%;">${isBn ? '\u09a6\u0996\u09b2\u09a6\u09be\u09b0' : 'Dakhaldar'}</th>
                    <th style="width:13%;">${isBn ? '\u09ae\u09a8\u09cd\u09a4\u09ac\u09cd\u09af' : 'Remarks'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml || `<tr><td colspan="7" class="print-col-center" style="padding:18px;">${isBn ? '\u098f\u0987 \u0996\u09a4\u09bf\u09af\u09bc\u09be\u09a8\u09c7\u09b0 \u0985\u09a7\u09c0\u09a8\u09c7 \u0995\u09cb\u09a8\u09cb \u09a6\u09be\u0997\u09c7\u09b0 \u09b0\u09c7\u0995\u09b0\u09cd\u09a1 \u09aa\u09be\u0993\u09af\u09bc\u09be \u09af\u09be\u09af\u09bc\u09a8\u09bf\u0987' : 'No plot records found under this khatian.'}</td></tr>`}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="text-align:right;">${isBn ? '\u09ae\u09cb\u099f \u0985\u0982\u09b6 \u0993 \u09aa\u09b0\u09bf\u09ae\u09be\u09aa:' : 'Total Share & Calculated Area:'}</td>
                    <td class="print-col-right font-mono" style="color:#0f172a; font-weight:700;">${totalShareSumDisplay}</td>
                    <td class="print-col-right font-mono" style="color:#0f172a; font-weight:700;">${totalAreaSumDisplay}</td>
                    <td colspan="2" class="print-col-center" style="color:#1e3a8a; font-weight:700;">${isBn ? '\u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09a1\u09bf\u099c\u09bf\u099f\u09be\u09b2 \u09b0\u09c7\u0995\u09b0\u09cd\u09a1' : 'Verified Digital Record'}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="print-footer-notice">
              <div class="print-disclaimer">
                ${isBn ? '<strong>\u0985\u09ab\u09bf\u09b8\u09bf\u09af\u09bc\u09be\u09b2 \u09a4\u09a5\u09cd\u09af \u09ac\u09bf\u09ac\u09b0\u09a3\u09c0:</strong> \u098f\u0987 \u09a8\u09a5\u09bf\u099f\u09bf \u09aa\u09b6\u09cd\u099a\u09bf\u09ae\u09ac\u0999\u09cd\u0997 \u09b8\u09b0\u0995\u09be\u09b0\u09c7\u09b0 \u09ad\u09c2\u09ae\u09bf \u0993 \u09ad\u09c2\u09ae\u09bf \u09b8\u0982\u09b8\u09cd\u0995\u09be\u09b0 \u098f\u09ac\u0982 \u0989\u09a6\u09cd\u09ac\u09be\u09b8\u09cd\u09a4\u09c1 \u09a4\u09cd\u09b0\u09be\u09a3 \u0993 \u09aa\u09c1\u09a8\u09b0\u09cd\u09ac\u09be\u09b8\u09a8 \u09a6\u09aa\u09cd\u09a4\u09b0\u09c7\u09b0 \u09b8\u09c7\u09a8\u09cd\u099f\u09cd\u09b0\u09be\u09b2 \u09a1\u09be\u099f\u09be\u09ac\u09c7\u09b8 (\u09ac\u09be\u0982\u09b2\u09be\u09b0\u09ad\u09c2\u09ae\u09bf) \u09a5\u09c7\u0995\u09c7 \u09b8\u09b0\u09be\u09b8\u09b0\u09bf \u09b8\u0982\u0997\u09c3\u09b9\u09c0\u09a4 \u098f\u0995\u099f\u09bf \u09aa\u09cd\u09b0\u09be\u09ae\u09be\u09a3\u09cd\u09af \u09a1\u09bf\u099c\u09bf\u099f\u09be\u09b2 \u0996\u09a4\u09bf\u09af\u09bc\u09be\u09a8 \u0993 \u09ae\u09be\u09b2\u09bf\u0995\u09be\u09a8\u09be \u09a4\u09ab\u09b8\u09bf\u09b2\u0987 \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09a4\u09a5\u09cd\u09af \u09b8\u0982\u09b6\u09cb\u09a7\u09a8 \u09ac\u09be \u09ac\u09bf\u09b7\u09af\u09bc\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09cd\u09a5\u09be\u09a8\u09c0\u09af\u09bc \u09ac\u09bf.\u098f\u09b2. \u0985\u09cd\u09af\u09be\u09a8\u09cd\u09a1 \u098f\u09b2.\u0986\u09b0.\u0993. \u0985\u09ab\u09bf\u09b8\u09c7 \u09af\u09cb\u0997\u09be\u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0987' : '<strong>Official Revenue Disclaimer:</strong> This document represents a certified computer-generated Land Ownership Schedule extracted directly from the Directorate of Land Records & Surveys central database (Banglarbhumi), Government of West Bengal. Any clerical disputes or corrections must be registered with the jurisdictional B.L. & L.R. office.'}
              </div>
              <div class="print-seal-block">
                <div class="print-seal-stamp">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>${isBn ? '\u09aa\u09cd\u09b0\u09be\u09ae\u09be\u09a3\u09cd\u09af \u09a1\u09bf\u099c\u09bf\u099f\u09be\u09b2 \u09ac\u09bf\u09ac\u09b0\u09a3\u09c0' : 'Certified Digital Extract'}</span>
                </div>
                <div class="print-seal-sub">${isBn ? '\u09ad\u09c2\u09ae\u09bf \u09b0\u09c7\u0995\u09b0\u09cd\u09a1 \u0993 \u099c\u09b0\u09bf\u09aa \u0985\u09a7\u09bf\u0995\u09be\u09b0' : 'Directorate of Land Records & Surveys'}</div>
                <div class="print-seal-sub">${isBn ? '\u09aa\u09b6\u09cd\u099a\u09bf\u09ae\u09ac\u0999\u09cd\u0997 \u09b8\u09b0\u0995\u09be\u09b0' : 'Government of West Bengal'}</div>
              </div>
            </div>
          </div>
        `;
      }

      const plotDetails = data.plotDetails || {};
      const rawPlotNo = plotDetails.dagNo || document.getElementById('txtPlotNo').value.trim() || '-';
      const plotNo = isBn ? toBengaliDigits(rawPlotNo) : toEnglishDigits(rawPlotNo);
      const rawClass = plotDetails.classification || document.getElementById('resClassification').innerText || 'N/A';
      const classification = isBn ? translateClassification(rawClass, 'bn') : translateClassification(rawClass, 'en');
      const rawTotalArea = plotDetails.totalArea || document.getElementById('resTotalArea').innerText || '-';
      const cleanTotalArea = String(rawTotalArea).replace(/\s*(?:acre|ekar|\u098f\u0995\u09b0)\b/gi, '').trim();
      const totalArea = isBn ? (toBengaliDigits(cleanTotalArea) + ' \u098f\u0995\u09b0') : (cleanTotalArea + ' Acre');

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
        const slDisplay = isBn ? toBengaliDigits(idx + 1) : (idx + 1);
        const khDisplay = isBn ? toBengaliDigits(h.khatianNo || '-') : toEnglishDigits(h.khatianNo || '-');
        const rawOwner = (h.ownerName || '-').replace(/\bbyakti\b/gi, '').replace(/\b\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf(?:\u0997\u09a4)?\b/gi, '').trim();
        const ownerDisplay = isBn ? transliterateToBengali(rawOwner) : rawOwner;
        const subOwnerType = isBn ? '\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u09ae\u09be\u09b2\u09bf\u0995\u09be\u09a8\u09be' : 'Individual Ownership';
        const fatherDisplay = isBn ? transliterateToBengali(h.fatherOrHusband || '-') : (h.fatherOrHusband || '-');
        const shareDisplay = isBn ? toBengaliDigits(h.share || '-') : (h.share || '-');
        const shareAreaDisplay = formatShareArea(h.shareArea, isBn);
        const dakhaldarDisplay = isBn ? translateDakhaldar(h.dakhaldar, 'bn') : translateDakhaldar(h.dakhaldar, 'en');
        const remarksDisplay = isBn ? translateRemarks(h.remarks, 'bn') : translateRemarks(h.remarks, 'en');

        return `
          <tr>
            <td class="print-col-center print-sl-num">${escape(slDisplay)}</td>
            <td class="print-col-center"><span class="print-khatian-badge">${escape(khDisplay)}</span></td>
            <td>
              <div class="print-owner-primary">${escape(ownerDisplay)}</div>
              <div class="print-owner-sub">${escape(subOwnerType)}</div>
            </td>
            <td class="print-father-cell">${escape(fatherDisplay)}</td>
            <td class="print-col-right font-mono print-share-cell">${escape(shareDisplay)}</td>
            <td class="print-col-right font-mono print-area-cell">${escape(shareAreaDisplay)}</td>
            <td class="print-col-center print-muted-cell">${escape(dakhaldarDisplay)}</td>
            <td class="print-col-center print-muted-cell">${escape(remarksDisplay)}</td>
          </tr>
        `;
      }).join('');

      const refText = isBn ? `\u09b8\u09c2\u09a4\u09cd\u09b0: WB-LR-PLT-${plotNo}` : `Ref: WB-LR-PLT-${plotNo}`;
      const docBadgeText = isBn ? '\u09a6\u09be\u0997\u09c7\u09b0 \u0996\u09a4\u09bf\u09af\u09bc\u09be\u09a8 (RoR)' : 'Land Records RoR';
      const docBadgeSub = isBn ? '\u09aa\u09cd\u09b0\u09be\u09ae\u09be\u09a3\u09cd\u09af \u09a1\u09bf\u099c\u09bf\u099f\u09be\u09b2 \u09ac\u09bf\u09ac\u09b0\u09a3\u09c0' : 'Certified Digital Extract';
      const bannerTitle = isBn ? '\u0996\u09a4\u09bf\u09af\u09bc\u09be\u09a8 \u0993 \u09a6\u09be\u0997\u09c7\u09b0 \u09a4\u09a5\u09cd\u09af' : 'LAND OWNERSHIP SCHEDULE';
      const totalHoldersDisplay = isBn ? `${toBengaliDigits(holdersCount)} \u099c\u09a8` : `${holdersCount} Rayats`;
      const totalShareSumDisplay = isBn ? toBengaliDigits(totalShareSum.toFixed(4)) : (totalShareSum > 0 ? totalShareSum.toFixed(4) : '-');
      const totalAreaSumDisplay = isBn ? (toBengaliDigits(totalAreaSum.toFixed(4)) + ' \u098f\u0995\u09b0') : (totalAreaSum > 0 ? (totalAreaSum.toFixed(4) + ' Acre') : totalArea);

      return `
        <div class="printable-schedule-doc">
          <div class="print-header-top">
            <div class="print-header-banner-wrap">
              <img src="${cachedHeaderImageDataUrl || 'images/header_image.png'}" alt="Government of West Bengal - Banglarbhumi" class="print-header-banner-img" />
            </div>
            <div class="print-meta-substrip">
              <div class="print-doc-badge-col">
                <span class="print-doc-type-pill">${docBadgeText}</span>
                <span class="print-meta-text-inline">${docBadgeSub}</span>
              </div>
              <div class="print-meta-ref-col">
                <span class="print-meta-text">${refText}</span>
                <span class="print-meta-sep">•</span>
                <span class="print-meta-text time">${escape(formattedGenTime)}</span>
              </div>
            </div>
          </div>

          <div class="print-gold-accent"></div>

          <div class="print-schedule-banner">
            <div class="print-schedule-title-main"><span>${bannerTitle}</span></div>
            <div class="print-schedule-title-sub">${escape(liveInfoText)}</div>
          </div>

          <div class="print-summary-box">
            <div class="print-summary-grid">
              <div class="print-summary-item">
                <span class="print-sum-label">${isBn ? '\u099c\u09c7\u09b2\u09be' : 'District'}</span>
                <span class="print-sum-val">${escape(distDisplay)}</span>
              </div>
              <div class="print-summary-item">
                <span class="print-sum-label">${isBn ? '\u09ac\u09cd\u09b2\u0995' : 'Block'}</span>
                <span class="print-sum-val">${escape(blockDisplay)}</span>
              </div>
              <div class="print-summary-item">
                <span class="print-sum-label">${isBn ? '\u09ae\u09cb\u099c\u09be \u0993 \u099c\u09c7.\u098f\u09b2' : 'Mouza & J.L. No'}</span>
                <span class="print-sum-val">${escape(mouzaDisplay)}</span>
              </div>
              <div class="print-summary-item">
                <span class="print-sum-label">${isBn ? '\u09a5\u09be\u09a8\u09be' : 'Thana'}</span>
                <span class="print-sum-val">${escape(thanaDisplay)}</span>
              </div>
            </div>
            <div class="print-summary-grid">
              <div class="print-summary-item">
                <span class="print-sum-label">${isBn ? '\u09a6\u09be\u0997 \u09a8\u09ae\u09cd\u09ac\u09b0' : 'Plot / Dag No'}</span>
                <span class="print-sum-val highlight"><span class="print-badge-plot">${escape(plotNo)}</span></span>
              </div>
              <div class="print-summary-item">
                <span class="print-sum-label">${isBn ? '\u099c\u09ae\u09bf\u09b0 \u09b6\u09cd\u09b0\u09c7\u09a3\u09bf' : 'Classification'}</span>
                <span class="print-sum-val">${escape(classification)}</span>
              </div>
              <div class="print-summary-item">
                <span class="print-sum-label">${isBn ? '\u09ae\u09cb\u099f \u099c\u09ae\u09bf\u09b0 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3' : 'Total Area'}</span>
                <span class="print-sum-val">${escape(totalArea)}</span>
              </div>
              <div class="print-summary-item">
                <span class="print-sum-label">${isBn ? '\u09ae\u09cb\u099f \u0985\u0982\u09b6\u09c0\u09a6\u09be\u09b0' : 'Total Rayats'}</span>
                <span class="print-sum-val highlight">${totalHoldersDisplay}</span>
              </div>
            </div>
          </div>

          <div class="print-table-wrap">
            <table class="print-ledger-table">
              <thead>
                <tr>
                  <th style="width:5%;">${isBn ? '\u0995\u09cd\u09b0.\u09a8\u0982' : 'Sl No'}</th>
                  <th style="width:12%;">${isBn ? '\u0996\u09a4\u09bf\u09af\u09bc\u09be\u09a8 \u09a8\u09ae\u09cd\u09ac\u09b0' : 'Khatian No'}</th>
                  <th style="width:25%;">${isBn ? '\u09b0\u09be\u09af\u09bc\u09a4\u09c7\u09b0 \u09a8\u09be\u09ae' : 'Rayat / Owner Name'}</th>
                  <th style="width:20%;">${isBn ? '\u09aa\u09bf\u09a4\u09be/\u09b8\u09cd\u09ac\u09be\u09ae\u09c0\u09b0 \u09a8\u09be\u09ae' : 'Father / Husband'}</th>
                  <th style="width:10%;">${isBn ? '\u0985\u0982\u09b6' : 'Share'}</th>
                  <th style="width:14%;">${isBn ? '\u0985\u0982\u09b6 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3 (\u098f\u0995\u09b0)' : 'Share Area (Acre)'}</th>
                  <th style="width:7%;">${isBn ? '\u09a6\u0996\u09b2\u09a6\u09be\u09b0' : 'Dakhaldar'}</th>
                  <th style="width:7%;">${isBn ? '\u09ae\u09a8\u09cd\u09a4\u09ac\u09cd\u09af' : 'Remarks'}</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || `<tr><td colspan="8" class="print-col-center" style="padding:18px;">${isBn ? '\u098f\u0987 \u09a6\u09be\u0997\u09c7\u09b0 \u0985\u09a7\u09c0\u09a8\u09c7 \u0995\u09cb\u09a8\u09cb \u09b0\u09be\u09af\u09bc\u09a4\u09c7\u09b0 \u09b0\u09c7\u0995\u09b0\u09cd\u09a1 \u09aa\u09be\u0993\u09af\u09bc\u09be \u09af\u09be\u09af\u09bc\u09a8\u09bf\u0987' : 'No owner records found.'}</td></tr>`}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align:right;">${isBn ? '\u09ae\u09cb\u099f \u0985\u0982\u09b6 \u0993 \u09aa\u09b0\u09bf\u09ae\u09be\u09aa:' : 'Total Share & Calculated Area:'}</td>
                  <td class="print-col-right font-mono" style="color:#0f172a; font-weight:700;">${totalShareSumDisplay}</td>
                  <td class="print-col-right font-mono" style="color:#0f172a; font-weight:700;">${totalAreaSumDisplay}</td>
                  <td colspan="2" class="print-col-center" style="color:#1e3a8a; font-weight:700;">${isBn ? '\u09af\u09be\u099a\u09be\u0987\u0995\u09c3\u09a4 \u09a1\u09bf\u099c\u09bf\u099f\u09be\u09b2 \u09b0\u09c7\u0995\u09b0\u09cd\u09a1' : 'Verified Digital Record'}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="print-footer-notice">
            <div class="print-disclaimer">
              ${isBn ? '<strong>\u0985\u09ab\u09bf\u09b8\u09bf\u09af\u09bc\u09be\u09b2 \u09a4\u09a5\u09cd\u09af \u09ac\u09bf\u09ac\u09b0\u09a3\u09c0:</strong> \u098f\u0987 \u09a8\u09a5\u09bf\u099f\u09bf \u09aa\u09b6\u09cd\u099a\u09bf\u09ae\u09ac\u0999\u09cd\u0997 \u09b8\u09b0\u0995\u09be\u09b0\u09c7\u09b0 \u09ad\u09c2\u09ae\u09bf \u0993 \u09ad\u09c2\u09ae\u09bf \u09b8\u0982\u09b8\u09cd\u0995\u09be\u09b0 \u098f\u09ac\u0982 \u0989\u09a6\u09cd\u09ac\u09be\u09b8\u09cd\u09a4\u09c1 \u09a4\u09cd\u09b0\u09be\u09a3 \u0993 \u09aa\u09c1\u09a8\u09b0\u09cd\u09ac\u09be\u09b8\u09a8 \u09a6\u09aa\u09cd\u09a4\u09b0\u09c7\u09b0 \u09b8\u09c7\u09a8\u09cd\u099f\u09cd\u09b0\u09be\u09b2 \u09a1\u09be\u099f\u09be\u09ac\u09c7\u09b8 (\u09ac\u09be\u0982\u09b2\u09be\u09b0\u09ad\u09c2\u09ae\u09bf) \u09a5\u09c7\u0995\u09c7 \u09b8\u09b0\u09be\u09b8\u09b0\u09bf \u09b8\u0982\u0997\u09c3\u09b9\u09c0\u09a4 \u098f\u0995\u099f\u09bf \u09aa\u09cd\u09b0\u09be\u09ae\u09be\u09a3\u09cd\u09af \u09a1\u09bf\u099c\u09bf\u099f\u09be\u09b2 \u0996\u09a4\u09bf\u09af\u09bc\u09be\u09a8 \u0993 \u09ae\u09be\u09b2\u09bf\u0995\u09be\u09a8\u09be \u09a4\u09ab\u09b8\u09bf\u09b2\u0987 \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09a4\u09a5\u09cd\u09af \u09b8\u0982\u09b6\u09cb\u09a7\u09a8 \u09ac\u09be \u09ac\u09bf\u09b7\u09af\u09bc\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u09b8\u09cd\u09a5\u09be\u09a8\u09c0\u09af\u09bc \u09ac\u09bf.\u098f\u09b2. \u0985\u09cd\u09af\u09be\u09a8\u09cd\u09a1 \u098f\u09b2.\u0986\u09b0.\u0993. \u0985\u09ab\u09bf\u09b8\u09c7 \u09af\u09cb\u0997\u09be\u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0987' : '<strong>Official Revenue Disclaimer:</strong> This document represents a certified computer-generated Land Ownership Schedule extracted directly from the Directorate of Land Records & Surveys central database (Banglarbhumi), Government of West Bengal. Any clerical disputes or corrections must be registered with the jurisdictional B.L. & L.R.O. office.'}
            </div>
            <div class="print-seal-block">
              <div class="print-seal-stamp">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>${isBn ? '\u09aa\u09cd\u09b0\u09be\u09ae\u09be\u09a3\u09cd\u09af \u09a1\u09bf\u099c\u09bf\u099f\u09be\u09b2 \u09ac\u09bf\u09ac\u09b0\u09a3\u09c0' : 'Certified Digital Extract'}</span>
              </div>
              <div class="print-seal-sub">${isBn ? '\u09ad\u09c2\u09ae\u09bf \u09b0\u09c7\u0995\u09b0\u09cd\u09a1 \u0993 \u099c\u09b0\u09bf\u09aa \u0985\u09a7\u09bf\u0995\u09be\u09b0' : 'Directorate of Land Records & Surveys'}</div>
              <div class="print-seal-sub">${isBn ? '\u09aa\u09b6\u09cd\u099a\u09bf\u09ae\u09ac\u0999\u09cd\u0997 \u09b8\u09b0\u0995\u09be\u09b0' : 'Government of West Bengal'}</div>
            </div>
          </div>
        </div>
      `;
    }

    async function exportOwnershipSchedulePdf() {
      const isBn = (currentScheduleLang === 'bn');
      if (!activeData || (!activeData.holders?.length && !activeData.plots?.length)) {
        toast.error(isBn ? 'PDF ডাউনলোড করার আগে অনুগ্রহ করে একটি খতিয়ান বা দাগের তথ্য অনুসন্ধান করুন।' : 'Please search and view a plot or khatian record before downloading PDF.');
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

      const toastId = toast.loading(isBn ? 'রাজস্ব তফসিল PDF তৈরি করা হচ্ছে...' : 'Generating Revenue Schedule PDF...');
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
        toast.success(isBn ? 'রাজস্ব তফসিল PDF সফলভাবে ডাউনলোড হয়েছে!' : 'Revenue Schedule PDF downloaded successfully!', { id: toastId });
      } catch (err) {
        toast.error((isBn ? 'PDF ডাউনলোড ব্যর্থ হয়েছে: ' : 'Failed to export PDF: ') + (err.message || 'Unknown error'), { id: toastId });
      } finally {
        container.remove();
        window.scrollTo(0, oldScroll);
      }
    }

    async function printOwnershipSchedule() {
      const isBn = (currentScheduleLang === 'bn');
      if (!activeData || (!activeData.holders?.length && !activeData.plots?.length)) {
        toast.error(isBn ? 'প্রিন্ট করার আগে অনুগ্রহ করে একটি খতিয়ান বা দাগের তথ্য অনুসন্ধান করুন।' : 'Please search and view a plot or khatian record before printing.');
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
