# Changelog E-Absensi Jamaah

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-07-27

### ✨ New Features
- ✅ **Ubah Email/Password di Admin** - Tombol 🔑 untuk update credentials
- ✅ **Smart Pagination** - Hanya tampilkan 1-5 halaman dengan smart window
- ✅ **Sidebar Scrollable** - Fix sidebar yang tidak bisa scroll di mobile

### 🎨 UI/UX Improvements
- ✅ **Minimalist Design** - Semua ukuran dikurangi untuk tampilan lebih rapi
- ✅ **Compact Sidebar** - Logo 60px, padding 20px, font 14px
- ✅ **Smaller Cards & Content** - Padding 18-20px, border 15px
- ✅ **Smaller Tables** - Font 12px, padding 10px 12px
- ✅ **Smaller Buttons & Forms** - Button 8px 16px, form input 8px 12px
- ✅ **Better Mobile Responsiveness** - No cut-off, semua fits properly

### 🐛 Bug Fixes
- ✅ **Fix sidebar scrolling** - Sidebar bisa scroll untuk melihat semua menu
- ✅ **Fix pagination** - Hanya max 5 halaman ditampilkan

### 📚 Documentation
- ✅ `PENYEMPURNAAN_UI.md` - Dokumentasi lengkap UI improvements
- ✅ `UPDATE_BRANDING.md` - Update branding & fix laporan
- ✅ `PERUBAHAN_QR_CODE.md` - QR Code integration

### 🔧 Technical Details
- Smart Pagination Window: max 5 pages with "..." indicator
- CSS optimization: reduced padding, font sizes, and border radius
- Sidebar: flex layout dengan overflow-y: auto
- Admin credentials: updateEmail() & updatePassword() Firebase Auth

---

### ✨ New Features
- ✅ **QR Code terintegrasi di tabel Data Siswa** - Tombol QR langsung di setiap baris siswa
- ✅ **Modal QR Code** - Popup dengan preview QR, info siswa lengkap
- ✅ **Download QR** - Download QR sebagai PNG dengan format nama file otomatis
- ✅ **Print QR** - Print QR dengan template yang rapi dan profesional
- ✅ **QR Code unik per siswa** - Berdasarkan NISN, tidak bisa dipalsukan

### 🎨 Branding
- ✅ **Update nama aplikasi** - "Absensi Jama'ah SMK Negeri 1 Sangasanga"
- ✅ **Update sidebar** - "Absensi SMK N 1 Sangasanga"
- ✅ **Update semua title** - Browser tab menampilkan nama sekolah
- ✅ **Update print QR** - Footer dengan nama sekolah lengkap
- ✅ **Update PDF laporan** - Header dengan nama sekolah

### 🔄 Changes
- ❌ **Menu "Generate QR" dihapus** - Diganti dengan tombol QR di tabel siswa
- ✅ **Simplifikasi navigasi** - Sidebar menu lebih ringkas
- ✅ **Workflow lebih efisien** - Generate QR hanya 1 klik dari tabel

### 🐛 Bug Fixes
- ✅ **Fix error Storage** - Menghapus inisialisasi Firebase Storage yang tidak digunakan
- ✅ **Fix script loading order** - utils.js dimuat sebelum page scripts
- ✅ **Fix students query** - Sorting client-side, tidak perlu Firestore index
- ✅ **Fix error laporan** - Query tanpa orderBy(), sorting di client-side
- ✅ **Fix "Gagal membuat laporan"** - Tidak perlu composite index lagi

### 📚 Documentation
- ✅ `PERUBAHAN_QR_CODE.md` - Dokumentasi lengkap perubahan QR Code
- ✅ `UPDATE_BRANDING.md` - Dokumentasi branding & fix laporan
- ✅ `FIRESTORE_RULES_FIX.md` - Panduan fix permission error
- ✅ `CARA_PUBLISH_RULES.txt` - Panduan cepat publish Firestore Rules
- ✅ `STATUS_PERBAIKAN.md` - Status progress dan perbaikan

### 🔧 Technical
- Library: QRCode.js v1.0.0 (CDN)
- QR Size: 256x256px
- QR Color: #7C3AED (purple brand)
- Error Correction Level: H (highest)
- Client-side sorting untuk menghindari composite index

---

## [1.0.0] - 2024-01-15

### ✨ Features
- ✅ Login sistem dengan Firebase Authentication
- ✅ Dashboard dengan statistik real-time
- ✅ CRUD Data Siswa lengkap
- ✅ Import data siswa dari Excel (batch import)
- ✅ Generate QR Code per siswa
- ✅ Scan QR Code untuk absensi
- ✅ Pengaturan waktu absensi Dhuha & Zuhur
- ✅ Auto-detect status: Tepat Waktu / Terlambat
- ✅ Validasi absensi (tidak boleh scan 2x)
- ✅ Data absensi dengan filter & search
- ✅ Laporan dengan export Excel & PDF
- ✅ Manajemen admin (Super Admin & Operator)
- ✅ Settings sekolah dan waktu
- ✅ Grafik kehadiran (harian, mingguan, bulanan)
- ✅ UI modern dengan purple gradient theme
- ✅ Responsive design (desktop & mobile)
- ✅ Offline persistence dengan Firestore
- ✅ Real-time updates

### 🎨 Design
- Purple gradient color scheme (#7C3AED, #8B5CF6, #A855F7)
- Soft shadow & rounded cards
- Glassmorphism effects
- Bootstrap Icons
- Poppins font family
- Smooth animations & transitions

### 🔒 Security
- Firebase Authentication
- Firestore security rules
- Session management
- Input validation
- XSS protection

### 📱 Compatibility
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Mobile browsers ✅

### 📚 Documentation
- README.md - Dokumentasi utama
- PANDUAN_INSTALASI.md - Panduan lengkap instalasi
- FITUR_DAN_CARA_KERJA.md - Dokumentasi fitur
- Template Excel untuk import data

## Future Updates (Planned)

### Version 1.1.0 (Coming Soon)
- [ ] Export QR Code batch (semua siswa sekaligus)
- [ ] Notifikasi push untuk siswa belum absen
- [ ] Statistik per kelas
- [ ] Rekap kehadiran per siswa
- [ ] Dark mode theme
- [ ] Multi-language support
- [ ] Backup & restore database

### Version 1.2.0
- [ ] SMS gateway untuk notifikasi
- [ ] WhatsApp bot integration
- [ ] Absensi via GPS location
- [ ] Face recognition
- [ ] Mobile app (Android/iOS)

---

**Maintained by:** E-Absensi Jamaah Team
**Last Updated:** January 15, 2024
