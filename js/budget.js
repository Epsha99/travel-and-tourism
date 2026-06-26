/**
 * budget.js — Travel Budget Calculator
 *
 * Features:
 *  - Total budget input with per-person & per-day breakdown
 *  - Four expense categories: Transport, Hotel, Food, Activities
 *  - Live SVG donut chart showing expense proportions
 *  - Itemised expense list with percentage bars
 *  - Remaining balance with over-budget warning
 *  - Currency switcher (INR / USD / EUR / GBP)
 *  - Reset button
 *  - Saves last inputs to localStorage so data persists on refresh
 *
 * Wires up to the existing HTML IDs already present in travel.html:
 *   #total-budget, #travelers, #duration,
 *   #exp-transport, #exp-hotel, #exp-food, #exp-activities,
 *   #calc-budget-btn, #chart-pie-placeholder,
 *   #expense-list-output, #balance-amount, #budget-status
 */

(() => {

  // ─── Currency config ───────────────────────────────────────────────
  const CURRENCIES = {
    INR: { symbol: '₹', label: 'INR', rate: 1       },
    USD: { symbol: '$', label: 'USD', rate: 0.012   },
    EUR: { symbol: '€', label: 'EUR', rate: 0.011   },
    GBP: { symbol: '£', label: 'GBP', rate: 0.0094  },
  };
  let activeCurrency = 'INR';

  // Expense category meta
  const CATEGORIES = [
    { key: 'transport', label: 'Transport',  id: 'exp-transport',  color: '#2563eb' },
    { key: 'hotel',     label: 'Hotel',      id: 'exp-hotel',      color: '#0ea5e9' },
    { key: 'food',      label: 'Food',       id: 'exp-food',       color: '#f59e0b' },
    { key: 'activities',label: 'Activities', id: 'exp-activities', color: '#10b981' },
  ];

  const STORAGE_KEY = 'travelBudgetData';

  // ─── Helpers ───────────────────────────────────────────────────────

  function fmt(amount) {
    const cur = CURRENCIES[activeCurrency];
    const converted = amount * cur.rate;
    return `${cur.symbol}${converted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  function getVal(id) {
    return parseFloat(document.getElementById(id)?.value) || 0;
  }

  function saveToStorage() {
    const data = {
      budget:     document.getElementById('total-budget').value,
      travelers:  document.getElementById('travelers').value,
      duration:   document.getElementById('duration').value,
      currency:   activeCurrency,
    };
    CATEGORIES.forEach(c => { data[c.key] = document.getElementById(c.id).value; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!data) return;
      document.getElementById('total-budget').value = data.budget   || '';
      document.getElementById('travelers').value    = data.travelers || '';
      document.getElementById('duration').value     = data.duration  || '';
      if (data.currency && CURRENCIES[data.currency]) {
        activeCurrency = data.currency;
        const sel = document.getElementById('budget-currency');
        if (sel) sel.value = activeCurrency;
      }
      CATEGORIES.forEach(c => {
        if (data[c.key]) document.getElementById(c.id).value = data[c.key];
      });
    } catch {}
  }

  // ─── SVG Donut Chart ───────────────────────────────────────────────

  function buildDonut(segments) {
    // segments: [{ label, value, color, pct }]
    const SIZE   = 200;
    const CX     = 100;
    const CY     = 100;
    const R      = 72;
    const STROKE = 28;
    const CIRC   = 2 * Math.PI * R;

    let svg = `<svg viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg"
      style="width:200px;height:200px;display:block;margin:0 auto 20px;">`;

    // background ring
    svg += `<circle cx="${CX}" cy="${CY}" r="${R}"
      fill="none" stroke="#e2e8f0" stroke-width="${STROKE}"/>`;

    // If all zero draw empty state
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    if (total === 0) {
      svg += `<text x="${CX}" y="${CY}" text-anchor="middle" dominant-baseline="middle"
        font-size="13" fill="#94a3b8" font-family="Poppins,sans-serif">No data yet</text>`;
      svg += `</svg>`;
      return svg;
    }

    let offset = 0;
    segments.forEach(seg => {
      const dash = (seg.value / total) * CIRC;
      const gap  = CIRC - dash;
      svg += `<circle cx="${CX}" cy="${CY}" r="${R}"
        fill="none"
        stroke="${seg.color}"
        stroke-width="${STROKE}"
        stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
        stroke-dashoffset="${(-offset).toFixed(2)}"
        transform="rotate(-90 ${CX} ${CY})"
        style="transition: stroke-dasharray 0.6s ease;">
        <title>${seg.label}: ${seg.pct}%</title>
      </circle>`;
      offset += dash;
    });

    svg += `</svg>`;
    return svg;
  }

  // ─── Main Calculate Function ────────────────────────────────────────

  function calculate() {
    const budget    = getVal('total-budget');
    const travelers = Math.max(1, getVal('travelers') || 1);
    const duration  = Math.max(1, getVal('duration')  || 1);

    // Daily per-person values
    const daily = {};
    CATEGORIES.forEach(c => { daily[c.key] = getVal(c.id); });

    // Total over whole trip for all travelers
    const totals = {};
    let grandTotal = 0;
    CATEGORIES.forEach(c => {
      totals[c.key] = daily[c.key] * duration * travelers;
      grandTotal += totals[c.key];
    });

    const remaining = budget - grandTotal;
    const overBudget = remaining < 0;

    saveToStorage();

    // ── Build segments for donut ──
    const segments = CATEGORIES.map(c => ({
      label: c.label,
      value: totals[c.key],
      color: c.color,
      pct:   grandTotal > 0 ? Math.round((totals[c.key] / grandTotal) * 100) : 0,
    }));

    // ── Render donut ──
    const chartEl = document.getElementById('chart-pie-placeholder');
    if (chartEl) {
      chartEl.style.background  = 'transparent';
      chartEl.style.height      = 'auto';
      chartEl.style.display     = 'block';
      chartEl.innerHTML = buildDonut(segments);
    }

    // ── Render expense list ──
    const listEl = document.getElementById('expense-list-output');
    if (listEl) {
      listEl.innerHTML = '';

      // Summary row: per person / per day
      const summaryItem = document.createElement('li');
      summaryItem.className = 'budget-summary-row';
      summaryItem.innerHTML = `
        <div class="bsr-grid">
          <div class="bsr-cell">
            <span class="bsr-label">Total Budget</span>
            <strong class="bsr-value">${fmt(budget)}</strong>
          </div>
          <div class="bsr-cell">
            <span class="bsr-label">Total Expenses</span>
            <strong class="bsr-value">${fmt(grandTotal)}</strong>
          </div>
          <div class="bsr-cell">
            <span class="bsr-label">Per Person</span>
            <strong class="bsr-value">${fmt(grandTotal / travelers)}</strong>
          </div>
          <div class="bsr-cell">
            <span class="bsr-label">Per Day</span>
            <strong class="bsr-value">${fmt(grandTotal / duration)}</strong>
          </div>
        </div>`;
      listEl.appendChild(summaryItem);

      // Individual category rows with progress bars
      CATEGORIES.forEach(c => {
        const seg = segments.find(s => s.label === c.label);
        const li  = document.createElement('li');
        li.className = 'expense-row';
        li.innerHTML = `
          <div class="expense-row-top">
            <div class="expense-dot" style="background:${c.color}"></div>
            <span class="expense-label">${c.label}</span>
            <span class="expense-daily">${fmt(daily[c.key])}/day per person</span>
            <span class="expense-total">${fmt(totals[c.key])}</span>
            <span class="expense-pct">${seg.pct}%</span>
          </div>
          <div class="expense-bar-track">
            <div class="expense-bar-fill" style="width:${seg.pct}%;background:${c.color}"></div>
          </div>`;
        listEl.appendChild(li);
      });
    }

    // ── Balance status ──
    const balanceEl = document.getElementById('balance-amount');
    const statusEl  = document.getElementById('budget-status');

    if (balanceEl) balanceEl.textContent = fmt(Math.abs(remaining));

    if (statusEl) {
      if (overBudget) {
        statusEl.className = 'total-remaining budget-over';
        statusEl.querySelector('h4').innerHTML =
          `⚠️ Over Budget by: <span id="balance-amount">${fmt(Math.abs(remaining))}</span>`;
      } else {
        statusEl.className = 'total-remaining budget-ok';
        statusEl.querySelector('h4').innerHTML =
          `✅ Remaining Balance: <span id="balance-amount">${fmt(remaining)}</span>`;
      }
    }

    // Show results panel
    const resultArea = document.getElementById('budget-result-area');
    if (resultArea) resultArea.classList.add('has-results');
  }

  // ─── Reset ─────────────────────────────────────────────────────────

  function resetAll() {
    ['total-budget','travelers','duration'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    CATEGORIES.forEach(c => {
      const el = document.getElementById(c.id);
      if (el) el.value = '';
    });
    localStorage.removeItem(STORAGE_KEY);

    const chartEl = document.getElementById('chart-pie-placeholder');
    if (chartEl) {
      chartEl.style.background = '#e2e8f0';
      chartEl.style.height     = '200px';
      chartEl.style.display    = 'flex';
      chartEl.textContent      = 'Chart Area';
    }

    const listEl = document.getElementById('expense-list-output');
    if (listEl) listEl.innerHTML = '';

    const statusEl = document.getElementById('budget-status');
    if (statusEl) {
      statusEl.className = 'total-remaining';
      statusEl.innerHTML = '<h4>Remaining Balance: <span id="balance-amount">$0.00</span></h4>';
    }

    const resultArea = document.getElementById('budget-result-area');
    if (resultArea) resultArea.classList.remove('has-results');
  }

  // ─── Init ──────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {

    // Inject currency switcher + reset button into the budget form
    const calcBtn = document.getElementById('calc-budget-btn');
    if (calcBtn) {
      // Currency row
      const curRow = document.createElement('div');
      curRow.className = 'form-group budget-currency-row';
      curRow.innerHTML = `
        <label for="budget-currency">Currency</label>
        <select id="budget-currency" class="filter-input">
          ${Object.entries(CURRENCIES).map(([k,v]) =>
            `<option value="${k}" ${k === activeCurrency ? 'selected' : ''}>${v.symbol} ${v.label}</option>`
          ).join('')}
        </select>`;
      calcBtn.parentNode.insertBefore(curRow, calcBtn);

      // Reset button — insert after calc button
      const resetBtn = document.createElement('button');
      resetBtn.id        = 'reset-budget-btn';
      resetBtn.className = 'btn btn-outline w-100';
      resetBtn.style.marginTop = '10px';
      resetBtn.textContent = 'Reset Calculator';
      calcBtn.parentNode.insertBefore(resetBtn, calcBtn.nextSibling);

      calcBtn.addEventListener('click', calculate);
      resetBtn.addEventListener('click', resetAll);

      document.getElementById('budget-currency').addEventListener('change', (e) => {
        activeCurrency = e.target.value;
        saveToStorage();
        // Re-run calculation if results are showing
        if (document.getElementById('budget-result-area')?.classList.contains('has-results')) {
          calculate();
        }
      });
    }

    // Load saved data
    loadFromStorage();

    // Auto-calc if saved data exists
    if (localStorage.getItem(STORAGE_KEY)) {
      calculate();
    }
  });

})();