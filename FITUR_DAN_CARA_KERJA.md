# 📋 Fitur dan Cara Kerja E-Absensi Jamaah

## 🎯 Fitur Utama

### 1. 🔐 Login & Authentication
- Login menggunakan Firebase Authentication
- Role-based access (Super Admin & Operator)
- Session management otomatis
- Auto-redirect jika belum login

**Cara Kerja:**
1. Admin memasukkan email dan password
2. Firebase Authentication memverifikasi
3. Sistem mengecek data admin di Firestore
4. Jika valid, redirect ke dashboard

---

### 2. 📊 Dashboard
- Statistik real-time kehadiran
- Grafik kehadiran harian, mingguan, bulanan
- Persentase kehadiran hari ini
- Aktivitas absensi terbaru

**Data yang Ditampilkan:**
- Total Siswa Aktif
- Jumlah Hadir Hari Ini
- Jumlah Terlambat
- Jumlah Belum Hadir
- Grafik visual dengan Chart.js

**Cara Kerja:**
1. System query data siswa aktif
2. Query absensi hari ini
3. Hitung statistik
4. Render grafik dan card statistik

---

### 3. 👥 Data Siswa (CRUD)
- Tambah siswa manual
- Edit data siswa
- Hapus siswa
- Pencarian & Filter
- Pagination

**Field Data Siswa:**
- NIS (opsional)
- NISN (wajib, unik)
- Nama
- Jenis Kelamin
- Kelas
- Alamat
- No HP
- Status (Aktif/Tidak Aktif)

**Cara Kerja:**
1. Admin klik "Tambah Siswa"
2. Isi form data siswa
3. Data disimpan ke Firestore collection "students"
4. Data ditampilkan di tabel dengan pagination

---

### 4. 📥 Import Excel
- Import data siswa massal dari Excel
- Preview data sebelum import
- Validasi format data
- Update otomatis jika NISN sudah ada

**Format Excel:**
```
| NIS | NISN | Nama | Jenis Kelamin | Kelas | Alamat | No HP | Status |
```

**Cara Kerja:**
1. Admin upload file Excel (.xlsx/.xls)
2. SheetJS membaca file dan convert ke JSON
3. System validasi setiap row data
4. Preview data dalam tabel
5. Admin klik "Import"
6. Data batch insert ke Firestore
7. Jika NISN sudah ada, data akan di-update

**Keunggulan:**
- ✅ Tidak perlu input manual satu per satu
- ✅ Bisa import ratusan data sekaligus
- ✅ Auto-update jika data sudah ada

---

### 5. 📱 Generate QR Code
- Generate QR Code per siswa
- QR berisi NISN siswa
- Download QR sebagai PNG
- Print QR langsung

**Isi QR Code:**
```
NISN siswa (contoh: 1234567890)
```

**Cara Kerja:**
1. Admin pilih siswa dari list
2. QRCode.js generate QR dari NISN
3. QR ditampilkan di layar
4. Admin bisa download atau print
5. QR dibagikan ke siswa

**Tips:**
- Print QR dalam kartu ID atau sticker
- Laminating QR agar tahan lama
- Satu QR per siswa untuk semua jenis absensi

---

### 6. 📷 Scan QR Code
- Scan QR menggunakan kamera
- Support laptop dan HP camera
- Real-time validation
- Auto-save absensi

**Cara Kerja:**
1. Operator pilih jenis absensi (Dhuha/Zuhur)
2. Klik "Mulai Scan"
3. Browser minta izin kamera
4. html5-qrcode aktif untuk scan
5. QR Code discan
6. System baca NISN dari QR
7. Query data siswa di Firestore berdasarkan NISN
8. Jika siswa ditemukan:
   - Cek apakah sudah absen hari ini untuk jenis yang sama
   - Jika belum, cek waktu scan
   - Tentukan status: Tepat Waktu atau Terlambat
   - Simpan data absensi
   - Tampilkan notifikasi sukses
9. Jika siswa tidak ditemukan:
   - Tampilkan error "Siswa tidak ditemukan"

**Validasi:**
- ✅ NISN harus terdaftar
- ✅ Status siswa harus Aktif
- ✅ Tidak boleh scan 2x untuk jenis absensi yang sama di hari yang sama
- ✅ Waktu scan dicatat dan dibandingkan dengan setting jam

---

### 7. ⏰ Setting Waktu Absensi
- Atur jam mulai dan jam terakhir
- Untuk Sholat Dhuha dan Sholat Zuhur
- Menentukan status Tepat Waktu atau Terlambat

**Default Setting:**
```
Sholat Dhuha:
- Jam Mulai: 06:30
- Jam Terakhir: 07:30

Sholat Zuhur:
- Jam Mulai: 11:30
- Jam Terakhir: 12:30
```

**Cara Kerja Status:**
```javascript
if (jamScan <= jamTerakhir) {
    status = "Tepat Waktu";
} else {
    status = "Terlambat";
}
```

**Contoh:**
- Scan jam 07:15 untuk Dhuha = Tepat Waktu ✅
- Scan jam 07:45 untuk Dhuha = Terlambat ⚠️
- Scan jam 12:00 untuk Zuhur = Tepat Waktu ✅
- Scan jam 12:45 untuk Zuhur = Terlambat ⚠️

---

### 8. 📋 Data Absensi
- View semua data absensi
- Filter by tanggal
- Filter by jenis absensi
- Filter by status waktu
- Search by nama/NISN
- Pagination

**Data yang Ditampilkan:**
- Tanggal
- Jam
- NISN
- Nama Siswa
- Kelas
- Jenis Absensi
- Status Waktu
- Operator (yang melakukan scan)

**Cara Kerja:**
1. System load data dari collection "attendance"
2. Tampilkan dengan filter default (hari ini)
3. User bisa ganti filter
4. System re-query dengan filter baru
5. Data ditampilkan dengan pagination

---

### 9. 📈 Laporan
- Generate laporan by periode
- Filter by kelas
- Filter by jenis absensi
- Export ke Excel
- Export ke PDF
- Print laporan

**Filter Laporan:**
- Tanggal Mulai - Tanggal Akhir
- Kelas (opsional)
- Jenis Absensi (opsional)

**Cara Kerja Export Excel:**
1. Ambil data sesuai filter
2. SheetJS convert data ke Excel format
3. Generate file .xlsx
4. Auto-download

**Cara Kerja Export PDF:**
1. Ambil data sesuai filter
2. jsPDF generate PDF
3. jsPDF-autotable buat tabel
4. Auto-download

---

### 10. 👤 Manajemen Admin
- Tambah admin baru
- Edit data admin
- Hapus admin
- Role: Super Admin / Operator

**Perbedaan Role:**
- **Super Admin:** Akses penuh ke semua fitur
- **Operator:** Fokus untuk scan absensi (bisa dikustomisasi)

**Cara Kerja:**
1. Super Admin buat user baru di Firebase Auth
2. Simpan data admin ke Firestore
3. Admin baru bisa login dengan email/password

---

### 11. ⚙️ Settings
- Informasi Sekolah (Nama, Alamat, Logo)
- Pengaturan Waktu Absensi

**Cara Kerja:**
1. Data settings disimpan di collection "settings"
2. Document "school" untuk info sekolah
3. Document "time" untuk setting waktu
4. Data ini digunakan di seluruh aplikasi

---

## 🔄 Alur Kerja Lengkap

### Setup Awal:
1. ✅ Install dan konfigurasi Firebase
2. ✅ Buat admin pertama
3. ✅ Login ke aplikasi
4. ✅ Atur setting sekolah dan waktu
5. ✅ Import data siswa dari Excel
6. ✅ Generate QR Code untuk semua siswa
7. ✅ Print dan bagikan QR ke siswa

### Operasional Harian:
1. 📷 Operator login
2. 📷 Pilih jenis absensi (Dhuha/Zuhur)
3. 📷 Scan QR Code siswa satu per satu
4. 📊 Pantau dashboard untuk statistik
5. 📋 Cek data absensi
6. 📈 Export laporan jika diperlukan

---

## 🎨 Teknologi yang Digunakan

### Frontend:
- **HTML5** - Struktur halaman
- **CSS3** - Styling dengan gradient purple
- **JavaScript Vanilla** - Logika aplikasi
- **Bootstrap 5** - UI Framework
- **Chart.js** - Grafik statistik
- **SweetAlert2** - Alert & notification
- **SheetJS** - Import/Export Excel
- **QRCode.js** - Generate QR Code
- **html5-qrcode** - Scan QR Code

### Backend:
- **Firebase Authentication** - Login & user management
- **Firebase Firestore** - Database NoSQL
- **Firebase Storage** - Penyimpanan file (opsional)

---

## 📊 Struktur Database Firestore

### Collection: students
```javascript
{
  id: "auto-generated",
  nis: "12345",
  nisn: "1234567890",
  nama: "Ahmad Rizki",
  jenisKelamin: "Laki-laki",
  kelas: "VII-A",
  alamat: "Jl. Mawar No. 10",
  noHp: "081234567890",
  status: "Aktif",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: attendance
```javascript
{
  id: "auto-generated",
  nisn: "1234567890",
  nama: "Ahmad Rizki",
  kelas: "VII-A",
  jenisAbsensi: "Sholat Dhuha",
  tanggal: "2024-01-15",
  jam: "06:45",
  statusWaktu: "Tepat Waktu",
  operator: "Admin",
  timestamp: timestamp
}
```

### Collection: admins
```javascript
{
  id: "uid-from-firebase-auth",
  email: "admin@sekolah.com",
  nama: "Administrator",
  role: "Super Admin",
  status: "Aktif",
  lastLogin: timestamp,
  createdAt: timestamp
}
```

### Collection: settings
```javascript
// Document: school
{
  name: "SMP Negeri 1",
  address: "Jl. Pendidikan No. 1",
  logo: "https://..."
}

// Document: time
{
  dhuhaStart: "06:30",
  dhuhaEnd: "07:30",
  zuhurStart: "11:30",
  zuhurEnd: "12:30"
}
```

---

## 🔒 Keamanan

### Authentication:
- ✅ Login required untuk semua halaman
- ✅ Session management
- ✅ Auto-logout jika session expired

### Firestore Rules:
- ✅ Read/Write hanya untuk authenticated users
- ✅ Data terisolasi per collection
- ✅ Validasi di level database

### Client-Side:
- ✅ Input validation
- ✅ XSS protection
- ✅ Sanitasi data

---

## 🚀 Performa

### Optimasi:
- ✅ Firestore offline persistence
- ✅ Pagination untuk data besar
- ✅ Lazy loading gambar
- ✅ Minified libraries

### Caching:
- ✅ Browser caching untuk static assets
- ✅ Firestore caching untuk data

---

## 📱 Responsive Design

- ✅ Desktop (1920x1080)
- ✅ Laptop (1366x768)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

Sidebar otomatis collapse di mobile dengan toggle button.

---

**Dokumentasi Lengkap - E-Absensi Jamaah** 🎓
