# Bosshire Design Test — UpNext

AI Product Design Challenge untuk Bosshire: mobile AI-powered job portal
experience untuk talenta digital Indonesia yang mengincar pekerjaan
global remote.

Konsep: **"Global Remote Reality Check & Reachout Decision Hub"**, membantu
job seeker memvalidasi apakah sebuah lowongan remote benar-benar bisa
dikerjakan dari Indonesia, seberapa besar overlap jam kerjanya, dan berapa
nilai bersih gajinya dalam Rupiah.

## Cara menjalankan

Static site tanpa build step (Tailwind via browser CDN, vanilla JS).
Harus lewat HTTP server, bukan `file://`, karena script dimuat relatif.

```bash
python3 -m http.server 8000
```

Lalu buka http://localhost:8000

## Isi repo

### Prototype
| File | Keterangan |
| --- | --- |
| `index.html` | Entry point, mobile workbench viewport (393x852 iOS / 360x800 Android) |
| `app.js` | Shell prototype, screen switcher, critical-state switcher, canvas view |
| `interview-coach.js` | Flow Interview Coach (8 layar) |
| `styles.css` | Styling prototype |
| `tokens.css` | Design token (warna, tipografi, radius, spacing) |
| `icons.js` | 245 Hugeicons, stroke 1.5 |

### Dokumen & referensi
| File | Keterangan |
| --- | --- |
| `BRIEF.md` | Requirement dan bobot penilaian dari soal tes |
| `BRAINSTORMING.md` | Problem & product thinking, AI & human collaboration, peta alur layar |
| `HANDOFF_CONTEXT.md` | Konteks lengkap untuk melanjutkan di mesin lain |
| `brainstorm-board.html` | Papan visual brainstorm ala FigJam |
| `design-system.html` | Bosshire Design System lengkap (light mode) |

### Aset
`bosshire-logo.png`, `bosshire-ai-blob.png`, `onboarding-hero.png`, `linkedin-logo.svg`

## Design system

Diadaptasi dari LnD Design System (Option A).

- Tipografi: DM Sans (weight 400 & 500), Geist Mono dengan `tabular-nums` untuk angka
- Primary (Steel Navy): `#44658B`, hover `#355070`
- AI signal (Warm Amber): `#F79626`
- Radius ladder: 24px dialog, 18px card, 14px frame dalam card, 10px inner item
- Semua kontrol berbentuk full pill (`999px`), flat, tanpa gradient

## Kredit aset

Logo perusahaan di `logos/` adalah logo dummy, dipotong dari satu set
"Flat Logo Collection" karya Freepik (`logos-source.svg`). Semuanya bentuk
geometris generik, bukan merek nyata. Lisensi gratis Freepik mewajibkan
atribusi, jadi kredit ini harus ikut kalau prototype dipublikasikan.
