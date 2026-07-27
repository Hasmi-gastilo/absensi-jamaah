# ⚡ Quick Start Guide - E-Absensi Jamaah

Panduan cepat untuk memulai dalam **15 menit**!

---

## 📋 Prerequisites

- ✅ Browser modern (Chrome recommended)
- ✅ Koneksi internet
- ✅ Text editor (VS Code, Sublime, Notepad++)
- ✅ Python atau Node.js (untuk local server)

---

## 🚀 5 Langkah Setup

### Step 1: Setup Firebase (5 menit)

1. Buka https://console.firebase.google.com/
2. Buat project baru: `e-absensi-jamaah`
3. Aktifkan:
   - ✅ Authentication (Email/Password)
   - ✅ Firestore Database
4. Buat user pertama:
   - Email: `admin@sekolah.com`
   - Password: `admin123`
   - **COPY UID-nya!**
5. Copy Firebase config

**Detail lengkap:** Lihat `KONFIGURASI_FIREBASE.md`

---

### Step 2: Setup Database (3 menit)

Di Firestore, buat:

**Collection 1: admins**
```
Document ID: [paste UID dari step 1]
Fields:
  - email: "admin@sekolah.com"
  - nama: "Administrator"
  - role: "Super Admin"
  - status: "Aktif"
```

**Collection 2: settings**
```
Document ID: "school"
Fields:
  - name: "SMP Negeri 1"
  - address: "Jl. Pendidikan No. 1"
  - logo: ""

Document ID: "time"
Fields:
  - dhuhaStart: "06:30"
  - dhuhaEnd: "07:30"
  - zuhurStart: "11:30"
  - zuhurEnd: "12:30"
```

---

### Step 3: Update Config (2 menit)

1. Extract file project
2. Buka `assets/js/firebase.js`
3. Ganti Firebase config dengan punya Anda
4. Save

---

### Step 4: Run Server (2 menit)

**Pilih salah satu:**

**Python:**
```bash
cd e-absensi-jamaah
python -m http.server 8000
```
Buka: http://localhost:8000

**Node.js:**
```bash
npx serve
```

**VS Code:**
- Install "Live Server" extension
- Right-click `index.html` > Open with Live Server

---

### Step 5: Login & Test (3 menit)

1. Login dengan:
   - Email: `admin@sekolah.com`
   - Password: `admin123`

2. Test fitur:
   - ✅ Dashboard muncul
   - ✅ Tambah 1 siswa manual
   - ✅ Generate QR Code
   - ✅ Scan QR (izinkan kamera)

✅ **Done! Website siap digunakan!**

---

## 📱 Workflow Harian

### Setup Awal (Sekali saja):
1. ✅ Import data siswa dari Excel
2. ✅ Generate QR untuk semua siswa
3. ✅ Print QR dan bagikan

### Operasional Harian:
1. 🔐 Login sebagai Operator
2. 📷 Buka "Scan QR"
3. 📷 Pilih jenis: Dhuha atau Zuhur
4. 📷 Scan QR siswa satu per satu
5. 📊 Pantau dashboard
6. 📈 Export laporan (akhir hari/minggu/bulan)

---

## 🎯 Tips Penggunaan

### Import Data Excel:
1. Download template di menu "Import Excel"
2. Isi data di Excel:
   - Kolom wajib: NISN, Nama, Kelas
   - Bisa ratusan data sekaligus
3. Upload dan import

### Generate QR:
1. Menu "Generate QR"
2. Pilih siswa
3. Download PNG
4. Print dan laminating (agar awet)
5. Bagikan ke siswa

### Scan Absensi:
1. Pastikan kamera berfungsi
2. Browser harus izinkan kamera
3. QR harus jelas (tidak blur)
4. Scan dalam cahaya yang cukup

### Laporan:
1. Menu "Laporan"
2. Pilih periode tanggal
3. Filter sesuai kebutuhan
4. Export Excel atau PDF

---

## ❓ FAQ - Pertanyaan Sering Ditanya

### Q: Apakah perlu internet?
**A:** Ya, karena menggunakan Firebase. Butuh koneksi internet untuk sync data.

### Q: Apakah bisa offline?
**A:** Firestore memiliki offline persistence, data akan sync saat online kembali.

### Q: Berapa biaya Firebase?
**A:** Firebase memiliki free tier yang cukup untuk sekolah menengah. Gratis hingga:
- 50K reads/day
- 20K writes/day
- 1GB storage

### Q: Apakah aman?
**A:** Ya, menggunakan:
- Firebase Authentication
- Firestore Security Rules
- HTTPS encryption

### Q: Bisa custom jam absensi?
**A:** Bisa! Menu "Settings" > ubah jam Dhuha dan Zuhur.

### Q: Bisa tambah jenis absensi lain?
**A:** Perlu modifikasi code. Lihat `TODO.md` untuk future features.

### Q: Scanner tidak jalan di HP?
**A:** Pastikan:
- Browser Chrome
- HTTPS atau localhost
- Izinkan akses kamera

### Q: QR Code buram saat print?
**A:** Download QR sebagai PNG dengan resolusi tinggi, jangan screenshot.

### Q: Import Excel error?
**A:** Pastikan:
- Format .xlsx atau .xls
- Header kolom sesuai template
- NISN tidak kosong

---

## 🆘 Troubleshooting Cepat

| Problem | Solution |
|---------|----------|
| Login gagal | Cek email/password & Firestore data admin |
| Data tidak muncul | Cek koneksi internet & Firestore rules |
| Scanner tidak aktif | Gunakan Chrome, izinkan kamera, pakai localhost |
| Import error | Download template baru, ikuti format exact |
| QR tidak terbaca | Print dengan kualitas tinggi, cahaya cukup |

---

## 📞 Butuh Bantuan?

1. **Baca dokumentasi:**
   - `README.md` - Overview
   - `PANDUAN_INSTALASI.md` - Detail setup
   - `FITUR_DAN_CARA_KERJA.md` - Cara pakai

2. **Cek Console Browser:**
   - Press F12
   - Lihat tab Console
   - Screenshot error jika ada

3. **Verifikasi Firebase:**
   - Cek Authentication > Users
   - Cek Firestore > Data
   - Cek Rules sudah publish

---

## 🎓 Next Steps

Setelah setup selesai:

1. ✅ Ganti info sekolah di Settings
2. ✅ Import semua data siswa
3. ✅ Generate & distribusi QR
4. ✅ Training operator untuk scan
5. ✅ Mulai gunakan sistem

**Selamat menggunakan E-Absensi Jamaah!** 🎉

---

## 🔗 Useful Links

- **Firebase Console:** https://console.firebase.google.com/
- **Bootstrap Icons:** https://icons.getbootstrap.com/
- **Chart.js Examples:** https://www.chartjs.org/docs/latest/samples/

---

**Quick Start Guide v1.0**  
**Last Updated:** 15 Januari 2024  
**Estimated Time:** 15 menit ⏱️
