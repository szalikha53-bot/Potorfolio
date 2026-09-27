/* =========================================================
   SISTEM PRESENSI KELAS - SCRIPT FINAL (REALTIME)
   ---------------------------------------------------------
   - Pakai Google Visualization API (JSONP) → bebas CORS
   - Auto-refresh tiap 15 detik
   - Bisa dibuka dari file:// atau server
   ========================================================= */

'use strict';

/* =========================================================
   1. KONFIGURASI  // ✅ FIX: ID & URL dipisah dengan benar
   ========================================================= */
const CONFIG = {
  // 🔗 URL Google Formulir untuk mengisi presensi (BUKAN spreadsheet)
  GOOGLE_FORM_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSupQ4CERje7CGlMmwvhq8-Ns6ez78f7oAPtot_VQzoIaQolHXHWH6OXmTwh7jJ3AKQJdalcqy7EeV/pubhtml",

  // 🆔 ID Spreadsheet (44 karakter, ambil dari URL spreadsheet)
  //    Contoh URL: https://docs.google.com/spreadsheets/d/1AbCdEf.../edit
  //    → ID = "1AbCdEf..."
  SHEET_ID: "1LKtrIKZK3ra46MFy6gVBnPkFNyh5UAwLdvMNnRnXhII",

  // 📄 Nama sheet/tab (opsional, kalau ingin spesifik)
  SHEET_NAME: "",

  // ⏰ Interval auto-refresh (ms)
  REFRESH_INTERVAL: 15000,

  // 📊 Maksimal kolom yang ditampilkan di tabel
  MAX_COLUMNS: 6,

  // ⏱️ Timeout fetch (ms)
  FETCH_TIMEOUT: 12000
};

/* =========================================================
   2. ELEMEN DOM
   ========================================================= */
const els = {
  btnScan:      document.getElementById('btnScan'),
  btnText:      document.getElementById('btnText'),
  btnRefresh:   document.getElementById('btnRefresh'),
  status:       document.getElementById('status'),
  qrImage:      document.getElementById('qrImage'),
  clock:        document.getElementById('clock'),
  rekapBody:    document.getElementById('rekapBody'),
  rekapTable:   document.getElementById('rekapTable'),
  rekapHead:    document.getElementById('rekapHead'),
  loadingState: document.getElementById('loadingState'),
  emptyState:   document.getElementById('emptyState'),
  statTotal:    document.getElementById('statTotal'),
  statToday:    document.getElementById('statToday'),
  statUpdate:   document.getElementById('statUpdate'),
  connDot:      document.getElementById('connDot'),
  connText:     document.getElementById('connText')
};

/* =========================================================
   3. STATE GLOBAL
   ========================================================= */
const state = {
  isFetching: false,
  lastData: [],
  lastHeaders: [],
  failCount: 0,
  statusTimer: null,
  refreshTimer: null   // ✅ FIX: simpan handle auto-refresh
};

/* =========================================================
   4. JAM DIGITAL
   ========================================================= */
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  els.clock.textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

/* =========================================================
   5. STATUS MESSAGE  // ✅ FIX: pakai span supaya layout stabil
   ========================================================= */
function showStatus(type, message, autoHide = true) {
  els.status.className = `status ${type}`;
  els.status.textContent = message;

  if (state.statusTimer) clearTimeout(state.statusTimer);

  if (autoHide && type !== 'loading') {
    state.statusTimer = setTimeout(() => {
      els.status.className = 'status';
      els.status.textContent = '';
    }, 4000);
  }
}

/* =========================================================
   6. SCAN QR → GOOGLE FORM  // ✅ FIX: validasi URL form
   ========================================================= */
function handleScan() {
  const url = CONFIG.GOOGLE_FORM_URL || '';

  if (!url || url.includes('XXXXXX') || !/^https?:\/\//.test(url)) {
    showStatus('error', '⚠️ URL Google Form belum diatur dengan benar di script.js');
    return;
  }

  els.btnScan.disabled = true;
  els.btnText.textContent = 'Mengarahkan...';
  showStatus('loading', '⏳ Membuka formulir presensi...', false);

  const newTab = window.open(url, '_blank', 'noopener,noreferrer');

  setTimeout(() => {
    if (newTab) {
      showStatus('success', '✅ Berhasil! Formulir dibuka di tab baru');
    } else {
      showStatus('error', '⚠️ Pop-up diblokir browser. Izinkan pop-up lalu coba lagi.');
    }
    els.btnScan.disabled = false;
    els.btnText.textContent = 'Scan QR & Isi Presensi';
  }, 600);
}

els.btnScan.addEventListener('click', handleScan);

/* =========================================================
   7. FALLBACK GAMBAR QR
   ========================================================= */
els.qrImage.addEventListener('error', function () {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
      <rect width="220" height="220" fill="#f1f5f9" rx="12"/>
      <text x="50%" y="45%" font-size="42" text-anchor="middle" dy=".3em">📷</text>
      <text x="50%" y="65%" font-size="12" font-family="sans-serif" text-anchor="middle" fill="#64748b">qr.png tidak ditemukan</text>
    </svg>`;
  this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  this.style.opacity = '0.6';
  this.onerror = null; // ✅ FIX: cegah infinite loop kalau SVG gagal
});

/* =========================================================
   8. FETCH DATA VIA GOOGLE VISUALIZATION API (JSONP)
   ✅ FIX: endpoint benar untuk SHEET_ID asli (bukan 2PACX)
   ========================================================= */
function fetchSheetData() {
  return new Promise((resolve, reject) => {
    if (!CONFIG.SHEET_ID || CONFIG.SHEET_ID.startsWith('2PACX')) {
      return reject(new Error(
        'SHEET_ID tidak valid. Ambil ID spreadsheet (44 char) dari URL /spreadsheets/d/<ID>/edit'
      ));
    }

    const cbName = 'gvizCb_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);

    const params = new URLSearchParams();
    params.set('tqx', `out:json;responseHandler:${cbName}`);
    params.set('tq',  'select *');

    // ✅ FIX: gviz/tq butuh SHEET_ID asli
    const base = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq`;
    const url = `${base}?${params.toString()}`;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Request timeout'));
    }, CONFIG.FETCH_TIMEOUT);

    window[cbName] = function (response) {
      cleanup();
      if (!response || !response.table) {
        return reject(new Error('Response tidak valid'));
      }
      resolve(response.table);
    };

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onerror = function () {
      cleanup();
      reject(new Error('Gagal memuat script gviz (cek izin "Anyone with link")'));
    };

    document.head.appendChild(script);

    function cleanup() {
      clearTimeout(timeout);
      if (script.parentNode) script.parentNode.removeChild(script);
      // ✅ FIX: hindari error di strict mode
      try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
    }
  });
}

/* =========================================================
   9. PARSER TABLE → OBJECT  // ✅ FIX: simpan raw & formatted
   ========================================================= */
function parseTable(table) {
  const headers = table.cols.map((col, i) =>
    (col.label || col.id || `Kolom ${i + 1}`).toString().trim()
  );

  const rows = table.rows.map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      const cell = row.c[i];
      obj[h] = {
        raw: cell && cell.v != null ? cell.v : '',
        text: formatCell(cell)
      };
    });
    return obj;
  });

  return { headers, rows };
}

function formatCell(cell) {
  if (!cell) return '';
  if (cell.f != null && cell.f !== '') return cell.f;
  if (cell.v == null) return '';
  return String(cell.v);
}

/* =========================================================
   10. RENDER TABEL  // ✅ FIX: cari kolom status dinamis
   ========================================================= */
function renderTable(headers, rows) {
  els.loadingState.style.display = 'none';

  if (!rows.length) {
    renderEmpty();
    return;
  }

  els.emptyState.style.display = 'none';
  els.rekapTable.style.display = 'table';

  const cols = Math.min(headers.length, CONFIG.MAX_COLUMNS);

  // ✅ FIX: kolom status dicari by nama, fallback ke kolom terakhir
  let statusIdx = headers.findIndex(h => /status|kehadiran|hadir/i.test(h));
  if (statusIdx === -1 || statusIdx >= cols) statusIdx = cols - 1;

  // Header
  els.rekapHead.innerHTML = '<th>No</th>';
  for (let c = 0; c < cols; c++) {
    const th = document.createElement('th');
    th.textContent = headers[c] || `Kolom ${c + 1}`;
    els.rekapHead.appendChild(th);
  }

  // Body
  els.rekapBody.innerHTML = '';
  const reversed = [...rows].reverse();

  reversed.forEach((rowObj, idx) => {
    const tr = document.createElement('tr');

    const tdNo = document.createElement('td');
    tdNo.textContent = idx + 1;
    tdNo.style.fontWeight = '700';
    tdNo.style.color = '#6366f1';
    tr.appendChild(tdNo);

    for (let c = 0; c < cols; c++) {
      const key = headers[c];
      const cell = rowObj[key] || { raw: '', text: '' };
      const td = document.createElement('td');

      if (c === statusIdx) {
        const badge = document.createElement('span');
        badge.className = 'badge-status';
        badge.textContent = cell.text || 'Hadir';
        td.appendChild(badge);
      } else {
        const text = cell.text.length > 28 ? cell.text.slice(0, 28) + '…' : cell.text;
        td.textContent = text || '-';
        if (cell.text.length > 28) td.title = cell.text;
      }

      tr.appendChild(td);
    }

    els.rekapBody.appendChild(tr);
  });
}

/* =========================================================
   11. RENDER EMPTY
   ========================================================= */
function renderEmpty() {
  els.rekapTable.style.display = 'none';
  els.emptyState.style.display = 'block';
  els.statTotal.textContent = '0';
  els.statToday.textContent = '0';
}

/* =========================================================
   12. STATISTIK  // ✅ FIX: pakai nilai raw
   ========================================================= */
function updateStats(rows) {
  els.statTotal.textContent = rows.length;

  const now = new Date();
  const todayDay   = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear  = now.getFullYear();

  let todayCount = 0;

  rows.forEach(row => {
    const keys = Object.keys(row);
    const tsKey = keys.find(k => /timestamp|waktu|tanggal/i.test(k)) || keys[0];
    if (!tsKey) return;

    const cell = row[tsKey];
    if (!cell) return;

    const d = parseDate(cell.raw) || parseDate(cell.text);
    if (!d) return;

    if (d.getDate() === todayDay &&
        d.getMonth() === todayMonth &&
        d.getFullYear() === todayYear) {
      todayCount++;
    }
  });

  els.statToday.textContent = todayCount;
}

function parseDate(value) {
  if (value == null || value === '') return null;

  // ✅ FIX: kalau sudah Date object (dari gviz)
  if (value instanceof Date && !isNaN(value)) return value;

  const str = String(value).trim();

  // ISO: yyyy-MM-dd [T HH:mm[:ss]]
  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  }

  // dd/MM/yyyy [HH:mm[:ss]]
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    let a = +m[1], b = +m[2];
    // ✅ FIX: kalau angka pertama > 12, berarti dd/MM
    let day = a > 12 ? a : (b > 12 ? a : b);
    let mon = a > 12 ? b : (b > 12 ? a : a);
    return new Date(+m[3], mon - 1, day, +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/* =========================================================
   13. WAKTU UPDATE
   ========================================================= */
function updateLastUpdate() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  els.statUpdate.textContent = `${h}:${m}:${s}`;
}

/* =========================================================
   14. KONEKSI STATUS
   ========================================================= */
function setConnection(status, text) {
  els.connDot.className = 'conn-dot';
  if (status === 'online')     els.connDot.classList.add('online');
  if (status === 'offline')    els.connDot.classList.add('offline');
  if (status === 'connecting') els.connDot.classList.add('connecting');
  els.connText.textContent = text;
}

/* =========================================================
   15. MAIN FETCH FLOW
   ========================================================= */
async function loadData(isManual = false) {
  if (state.isFetching) return;
  state.isFetching = true;

  if (isManual || state.lastData.length === 0) {
    els.loadingState.style.display = 'block';
  }

  setConnection('connecting', 'Menghubungkan...');

  try {
    const table = await fetchSheetData();
    const { headers, rows } = parseTable(table);

    state.lastData = rows;
    state.lastHeaders = headers;
    state.failCount = 0;

    renderTable(headers, rows);
    updateStats(rows);
    updateLastUpdate();
    setConnection('online', `Terhubung • ${rows.length} data`);

  } catch (err) {
    console.error('[Presensi] Fetch error:', err);
    state.failCount++;

    setConnection('offline', `Gagal memuat (${state.failCount}x)`);

    if (state.lastData.length === 0) {
      renderEmpty();
      showStatus('error', '⚠️ ' + (err.message || 'Gagal memuat data.'));
    }
  } finally {
    state.isFetching = false;
    els.loadingState.style.display = 'none';
  }
}

/* =========================================================
   16. TOMBOL REFRESH MANUAL
   ========================================================= */
els.btnRefresh.addEventListener('click', async () => {
  if (state.isFetching) return;
  els.btnRefresh.classList.add('spinning');
  await loadData(true);
  setTimeout(() => els.btnRefresh.classList.remove('spinning'), 600);
});

/* =========================================================
   17. AUTO-REFRESH  // ✅ FIX: hindari dobel timer
   ========================================================= */
if (state.refreshTimer) clearInterval(state.refreshTimer);
state.refreshTimer = setInterval(() => {
  if (document.hidden) return;
  loadData(false);
}, CONFIG.REFRESH_INTERVAL);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) loadData(false);
});

/* =========================================================
   18. INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  loadData(true);
});