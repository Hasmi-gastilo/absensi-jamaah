# 🧪 Testing Guide - E-Absensi Jamaah

Panduan untuk testing website E-Absensi Jamaah sebelum produksi.

## 📋 Pre-Testing Checklist

### Setup
- [ ] Firebase sudah dikonfigurasi
- [ ] Admin pertama sudah dibuat
- [ ] Website bisa diakses via localhost
- [ ] Browser mendukung (Chrome recommended)
- [ ] Kamera tersedia untuk test scanner

---

## 🔐 Testing Authentication

### Test Case 1: Login Berhasil
**Steps:**
1. Buka `index.html`
2. Masukkan email: `admin@sekolah.com`
3. Masukkan password yang benar
4. Klik "Masuk"

**Expected:**
- ✅ Loading muncul
- ✅ SweetAlert success
- ✅ Redirect ke dashboard.html
- ✅ Nama admin muncul di header

### Test Case 2: Login Gagal (Wrong Password)
**Steps:**
1. Masukkan email: `admin@sekolah.com`
2. Masukkan password salah
3. Klik "Masuk"

**Expected:**
- ✅ SweetAlert error "Password salah"
- ✅ Tetap di halaman login

### Test Case 3: Login Gagal (Email Not Found)
**Steps:**
1. Masukkan email: `notfound@test.com`
2. Masukkan password apapun
3. Klik "Masuk"

**Expected:**
- ✅ SweetAlert error "Email tidak terdaftar"

### Test Case 4: Remember Me
**Steps:**
1. Check "Ingat Saya"
2. Login berhasil
3. Close browser
4. Buka lagi

**Expected:**
- ✅ Langsung masuk ke dashboard (auto-login)

---

## 📊 Testing Dashboard

### Test Case 5: Dashboard Load
**Steps:**
1. Login dan masuk dashboard

**Expected:**
- ✅ Nama admin muncul
- ✅ Tanggal hari ini benar
- ✅ Statistik muncul (Total Siswa, Hadir, dll)
- ✅ Grafik ter-render dengan Chart.js
- ✅ Tabel aktivitas terbaru muncul

### Test Case 6: Statistics Calculation
**Steps:**
1. Pastikan ada data siswa
2. Pastikan ada data absensi hari ini
3. Cek angka statistik

**Expected:**
- ✅ Total Siswa = jumlah siswa status Aktif
- ✅ Hadir Hari Ini = unique siswa yang absen hari ini
- ✅ Persentase dihitung dengan benar

---

## 👥 Testing Data Siswa

### Test Case 7: Tambah Siswa
**Steps:**
1. Menu "Data Siswa"
2. Klik "Tambah Siswa"
3. Isi semua field:
   - NIS: 12345
   - NISN: 1234567890
   - Nama: Test Siswa
   - Jenis Kelamin: Laki-laki
   - Kelas: VII-A
   - Status: Aktif
4. Klik "Simpan"

**Expected:**
- ✅ SweetAlert success
- ✅ Modal close
- ✅ Data muncul di tabel
- ✅ Data tersimpan di Firestore

### Test Case 8: Edit Siswa
**Steps:**
1. Klik tombol edit pada siswa
2. Ubah nama menjadi "Test Siswa Updated"
3. Klik "Simpan"

**Expected:**
- ✅ SweetAlert success
- ✅ Nama ter-update di tabel
- ✅ Data ter-update di Firestore

### Test Case 9: Hapus Siswa
**Steps:**
1. Klik tombol hapus
2. Konfirmasi hapus
3. Klik "Ya, Hapus"

**Expected:**
- ✅ SweetAlert konfirmasi
- ✅ Data terhapus dari tabel
- ✅ Data terhapus dari Firestore

### Test Case 10: Search Siswa
**Steps:**
1. Ada minimal 5 siswa di database
2. Ketik nama salah satu siswa di search box

**Expected:**
- ✅ Tabel filter real-time
- ✅ Hanya siswa yang match yang muncul

### Test Case 11: Pagination
**Steps:**
1. Ada lebih dari 10 siswa
2. Cek pagination muncul
3. Klik halaman 2

**Expected:**
- ✅ Pagination buttons muncul
- ✅ Navigate ke halaman 2
- ✅ Data halaman 2 tampil

---

## 📥 Testing Import Excel

### Test Case 12: Import Excel Valid
**Steps:**
1. Menu "Import Excel"
2. Download template
3. Isi 5 data siswa di template
4. Upload file
5. Klik "Import ke Database"

**Expected:**
- ✅ Preview data muncul
- ✅ Total data: 5 siswa
- ✅ SweetAlert success
- ✅ Data masuk ke Firestore
- ✅ Data muncul di "Data Siswa"

### Test Case 13: Import Excel - Update Existing
**Steps:**
1. Import data dengan NISN yang sudah ada
2. Ubah nama siswa tersebut
3. Upload dan import

**Expected:**
- ✅ Data ter-update, tidak duplicate
- ✅ NISN tetap sama, nama ter-update

### Test Case 14: Import Excel - Invalid Format
**Steps:**
1. Upload file bukan Excel (.txt, .pdf)

**Expected:**
- ✅ Error "Format file tidak valid"

### Test Case 15: Import Excel - Empty File
**Steps:**
1. Upload Excel kosong (hanya header)

**Expected:**
- ✅ Error "File Excel kosong"

---

## 📱 Testing Generate QR

### Test Case 16: Generate QR
**Steps:**
1. Menu "Generate QR"
2. Pilih siswa dari list

**Expected:**
- ✅ QR Code muncul
- ✅ Info siswa muncul (nama, NISN, kelas)
- ✅ QR berisi NISN siswa

### Test Case 17: Download QR
**Steps:**
1. Generate QR untuk siswa
2. Klik "Download PNG"

**Expected:**
- ✅ File .png ter-download
- ✅ Nama file: `QR_[NISN]_[Nama].png`
- ✅ File bisa dibuka dan QR jelas

### Test Case 18: Print QR
**Steps:**
1. Generate QR
2. Klik "Print"

**Expected:**
- ✅ Print preview muncul
- ✅ QR dan info siswa tampil
- ✅ Bisa di-print

---

## 📷 Testing Scan QR (CRITICAL)

### Test Case 19: Scan QR - First Time
**Steps:**
1. Menu "Scan QR"
2. Pilih "Sholat Dhuha"
3. Klik "Mulai Scan"
4. Izinkan akses kamera
5. Scan QR Code siswa

**Expected:**
- ✅ Kamera aktif
- ✅ QR ter-detect
- ✅ Data siswa ditemukan
- ✅ SweetAlert success dengan info siswa
- ✅ Status waktu benar (Tepat Waktu/Terlambat)
- ✅ Data tersimpan di Firestore
- ✅ Muncul di history scan

### Test Case 20: Scan QR - Duplicate (Same Day)
**Steps:**
1. Scan QR siswa yang sudah absen hari ini
2. Untuk jenis absensi yang sama

**Expected:**
- ✅ SweetAlert warning "Absensi sudah tercatat"
- ✅ Data tidak duplicate di Firestore

### Test Case 21: Scan QR - Different Type
**Steps:**
1. Siswa sudah absen Dhuha
2. Scan untuk Zuhur

**Expected:**
- ✅ Berhasil tersimpan
- ✅ Tidak error duplicate

### Test Case 22: Scan QR - Student Not Found
**Steps:**
1. Buat QR Code manual dengan NISN random
2. Scan QR tersebut

**Expected:**
- ✅ SweetAlert error "Siswa tidak ditemukan"
- ✅ Data tidak tersimpan

### Test Case 23: Scan QR - Tepat Waktu
**Steps:**
1. Set waktu Dhuha: 06:30 - 07:30
2. Scan jam 07:00

**Expected:**
- ✅ Status: "Tepat Waktu"

### Test Case 24: Scan QR - Terlambat
**Steps:**
1. Set waktu Dhuha: 06:30 - 07:30
2. Scan jam 07:45

**Expected:**
- ✅ Status: "Terlambat"

---

## 📋 Testing Data Absensi

### Test Case 25: View Absensi
**Steps:**
1. Menu "Data Absensi"
2. Pastikan ada data absensi

**Expected:**
- ✅ Data muncul di tabel
- ✅ Default filter: hari ini
- ✅ Semua kolom tampil lengkap

### Test Case 26: Filter by Date
**Steps:**
1. Pilih tanggal kemarin
2. Klik apply filter

**Expected:**
- ✅ Tabel update dengan data tanggal kemarin

### Test Case 27: Filter by Jenis
**Steps:**
1. Pilih "Sholat Dhuha"
2. Apply

**Expected:**
- ✅ Hanya absensi Dhuha yang muncul

### Test Case 28: Search Absensi
**Steps:**
1. Ketik nama siswa di search

**Expected:**
- ✅ Real-time filter
- ✅ Hanya data siswa tersebut muncul

---

## 📈 Testing Laporan

### Test Case 29: Generate Report
**Steps:**
1. Menu "Laporan"
2. Pilih tanggal mulai dan akhir
3. Klik "Filter"

**Expected:**
- ✅ Data muncul sesuai periode
- ✅ Total data benar

### Test Case 30: Export Excel
**Steps:**
1. Generate report
2. Klik "Export Excel"

**Expected:**
- ✅ File .xlsx ter-download
- ✅ Data lengkap di Excel
- ✅ Format rapi

### Test Case 31: Export PDF
**Steps:**
1. Generate report
2. Klik "Export PDF"

**Expected:**
- ✅ File .pdf ter-download
- ✅ Data lengkap di PDF
- ✅ Format rapi dengan tabel

### Test Case 32: Print Report
**Steps:**
1. Generate report
2. Klik "Print"

**Expected:**
- ✅ Print preview muncul
- ✅ Format sesuai untuk print

---

## ⚙️ Testing Settings

### Test Case 33: Update School Info
**Steps:**
1. Menu "Settings"
2. Ubah nama sekolah
3. Ubah alamat
4. Klik "Simpan"

**Expected:**
- ✅ SweetAlert success
- ✅ Data ter-update di Firestore
- ✅ Nama sekolah update di header

### Test Case 34: Update Time Settings
**Steps:**
1. Ubah jam Dhuha: 06:00 - 07:00
2. Klik "Simpan Waktu"

**Expected:**
- ✅ SweetAlert success
- ✅ Data ter-update
- ✅ Scan QR menggunakan waktu baru

### Test Case 35: Invalid Time Settings
**Steps:**
1. Set jam mulai: 07:30
2. Set jam terakhir: 06:30 (lebih awal)
3. Simpan

**Expected:**
- ✅ Error "Jam mulai harus lebih awal"

---

## 👤 Testing Admin Management

### Test Case 36: Add New Admin
**Steps:**
1. Menu "Admin"
2. Klik "Tambah Admin"
3. Isi:
   - Email: operator@sekolah.com
   - Password: operator123
   - Nama: Operator
   - Role: Operator
4. Simpan

**Expected:**
- ✅ User dibuat di Firebase Auth
- ✅ Data tersimpan di Firestore
- ✅ Muncul di tabel admin

### Test Case 37: Edit Admin
**Steps:**
1. Edit admin yang baru dibuat
2. Ubah role menjadi "Super Admin"
3. Simpan

**Expected:**
- ✅ Data ter-update
- ✅ Role berubah

### Test Case 38: Delete Admin
**Steps:**
1. Hapus admin
2. Konfirmasi

**Expected:**
- ✅ Data terhapus dari Firestore
- ✅ Hilang dari tabel

### Test Case 39: Login as Operator
**Steps:**
1. Logout
2. Login dengan operator@sekolah.com

**Expected:**
- ✅ Berhasil login
- ✅ Akses ke semua menu

---

## 📱 Testing Responsive Design

### Test Case 40: Mobile View
**Steps:**
1. Buka website di mobile atau resize browser ke 375px
2. Test semua halaman

**Expected:**
- ✅ Sidebar collapse dengan toggle button
- ✅ Tabel responsive dengan scroll
- ✅ Form responsive
- ✅ Cards stack vertical
- ✅ Buttons tidak terpotong

### Test Case 41: Tablet View
**Steps:**
1. Resize ke 768px

**Expected:**
- ✅ Layout adjust dengan baik
- ✅ Sidebar tetap accessible

---

## 🔒 Testing Security

### Test Case 42: Access Without Login
**Steps:**
1. Logout
2. Akses dashboard.html langsung via URL

**Expected:**
- ✅ Auto-redirect ke login

### Test Case 43: Session Management
**Steps:**
1. Login
2. Buka tab baru
3. Logout di tab pertama
4. Refresh tab kedua

**Expected:**
- ✅ Tab kedua auto-redirect ke login

---

## 🐛 Bug Reporting Template

Jika menemukan bug, catat dengan format:

```
**Bug Title:** [Deskripsi singkat]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[Apa yang seharusnya terjadi]

**Actual Result:**
[Apa yang terjadi]

**Screenshot/Video:**
[Attach jika ada]

**Browser:** Chrome 120
**OS:** Windows 11
**Date:** 2024-01-15
```

---

## ✅ Testing Completion Checklist

- [ ] Semua test case berhasil
- [ ] Tidak ada critical bugs
- [ ] Performance acceptable (load < 3s)
- [ ] Mobile responsive works
- [ ] Scanner works di laptop & HP
- [ ] Import Excel works
- [ ] Export Excel & PDF works
- [ ] Semua validasi berjalan
- [ ] No console errors

---

**Testing Status:** ⏳ In Progress
**Last Updated:** January 15, 2024
**Tested By:** [Your Name]
