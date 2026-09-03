# Wheel Spot — Frontend

Prototipe frontend aplikasi ketersediaan & sesi parkir, dibangun dari desain Figma.
HTML/CSS/JS statis — **tanpa build step**. Buka `index.html` di browser (atau jalankan
`npx serve` / Live Server dari folder ini).

## Halaman & alur

| File | Layar | Terhubung ke |
|---|---|---|
| `index.html` | Splash → redirect | `login.html` |
| `login.html` | Masuk ke Akun | `home.html`, `register.html` |
| `register.html` | Create Account | `home.html`, `login.html` |
| `home.html` | Home + ringkasan sistem + lokasi pantauan | `find.html`, `map.html`, `location.html`, `profile.html` |
| `find.html` | Lokasi Parkir + filter | `location.html`, `find-history.html` |
| `find-history.html` | Riwayat Pengecekan Ketersediaan | `location.html` |
| `location.html` | Detail lokasi (status FULL + alternatif) | `map.html`, `dashboard.html` |
| `map.html` | Live Parking Map (grid slot interaktif) | `dashboard.html` |
| `dashboard.html` | Dashboard Sesi — 5 state | `receipt.html`, `map.html` |
| `receipt.html` | Struk Parkir — gagal / selesai | `home.html`, `contact.html` |
| `news.html` | Live Parking Updates | `ratings.html`, `contact.html`, `location.html` |
| `ratings.html` | Location Ratings + form review | — |
| `contact.html` | Hubungi Kami | — |
| `profile.html` | Profile Overview | `edit-profile.html`, `dashboard.html`, `login.html` |
| `edit-profile.html` | Edit Profile | `profile.html` |

### State dashboard
`dashboard.html?state=` → `menuju` · `verifikasi` · `valid` (default) · `salah` · `denda`.
Segmented control di atas kartu untuk berpindah state.

### State struk
`receipt.html?state=` → `failed` (default) · `success`.

## Struktur
- `assets/styles.css` — design system (token warna, komponen, breakpoint responsif 1024/900/680/420px)
- `assets/app.js` — toast, form palsu, star rating, filter live, state machine dashboard, generator peta parkir
- `assets/LOGO_FIX copy2.png` — logo mark (dipakai sebagai favicon + brand mark; di-crop via CSS `.logo`)

## Catatan
Semua form bersifat demo (tidak ada backend) — submit memunculkan toast lalu, bila relevan, pindah halaman.

# frontend-wheel-spot
