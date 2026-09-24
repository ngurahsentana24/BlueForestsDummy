/* =========================================================
   Blue Forests MIS – core: state, schema, helpers, komponen
   ========================================================= */
const CONFIG = {
  LOGO_URL: 'https://blue-forests.org/wp-content/uploads/2020/01/cropped-Logo-Blue-Forests-Transparent1-3-300x110.png',
  HERO_PHOTO_URL: '',            // isi dengan URL foto laut/mangrove milik sendiri jika ingin (opsional)
  USER: 'Pengguna Demo',         // tanpa login: semua aksi tercatat atas nama ini
  TODAY: new Date().toISOString().slice(0, 10)
};

/* ---------- state ---------- */
const S = {
  db: null, meta: {}, view: 'dashboard', lang: 'id', pub: false, mask: true,
  f: {}, tab: {}, sel: {}
};
const charts = []; let maps = [];

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (v, d = 0) => (v === '' || v == null || isNaN(v)) ? '–' : Number(v).toLocaleString('id-ID', { maximumFractionDigits: d });
const rp = v => 'Rp ' + nf(v);
const pctf = v => v == null ? '–' : nf(v, 0) + '%';
const fdate = d => { if (!d) return '–'; const x = new Date(String(d).slice(0, 10) + 'T00:00:00'); return isNaN(x) ? esc(d) : x.toLocaleDateString(S.lang === 'en' ? 'en-GB' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); };
const sum = (a, f = x => x) => a.reduce((s, x) => s + (Number(f(x)) || 0), 0);
const groupBy = (a, f) => a.reduce((m, x) => { const k = f(x); (m[k] = m[k] || []).push(x); return m; }, {});
const uniq = a => [...new Set(a)];
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const rows = t => (S.db[t] || []).filter(r => !r._deleted);
const byId = (t, id) => (S.db[t] || []).find(r => r.id === id);
const nameOf = (t, id, k = 'nama') => { const r = byId(t, id); return r ? (r[k] || r.pernyataan || r.judul || id) : (id || '–'); };
const age = d => { if (!d) return ''; const b = new Date(d); const n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a; };
const maskStr = (s, keep = 4) => { s = String(s || ''); if (!s) return '–'; return (S.mask || S.pub) ? '•'.repeat(Math.max(0, s.length - keep)) + s.slice(-keep) : s; };
const ICON = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z', map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
  layers: 'm12 2 10 5-10 5L2 7l10-5zM2 17l10 5 10-5M2 12l10 5 10-5', target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  check: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', cal: 'M3 5h18v16H3zM16 3v4M8 3v4M3 10h18',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  folder: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z', book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM20 17v5H6.5A2.5 2.5 0 0 1 4 19.5',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8', print: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12', gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01', search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0', menu: 'M3 12h18M3 6h18M3 18h18', plus: 'M12 5v14M5 12h14',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', trash: 'M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2',
  down: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3', msg: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', x: 'M18 6 6 18M6 6l12 12', refresh: 'M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15',
  pin: 'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', flag: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4', unlock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 7.9-1', image: 'M3 3h18v18H3zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
  video: 'M23 7l-7 5 7 5zM1 5h15v14H1z', table: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18', globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
  bug: 'M8 2l1.9 1.9M16 2l-1.9 1.9M9 7.1V6a3 3 0 0 1 6 0v1.1M12 20a6 6 0 0 1-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3a6 6 0 0 1-6 6zM12 20v-9M6.5 13H3M21 13h-3.5M6 9H4M20 9h-2M6.5 17 4 19M17.5 17 20 19'
};
const ic = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON[n] || ''}"/></svg>`;

/* ---------- i18n (label utama) ---------- */
const I18N = {
  id: { dashboard: 'Dashboard', peta: 'Peta Spasial', program: 'Program & Landscape', kmel: 'Kerangka Hasil (KMEL)', capaian: 'Input & Approval Capaian', aktivitas: 'Aktivitas', penerima: 'Penerima Manfaat & Stakeholder', evidence: 'Evidence Library', pengetahuan: 'Pengetahuan & Pembelajaran', dokumen: 'Dokumen & Operasional', laporan: 'Pelaporan', migrasi: 'Migrasi & Kualitas Data', admin: 'Admin & Tata Kelola', bantuan: 'Bantuan & Umpan Balik', g1: 'Ringkasan', g2: 'Program & KMEL', g3: 'Data & Pengetahuan', g4: 'Pelaporan & Data', g5: 'Sistem', search: 'Cari program, indikator, penerima, dokumen…', demo: 'Data dummy untuk demo', report: 'Laporkan masalah', public: 'Mode publik', add: 'Tambah', save: 'Simpan', cancel: 'Batal', export: 'Ekspor CSV' },
  en: { dashboard: 'Dashboard', peta: 'Spatial Map', program: 'Programs & Landscapes', kmel: 'Results Framework (KMEL)', capaian: 'Results Entry & Approval', aktivitas: 'Activities', penerima: 'Beneficiaries & Stakeholders', evidence: 'Evidence Library', pengetahuan: 'Knowledge & Learning', dokumen: 'Documents & Operations', laporan: 'Reporting', migrasi: 'Migration & Data Quality', admin: 'Admin & Governance', bantuan: 'Help & Feedback', g1: 'Overview', g2: 'Programs & KMEL', g3: 'Data & Knowledge', g4: 'Reporting & Data', g5: 'System', search: 'Search programs, indicators, beneficiaries, documents…', demo: 'Dummy data for demo', report: 'Report an issue', public: 'Public mode', add: 'Add', save: 'Save', cancel: 'Cancel', export: 'Export CSV' }
};
const t = k => (I18N[S.lang] || I18N.id)[k] || I18N.id[k] || k;
const NAV = [
  { g: 'g1', items: [['dashboard', 'grid'], ['peta', 'map']] },
  { g: 'g2', items: [['program', 'layers'], ['kmel', 'target'], ['capaian', 'check'], ['aktivitas', 'cal']] },
  { g: 'g3', items: [['penerima', 'users'], ['evidence', 'folder'], ['pengetahuan', 'book'], ['dokumen', 'file']] },
  { g: 'g4', items: [['laporan', 'print'], ['migrasi', 'upload']] },
  { g: 'g5', items: [['admin', 'gear'], ['bantuan', 'help']] }
];
const PUBLIC_VIEWS = ['dashboard', 'peta', 'pengetahuan'];

/* ---------- schema (sumber untuk form, data dictionary, impor, ekspor) ---------- */
const O = { status: ['Aktif', 'Selesai', 'Ditunda'], jk: ['L', 'P'], freq: ['Bulanan', 'Triwulan', 'Semester', 'Tahunan'], agg: ['Kumulatif', 'Terakhir'], ast: ['Draft', 'Submitted', 'Verified', 'Approved', 'Rejected'], lvl: ['Tinggi', 'Sedang', 'Rendah'] };
const lk = kat => () => rows('Lookups').filter(l => l.kategori === kat && l.aktif !== false).map(l => l.nilai);
const SCHEMA = {
  Programs: { label: 'Program', prefix: 'PRG', fields: [['kode', 'Kode', 'text', 1], ['nama', 'Nama program', 'text', 1, { full: 1 }], ['deskripsi', 'Deskripsi', 'textarea', 0, { full: 1 }], ['mulai', 'Mulai', 'date', 1], ['selesai', 'Selesai', 'date', 1], ['status', 'Status', 'select', 1, { opts: O.status }]] },
  Projects: { label: 'Project', prefix: 'PRJ', fields: [['programId', 'Program', 'ref', 1, { ref: 'Programs' }], ['nama', 'Nama project', 'text', 1], ['donor', 'Donor', 'text', 1], ['anggaran', 'Anggaran (Rp)', 'number', 0], ['mulai', 'Mulai', 'date', 1], ['selesai', 'Selesai', 'date', 1], ['status', 'Status', 'select', 1, { opts: ['Berjalan', 'Selesai', 'Pipeline'] }]] },
  Landscapes: { label: 'Landscape', prefix: 'LS', fields: [['nama', 'Nama landscape', 'text', 1], ['provinsi', 'Provinsi', 'text', 1], ['lat', 'Latitude', 'number', 1], ['lng', 'Longitude', 'number', 1], ['luasHa', 'Luas (ha)', 'number', 0]] },
  Sites: { label: 'Site', prefix: 'ST', fields: [['nama', 'Nama site', 'text', 1, { full: 1 }], ['landscapeId', 'Landscape', 'ref', 1, { ref: 'Landscapes' }], ['projectId', 'Project', 'ref', 1, { ref: 'Projects' }], ['desa', 'Desa', 'text', 1], ['kabupaten', 'Kabupaten', 'text', 0], ['tipe', 'Tipe site', 'select', 1, { opts: lk('Tipe Site') }], ['luasHa', 'Luas (ha)', 'number', 0], ['lat', 'Latitude', 'number', 1, { gps: 1 }], ['lng', 'Longitude', 'number', 1]] },
  Outcomes: { label: 'Outcome', prefix: 'OC', fields: [['programId', 'Program', 'ref', 1, { ref: 'Programs' }], ['kode', 'Kode', 'text', 1], ['pernyataan', 'Pernyataan outcome', 'textarea', 1, { full: 1 }]] },
  Outputs: { label: 'Output', prefix: 'OP', fields: [['outcomeId', 'Outcome', 'ref', 1, { ref: 'Outcomes', key: 'pernyataan' }], ['kode', 'Kode', 'text', 1], ['pernyataan', 'Pernyataan output', 'textarea', 1, { full: 1 }]] },
  Indicators: { label: 'Indikator', prefix: 'IND', fields: [['outputId', 'Output', 'ref', 1, { ref: 'Outputs', key: 'pernyataan' }], ['kode', 'Kode', 'text', 1], ['nama', 'Nama indikator', 'text', 1, { full: 1 }], ['definisi', 'Definisi operasional', 'textarea', 1, { full: 1 }], ['satuan', 'Satuan', 'text', 1], ['frekuensi', 'Frekuensi', 'select', 1, { opts: O.freq }], ['baseline', 'Baseline', 'number', 1], ['agregasi', 'Cara agregasi', 'select', 1, { opts: O.agg, hint: 'Kumulatif = dijumlahkan antar periode; Terakhir = nilai periode terakhir' }], ['disaggregation', 'Disaggregation', 'text', 0], ['crosswalk', 'Crosswalk donor/SDG', 'text', 0, { full: 1, hint: 'Pisahkan dengan |, contoh: Donor A: EG.11-6 | SDG 14.2' }], ['sumberData', 'Sumber data', 'text', 0, { full: 1 }], ['prioritas', 'Indikator prioritas', 'bool', 0]] },
  IndicatorTargets: { label: 'Target', prefix: 'TG', fields: [['indicatorId', 'Indikator', 'ref', 1, { ref: 'Indicators' }], ['landscapeId', 'Landscape', 'ref', 1, { ref: 'Landscapes' }], ['periode', 'Periode', 'ref', 1, { ref: 'Periods', val: 'nama' }], ['target', 'Target kumulatif', 'number', 1], ['versi', 'Versi', 'number', 1], ['alasanRevisi', 'Alasan revisi', 'text', 0, { full: 1 }], ['tanggal', 'Tanggal', 'date', 1]] },
  IndicatorActuals: { label: 'Capaian', prefix: 'AC', fields: [['indicatorId', 'Indikator', 'ref', 1, { ref: 'Indicators', full: 1 }], ['landscapeId', 'Landscape', 'ref', 1, { ref: 'Landscapes' }], ['periode', 'Periode', 'ref', 1, { ref: 'Periods', val: 'nama' }], ['nilai', 'Nilai periode ini', 'number', 1], ['laki', 'Laki-laki', 'number', 0], ['perempuan', 'Perempuan', 'number', 0], ['pemuda', 'Pemuda (<30 th)', 'number', 0], ['rentan', 'Kelompok rentan', 'number', 0], ['evidenceIds', 'Evidence pendukung', 'multi', 0, { ref: 'Evidence', key: 'judul', full: 1 }], ['catatan', 'Catatan', 'textarea', 0, { full: 1 }], ['status', 'Status', 'select', 1, { opts: O.ast }], ['diinputOleh', 'Diinput oleh', 'text', 0], ['tanggal', 'Tanggal input', 'date', 1]] },
  Periods: { label: 'Periode', prefix: 'PER', fields: [['nama', 'Nama periode', 'text', 1], ['mulai', 'Mulai', 'date', 1], ['selesai', 'Selesai', 'date', 1], ['batasLapor', 'Batas pelaporan', 'date', 1], ['locked', 'Terkunci', 'bool', 0]] },
  Activities: { label: 'Aktivitas', prefix: 'ACT', fields: [['nama', 'Nama kegiatan', 'text', 1, { full: 1 }], ['outputId', 'Output terkait', 'ref', 1, { ref: 'Outputs', key: 'pernyataan', full: 1 }], ['siteId', 'Site', 'ref', 1, { ref: 'Sites' }], ['landscapeId', 'Landscape', 'ref', 1, { ref: 'Landscapes' }], ['tanggal', 'Tanggal', 'date', 1], ['pesertaL', 'Peserta laki-laki', 'number', 0], ['pesertaP', 'Peserta perempuan', 'number', 0], ['peserta', 'Daftar hadir (penerima manfaat)', 'multi', 0, { ref: 'Beneficiaries', full: 1 }], ['lat', 'Latitude', 'number', 0, { gps: 1 }], ['lng', 'Longitude', 'number', 0], ['sumber', 'Sumber data', 'select', 1, { opts: ['Manual', 'KoboToolbox'] }], ['status', 'Status', 'select', 1, { opts: ['Perlu Verifikasi', 'Terverifikasi'] }], ['kodeAnggaran', 'Kode anggaran', 'ref', 0, { ref: 'BudgetLines', key: 'kode' }], ['anggaran', 'Anggaran (Rp)', 'number', 0], ['realisasi', 'Realisasi (Rp)', 'number', 0], ['catatan', 'Catatan', 'textarea', 0, { full: 1 }]] },
  Beneficiaries: { label: 'Penerima manfaat', prefix: 'BEN', pii: ['nik', 'hp', 'tglLahir'], fields: [['nama', 'Nama lengkap', 'text', 1], ['nik', 'NIK', 'text', 0, { pii: 1 }], ['jk', 'Jenis kelamin', 'select', 1, { opts: O.jk }], ['tglLahir', 'Tanggal lahir', 'date', 1], ['desa', 'Desa', 'text', 1], ['landscapeId', 'Landscape', 'ref', 1, { ref: 'Landscapes' }], ['kelompok', 'Kelompok', 'select', 1, { opts: lk('Kelompok Penerima Manfaat') }], ['hp', 'No. HP', 'text', 0, { pii: 1 }], ['rentan', 'Kelompok rentan', 'bool', 0], ['consent', 'Persetujuan data (consent)', 'bool', 0], ['terdaftar', 'Tanggal terdaftar', 'date', 0]] },
  Stakeholders: { label: 'Stakeholder', prefix: 'STK', fields: [['nama', 'Nama lembaga', 'text', 1, { full: 1 }], ['tipe', 'Tipe', 'select', 1, { opts: lk('Tipe Stakeholder') }], ['landscapeId', 'Landscape', 'ref', 1, { ref: 'Landscapes' }], ['peran', 'Peran', 'text', 0], ['kontak', 'Kontak', 'text', 0], ['pengaruh', 'Pengaruh', 'select', 1, { opts: O.lvl }], ['kepentingan', 'Kepentingan', 'select', 1, { opts: O.lvl }]] },
  Evidence: { label: 'Evidence', prefix: 'EV', fields: [['judul', 'Judul', 'text', 1, { full: 1 }], ['jenis', 'Jenis', 'select', 1, { opts: lk('Jenis Evidence') }], ['tanggal', 'Tanggal', 'date', 1], ['landscapeId', 'Landscape', 'ref', 1, { ref: 'Landscapes' }], ['indicatorId', 'Indikator terkait', 'ref', 0, { ref: 'Indicators' }], ['activityId', 'Aktivitas terkait', 'ref', 0, { ref: 'Activities' }], ['tags', 'Tag', 'text', 0, { hint: 'Pisahkan dengan koma' }], ['pengunggah', 'Pengunggah', 'text', 0], ['url', 'Tautan file', 'text', 0, { full: 1 }], ['lat', 'Latitude', 'number', 0, { gps: 1 }], ['lng', 'Longitude', 'number', 0]] },
  Knowledge: { label: 'Produk pengetahuan', prefix: 'KP', fields: [['judul', 'Judul', 'text', 1, { full: 1 }], ['tipe', 'Tipe', 'select', 1, { opts: lk('Tipe Produk Pengetahuan') }], ['tanggal', 'Tanggal terbit', 'date', 1], ['programId', 'Program', 'ref', 0, { ref: 'Programs' }], ['bahasa', 'Bahasa', 'select', 0, { opts: ['ID', 'EN'] }], ['ringkasan', 'Ringkasan', 'textarea', 1, { full: 1 }], ['tautan', 'Tautan', 'text', 0, { full: 1 }], ['publik', 'Tampilkan di mode publik', 'bool', 0]] },
  Lessons: { label: 'Lesson learned', prefix: 'LL', fields: [['judul', 'Judul pembelajaran', 'text', 1, { full: 1 }], ['sumber', 'Sumber', 'select', 1, { opts: ['After-Action Review', 'Refleksi Triwulan', 'Evaluasi Tengah', 'Evaluasi Akhir'] }], ['tanggal', 'Tanggal', 'date', 1], ['landscapeId', 'Landscape', 'ref', 0, { ref: 'Landscapes' }], ['konteks', 'Konteks / apa yang terjadi', 'textarea', 1, { full: 1 }], ['pembelajaran', 'Pembelajaran', 'textarea', 1, { full: 1 }], ['rekomendasi', 'Rekomendasi', 'textarea', 0, { full: 1 }]] },
  Actions: { label: 'Tindak lanjut', prefix: 'AT', fields: [['lessonId', 'Dari pembelajaran', 'ref', 1, { ref: 'Lessons', key: 'judul', full: 1 }], ['tindakan', 'Tindakan', 'text', 1, { full: 1 }], ['pic', 'PIC', 'text', 1], ['deadline', 'Tenggat', 'date', 1], ['status', 'Status', 'select', 1, { opts: ['Belum Mulai', 'Proses', 'Selesai'] }]] },
  Stories: { label: 'Cerita perubahan', prefix: 'SC', fields: [['judul', 'Judul cerita', 'text', 1, { full: 1 }], ['narasumber', 'Narasumber', 'text', 1], ['landscapeId', 'Landscape', 'ref', 1, { ref: 'Landscapes' }], ['outcomeId', 'Outcome terkait', 'ref', 0, { ref: 'Outcomes', key: 'pernyataan', full: 1 }], ['cerita', 'Cerita', 'textarea', 1, { full: 1 }], ['kutipan', 'Kutipan', 'text', 0, { full: 1 }], ['tanggal', 'Tanggal', 'date', 1]] },
  Comments: { label: 'Komentar', prefix: 'CM', fields: [['entity', 'Tabel', 'text', 1], ['entityId', 'ID data', 'text', 1], ['penulis', 'Penulis', 'text', 1], ['teks', 'Komentar', 'textarea', 1], ['tanggal', 'Tanggal', 'date', 1]] },
  Documents: { label: 'Dokumen', prefix: 'DOC', fields: [['judul', 'Judul dokumen', 'text', 1, { full: 1 }], ['jenis', 'Jenis', 'select', 1, { opts: lk('Jenis Dokumen') }], ['nomor', 'Nomor', 'text', 0], ['versi', 'Versi', 'text', 1], ['berlaku', 'Tanggal berlaku', 'date', 0], ['status', 'Status', 'select', 1, { opts: ['Draft', 'Review', 'Disetujui', 'Kedaluwarsa'] }], ['pemilik', 'Pemilik', 'text', 0], ['tautan', 'Tautan Drive', 'text', 0, { full: 1 }]] },
  BudgetLines: { label: 'Mata anggaran', prefix: 'BL', fields: [['kode', 'Kode anggaran', 'text', 1], ['uraian', 'Uraian', 'text', 1, { full: 1 }], ['anggaran', 'Anggaran (Rp)', 'number', 1], ['realisasi', 'Realisasi (Rp)', 'number', 0], ['sumber', 'Sumber data', 'text', 0], ['diperbarui', 'Diperbarui', 'date', 0]] },
  Users: { label: 'Pengguna', prefix: 'USR', fields: [['nama', 'Nama', 'text', 1], ['email', 'Email', 'email', 1], ['role', 'Role', 'select', 1, { opts: lk('Role') }], ['landscapeScope', 'Cakupan landscape', 'text', 1, { hint: 'Semua atau ID landscape, contoh LS-01' }], ['aktif', 'Aktif', 'bool', 0]] },
  Lookups: { label: 'Master data', prefix: 'LK', fields: [['kategori', 'Kategori', 'text', 1], ['nilai', 'Nilai', 'text', 1], ['aktif', 'Aktif', 'bool', 0]] },
  Feedback: { label: 'Laporan masalah', prefix: 'FB', fields: [['halaman', 'Halaman', 'text', 1], ['deskripsi', 'Apa yang terjadi?', 'textarea', 1, { full: 1 }], ['severity', 'Tingkat keparahan', 'select', 1, { opts: ['Critical', 'Major', 'Minor'] }], ['status', 'Status', 'select', 1, { opts: ['Open', 'In Progress', 'Fixed', 'Verified'] }], ['pelapor', 'Pelapor', 'text', 1], ['tanggal', 'Tanggal', 'date', 1], ['infoTeknis', 'Info teknis', 'text', 0, { full: 1 }]] },
  AuditLog: { label: 'Audit trail', prefix: 'AL', fields: [['waktu', 'Waktu', 'text', 1], ['user', 'Pengguna', 'text', 1], ['aksi', 'Aksi', 'text', 1], ['tabel', 'Tabel', 'text', 1], ['recordId', 'ID data', 'text', 1], ['detail', 'Detail', 'text', 0]] },
  BackupLog: { label: 'Log backup', prefix: 'BK', fields: [['waktu', 'Waktu', 'text', 1], ['file', 'Nama file', 'text', 1], ['status', 'Status', 'text', 1], ['ukuran', 'Ukuran', 'text', 0], ['tipe', 'Tipe', 'text', 0]] }
};
Object.values(SCHEMA).forEach(s => s.fields = s.fields.map(([k, label, type, req, o]) => ({ k, label, type, req: !!req, ...(o || {}) })));
window.SCHEMA = SCHEMA;

/* ---------- perhitungan KMEL ---------- */
const periodsSorted = () => rows('Periods').map(p => p.nama).sort();
const periodObj = n => rows('Periods').find(p => p.nama === n);
function defaultPeriod() { const ps = rows('Periods').filter(p => p.selesai < CONFIG.TODAY).map(p => p.nama).sort(); return ps[ps.length - 1] || periodsSorted().slice(-1)[0]; }
const indProgram = ind => { const op = byId('Outputs', ind.outputId); const oc = op && byId('Outcomes', op.outcomeId); return oc ? oc.programId : null; };
function targetAt(indId, lsId, per) {
  const c = rows('IndicatorTargets').filter(x => x.indicatorId === indId && x.landscapeId === lsId && x.periode === per);
  if (!c.length) return null; return c.reduce((a, b) => (+b.versi > +a.versi ? b : a)).target;
}
function actualAt(ind, lsId, per, sts) {
  const a = rows('IndicatorActuals').filter(x => x.indicatorId === ind.id && x.landscapeId === lsId && x.periode <= per && sts.includes(x.status));
  if (!a.length) return null;
  if (ind.agregasi === 'Terakhir') { const l = a.sort((x, y) => x.periode < y.periode ? 1 : -1)[0]; return Number(l.nilai); }
  return sum(a, x => x.nilai);
}
function achv(ind, lsId, per, sts = ['Approved']) {
  const lss = lsId ? [lsId] : rows('Landscapes').map(l => l.id);
  if (ind.agregasi === 'Terakhir') {
    const r = lss.map(l => { const tg = targetAt(ind.id, l, per), ac = actualAt(ind, l, per, sts); return tg ? { tg, ac: ac ?? 0 } : null; }).filter(Boolean);
    if (!r.length) return { target: null, actual: null, pct: null };
    const tg = sum(r, x => x.tg) / r.length, ac = sum(r, x => x.ac) / r.length;
    return { target: tg, actual: ac, pct: tg ? ac / tg * 100 : null };
  }
  let tg = 0, ac = 0, has = false;
  lss.forEach(l => { const t1 = targetAt(ind.id, l, per); if (t1 != null) { has = true; tg += +t1; ac += actualAt(ind, l, per, sts) || 0; } });
  return has ? { target: tg, actual: ac, pct: tg ? ac / tg * 100 : null } : { target: null, actual: null, pct: null };
}
const light = p => p == null ? 'grey' : p >= 90 ? 'green' : p >= 60 ? 'yellow' : 'red';
const lightLabel = p => ({ green: 'On track', yellow: 'Perlu perhatian', red: 'Off track', grey: 'Belum ada data' })[light(p)];
const pctBar = p => `<div class="flex" style="gap:8px;flex-wrap:nowrap"><div class="bar ${light(p)}" style="flex:1"><i style="width:${Math.min(100, p || 0)}%"></i></div><b class="small nowrap">${pctf(p)}</b></div>`;
const statusSet = () => S.f.inclVerified ? ['Approved', 'Verified'] : ['Approved'];
const dupKey = b => norm(b.nama) + '|' + norm(b.desa) + '|' + String(b.tglLahir || '').slice(0, 10);
function dupGroups() {
  const ignore = new Set((S.db.Settings || []).filter(s => s.id === 'bukanDuplikat').flatMap(s => String(s.nilai || '').split(',')));
  return Object.values(groupBy(rows('Beneficiaries'), dupKey)).filter(g => g.length > 1 && !g.every(b => ignore.has(b.id)));
}
function dqi(lsId) {
  const ben = rows('Beneficiaries').filter(b => b.landscapeId === lsId);
  const complete = ben.length ? ben.filter(b => b.nik && b.tglLahir && b.hp && b.consent).length / ben.length * 100 : 100;
  const dupIds = new Set(dupGroups().flatMap(g => g.slice(1).map(b => b.id)));
  const dupScore = ben.length ? 100 - ben.filter(b => dupIds.has(b.id)).length / ben.length * 100 * 5 : 100;
  const acts = rows('IndicatorActuals').filter(a => a.landscapeId === lsId);
  const timely = acts.length ? acts.filter(a => { const p = periodObj(a.periode); return p && a.tanggal <= p.batasLapor; }).length / acts.length * 100 : 100;
  const needEv = acts.filter(a => ['Approved', 'Verified', 'Submitted'].includes(a.status));
  const ev = needEv.length ? needEv.filter(a => (a.evidenceIds || []).length).length / needEv.length * 100 : 100;
  const s = { complete, dup: Math.max(0, dupScore), timely, ev }; s.score = (s.complete + s.dup + s.timely + s.ev) / 4; return s;
}

/* ---------- toast, modal, confirm ---------- */
function toast(msg, err) { const w = $('#toasts'); const d = document.createElement('div'); d.className = 'toast' + (err ? ' err' : ''); d.textContent = msg; w.appendChild(d); setTimeout(() => d.remove(), 3600); }
function modal({ title, body, foot = '', wide = false, onMount }) {
  const o = document.createElement('div'); o.className = 'overlay';
  o.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-h"><h2>${title}</h2><button class="icon-btn x" data-close aria-label="Tutup">${ic('x')}</button></div><div class="modal-b">${body}</div>${foot ? `<div class="modal-f">${foot}</div>` : ''}</div>`;
  document.body.appendChild(o);
  const close = () => { o.remove(); };
  o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-close]')) close(); });
  o.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  setTimeout(() => { const f = o.querySelector('input,select,textarea,button:not(.x)'); f && f.focus(); }, 30);
  onMount && onMount(o, close);
  return { el: o, close };
}
function confirmBox(title, text, okLabel = 'Lanjutkan', danger = false) {
  return new Promise(res => {
    const m = modal({ title, body: `<p style="margin:0">${text}</p>`, foot: `<button class="btn" data-close>${t('cancel')}</button><button class="btn ${danger ? 'danger' : 'primary'}" id="okc">${okLabel}</button>` });
    m.el.addEventListener('click', e => { if (e.target.closest('[data-close]')) res(false); });
    $('#okc', m.el).onclick = () => { m.close(); res(true); };
  });
}
function promptBox(title, label, def = '') {
  return new Promise(res => {
    const m = modal({ title, body: `<div class="form"><div class="f full"><label>${label}</label><textarea id="pv">${esc(def)}</textarea></div></div>`, foot: `<button class="btn" data-close>${t('cancel')}</button><button class="btn primary" id="okp">${t('save')}</button>` });
    $('#okp', m.el).onclick = () => { const v = $('#pv', m.el).value.trim(); if (!v) { toast('Isi dulu kolomnya.', 1); return; } m.close(); res(v); };
    m.el.addEventListener('click', e => { if (e.target.closest('[data-close]')) res(null); });
  });
}

/* ---------- data ops (update state lokal setelah server) ---------- */
function upsertLocal(tbl, rec) { S.db[tbl] = S.db[tbl] || []; const i = S.db[tbl].findIndex(r => r.id === rec.id); if (i >= 0) S.db[tbl][i] = rec; else S.db[tbl].unshift(rec); }
function logLocal(aksi, tabel, id, detail) { S.db.AuditLog = S.db.AuditLog || []; S.db.AuditLog.unshift({ id: 'tmp' + Date.now(), waktu: new Date().toISOString().slice(0, 16).replace('T', ' '), user: CONFIG.USER, aksi, tabel, recordId: id, detail: detail || '', _deleted: false }); }
async function saveRec(tbl, rec, note) {
  try { if (note) rec._auditNote = note; const r = await API.save(tbl, rec, CONFIG.USER); upsertLocal(tbl, r); logLocal(rec.id ? 'Ubah' : 'Tambah', tbl, r.id, note); return r; }
  catch (e) { toast('Gagal menyimpan: ' + e.message, 1); throw e; }
}
async function removeRec(tbl, id) {
  const pii = tbl === 'Beneficiaries';
  const m = modal({ title: 'Hapus data', body: `<p style="margin-top:0">Data <b>${esc(id)}</b> akan dipindahkan ke tempat sampah dan bisa dipulihkan dari menu Admin selama masa retensi.</p>${pii ? `<div class="alert info">Jika ini permintaan penghapusan dari subjek data (UU PDP), pilih hapus permanen. Tindakan ini tercatat di audit trail.</div>` : ''}`, foot: `<button class="btn" data-close>${t('cancel')}</button>${pii ? '<button class="btn danger" id="dp">Hapus permanen</button>' : ''}<button class="btn primary" id="ds">Pindahkan ke tempat sampah</button>` });
  $('#ds', m.el).onclick = async () => { m.close(); const r = await API.remove(tbl, id, CONFIG.USER); r && upsertLocal(tbl, r); logLocal('Hapus', tbl, id); toast('Dipindahkan ke tempat sampah.'); render(); };
  if (pii) $('#dp', m.el).onclick = async () => { m.close(); const why = await promptBox('Alasan hapus permanen', 'Catat dasar permintaan subjek data'); if (!why) return; await API.purge(tbl, id, CONFIG.USER, why); S.db[tbl] = S.db[tbl].filter(r => r.id !== id); logLocal('Hapus permanen', tbl, id, why); toast('Data dihapus permanen.'); render(); };
}

/* ---------- form builder ---------- */
function optionsFor(f, rec) {
  if (f.type === 'select') return (typeof f.opts === 'function' ? f.opts() : f.opts) || [];
  if (f.type === 'ref' || f.type === 'multi') return rows(f.ref).map(r => ({ v: f.val ? r[f.val] : r.id, l: (f.val ? r[f.val] : (r.kode && f.ref !== 'BudgetLines' ? r.kode + ' – ' : '') + (r[f.key || 'nama'] || r.judul || r.pernyataan || r.id)) }));
  return [];
}
function fieldHTML(f, v) {
  const id = 'f_' + f.k; const req = f.req ? ' <span class="req">*</span>' : '';
  let input = '';
  if (f.type === 'textarea') input = `<textarea id="${id}" name="${f.k}">${esc(v)}</textarea>`;
  else if (f.type === 'bool') return `<div class="f ${f.full ? 'full' : ''}"><label class="check"><input type="checkbox" id="${id}" name="${f.k}" ${v === true || v === 'TRUE' || v === 'true' ? 'checked' : ''}> ${f.label}</label></div>`;
  else if (f.type === 'select') input = `<select id="${id}" name="${f.k}"><option value="">– pilih –</option>${optionsFor(f).map(o => `<option ${String(o) === String(v) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  else if (f.type === 'ref') input = `<select id="${id}" name="${f.k}"><option value="">– pilih –</option>${optionsFor(f).map(o => `<option value="${esc(o.v)}" ${String(o.v) === String(v) ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`;
  else if (f.type === 'multi') { const set = new Set(Array.isArray(v) ? v : String(v || '').split(',').filter(Boolean)); input = `<input type="search" placeholder="Saring daftar…" data-filter-multi="${id}"><div class="multi" id="${id}" data-multi="${f.k}">${optionsFor(f).map(o => `<label data-l="${esc(norm(o.l))}"><input type="checkbox" value="${esc(o.v)}" ${set.has(o.v) ? 'checked' : ''}> ${esc(o.l)}</label>`).join('') || '<span class="muted small">Belum ada data</span>'}</div>`; }
  else input = `<input type="${f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'email' ? 'email' : 'text'}" ${f.type === 'number' ? 'step="any"' : ''} id="${id}" name="${f.k}" value="${esc(v)}">`;
  const gps = f.gps ? `<button type="button" class="btn sm ghost" data-gps>${ic('pin')} Ambil lokasi saya</button>` : '';
  return `<div class="f ${f.full || f.type === 'textarea' || f.type === 'multi' ? 'full' : ''}"><label for="${id}">${f.label}${req}</label>${input}${f.hint ? `<span class="hint">${f.hint}</span>` : ''}${gps}<span class="err" data-err="${f.k}"></span></div>`;
}
function readForm(el, fields) {
  const o = {};
  fields.forEach(f => {
    if (f.type === 'multi') o[f.k] = $$(`[data-multi="${f.k}"] input:checked`, el).map(i => i.value);
    else if (f.type === 'bool') o[f.k] = $(`[name="${f.k}"]`, el).checked;
    else { const x = $(`[name="${f.k}"]`, el); if (!x) return; o[f.k] = f.type === 'number' ? (x.value === '' ? '' : Number(String(x.value).replace(',', '.'))) : x.value.trim(); }
  });
  return o;
}
function validate(el, fields, o) {
  let ok = true; $$('[data-err]', el).forEach(e => e.textContent = '');
  fields.forEach(f => {
    const v = o[f.k]; let m = '';
    if (f.req && (v === '' || v == null || (Array.isArray(v) && !v.length && f.type !== 'multi'))) m = 'Wajib diisi.';
    else if (f.type === 'number' && v !== '' && isNaN(v)) m = 'Harus berupa angka.';
    else if (f.type === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) m = 'Format email tidak valid.';
    if (m) { ok = false; const e = $(`[data-err="${f.k}"]`, el); if (e) e.textContent = m; }
  });
  return ok;
}
/* openForm: form generik dari SCHEMA; opts.defaults, opts.fields (filter), opts.beforeSave(o)->string error|undefined */
function openForm(tbl, rec, opts = {}) {
  const sc = SCHEMA[tbl]; const isNew = !rec || !rec.id; const data = { ...(opts.defaults || {}), ...(rec || {}) };
  const fields = opts.only ? sc.fields.filter(f => opts.only.includes(f.k)) : sc.fields;
  const m = modal({ title: (isNew ? 'Tambah ' : 'Ubah ') + sc.label.toLowerCase(), wide: fields.some(f => f.type === 'multi') || fields.length > 10,
    body: `${opts.note || ''}<div id="fwarn"></div><form class="form" novalidate>${fields.map(f => fieldHTML(f, data[f.k])).join('')}</form>`,
    foot: `<button class="btn" data-close>${t('cancel')}</button><button class="btn primary" id="fsave">${isNew ? 'Simpan ' + sc.label.toLowerCase() : 'Simpan perubahan'}</button>` });
  const el = m.el;
  $$('[data-filter-multi]', el).forEach(i => i.oninput = () => { const q = norm(i.value); $$(`#${i.dataset.filterMulti} label`, el).forEach(l => l.style.display = l.dataset.l.includes(q) ? '' : 'none'); });
  $$('[data-gps]', el).forEach(b => b.onclick = () => {
    if (!navigator.geolocation) return toast('Browser tidak mendukung GPS.', 1);
    b.disabled = true; navigator.geolocation.getCurrentPosition(p => { $('[name=lat]', el).value = p.coords.latitude.toFixed(5); $('[name=lng]', el).value = p.coords.longitude.toFixed(5); b.disabled = false; toast('Lokasi terisi.'); }, () => { b.disabled = false; toast('Izin lokasi ditolak atau tidak tersedia.', 1); });
  });
  opts.onMount && opts.onMount(el);
  $('#fsave', el).onclick = async () => {
    const o = readForm(el, fields); if (!validate(el, fields, o)) return;
    const merged = { ...data, ...o };
    if (opts.beforeSave) { const w = await opts.beforeSave(merged, el); if (w === false) return; if (typeof w === 'string') { $('#fwarn', el).innerHTML = `<div class="alert err">${w}</div>`; return; } }
    $('#fsave', el).disabled = true;
    try { const r = await saveRec(tbl, merged, opts.note2); m.close(); toast(isNew ? `${sc.label} tersimpan.` : 'Perubahan tersimpan.'); opts.after ? opts.after(r) : render(); }
    catch (e) { $('#fsave', el).disabled = false; }
  };
  return m;
}

/* ---------- tabel generik ---------- */
const TABLES = {}; const TS = {};
function table(id, { cols, data, actions, pageSize = 12, search = true, onRow, empty = 'Belum ada data. Tambahkan data baru untuk mulai.' }) {
  TABLES[id] = { cols, data, actions, pageSize, search, onRow, empty }; TS[id] = TS[id] || { q: '', sort: null, dir: 1, page: 0 };
  return `<div data-table="${id}">${tableInner(id)}</div>`;
}
function tableInner(id) {
  const T = TABLES[id], st = TS[id]; let d = T.data;
  if (st.q) { const q = norm(st.q); d = d.filter(r => T.cols.some(c => norm(c.text ? c.text(r) : r[c.k]).includes(q))); }
  if (st.sort) { const c = T.cols.find(c => c.k === st.sort); const g = r => c.sortv ? c.sortv(r) : c.text ? c.text(r) : r[c.k]; d = [...d].sort((a, b) => { const x = g(a), y = g(b); return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), 'id', { numeric: true })) * st.dir; }); }
  const pages = Math.max(1, Math.ceil(d.length / T.pageSize)); st.page = Math.min(st.page, pages - 1);
  const slice = d.slice(st.page * T.pageSize, (st.page + 1) * T.pageSize);
  const head = T.cols.map(c => `<th class="${c.num ? 'num' : ''}" data-sort="${c.k}" aria-sort="${st.sort === c.k ? (st.dir > 0 ? 'ascending' : 'descending') : 'none'}">${c.label}${st.sort === c.k ? (st.dir > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('') + (T.actions ? '<th class="num">Aksi</th>' : '');
  const body = slice.map(r => `<tr data-rid="${esc(r.id)}" ${T.onRow ? 'style="cursor:pointer"' : ''}>${T.cols.map(c => `<td class="${c.num ? 'num' : ''}">${c.render ? c.render(r) : esc(r[c.k])}</td>`).join('')}${T.actions ? `<td><div class="row-actions">${T.actions(r)}</div></td>` : ''}</tr>`).join('');
  return `${T.search ? `<div class="flex mb"><input type="search" data-tsearch="${id}" placeholder="Cari di tabel ini…" value="${esc(st.q)}" style="max-width:280px"></div>` : ''}
  <div class="table-wrap"><table class="t"><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${T.cols.length + 1}"><div class="empty">${T.empty}</div></td></tr>`}</tbody></table></div>
  <div class="table-foot"><span>${nf(d.length)} baris</span><div class="pg"><button class="btn sm" data-tpage="${id}" data-d="-1" ${st.page ? '' : 'disabled'}>Sebelumnya</button><span class="small" style="padding:4px 6px">${st.page + 1} / ${pages}</span><button class="btn sm" data-tpage="${id}" data-d="1" ${st.page < pages - 1 ? '' : 'disabled'}>Berikutnya</button></div></div>`;
}
function refreshTable(id) { const w = $(`[data-table="${id}"]`); if (w) { const f = document.activeElement && document.activeElement.dataset.tsearch; w.innerHTML = tableInner(id); if (f) { const i = $(`[data-tsearch="${id}"]`); i.focus(); i.setSelectionRange(i.value.length, i.value.length); } } }
document.addEventListener('click', e => {
  const th = e.target.closest('th[data-sort]'); if (th) { const id = th.closest('[data-table]').dataset.table; const st = TS[id]; st.dir = st.sort === th.dataset.sort ? -st.dir : 1; st.sort = th.dataset.sort; refreshTable(id); return; }
  const pg = e.target.closest('[data-tpage]'); if (pg) { TS[pg.dataset.tpage].page += +pg.dataset.d; refreshTable(pg.dataset.tpage); return; }
  const tr = e.target.closest('tr[data-rid]'); if (tr && !e.target.closest('button,a,input')) { const id = tr.closest('[data-table]').dataset.table; const T = TABLES[id]; if (T.onRow) T.onRow(T.data.find(r => String(r.id) === tr.dataset.rid)); }
});
document.addEventListener('input', debounce(e => { const s = e.target.dataset && e.target.dataset.tsearch; if (s) { TS[s].q = e.target.value; TS[s].page = 0; refreshTable(s); } }, 180));
const act = (name, id, label, icon, cls = '', extra = '') => `<button class="btn sm ${cls}" data-act="${name}" data-id="${esc(id)}" ${extra} title="${esc(label)}">${icon ? ic(icon) : ''}${icon && cls.includes('icon') ? '' : ' ' + label}</button>`;
const iconAct = (name, id, label, icon, cls = '') => `<button class="btn sm ${cls}" data-act="${name}" data-id="${esc(id)}" title="${esc(label)}" aria-label="${esc(label)}">${ic(icon)}</button>`;
const crudActs = (tbl, r) => `<span class="edit-only flex" style="gap:4px;flex-wrap:nowrap">${iconAct('edit', tbl + '|' + r.id, 'Ubah', 'edit')}${iconAct('del', tbl + '|' + r.id, 'Hapus', 'trash', 'danger')}</span>`;

/* ---------- aksi global via data-act ---------- */
const ACT = {
  edit: (el) => { const [tb, id] = el.dataset.id.split('|'); openForm(tb, byId(tb, id)); },
  del: (el) => { const [tb, id] = el.dataset.id.split('|'); removeRec(tb, id); },
  add: (el) => openForm(el.dataset.id, null, { defaults: JSON.parse(el.dataset.def || '{}') }),
  go: (el) => navigate(el.dataset.id),
  exportcsv: (el) => exportCSV(el.dataset.id),
  ind: (el) => indicatorDetail(el.dataset.id),
  tab: (el) => { const [k, v] = el.dataset.id.split('|'); S.tab[k] = v; render(); }
};
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && ACT[b.dataset.act]) { e.preventDefault(); ACT[b.dataset.act](b, e); } });
const tabs = (key, list) => { const cur = S.tab[key] || list[0][0]; return `<div class="tabs" role="tablist">${list.map(([k, l]) => `<button role="tab" aria-selected="${cur === k}" class="${cur === k ? 'on' : ''}" data-act="tab" data-id="${key}|${k}">${l}</button>`).join('')}</div>`; };
const curTab = (key, def) => S.tab[key] || def;

/* ---------- ekspor CSV ---------- */
function toCSV(head, data) { const q = v => { v = v == null ? '' : Array.isArray(v) ? v.join(';') : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }; return [head.map(q).join(','), ...data.map(r => r.map(q).join(','))].join('\n'); }
function download(name, text, type = 'text/csv;charset=utf-8') { const b = new Blob(['\ufeff' + text], { type }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
function exportCSV(tbl) {
  const sc = SCHEMA[tbl]; const ks = ['id', ...sc.fields.map(f => f.k)];
  const data = rows(tbl).map(r => ks.map(k => (sc.pii || []).includes(k) && (S.mask || S.pub) ? maskStr(r[k]) : r[k]));
  download(`${tbl}_${CONFIG.TODAY}.csv`, toCSV(ks, data)); toast(`${sc.label}: ${data.length} baris diekspor${S.mask ? ' (data pribadi disamarkan)' : ''}.`);
}

/* ---------- charts & map helpers ---------- */
const PAL = { abyss: '#0A2E3F', lagoon: '#127A86', shoal: '#6FC3C8', sand: '#D9C49A', mangrove: '#4F7A45', sun: '#C98D1E', urchin: '#B3443A', muted: '#5A7077' };
const SERIES = ['#127A86', '#0A2E3F', '#6FC3C8', '#D9C49A', '#4F7A45', '#8FA9AD'];
function chart(id, cfg) {
  const c = document.getElementById(id); if (!c || !window.Chart) return;
  Chart.defaults.font.family = 'Manrope, system-ui, sans-serif'; Chart.defaults.color = PAL.muted; Chart.defaults.borderColor = '#E7EEED';
  cfg.options = Object.assign({ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true } } } }, cfg.options || {});
  charts.push(new Chart(c, cfg));
}
function killCharts() { while (charts.length) { try { charts.pop().destroy(); } catch (e) {} } maps.forEach(m => { try { m.remove(); } catch (e) {} }); maps = []; }
function baseMap(id, opts = {}) {
  if (!window.L) { const el = document.getElementById(id); if (el) el.innerHTML = '<div class="empty">Peta membutuhkan koneksi internet (Leaflet).</div>'; return null; }
  const m = L.map(id, { scrollWheelZoom: !!opts.wheel, zoomControl: true }).setView([-2.3, 120.5], 5);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 18 }).addTo(m);
  maps.push(m); return m;
}
function hull(pts) { // convex hull (monotone chain) untuk batas landscape dari titik site
  const p = pts.map(x => [x[1], x[0]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return pts;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = []; p.forEach(q => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
  p.slice().reverse().forEach(q => { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); });
  const h = lo.slice(0, -1).concat(up.slice(0, -1)); const cx = sum(h, x => x[0]) / h.length, cy = sum(h, x => x[1]) / h.length;
  return h.map(([x, y]) => [cy + (y - cy) * 1.35, cx + (x - cx) * 1.35]);
}
const statusColor = p => ({ green: PAL.mangrove, yellow: PAL.sun, red: PAL.urchin, grey: '#9AAEB0' })[light(p)];
function landscapePct(lsId, per) { const inds = rows('Indicators'); const v = inds.map(i => achv(i, lsId, per, statusSet()).pct).filter(x => x != null); return v.length ? sum(v) / v.length : null; }

/* ---------- shell ---------- */
function shell() {
  const logo = `<img src="${CONFIG.LOGO_URL}" alt="Blue Forests" onerror="this.outerHTML='<span class=&quot;fallback&quot;>Blue Forests</span>'">`;
  return `<div class="app ${S.pub ? 'is-public' : ''}">
  <aside class="side" id="side" aria-label="Navigasi utama"><div class="brand"><div class="brand-logo">${logo}</div><small>Management Information System</small></div>
  <nav class="nav" id="nav"></nav>
  <div class="side-foot">Versi ${esc((rows('Changelog')[0] || {}).versi || '0.3.0')} · mode ${API.mode === 'gas' ? 'Apps Script' : 'web lokal'}</div></aside>
  <div class="main">${S.pub ? `<div class="public-bar">Mode publik aktif: hanya ringkasan tanpa data pribadi yang ditampilkan.<button data-act="pub">Keluar</button></div>` : ''}
  <header class="top"><button class="icon-btn menu-btn" id="menuBtn" aria-label="Buka menu">${ic('menu')}</button>
    <div class="search">${ic('search')}<input id="gsearch" type="search" placeholder="${t('search')}" aria-label="Pencarian global" autocomplete="off"><div class="search-results" id="sres"></div></div>
    <div class="top-actions"><span class="demo-flag">${t('demo')}</span>
      <div class="seg" role="group" aria-label="Bahasa"><button class="${S.lang === 'id' ? 'on' : ''}" data-act="lang" data-id="id">ID</button><button class="${S.lang === 'en' ? 'on' : ''}" data-act="lang" data-id="en">EN</button></div>
      <button class="icon-btn" data-act="pub" title="${t('public')}" aria-label="${t('public')}">${ic('globe')}</button>
      <div style="position:relative"><button class="icon-btn" id="bell" aria-label="Notifikasi">${ic('bell')}<span class="dot" id="bellDot"></span></button><div class="dropdown" id="notif" hidden></div></div>
    </div></header>
  <main class="content" id="view" tabindex="-1"></main></div></div>
  ${S.pub ? '' : `<button class="fab" data-act="bug">${ic('bug')} ${t('report')}</button>`}
  <div class="toasts" id="toasts" aria-live="polite"></div>`;
}
function renderNav() {
  const cnt = { capaian: rows('IndicatorActuals').filter(a => ['Submitted', 'Verified'].includes(a.status)).length, aktivitas: rows('Activities').filter(a => a.status === 'Perlu Verifikasi').length };
  $('#nav').innerHTML = NAV.map(g => { const items = g.items.filter(([k]) => !S.pub || PUBLIC_VIEWS.includes(k)); if (!items.length) return ''; return `<div class="nav-group"><span>${t(g.g)}</span>${items.map(([k, i]) => `<a href="#${k}" data-view="${k}" class="${S.view === k ? 'active' : ''}" ${S.view === k ? 'aria-current="page"' : ''}>${ic(i)}<span>${t(k)}</span>${cnt[k] && !S.pub ? `<span class="count">${cnt[k]}</span>` : ''}</a>`).join('')}</div>`; }).join('');
}
function pageHead(title, desc, actions = '') { return `<div class="page-head"><div><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`; }
const VIEWS = {};
function navigate(v) { if (S.pub && !PUBLIC_VIEWS.includes(v)) v = 'dashboard'; if (location.hash !== '#' + v) { location.hash = v; return; } S.view = v; render(); }
function render() {
  killCharts(); renderNav();
  const v = VIEWS[S.view] || VIEWS.dashboard; const out = v();
  const el = $('#view'); el.innerHTML = typeof out === 'string' ? out : out.html; if (out.after) out.after(el);
  document.body.classList.toggle('public', S.pub);
  $$('.edit-only').forEach(e => e.style.display = S.pub ? 'none' : '');
  updateBell(); $('#side').classList.remove('open');
}
function remount() { $('#app').innerHTML = shell(); bindShell(); render(); }

/* ---------- pencarian global ---------- */
function searchAll(q) {
  q = norm(q); if (q.length < 2) return [];
  const src = [['Programs', 'Program', r => r.nama, 'program'], ['Indicators', 'Indikator', r => r.kode + ' ' + r.nama, 'kmel'], ['Landscapes', 'Landscape', r => r.nama + ' ' + r.provinsi, 'peta'], ['Activities', 'Aktivitas', r => r.nama, 'aktivitas'], ['Beneficiaries', 'Penerima manfaat', r => r.nama + ' ' + r.desa, 'penerima'], ['Evidence', 'Evidence', r => r.judul + ' ' + r.tags, 'evidence'], ['Knowledge', 'Pengetahuan', r => r.judul, 'pengetahuan'], ['Documents', 'Dokumen', r => r.judul + ' ' + r.nomor, 'dokumen'], ['Lessons', 'Pembelajaran', r => r.judul, 'pengetahuan']];
  return src.filter(s => !S.pub || ['Programs', 'Indicators', 'Landscapes', 'Knowledge'].includes(s[0])).map(([tb, lab, f, v]) => ({ lab, v, tb, items: rows(tb).filter(r => norm(f(r)).includes(q)).slice(0, 5).map(r => ({ id: r.id, text: f(r) })) })).filter(g => g.items.length);
}
function openRecord(tb, id) {
  if (tb === 'Indicators') return indicatorDetail(id);
  if (tb === 'Evidence') return evidenceDetail(id);
  if (tb === 'Landscapes') { S.sel.ls = id; return navigate('peta'); }
  if (tb === 'Beneficiaries' || tb === 'Activities' || tb === 'Documents') { const v = { Beneficiaries: 'penerima', Activities: 'aktivitas', Documents: 'dokumen' }[tb]; navigate(v); setTimeout(() => openForm(tb, byId(tb, id)), 60); return; }
  if (tb === 'Programs') { S.sel.node = 'Programs|' + id; return navigate('program'); }
  navigate({ Knowledge: 'pengetahuan', Lessons: 'pengetahuan' }[tb] || 'dashboard');
}

/* ---------- notifikasi ---------- */
function notifications() {
  const n = []; const sub = rows('IndicatorActuals').filter(a => a.status === 'Submitted').length, ver = rows('IndicatorActuals').filter(a => a.status === 'Verified').length;
  if (sub) n.push({ t: `${sub} capaian menunggu verifikasi MEL`, s: 'Input & Approval Capaian', v: 'capaian', f: 'Submitted' });
  if (ver) n.push({ t: `${ver} capaian menunggu persetujuan manajer`, s: 'Input & Approval Capaian', v: 'capaian', f: 'Verified' });
  const kobo = rows('Activities').filter(a => a.status === 'Perlu Verifikasi').length; if (kobo) n.push({ t: `${kobo} kegiatan dari lapangan perlu diverifikasi`, s: 'Aktivitas', v: 'aktivitas' });
  const od = rows('Actions').filter(a => a.status !== 'Selesai' && a.deadline < CONFIG.TODAY); if (od.length) n.push({ t: `${od.length} tindak lanjut pembelajaran melewati tenggat`, s: 'Pengetahuan & Pembelajaran', v: 'pengetahuan', tab: 'act' });
  const crit = rows('Feedback').filter(f => f.severity === 'Critical' && f.status === 'Open').length; if (crit) n.push({ t: `${crit} laporan masalah kritis belum ditangani`, s: 'Bantuan & Umpan Balik', v: 'bantuan', tab: 'bug' });
  rows('Periods').filter(p => !p.locked && p.batasLapor >= CONFIG.TODAY).forEach(p => { const d = Math.round((new Date(p.batasLapor) - new Date(CONFIG.TODAY)) / 864e5); if (d <= 30) n.push({ t: `Batas pelaporan ${p.nama}: ${d} hari lagi (${fdate(p.batasLapor)})`, s: 'Periode pelaporan', v: 'capaian' }); });
  const dg = dupGroups().length; if (dg) n.push({ t: `${dg} kemungkinan data penerima ganda`, s: 'Penerima Manfaat', v: 'penerima', tab: 'dup' });
  return n;
}
function updateBell() { const n = S.pub ? [] : notifications(); const d = $('#bellDot'); if (d) { d.textContent = n.length; d.style.display = n.length ? '' : 'none'; } }

function bindShell() {
  $('#menuBtn').onclick = () => $('#side').classList.toggle('open');
  const gs = $('#gsearch'), sr = $('#sres');
  gs.oninput = debounce(() => { const g = searchAll(gs.value); sr.innerHTML = g.length ? g.map(x => `<div class="grp">${x.lab}</div>${x.items.map(i => `<button data-open="${x.tb}|${esc(i.id)}">${esc(i.text)} <span class="muted small">${esc(i.id)}</span></button>`).join('')}`).join('') : (gs.value.length > 1 ? '<div class="empty">Tidak ditemukan. Coba kata kunci lain, misalnya nama desa.</div>' : ''); sr.classList.toggle('open', gs.value.length > 1); }, 150);
  sr.onclick = e => { const b = e.target.closest('[data-open]'); if (b) { const [tb, id] = b.dataset.open.split('|'); sr.classList.remove('open'); gs.value = ''; openRecord(tb, id); } };
  document.addEventListener('click', e => { if (!e.target.closest('.search')) sr.classList.remove('open'); if (!e.target.closest('#notif') && !e.target.closest('#bell')) { const n = $('#notif'); if (n) n.hidden = true; } });
  $('#bell').onclick = () => { const n = $('#notif'); const list = notifications(); n.innerHTML = `<div class="item" style="cursor:default"><b>Notifikasi</b><small>Pengingat yang sama dikirim lewat email sesuai jadwal di Admin.</small></div>` + (list.map((x, i) => `<div class="item" data-ni="${i}">${esc(x.t)}<small>${esc(x.s)}</small></div>`).join('') || '<div class="empty">Tidak ada yang perlu ditindaklanjuti.</div>'); n.hidden = !n.hidden; n.onclick = e => { const it = e.target.closest('[data-ni]'); if (!it) return; const x = list[+it.dataset.ni]; if (x.f) S.f.capStatus = x.f; if (x.tab) S.tab[x.v] = x.tab; n.hidden = true; navigate(x.v); }; };
}
ACT.lang = el => { S.lang = el.dataset.id; remount(); };
ACT.pub = () => { S.pub = !S.pub; if (S.pub && !PUBLIC_VIEWS.includes(S.view)) S.view = 'dashboard'; remount(); toast(S.pub ? 'Mode publik aktif.' : 'Kembali ke mode internal.'); };
window.addEventListener('hashchange', () => { const v = location.hash.slice(1) || 'dashboard'; S.view = (S.pub && !PUBLIC_VIEWS.includes(v)) ? 'dashboard' : v; if (S.db) { render(); $('#view').focus({ preventScroll: true }); window.scrollTo(0, 0); } });
