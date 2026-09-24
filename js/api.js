/* =========================================================
   API adapter
   - Di Apps Script: memanggil fungsi server lewat google.script.run
   - Di web biasa: memakai data dummy (SEED) + localStorage
   Kedua mode punya fungsi yang sama, jadi UI tidak perlu tahu bedanya.
   ========================================================= */
const API = (function () {
  const isGAS = !!(window.google && google.script && google.script.run);
  const gas = (fn, ...args) => new Promise((res, rej) =>
    google.script.run.withSuccessHandler(res).withFailureHandler(e => rej(e && e.message ? e : new Error(String(e))))[fn](...args));

  if (isGAS) {
    return {
      mode: 'gas',
      getAll: () => gas('apiGetAll'),
      save: (t, r, u) => gas('apiSave', t, r, u),
      saveMany: (t, rows, u) => gas('apiSaveMany', t, rows, u),
      remove: (t, id, u) => gas('apiRemove', t, id, u),
      restore: (t, id, u) => gas('apiRestore', t, id, u),
      purge: (t, id, u, reason) => gas('apiPurge', t, id, u, reason),
      uploadEvidence: (meta, file, u) => gas('apiUploadEvidence', meta, file, u),
      generateReport: (model) => gas('apiGenerateReport', model),
      backupNow: (u) => gas('apiBackupNow', u),
      restoreBackup: (id, u) => gas('apiRestoreBackup', id, u),
      syncKobo: (u) => gas('apiSyncKobo', u),
      sendReminders: (u) => gas('apiSendReminders', u),
      resetDemo: () => gas('apiResetDemo')
    };
  }

  /* ---------- local mock ---------- */
  const KEY = 'bf-mis-demo-v1';
  let DB = null;
  const clone = o => JSON.parse(JSON.stringify(o));
  function load() {
    if (DB) return;
    try { const s = localStorage.getItem(KEY); if (s) { DB = JSON.parse(s); return; } } catch (e) {}
    DB = clone(window.SEED || {});
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { /* kuota penuh: abaikan, data tetap di memori */ } }
  const now = () => { const d = new Date(); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  function nextId(t) {
    const rows = DB[t] || (DB[t] = []);
    let prefix = (window.SCHEMA && SCHEMA[t] && SCHEMA[t].prefix) || t.slice(0, 3).toUpperCase();
    let max = 0, width = 3;
    rows.forEach(r => { const m = String(r.id).match(/^(.*?)(\d+)$/); if (m && m[1].replace(/-$/, '') === prefix) { max = Math.max(max, +m[2]); width = m[2].length; } });
    return `${prefix}-${String(max + 1).padStart(width, '0')}`;
  }
  function audit(user, aksi, tabel, id, detail) {
    DB.AuditLog = DB.AuditLog || [];
    DB.AuditLog.unshift({ id: 'AL-' + String(DB.AuditLog.length + 1).padStart(4, '0') + '-' + Date.now().toString(36).slice(-3), waktu: now(), user: user || 'Pengguna Demo', aksi, tabel, recordId: id, detail: detail || '', _deleted: false });
  }
  const wait = (v) => new Promise(r => setTimeout(() => r(clone(v)), 120));

  const mock = {
    mode: 'local',
    async getAll() { load(); return wait({ ...DB, _meta: { mode: 'local', webAppUrl: location.href.split('#')[0] } }); },
    async save(t, rec, user) {
      load(); DB[t] = DB[t] || [];
      const rows = DB[t]; let isNew = !rec.id || !rows.some(r => r.id === rec.id);
      if (isNew) { rec.id = rec.id || nextId(t); rec._deleted = false; rows.unshift(rec); }
      else { const i = rows.findIndex(r => r.id === rec.id); rows[i] = { ...rows[i], ...rec }; rec = rows[i]; }
      if (t !== 'AuditLog' && t !== 'Usage') audit(user, isNew ? 'Tambah' : 'Ubah', t, rec.id, rec._auditNote || '');
      delete rec._auditNote; persist(); return wait(rec);
    },
    async saveMany(t, list, user) {
      load(); DB[t] = DB[t] || []; const out = [];
      list.forEach(r => { r.id = r.id && !DB[t].some(x => x.id === r.id) ? r.id : nextId(t); r._deleted = false; DB[t].unshift(r); out.push(r); });
      audit(user, 'Impor', t, `${out.length} baris`, 'Impor CSV tervalidasi'); persist(); return wait(out);
    },
    async remove(t, id, user) { load(); const r = (DB[t] || []).find(x => x.id === id); if (r) { r._deleted = true; r._deletedAt = now(); audit(user, 'Hapus (tempat sampah)', t, id); persist(); } return wait(r); },
    async restore(t, id, user) { load(); const r = (DB[t] || []).find(x => x.id === id); if (r) { r._deleted = false; delete r._deletedAt; audit(user, 'Pulihkan', t, id); persist(); } return wait(r); },
    async purge(t, id, user, reason) { load(); DB[t] = (DB[t] || []).filter(x => x.id !== id); audit(user, 'Hapus permanen', t, id, reason || ''); persist(); return wait({ id }); },
    async uploadEvidence(meta, file, user) {
      // di mode lokal file hanya disimpan jika kecil (gambar < 350 KB) sebagai data URL
      if (file && file.dataUrl && file.size < 350000) meta.url = file.dataUrl; else meta.url = '';
      meta.ukuran = file ? Math.round(file.size / 1024) + ' KB' : meta.ukuran;
      meta.namaFile = file ? file.name : '';
      return mock.save('Evidence', meta, user);
    },
    async generateReport() { return wait({ mode: 'local' }); },
    async backupNow(user) {
      load(); const d = now();
      const rec = { id: 'BK-' + Date.now().toString(36), waktu: d, file: 'MIS_BlueForests_backup_' + d.slice(0, 10), status: 'Berhasil', ukuran: Math.round(JSON.stringify(DB).length / 1024) + ' KB', tipe: 'Manual', _deleted: false };
      DB.BackupLog.unshift(rec); audit(user, 'Backup', 'Sistem', rec.id, rec.file); persist(); return wait(rec);
    },
    async restoreBackup(id, user) { load(); audit(user, 'Pulihkan backup', 'Sistem', id, 'Simulasi (mode lokal)'); persist(); return wait({ ok: true }); },
    async syncKobo(user) {
      load(); const sites = DB.Sites.filter(s => !s._deleted); const out = [];
      const jenis = ['Pemantauan plot permanen', 'Sesi sekolah lapang', 'Penanaman dan perbaikan hidrologi'];
      const ops = ['OP-1.2', 'OP-2.1', 'OP-1.1'];
      for (let i = 0; i < 3; i++) {
        const s = sites[Math.floor(Math.random() * sites.length)]; const j = Math.floor(Math.random() * 3);
        const rec = { nama: jenis[j] + ' – ' + s.desa, outputId: ops[j], siteId: s.id, landscapeId: s.landscapeId, tanggal: now().slice(0, 10), pesertaL: 5 + Math.floor(Math.random() * 12), pesertaP: 4 + Math.floor(Math.random() * 12), peserta: [], lat: s.lat, lng: s.lng, sumber: 'KoboToolbox', status: 'Perlu Verifikasi', kodeAnggaran: '', anggaran: 0, realisasi: 0, catatan: 'Submission simulasi' };
        rec.id = nextId('Activities'); rec._deleted = false; DB.Activities.unshift(rec); out.push(rec);
      }
      audit(user, 'Sinkron KoboToolbox', 'Activities', out.length + ' submission', 'Simulasi'); persist(); return wait(out);
    },
    async sendReminders(user) { load(); audit(user, 'Kirim pengingat', 'Sistem', '-', 'Simulasi email'); persist(); return wait({ sent: 3, mode: 'simulasi' }); },
    async resetDemo() { try { localStorage.removeItem(KEY); } catch (e) {} DB = null; return true; }
  };
  return mock;
})();
