# MIS Blue Forests – versi web (HTML + CSS + JavaScript)

Buka `index.html` langsung di browser (butuh internet untuk font, Chart.js, Leaflet, dan peta dasar).

- `css/style.css` – desain
- `js/data.js` – data dummy
- `js/api.js` – lapisan data. Di sini data disimpan di localStorage browser; ganti fungsi di dalamnya dengan `fetch()` ke REST API Anda (mis. Supabase/Node) tanpa mengubah tampilan.
- `js/core.js` – state, schema tabel, komponen tabel/form/modal, navigasi
- `js/views_a.js` – Dashboard, Peta, Program, KMEL, Input & Approval Capaian
- `js/views_b.js` – Aktivitas, Penerima & Stakeholder, Evidence, Pengetahuan, Dokumen
- `js/views_c.js` – Pelaporan, Migrasi & Kualitas Data, Admin, Bantuan

Untuk mengembalikan data ke awal: Admin › Changelog › "Kembalikan data demo ke awal".
Frontend ini sama persis dengan versi Apps Script; bedanya hanya `api.js`.
