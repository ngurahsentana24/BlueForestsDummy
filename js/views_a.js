/* =========================================================
   Views A: Dashboard, Peta, Program & Landscape, KMEL, Capaian
   ========================================================= */
const heroSVG = () => `
<svg class="sea" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
 <defs>
  <linearGradient id="gSea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#082633"/><stop offset=".5" stop-color="#0D4A5B"/><stop offset="1" stop-color="#17808B"/></linearGradient>
  <radialGradient id="gShal" cx=".82" cy=".95" r=".55"><stop offset="0" stop-color="#7FD0CF" stop-opacity=".55"/><stop offset="1" stop-color="#7FD0CF" stop-opacity="0"/></radialGradient>
  <filter id="foam" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.008 0.035" numOctaves="4" seed="9"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1.6 -.72"/></filter>
 </defs>
 <rect width="1200" height="420" fill="url(#gSea)"/><rect width="1200" height="420" fill="url(#gShal)"/>
 <rect width="1200" height="420" filter="url(#foam)" opacity=".14"/>
 <g fill="none" stroke="#BFE6E6" stroke-opacity=".16" stroke-width="1.2">
  <path d="M620 0c40 60 10 120 70 170s150 40 190 110 10 110 60 140"/><path d="M700 0c30 70 0 130 60 180s160 30 200 100 20 110 70 140"/>
  <path d="M780 0c20 70 -10 140 50 190s170 20 210 90 30 110 80 140"/><path d="M860 0c20 60 0 130 50 180s150 30 190 90 40 110 100 150"/>
  <path d="M940 0c10 60 10 120 50 170s130 40 170 100"/>
 </g>
 <g class="swell" fill="none" stroke="#fff" stroke-linecap="round">
  <path d="M-20 300c120-30 220 20 340-10s230-60 360-20 240 50 360 10 160-30 200-20" stroke-opacity=".10" stroke-width="3"/>
  <path d="M-20 345c140-20 240 25 360 0s250-50 380-15 230 40 340 10 140-20 180-10" stroke-opacity=".07" stroke-width="2"/>
 </g>
</svg>`;
const heroEdge = () => `<svg class="edge" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="tear"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="3"/><feDisplacementMap in="SourceGraphic" scale="16"/></filter></defs>
 <path filter="url(#tear)" d="M0 44C130 24 240 62 380 40S640 12 790 38 1050 26 1200 42V90H0Z" fill="#D9C49A" opacity=".55"/>
 <path filter="url(#tear)" d="M0 58C150 38 260 72 420 54S700 30 860 52 1080 40 1200 56V90H0Z" fill="#F3F6F5"/></svg>`;

/* ================= DASHBOARD ================= */
VIEWS.dashboard = () => {
  const per = S.f.per || (S.f.per = defaultPeriod()); const prog = S.f.prog || '', ls = S.f.ls || '';
  const inds = rows('Indicators').filter(i => !prog || indProgram(i) === prog);
  const lss = rows('Landscapes').filter(l => !ls || l.id === ls);
  const ach = inds.map(i => ({ i, a: achv(i, ls || null, per, statusSet()) }));
  const on = ach.filter(x => x.a.pct != null); const onTrack = on.length ? on.filter(x => x.a.pct >= 90).length / on.length * 100 : null;
  const ben = rows('Beneficiaries').filter(b => !ls || b.landscapeId === ls);
  const ha = achv(byId('Indicators', 'IND-01') || {}, ls || null, per, statusSet()).actual;
  const pending = rows('IndicatorActuals').filter(a => ['Submitted', 'Verified'].includes(a.status) && (!ls || a.landscapeId === ls));
  const odActions = rows('Actions').filter(a => a.status !== 'Selesai' && a.deadline < CONFIG.TODAY);
  const photo = CONFIG.HERO_PHOTO_URL ? `<div class="photo" style="background-image:linear-gradient(90deg,rgba(8,38,51,.85),rgba(8,38,51,.2)),url('${CONFIG.HERO_PHOTO_URL}')"></div>` : '';
  const html = `
  <section class="hero">${heroSVG()}${photo}<div class="hero-inner"><span class="dash"></span>
    <h1>${S.lang === 'en' ? 'Coasts that recover, communities that hold' : 'Pesisir yang pulih, masyarakat yang tangguh'}</h1>
    <p>${S.lang === 'en' ? 'Programme, KMEL and landscape data in one place, from field evidence to management decisions.' : 'Data program, KMEL, dan landscape di satu tempat, dari bukti lapangan sampai keputusan manajemen.'} Periode ${esc(per)}.</p></div>${heroEdge()}</section>
  <div class="statbar" role="list">
    <div role="listitem"><b>${rows('Programs').filter(p => !prog || p.id === prog).length}</b><span>Program aktif</span></div>
    <div role="listitem"><b>${lss.length}</b><span>Landscape · ${rows('Sites').filter(s => !ls || s.landscapeId === ls).length} site</span></div>
    <div role="listitem"><b>${nf(ben.length)}</b><span>Penerima manfaat terdaftar</span></div>
    <div role="listitem"><b>${pctf(onTrack)}</b><span>Indikator on track</span></div>
    <div role="listitem"><b>${nf(ha)}</b><span>Hektar mangrove direstorasi</span></div>
  </div>
  <div class="filters no-print" role="group" aria-label="Filter dashboard">
    <label>Program<select id="fProg"><option value="">Semua program</option>${rows('Programs').map(p => `<option value="${p.id}" ${prog === p.id ? 'selected' : ''}>${esc(p.nama)}</option>`).join('')}</select></label>
    <label>Landscape<select id="fLs"><option value="">Semua landscape</option>${rows('Landscapes').map(l => `<option value="${l.id}" ${ls === l.id ? 'selected' : ''}>${esc(l.nama)}</option>`).join('')}</select></label>
    <label>Periode<select id="fPer">${periodsSorted().map(p => `<option ${p === per ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
    <label class="check" style="flex-direction:row;margin-top:16px"><input type="checkbox" id="fVer" ${S.f.inclVerified ? 'checked' : ''}> Hitung juga capaian terverifikasi</label>
  </div>
  <div class="grid g-7-5">
    <div class="panel"><div class="panel-h"><h2>Capaian terhadap target per landscape</h2><p>Rata-rata % capaian semua indikator terpilih sampai ${esc(per)}. Klik batang untuk membuka peta.</p></div><div class="chart-box"><canvas id="cLs"></canvas></div></div>
    <div class="panel"><div class="panel-h"><h2>Tren capaian</h2><p>Rata-rata % capaian per periode</p></div><div class="chart-box"><canvas id="cTrend"></canvas></div></div>
  </div>
  <div class="section-t"><h2>Indikator</h2><span class="muted small">Klik baris untuk melihat detail, evidence, dan diskusi</span></div>
  ${table('dashInd', { search: false, pageSize: 12, onRow: r => indicatorDetail(r.id), data: ach.map(x => ({ id: x.i.id, kode: x.i.kode, nama: x.i.nama, satuan: x.i.satuan, t: x.a.target, a: x.a.actual, p: x.a.pct, pr: x.i.prioritas })).sort((a, b) => (b.pr ? 1 : 0) - (a.pr ? 1 : 0)),
    cols: [{ k: 'p', label: '', render: r => `<span class="light ${light(r.p)}" title="${lightLabel(r.p)}"></span>`, sortv: r => r.p ?? -1 }, { k: 'kode', label: 'Kode' }, { k: 'nama', label: 'Indikator', render: r => `${esc(r.nama)} ${r.pr ? '<span class="badge blue">Prioritas</span>' : ''}` }, { k: 't', label: 'Target', num: 1, render: r => nf(r.t, 1) + ' <span class="muted small">' + esc(r.satuan) + '</span>' }, { k: 'a', label: 'Capaian', num: 1, render: r => nf(r.a, 1) }, { k: 'pp', label: '% capaian', render: r => pctBar(r.p), sortv: r => r.p ?? -1 }] })}
  <div class="section-t"><h2>Siapa yang dijangkau</h2></div>
  <div class="grid g3">
    <div class="panel"><div class="panel-h"><h2>Jenis kelamin</h2></div><div class="chart-box sm"><canvas id="cGender"></canvas></div></div>
    <div class="panel"><div class="panel-h"><h2>Kelompok usia</h2></div><div class="chart-box sm"><canvas id="cAge"></canvas></div></div>
    <div class="panel"><div class="panel-h"><h2>Kelompok penerima</h2><p>${nf(ben.filter(b => b.rentan).length)} orang tercatat rentan</p></div><div class="chart-box sm"><canvas id="cGroup"></canvas></div></div>
  </div>
  <div class="grid g-7-5 mt">
    <div class="panel"><div class="panel-h"><h2>Sebaran lokasi</h2><div class="right"><button class="btn sm" data-act="go" data-id="peta">Buka peta lengkap</button></div></div><div id="miniMap" class="map sm"></div></div>
    ${S.pub ? `<div class="panel sand"><div class="panel-h"><h2>Cerita dari lapangan</h2></div>${rows('Stories').slice(0, 1).map(s => `<blockquote style="font-family:var(--f-disp);font-size:24px;line-height:1.25;margin:0 0 10px">“${esc(s.kutipan)}”</blockquote><p class="muted" style="margin:0">${esc(s.narasumber)}, ${esc(nameOf('Landscapes', s.landscapeId))}</p>`).join('')}</div>` :
    `<div class="panel"><div class="panel-h"><h2>Menunggu tindakan</h2></div>
      <div class="flex mb"><span class="badge yellow">${pending.filter(p => p.status === 'Submitted').length} menunggu verifikasi</span><span class="badge blue">${pending.filter(p => p.status === 'Verified').length} menunggu approval</span><span class="badge red">${odActions.length} tindak lanjut lewat tenggat</span></div>
      ${pending.slice(0, 5).map(p => `<div class="flex" style="justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line-2);flex-wrap:nowrap"><span class="small">${esc(nameOf('Indicators', p.indicatorId))}<br><span class="muted">${esc(nameOf('Landscapes', p.landscapeId))} · ${p.periode}</span></span>${statusBadge(p.status)}</div>`).join('') || '<div class="empty">Semua capaian sudah diproses.</div>'}
      <button class="btn sm mt" data-act="go" data-id="capaian">Buka antrian approval</button></div>`}
  </div>
  ${S.pub ? '' : `<div class="section-t"><h2>Kualitas data per landscape</h2><span class="muted small">Skor dari kelengkapan, duplikasi, ketepatan waktu, dan kelengkapan evidence</span></div>
  <div class="grid g4" style="grid-template-columns:repeat(5,minmax(0,1fr))">${rows('Landscapes').map(l => { const q = dqi(l.id); return `<div class="panel"><div class="small muted">${esc(l.nama)}</div><div class="kpi"><b>${nf(q.score)}</b><span>dari 100</span></div><div class="bar ${light(q.score)} mt"><i style="width:${q.score}%"></i></div></div>`; }).join('')}</div>`}`;
  return { html, after: () => {
    const bind = (id, k, num) => $(id).onchange = e => { S.f[k] = num ? e.target.checked : e.target.value; render(); };
    bind('#fProg', 'prog'); bind('#fLs', 'ls'); bind('#fPer', 'per'); bind('#fVer', 'inclVerified', 1);
    const lsData = lss.map(l => { const v = inds.map(i => achv(i, l.id, per, statusSet()).pct).filter(x => x != null); return v.length ? sum(v) / v.length : 0; });
    chart('cLs', { type: 'bar', data: { labels: lss.map(l => l.nama), datasets: [{ label: '% capaian', data: lsData, backgroundColor: lsData.map(statusColor), borderRadius: 6, maxBarThickness: 46 }] }, options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => nf(c.raw) + '%' } } }, scales: { y: { beginAtZero: true, suggestedMax: 110, ticks: { callback: v => v + '%' } } }, onClick: (e, el) => { if (el[0]) { S.sel.ls = lss[el[0].index].id; navigate('peta'); } } } });
    const ps = periodsSorted();
    const tr = ps.map(p => { const v = inds.map(i => achv(i, ls || null, p, statusSet()).pct).filter(x => x != null); return v.length ? sum(v) / v.length : null; });
    chart('cTrend', { type: 'line', data: { labels: ps, datasets: [{ label: 'Rata-rata % capaian', data: tr, borderColor: PAL.lagoon, backgroundColor: 'rgba(18,122,134,.12)', fill: true, tension: .35, pointRadius: 4 }, { label: 'Ambang on track', data: ps.map(() => 90), borderColor: PAL.sand, borderDash: [5, 5], pointRadius: 0 }] }, options: { scales: { y: { beginAtZero: true, suggestedMax: 110, ticks: { callback: v => v + '%' } } } } });
    const g = groupBy(ben, b => b.jk);
    chart('cGender', { type: 'doughnut', data: { labels: ['Perempuan', 'Laki-laki'], datasets: [{ data: [(g.P || []).length, (g.L || []).length], backgroundColor: [PAL.lagoon, PAL.abyss], borderWidth: 0 }] }, options: { cutout: '64%', plugins: { legend: { position: 'bottom' } } } });
    const bins = [['<25', 0, 24], ['25–34', 25, 34], ['35–44', 35, 44], ['45–54', 45, 54], ['55+', 55, 200]];
    chart('cAge', { type: 'bar', data: { labels: bins.map(b => b[0]), datasets: [{ label: 'P', data: bins.map(b => ben.filter(x => x.jk === 'P' && age(x.tglLahir) >= b[1] && age(x.tglLahir) <= b[2]).length), backgroundColor: PAL.lagoon, borderRadius: 4 }, { label: 'L', data: bins.map(b => ben.filter(x => x.jk === 'L' && age(x.tglLahir) >= b[1] && age(x.tglLahir) <= b[2]).length), backgroundColor: PAL.abyss, borderRadius: 4 }] }, options: { scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }, plugins: { legend: { position: 'bottom' } } } });
    const kg = groupBy(ben, b => b.kelompok); const kk = Object.keys(kg).sort((a, b) => kg[b].length - kg[a].length);
    chart('cGroup', { type: 'bar', data: { labels: kk, datasets: [{ data: kk.map(k => kg[k].length), backgroundColor: PAL.shoal, borderRadius: 4 }] }, options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { y: { ticks: { font: { size: 11 }, callback: function (v) { const l = this.getLabelForValue(v); return l.length > 20 ? l.slice(0, 19) + '…' : l; } } } } } });
    const m = baseMap('miniMap'); if (m) { const b = []; rows('Sites').filter(s => !ls || s.landscapeId === ls).forEach(s => { const p = landscapePct(s.landscapeId, per); L.circleMarker([s.lat, s.lng], { radius: 6, color: '#fff', weight: 1.5, fillColor: statusColor(p), fillOpacity: .95 }).bindTooltip(esc(s.nama)).addTo(m); b.push([s.lat, s.lng]); }); if (b.length) m.fitBounds(b, { padding: [20, 20] }); }
  } };
};
const statusBadge = s => `<span class="badge ${({ Draft: '', Submitted: 'yellow', Verified: 'blue', Approved: 'green', Rejected: 'red' })[s] || ''}">${esc(s)}</span>`;

/* ================= PETA ================= */
VIEWS.peta = () => {
  const per = S.f.per || defaultPeriod(); const indSel = S.f.mapInd || '';
  const pctFor = l => indSel ? achv(byId('Indicators', indSel), l, per, statusSet()).pct : landscapePct(l, per);
  const list = rows('Landscapes').map(l => ({ ...l, p: pctFor(l.id), sites: rows('Sites').filter(s => s.landscapeId === l.id) }));
  const html = pageHead(t('peta'), 'Landscape, site, kegiatan, dan titik evidence. Warna menunjukkan status capaian.', `<button class="btn" data-act="exportcsv" data-id="Sites">${ic('down')} Ekspor site</button>`) + `
  <div class="filters"><label>Warna berdasarkan<select id="mInd"><option value="">Rata-rata semua indikator</option>${rows('Indicators').map(i => `<option value="${i.id}" ${indSel === i.id ? 'selected' : ''}>${esc(i.kode + ' ' + i.nama)}</option>`).join('')}</select></label>
  <label>Periode<select id="mPer">${periodsSorted().map(p => `<option ${p === per ? 'selected' : ''}>${p}</option>`).join('')}</select></label></div>
  <div class="grid g-8-4"><div class="panel" style="padding:8px"><div id="bigMap" class="map" style="height:600px"></div></div>
  <div class="panel"><div class="panel-h"><h2>Landscape</h2><p>Klik untuk memusatkan peta</p></div>
  ${list.map(l => `<button class="node ${S.sel.ls === l.id ? 'sel' : ''}" data-ls="${l.id}" style="width:100%;border:0;background:none;text-align:left;padding:10px 8px;border-bottom:1px solid var(--line-2);border-radius:0"><span class="light ${light(l.p)}"></span><span class="nm"><b>${esc(l.nama)}</b><br><span class="meta">${esc(l.provinsi)} · ${l.sites.length} site · ${nf(l.luasHa)} ha</span></span><b class="small">${pctf(l.p)}</b></button>`).join('')}
  <div class="map-legend mt"><span class="light green"></span> ≥ 90% on track &nbsp; <span class="light yellow"></span> 60–89% &nbsp; <span class="light red"></span> &lt; 60%<br>● site &nbsp; ◆ kegiatan &nbsp; ▲ evidence</div></div></div>
  <div class="panel mt" id="lsDetail"></div>`;
  return { html, after: () => {
    $('#mInd').onchange = e => { S.f.mapInd = e.target.value; render(); }; $('#mPer').onchange = e => { S.f.per = e.target.value; render(); };
    const m = baseMap('bigMap', { wheel: true }); if (!m) return;
    const gL = L.layerGroup().addTo(m), gS = L.layerGroup().addTo(m), gA = L.layerGroup(), gE = L.layerGroup(); const polys = {};
    list.forEach(l => {
      const pts = l.sites.map(s => [s.lat, s.lng]); if (!pts.length) pts.push([l.lat, l.lng]);
      const poly = L.polygon(hull(pts.length > 2 ? pts : pts.concat([[l.lat + .1, l.lng + .1], [l.lat - .1, l.lng + .12], [l.lat, l.lng - .12]])), { color: statusColor(l.p), weight: 1.5, fillOpacity: .12, dashArray: '4 4' }).addTo(gL);
      poly.bindPopup(`<h4>${esc(l.nama)}</h4>${esc(l.provinsi)}<br>Capaian: <b>${pctf(l.p)}</b> (${lightLabel(l.p)})<br>${l.sites.length} site · ${rows('Beneficiaries').filter(b => b.landscapeId === l.id).length} penerima manfaat`);
      polys[l.id] = poly;
      l.sites.forEach(s => L.circleMarker([s.lat, s.lng], { radius: 7, color: '#fff', weight: 2, fillColor: statusColor(l.p), fillOpacity: 1 }).bindPopup(`<h4>${esc(s.nama)}</h4>${esc(s.tipe)} · Desa ${esc(s.desa)}<br>Project: ${esc(nameOf('Projects', s.projectId))}<br>${s.luasHa ? nf(s.luasHa) + ' ha<br>' : ''}Kegiatan: ${rows('Activities').filter(a => a.siteId === s.id).length}`).addTo(gS));
    });
    rows('Activities').forEach(a => L.marker([a.lat, a.lng], { icon: L.divIcon({ className: '', html: `<div style="width:10px;height:10px;background:${PAL.abyss};transform:rotate(45deg);border:1.5px solid #fff"></div>` }) }).bindPopup(`<h4>${esc(a.nama)}</h4>${fdate(a.tanggal)} · ${a.pesertaL + a.pesertaP} peserta<br>Sumber: ${esc(a.sumber)}`).addTo(gA));
    rows('Evidence').filter(e => e.lat).forEach(e => L.marker([+e.lat + .01, +e.lng + .01], { icon: L.divIcon({ className: '', html: `<div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:11px solid ${PAL.sun}"></div>` }) }).bindPopup(`<h4>${esc(e.judul)}</h4>${esc(e.jenis)} · ${fdate(e.tanggal)}`).addTo(gE));
    L.control.layers(null, { 'Batas landscape': gL, 'Site': gS, 'Kegiatan': gA, 'Evidence': gE }, { collapsed: false }).addTo(m);
    const all = list.flatMap(l => l.sites.map(s => [s.lat, s.lng])); m.fitBounds(all, { padding: [30, 30] });
    const showLs = id => { S.sel.ls = id; $$('[data-ls]').forEach(b => b.classList.toggle('sel', b.dataset.ls === id)); const l = list.find(x => x.id === id); if (!l) return; m.fitBounds(polys[id].getBounds(), { padding: [40, 40] }); polys[id].openPopup();
      $('#lsDetail').innerHTML = `<div class="panel-h"><h2>${esc(l.nama)}</h2><p>${esc(l.provinsi)} · Periode ${esc(per)}</p></div>` + table('lsInd', { search: false, pageSize: 12, onRow: r => indicatorDetail(r.id), data: rows('Indicators').map(i => { const a = achv(i, id, per, statusSet()); return { id: i.id, kode: i.kode, nama: i.nama, t: a.target, a: a.actual, p: a.pct }; }), cols: [{ k: 'kode', label: 'Kode' }, { k: 'nama', label: 'Indikator' }, { k: 't', label: 'Target', num: 1, render: r => nf(r.t, 1) }, { k: 'a', label: 'Capaian', num: 1, render: r => nf(r.a, 1) }, { k: 'p', label: '% capaian', render: r => pctBar(r.p), sortv: r => r.p ?? -1 }] }); };
    $$('[data-ls]').forEach(b => b.onclick = () => showLs(b.dataset.ls));
    if (S.sel.ls) setTimeout(() => showLs(S.sel.ls), 200); else $('#lsDetail').innerHTML = '<div class="empty">Pilih landscape di daftar kanan untuk melihat capaian indikatornya.</div>';
  } };
};

/* ================= PROGRAM & LANDSCAPE ================= */
VIEWS.program = () => {
  const tab = curTab('program', 'tree');
  let body = '';
  if (tab === 'tree') {
    const open = S.sel.open || (S.sel.open = new Set(['Programs|PRG-01', 'Projects|PRJ-01']));
    const node = (tb, r, lvl, kids, meta) => { const key = tb + '|' + r.id; const isOpen = open.has(key); return `<li><div class="node ${S.sel.node === key ? 'sel' : ''}" data-node="${key}">${kids ? `<button class="tw" data-tw="${key}" aria-label="${isOpen ? 'Tutup' : 'Buka'}" aria-expanded="${isOpen}">${isOpen ? '▾' : '▸'}</button>` : '<span class="tw"></span>'}<span class="lvl">${lvl}</span><span class="nm">${esc(r.nama)}</span><span class="meta">${meta || ''}</span></div>${kids && isOpen ? `<ul>${kids}</ul>` : ''}</li>`; };
    const tree = rows('Programs').map(p => node('Programs', p, 'PRG', rows('Projects').filter(j => j.programId === p.id).map(j => {
      const sites = rows('Sites').filter(s => s.projectId === j.id); const lsIds = uniq(sites.map(s => s.landscapeId));
      return node('Projects', j, 'PRJ', lsIds.map(lid => { const l = byId('Landscapes', lid); return node('Landscapes', { ...l, id: l.id + '@' + j.id }, 'LS', sites.filter(s => s.landscapeId === lid).map(s => node('Sites', s, 'SITE', '', esc(s.desa))).join(''), esc(l.provinsi)); }).join(''), esc(j.donor));
    }).join(''), p.status)).join('');
    body = `<div class="grid g-7-5"><div class="panel"><div class="panel-h"><h2>Hierarki program</h2><p>Program → Project → Landscape → Site. Klik node untuk detail.</p><div class="right edit-only"><button class="btn sm" data-act="add" data-id="Programs">${ic('plus')} Program</button></div></div><ul class="tree">${tree}</ul></div><div class="panel" id="nodeDetail">${nodeDetail(S.sel.node)}</div></div>`;
  } else {
    const map = { programs: 'Programs', projects: 'Projects', landscapes: 'Landscapes', sites: 'Sites' }; const tb = map[tab];
    const colsBy = {
      Programs: [{ k: 'kode', label: 'Kode' }, { k: 'nama', label: 'Nama' }, { k: 'mulai', label: 'Mulai', render: r => fdate(r.mulai) }, { k: 'selesai', label: 'Selesai', render: r => fdate(r.selesai) }, { k: 'status', label: 'Status', render: r => `<span class="badge green">${esc(r.status)}</span>` }],
      Projects: [{ k: 'id', label: 'ID' }, { k: 'nama', label: 'Nama' }, { k: 'programId', label: 'Program', text: r => nameOf('Programs', r.programId), render: r => esc(nameOf('Programs', r.programId)) }, { k: 'donor', label: 'Donor' }, { k: 'anggaran', label: 'Anggaran', num: 1, render: r => rp(r.anggaran) }, { k: 'status', label: 'Status' }],
      Landscapes: [{ k: 'id', label: 'ID' }, { k: 'nama', label: 'Nama' }, { k: 'provinsi', label: 'Provinsi' }, { k: 'luasHa', label: 'Luas (ha)', num: 1, render: r => nf(r.luasHa) }, { k: 's', label: 'Site', num: 1, render: r => rows('Sites').filter(s => s.landscapeId === r.id).length }],
      Sites: [{ k: 'id', label: 'ID' }, { k: 'nama', label: 'Nama' }, { k: 'tipe', label: 'Tipe' }, { k: 'desa', label: 'Desa' }, { k: 'landscapeId', label: 'Landscape', text: r => nameOf('Landscapes', r.landscapeId), render: r => esc(nameOf('Landscapes', r.landscapeId)) }, { k: 'projectId', label: 'Project', render: r => esc(nameOf('Projects', r.projectId)) }, { k: 'lat', label: 'Koordinat', render: r => `<span class="small">${nf(r.lat, 3)}, ${nf(r.lng, 3)}</span>` }]
    };
    body = `<div class="flex mb edit-only"><button class="btn primary" data-act="add" data-id="${tb}">${ic('plus')} Tambah ${SCHEMA[tb].label.toLowerCase()}</button><button class="btn" data-act="exportcsv" data-id="${tb}">${ic('down')} ${t('export')}</button></div>` + table('prog' + tb, { cols: colsBy[tb], data: rows(tb), actions: r => crudActs(tb, r) });
  }
  return { html: pageHead(t('program'), 'Struktur program, project, wilayah kerja, dan lokasi kegiatan.') + tabs('program', [['tree', 'Hierarki'], ['programs', 'Program'], ['projects', 'Project'], ['landscapes', 'Landscape'], ['sites', 'Site']]) + body,
    after: () => {
      $$('[data-tw]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.tw; S.sel.open.has(k) ? S.sel.open.delete(k) : S.sel.open.add(k); render(); });
      $$('[data-node]').forEach(n => n.onclick = () => { S.sel.node = n.dataset.node; $$('[data-node]').forEach(x => x.classList.toggle('sel', x === n)); $('#nodeDetail').innerHTML = nodeDetail(S.sel.node); });
    } };
};
function nodeDetail(key) {
  if (!key) return '<div class="empty">Pilih program, project, landscape, atau site di sebelah kiri.</div>';
  let [tb, id] = key.split('|'); id = id.split('@')[0]; const r = byId(tb, id); if (!r) return '';
  const per = S.f.per || defaultPeriod(); const edit = `<div class="flex edit-only">${act('edit', tb + '|' + r.id, 'Ubah', 'edit')}${act('del', tb + '|' + r.id, 'Hapus', 'trash', 'danger')}</div>`;
  if (tb === 'Programs') { const inds = rows('Indicators').filter(i => indProgram(i) === id); const ps = inds.map(i => achv(i, null, per).pct).filter(x => x != null);
    return `<div class="panel-h"><span class="badge dark">Program</span><h2>${esc(r.nama)}</h2></div><p class="muted">${esc(r.deskripsi)}</p><dl class="dl"><dt>Periode</dt><dd>${fdate(r.mulai)} – ${fdate(r.selesai)}</dd><dt>Project</dt><dd>${rows('Projects').filter(j => j.programId === id).length}</dd><dt>Indikator</dt><dd>${inds.length}</dd><dt>Rata-rata capaian</dt><dd>${pctBar(ps.length ? sum(ps) / ps.length : null)}</dd></dl><div class="flex mt edit-only"><button class="btn sm" data-act="add" data-id="Projects" data-def='${esc(JSON.stringify({ programId: id }))}'>${ic('plus')} Project</button><button class="btn sm" data-act="add" data-id="Outcomes" data-def='${esc(JSON.stringify({ programId: id }))}'>${ic('plus')} Outcome</button></div><div class="mt">${edit}</div>`; }
  if (tb === 'Projects') { const sites = rows('Sites').filter(s => s.projectId === id); const acts = rows('Activities').filter(a => sites.some(s => s.id === a.siteId));
    return `<div class="panel-h"><span class="badge blue">Project</span><h2>${esc(r.nama)}</h2></div><dl class="dl"><dt>Program</dt><dd>${esc(nameOf('Programs', r.programId))}</dd><dt>Donor</dt><dd>${esc(r.donor)}</dd><dt>Anggaran</dt><dd>${rp(r.anggaran)}</dd><dt>Periode</dt><dd>${fdate(r.mulai)} – ${fdate(r.selesai)}</dd><dt>Site</dt><dd>${sites.length} di ${uniq(sites.map(s => s.landscapeId)).length} landscape</dd><dt>Kegiatan tercatat</dt><dd>${acts.length}</dd></dl><div class="flex mt edit-only"><button class="btn sm" data-act="add" data-id="Sites" data-def='${esc(JSON.stringify({ projectId: id }))}'>${ic('plus')} Site</button></div><div class="mt">${edit}</div>`; }
  if (tb === 'Landscapes') { const p = landscapePct(id, per); const q = dqi(id);
    return `<div class="panel-h"><span class="badge green">Landscape</span><h2>${esc(r.nama)}</h2></div><dl class="dl"><dt>Provinsi</dt><dd>${esc(r.provinsi)}</dd><dt>Luas wilayah kerja</dt><dd>${nf(r.luasHa)} ha</dd><dt>Site</dt><dd>${rows('Sites').filter(s => s.landscapeId === id).length}</dd><dt>Penerima manfaat</dt><dd>${rows('Beneficiaries').filter(b => b.landscapeId === id).length}</dd><dt>Capaian ${per}</dt><dd>${pctBar(p)}</dd><dt>Skor kualitas data</dt><dd>${nf(q.score)} / 100</dd></dl><div class="flex mt"><button class="btn sm" data-act="lsmap" data-id="${id}">${ic('map')} Lihat di peta</button>${edit}</div>`; }
  return `<div class="panel-h"><span class="badge sand">Site</span><h2>${esc(r.nama)}</h2></div><dl class="dl"><dt>Tipe</dt><dd>${esc(r.tipe)}</dd><dt>Desa / Kabupaten</dt><dd>${esc(r.desa)}, ${esc(r.kabupaten)}</dd><dt>Landscape</dt><dd>${esc(nameOf('Landscapes', r.landscapeId))}</dd><dt>Project</dt><dd>${esc(nameOf('Projects', r.projectId))}</dd><dt>Koordinat</dt><dd>${r.lat}, ${r.lng}</dd><dt>Kegiatan</dt><dd>${rows('Activities').filter(a => a.siteId === id).length}</dd></dl><div class="mt">${edit}</div>`;
}
ACT.lsmap = el => { S.sel.ls = el.dataset.id; navigate('peta'); };

/* ================= KMEL ================= */
VIEWS.kmel = () => {
  const tab = curTab('kmel', 'logframe'); const per = S.f.per || defaultPeriod(); let body = '';
  if (tab === 'logframe') {
    body = `<div class="filters"><label>Periode<select id="kPer">${periodsSorted().map(p => `<option ${p === per ? 'selected' : ''}>${p}</option>`).join('')}</select></label><span class="edit-only flex" style="margin-top:16px"><button class="btn sm" data-act="add" data-id="Outcomes">${ic('plus')} Outcome</button><button class="btn sm" data-act="add" data-id="Outputs">${ic('plus')} Output</button><button class="btn sm primary" data-act="add" data-id="Indicators">${ic('plus')} Indikator</button></span></div>` +
      rows('Programs').map(p => `<div class="panel mb"><div class="panel-h"><span class="badge dark">${esc(p.kode)}</span><h2>${esc(p.nama)}</h2></div><ul class="tree">${rows('Outcomes').filter(o => o.programId === p.id).map(oc => `<li><div class="node"><span class="lvl">OC ${esc(oc.kode)}</span><span class="nm"><b>${esc(oc.pernyataan)}</b></span><span class="edit-only">${iconAct('edit', 'Outcomes|' + oc.id, 'Ubah outcome', 'edit')}</span></div><ul>${rows('Outputs').filter(o => o.outcomeId === oc.id).map(op => `<li><div class="node"><span class="lvl">OP ${esc(op.kode)}</span><span class="nm">${esc(op.pernyataan)}</span><span class="edit-only">${iconAct('edit', 'Outputs|' + op.id, 'Ubah output', 'edit')}</span></div><ul>${rows('Indicators').filter(i => i.outputId === op.id).map(i => { const a = achv(i, null, per, statusSet()); return `<li><div class="node" data-act="ind" data-id="${i.id}"><span class="light ${light(a.pct)}" title="${lightLabel(a.pct)}"></span><span class="lvl">${esc(i.kode)}</span><span class="nm">${esc(i.nama)}</span><span class="meta nowrap">${nf(a.actual, 1)} / ${nf(a.target, 1)} ${esc(i.satuan)}</span><span style="width:120px">${pctBar(a.pct)}</span></div></li>`; }).join('')}</ul></li>`).join('')}</ul></li>`).join('')}</ul></div>`).join('');
  } else if (tab === 'ref') {
    body = `<div class="flex mb edit-only"><button class="btn primary" data-act="add" data-id="Indicators">${ic('plus')} Tambah indikator</button><button class="btn" data-act="exportcsv" data-id="Indicators">${ic('down')} ${t('export')}</button></div>` + table('indRef', { onRow: r => indicatorDetail(r.id), data: rows('Indicators'), actions: r => crudActs('Indicators', r), cols: [{ k: 'kode', label: 'Kode' }, { k: 'nama', label: 'Indikator' }, { k: 'satuan', label: 'Satuan' }, { k: 'frekuensi', label: 'Frekuensi' }, { k: 'baseline', label: 'Baseline', num: 1 }, { k: 'agregasi', label: 'Agregasi' }, { k: 'disaggregation', label: 'Disaggregation' }] });
  } else if (tab === 'target') {
    const fi = S.f.tInd || 'IND-01';
    const tg = rows('IndicatorTargets').filter(x => x.indicatorId === fi);
    body = `<div class="filters"><label>Indikator<select id="tInd">${rows('Indicators').map(i => `<option value="${i.id}" ${fi === i.id ? 'selected' : ''}>${esc(i.kode + ' ' + i.nama)}</option>`).join('')}</select></label></div>
    <div class="alert info">Target tidak ditimpa. Revisi membuat versi baru, dan dashboard memakai versi terbaru. Riwayat versi tetap tersimpan untuk audit.</div>
    <div class="grid g2"><div class="panel"><div class="panel-h"><h2>Target awal vs revisi</h2><p>Total semua landscape</p></div><div class="chart-box"><canvas id="cRev"></canvas></div></div><div class="panel">${table('tgt', { search: false, pageSize: 10, data: tg.sort((a, b) => (a.landscapeId + a.periode + a.versi).localeCompare(b.landscapeId + b.periode + b.versi)), actions: r => `<span class="edit-only">${act('revise', r.id, 'Revisi', '')}</span>`, cols: [{ k: 'landscapeId', label: 'Landscape', render: r => esc(nameOf('Landscapes', r.landscapeId)) }, { k: 'periode', label: 'Periode' }, { k: 'target', label: 'Target', num: 1, render: r => nf(r.target, 1) }, { k: 'versi', label: 'Versi', render: r => `<span class="badge ${+r.versi > 1 ? 'yellow' : ''}">v${r.versi}</span>` }, { k: 'alasanRevisi', label: 'Alasan', render: r => `<span class="small">${esc(r.alasanRevisi || '–')}</span>` }] })}</div></div>`;
  } else {
    const parsed = rows('Indicators').map(i => { const m = {}; String(i.crosswalk || '').split('|').map(x => x.trim()).filter(Boolean).forEach(x => { if (/^SDG/i.test(x)) { const v = x.replace(/^SDG\s*/i, ''); m.SDG = m.SDG ? m.SDG + ', ' + v : v; } else { const k = x.split(':')[0].trim(), v = x.split(':').slice(1).join(':').trim(); m[k] = m[k] ? m[k] + ', ' + v : v; } }); return { i, m }; });
    const fw = uniq(parsed.flatMap(p => Object.keys(p.m))).filter(Boolean).sort((a, b) => a === 'SDG' ? 1 : b === 'SDG' ? -1 : a.localeCompare(b));
    body = `<div class="alert info">Satu indikator internal dapat melapor ke beberapa kerangka donor dan SDG sekaligus. Laporan donor di menu Pelaporan memakai pemetaan ini.</div><div class="table-wrap"><table class="t"><thead><tr><th>Indikator internal</th>${fw.map(f => `<th>${esc(f)}</th>`).join('')}</tr></thead><tbody>${parsed.map(p => `<tr><td><b>${esc(p.i.kode)}</b> ${esc(p.i.nama)}</td>${fw.map(f => `<td>${p.m[f] ? `<span class="badge ${f === 'SDG' ? 'green' : 'blue'}">${esc(p.m[f])}</span>` : '<span class="muted">–</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  return { html: pageHead(t('kmel'), 'Logframe, lembar referensi indikator, target berversi, dan pemetaan ke kerangka donor.') + tabs('kmel', [['logframe', 'Logframe'], ['ref', 'Referensi indikator'], ['target', 'Target & revisi'], ['cross', 'Crosswalk donor / SDG']]) + body,
    after: () => {
      const kp = $('#kPer'); if (kp) kp.onchange = e => { S.f.per = e.target.value; render(); };
      const ti = $('#tInd'); if (ti) { ti.onchange = e => { S.f.tInd = e.target.value; render(); }; const ps = periodsSorted(); const fi = S.f.tInd || 'IND-01';
        const v1 = ps.map(p => sum(rows('IndicatorTargets').filter(x => x.indicatorId === fi && x.periode === p && +x.versi === 1), x => x.target));
        const vl = ps.map(p => sum(rows('Landscapes'), l => targetAt(fi, l.id, p) || 0));
        chart('cRev', { type: 'line', data: { labels: ps, datasets: [{ label: 'Target awal (v1)', data: v1, borderColor: PAL.sand, borderDash: [6, 4], tension: .3 }, { label: 'Target berlaku', data: vl, borderColor: PAL.lagoon, tension: .3 }] } }); }
    } };
};
ACT.revise = async el => {
  const r = byId('IndicatorTargets', el.dataset.id);
  openForm('IndicatorTargets', { ...r, id: '', versi: (+r.versi || 1) + 1, alasanRevisi: '', tanggal: CONFIG.TODAY }, { only: ['target', 'alasanRevisi', 'tanggal'], note: `<div class="alert info">Membuat versi ${(+r.versi || 1) + 1} untuk ${esc(nameOf('Indicators', r.indicatorId))}, ${esc(nameOf('Landscapes', r.landscapeId))}, ${r.periode}. Target lama: <b>${nf(r.target, 1)}</b>.</div>`, beforeSave: o => { if (!o.alasanRevisi) return 'Alasan revisi wajib diisi agar jejak audit jelas.'; } });
};

/* ---------- detail indikator (drill-down) ---------- */
function indicatorDetail(id) {
  const i = byId('Indicators', id); if (!i) return; const per = S.f.per || defaultPeriod(); const a = achv(i, null, per, statusSet());
  const acts = rows('IndicatorActuals').filter(x => x.indicatorId === id).sort((x, y) => y.periode.localeCompare(x.periode));
  const evIds = uniq(acts.flatMap(x => x.evidenceIds || [])); const evs = rows('Evidence').filter(e => evIds.includes(e.id) || e.indicatorId === id);
  const revs = rows('IndicatorTargets').filter(x => x.indicatorId === id && +x.versi > 1);
  const m = modal({ wide: true, title: `<span class="light ${light(a.pct)}"></span> ${esc(i.kode)} · ${esc(i.nama)}`, body: `
    <div class="grid g4 mb"><div class="kpi"><b>${nf(a.target, 1)}</b><span>Target s.d. ${per} (${esc(i.satuan)})</span></div><div class="kpi"><b>${nf(a.actual, 1)}</b><span>Capaian ${S.f.inclVerified ? 'approved + verified' : 'approved'}</span></div><div class="kpi"><b>${pctf(a.pct)}</b><span>${lightLabel(a.pct)}</span></div><div class="kpi"><b>${evs.length}</b><span>Evidence terkait</span></div></div>
    ${tabsLocal('indT', [['ref', 'Referensi'], ['chart', 'Grafik'], ['data', 'Data capaian'], ['ev', 'Evidence'], ['disc', 'Diskusi']])}
    <div data-pane="ref"><dl class="dl"><dt>Definisi operasional</dt><dd>${esc(i.definisi)}</dd><dt>Output</dt><dd>${esc(nameOf('Outputs', i.outputId, 'pernyataan'))}</dd><dt>Satuan · frekuensi</dt><dd>${esc(i.satuan)} · ${esc(i.frekuensi)}</dd><dt>Baseline</dt><dd>${nf(i.baseline, 1)}</dd><dt>Agregasi</dt><dd>${esc(i.agregasi)}</dd><dt>Disaggregation</dt><dd>${esc(i.disaggregation)}</dd><dt>Crosswalk donor/SDG</dt><dd>${String(i.crosswalk || '').split('|').filter(Boolean).map(s => `<span class="badge blue">${esc(s.trim())}</span>`).join(' ') || '–'}</dd><dt>Sumber data</dt><dd>${esc(i.sumberData)}</dd><dt>Revisi target</dt><dd>${revs.length ? revs.length + ' baris direvisi. ' + esc(revs[0].alasanRevisi) : 'Tidak ada'}</dd></dl></div>
    <div data-pane="chart" hidden><div class="grid g2"><div><h3 class="small muted">Target vs capaian per periode</h3><div class="chart-box"><canvas id="iTrend"></canvas></div></div><div><h3 class="small muted">Per landscape (${per})</h3><div class="chart-box"><canvas id="iLs"></canvas></div></div></div></div>
    <div data-pane="data" hidden>${table('indActs', { search: false, pageSize: 8, data: acts, cols: [{ k: 'periode', label: 'Periode' }, { k: 'landscapeId', label: 'Landscape', render: r => esc(nameOf('Landscapes', r.landscapeId)) }, { k: 'nilai', label: 'Nilai', num: 1, render: r => nf(r.nilai, 1) }, { k: 'dis', label: 'P / L', render: r => r.perempuan !== '' && r.perempuan != null ? `${nf(r.perempuan)} / ${nf(r.laki)}` : '–' }, { k: 'ev', label: 'Evidence', num: 1, render: r => (r.evidenceIds || []).length }, { k: 'status', label: 'Status', render: r => statusBadge(r.status) }] })}</div>
    <div data-pane="ev" hidden>${evs.length ? `<div class="cards">${evs.slice(0, 12).map(evidenceCard).join('')}</div>` : '<div class="empty">Belum ada evidence. Unggah dari Evidence Library lalu tautkan ke indikator ini.</div>'}</div>
    <div data-pane="disc" hidden>${commentsHTML('Indicators', id)}</div>`,
    onMount: el => { bindTabsLocal(el, 'indT', k => { if (k === 'chart' && !el.dataset.charted) { el.dataset.charted = 1; const ps = periodsSorted();
      chart('iTrend', { type: 'bar', data: { labels: ps, datasets: [{ type: 'line', label: 'Target', data: ps.map(p => achv(i, null, p).target), borderColor: PAL.sand, borderDash: [5, 4], tension: .3 }, { label: 'Capaian', data: ps.map(p => achv(i, null, p, statusSet()).actual), backgroundColor: PAL.lagoon, borderRadius: 5 }] } });
      const ls = rows('Landscapes'); const d = ls.map(l => achv(i, l.id, per, statusSet()).pct);
      chart('iLs', { type: 'bar', data: { labels: ls.map(l => l.nama), datasets: [{ data: d, backgroundColor: d.map(statusColor), borderRadius: 5 }] }, options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { callback: v => v + '%' } } } } }); } });
      bindComments(el, 'Indicators', id); } });
  return m;
}
const tabsLocal = (k, list) => `<div class="tabs" data-ltabs="${k}">${list.map(([v, l], n) => `<button data-lt="${v}" class="${n ? '' : 'on'}">${l}</button>`).join('')}</div>`;
function bindTabsLocal(el, k, cb) { const w = $(`[data-ltabs="${k}"]`, el); w.onclick = e => { const b = e.target.closest('[data-lt]'); if (!b) return; $$('[data-lt]', w).forEach(x => x.classList.toggle('on', x === b)); $$('[data-pane]', el).forEach(p => p.hidden = p.dataset.pane !== b.dataset.lt); cb && cb(b.dataset.lt); }; }
function commentsHTML(ent, id) { const c = rows('Comments').filter(x => x.entity === ent && x.entityId === id).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  return `<div class="thread" data-thread>${c.map(x => `<div class="cmt"><b>${esc(x.penulis)}</b><small>${fdate(x.tanggal)}</small><p>${esc(x.teks)}</p></div>`).join('') || '<div class="muted small">Belum ada diskusi.</div>'}</div>${S.pub ? '' : `<div class="flex mt" style="flex-wrap:nowrap"><input type="text" data-cin placeholder="Tulis komentar atau pertanyaan untuk tim…" style="flex:1"><button class="btn primary" data-csend>Kirim</button></div>`}`; }
function bindComments(el, ent, id) { const b = $('[data-csend]', el); if (!b) return; b.onclick = async () => { const i = $('[data-cin]', el); if (!i.value.trim()) return; b.disabled = true; await saveRec('Comments', { entity: ent, entityId: id, penulis: CONFIG.USER, teks: i.value.trim(), tanggal: CONFIG.TODAY }); $('[data-thread]', el).outerHTML = commentsHTML(ent, id).split('<div class="flex mt"')[0]; i.value = ''; b.disabled = false; toast('Komentar terkirim. Tim terkait menerima notifikasi email.'); }; }

/* ================= CAPAIAN (input & approval) ================= */
const FLOW = ['Draft', 'Submitted', 'Verified', 'Approved'];
VIEWS.capaian = () => {
  const per = S.f.capPer || (S.f.capPer = periodsSorted().slice(-1)[0]); const P = periodObj(per); const st = S.f.capStatus || ''; const ls = S.f.capLs || '';
  const all = rows('IndicatorActuals').filter(a => a.periode === per && (!ls || a.landscapeId === ls));
  const data = all.filter(a => !st || a.status === st);
  const cnt = s => all.filter(a => a.status === s).length;
  const html = pageHead(t('capaian'), 'Staf lapangan menginput, MEL memverifikasi, manajer menyetujui. Capaian hanya bisa disetujui jika ada evidence.', `<button class="btn primary edit-only" data-act="newAct" ${P && P.locked ? 'disabled title="Periode terkunci"' : ''}>${ic('plus')} Input capaian</button><button class="btn" data-act="exportcsv" data-id="IndicatorActuals">${ic('down')} ${t('export')}</button>`) + `
  <div class="filters"><label>Periode<select id="cPer">${periodsSorted().map(p => `<option ${p === per ? 'selected' : ''}>${p}${periodObj(p).locked ? ' (terkunci)' : ''}</option>`).join('')}</select></label>
  <label>Landscape<select id="cLs"><option value="">Semua</option>${rows('Landscapes').map(l => `<option value="${l.id}" ${ls === l.id ? 'selected' : ''}>${esc(l.nama)}</option>`).join('')}</select></label>
  <div style="margin-top:16px" class="flex">${P && P.locked ? `<span class="badge red">${ic('lock')} Periode terkunci</span>` : `<span class="badge green">Periode terbuka · batas lapor ${fdate(P && P.batasLapor)}</span>`}<button class="btn sm edit-only" data-act="lockPer" data-id="${P && P.id}">${P && P.locked ? 'Buka kunci periode' : 'Kunci periode'}</button></div></div>
  <div class="steps" aria-label="Alur approval">${FLOW.map(s => `<span class="${s === st ? 'cur' : ''}" role="button" tabindex="0" data-stf="${s}" style="cursor:pointer">${s} · ${cnt(s)}</span>`).join('')}</div>
  <div class="flex mb"><button class="btn sm ${!st ? 'dark' : ''}" data-stf="">Semua status (${all.length})</button>${cnt('Rejected') ? `<button class="btn sm" data-stf="Rejected">Dikembalikan (${cnt('Rejected')})</button>` : ''}</div>
  ${P && P.locked ? '<div class="alert warn">Periode ini sudah dikunci untuk pelaporan donor. Data hanya bisa dilihat. Admin dapat membuka kunci dengan mencatat alasan.</div>' : ''}
  ${table('cap', { data, pageSize: 15, cols: [{ k: 'indicatorId', label: 'Indikator', text: r => nameOf('Indicators', r.indicatorId), render: r => `<a href="#" data-act="ind" data-id="${r.indicatorId}">${esc(byId('Indicators', r.indicatorId).kode)}</a> ${esc(nameOf('Indicators', r.indicatorId))}` }, { k: 'landscapeId', label: 'Landscape', text: r => nameOf('Landscapes', r.landscapeId), render: r => esc(nameOf('Landscapes', r.landscapeId)) }, { k: 'nilai', label: 'Nilai', num: 1, render: r => nf(r.nilai, 1) + ' <span class="muted small">' + esc(byId('Indicators', r.indicatorId).satuan) + '</span>' }, { k: 'dis', label: 'P / L', render: r => r.perempuan !== '' && r.perempuan != null ? `${nf(r.perempuan)} / ${nf(r.laki)}` : '<span class="muted">–</span>' }, { k: 'ev', label: 'Evidence', num: 1, render: r => (r.evidenceIds || []).length ? `<span class="badge green">${r.evidenceIds.length}</span>` : '<span class="badge red">0</span>', sortv: r => (r.evidenceIds || []).length }, { k: 'diinputOleh', label: 'Diinput', render: r => `<span class="small">${esc(r.diinputOleh)}<br><span class="muted">${fdate(r.tanggal)}</span></span>` }, { k: 'status', label: 'Status', render: r => statusBadge(r.status) }],
    actions: r => { if (S.pub) return ''; const lock = P && P.locked; const noEv = !(r.evidenceIds || []).length; let b = '';
      if (!lock) { if (r.status === 'Draft' || r.status === 'Rejected') b += act('flow', r.id + '|Submitted', 'Kirim', '', 'primary');
        if (r.status === 'Submitted') b += act('flow', r.id + '|Verified', 'Verifikasi', '', 'primary') + act('flow', r.id + '|Rejected', 'Kembalikan', '');
        if (r.status === 'Verified') b += `<button class="btn sm primary" data-act="flow" data-id="${r.id}|Approved" ${noEv ? 'disabled title="Lampirkan evidence dulu"' : ''}>Setujui</button>` + act('flow', r.id + '|Rejected', 'Kembalikan', '');
        if (r.status !== 'Approved') b += iconAct('editAct', r.id, 'Ubah', 'edit'); }
      return b + iconAct('cmt', r.id, 'Diskusi', 'msg'); } })}`;
  return { html, after: () => {
    $('#cPer').onchange = e => { S.f.capPer = e.target.value.split(' ')[0]; render(); }; $('#cLs').onchange = e => { S.f.capLs = e.target.value; render(); };
    $$('[data-stf]').forEach(b => { const go = () => { S.f.capStatus = b.dataset.stf; TS.cap && (TS.cap.page = 0); render(); }; b.onclick = go; b.onkeydown = e => { if (e.key === 'Enter') go(); }; });
  } };
};
function actualForm(rec) {
  const P = periodObj((rec && rec.periode) || S.f.capPer);
  openForm('IndicatorActuals', rec, { defaults: { periode: S.f.capPer, status: 'Draft', diinputOleh: CONFIG.USER, tanggal: CONFIG.TODAY, landscapeId: S.f.capLs || '' },
    note: `<div class="alert info">Isi nilai untuk periode ini saja. Sistem menjumlahkan antar periode untuk indikator kumulatif. Pilih evidence yang sudah diunggah di Evidence Library.</div>`,
    onMount: el => { const upd = () => { const ind = byId('Indicators', $('[name=indicatorId]', el).value); $('label[for=f_nilai]', el).innerHTML = `Nilai periode ini${ind ? ' (' + esc(ind.satuan) + ')' : ''} <span class="req">*</span>`; const l = $('[name=landscapeId]', el).value; $$('[data-multi=evidenceIds] label', el).forEach(x => { const e = byId('Evidence', x.querySelector('input').value); x.style.display = !l || (e && e.landscapeId === l) ? '' : 'none'; }); }; $('[name=indicatorId]', el).onchange = upd; $('[name=landscapeId]', el).onchange = upd; upd(); },
    beforeSave: o => { const p = periodObj(o.periode); if (p && p.locked) return `Periode ${o.periode} sudah dikunci. Pilih periode lain atau minta Admin membuka kunci.`;
      if (o.perempuan !== '' && o.laki !== '' && +o.perempuan + +o.laki !== +o.nilai && byId('Indicators', o.indicatorId).satuan !== '%') return `Jumlah laki-laki (${o.laki}) + perempuan (${o.perempuan}) harus sama dengan nilai (${o.nilai}).`;
      if (!rec) { const d = rows('IndicatorActuals').find(a => a.indicatorId === o.indicatorId && a.landscapeId === o.landscapeId && a.periode === o.periode); if (d) return `Sudah ada capaian untuk kombinasi ini (${d.id}, status ${d.status}). Ubah data tersebut, jangan membuat baris baru.`; } } });
}
ACT.newAct = () => actualForm(null);
ACT.editAct = el => actualForm(byId('IndicatorActuals', el.dataset.id));
ACT.cmt = el => { const id = el.dataset.id; const a = byId('IndicatorActuals', id); modal({ title: 'Diskusi capaian ' + id, body: `<p class="muted" style="margin-top:0">${esc(nameOf('Indicators', a.indicatorId))} · ${esc(nameOf('Landscapes', a.landscapeId))} · ${a.periode}</p>` + commentsHTML('IndicatorActuals', id), onMount: el2 => bindComments(el2, 'IndicatorActuals', id) }); };
ACT.flow = async el => {
  const [id, to] = el.dataset.id.split('|'); const r = byId('IndicatorActuals', id); const P = periodObj(r.periode);
  if (P && P.locked) return toast('Periode terkunci.', 1);
  if (to === 'Approved' && !(r.evidenceIds || []).length) return toast('Capaian tidak bisa disetujui tanpa evidence. Lampirkan evidence lewat tombol ubah.', 1);
  let note = `${r.status} → ${to}`;
  if (to === 'Rejected') { const why = await promptBox('Kembalikan ke penginput', 'Apa yang perlu diperbaiki?'); if (!why) return; await saveRec('Comments', { entity: 'IndicatorActuals', entityId: id, penulis: CONFIG.USER, teks: 'Dikembalikan: ' + why, tanggal: CONFIG.TODAY }); note += ': ' + why; }
  await saveRec('IndicatorActuals', { ...r, status: to }, note);
  toast({ Submitted: 'Capaian dikirim ke MEL.', Verified: 'Capaian terverifikasi, menunggu persetujuan manajer.', Approved: 'Capaian disetujui dan masuk dashboard.', Rejected: 'Capaian dikembalikan ke penginput.' }[to]); render();
};
ACT.lockPer = async el => {
  const p = byId('Periods', el.dataset.id); if (!p) return;
  if (p.locked) { const why = await promptBox('Buka kunci periode ' + p.nama, 'Alasan membuka kunci (tercatat di audit trail)'); if (!why) return; await saveRec('Periods', { ...p, locked: false }, 'Buka kunci: ' + why); }
  else { const pend = rows('IndicatorActuals').filter(a => a.periode === p.nama && a.status !== 'Approved').length; if (!(await confirmBox('Kunci periode ' + p.nama, `${pend ? `<b>${pend} capaian belum disetujui</b> dan akan ikut terkunci. ` : ''}Setelah dikunci, data periode ini tidak bisa diubah sampai Admin membuka kunci.`, 'Kunci periode'))) return; await saveRec('Periods', { ...p, locked: true }, 'Periode dikunci'); }
  toast(p.locked ? 'Kunci periode dibuka.' : 'Periode dikunci.'); render();
};
