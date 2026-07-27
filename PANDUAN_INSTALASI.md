# 📖 Panduan Instalasi E-Absensi Jamaah

## Langkah 1: Persiapan Firebase

### 1.1 Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Add Project"** atau **"Tambah Project"**
3. Masukkan nama project: **"E-Absensi-Jamaah"**
4. Matikan Google Analytics (opsional)
5. Klik **"Create Project"**

### 1.2 Aktifkan Authentication

1. Di menu kiri, pilih **"Authentication"**
2. Klik **"Get Started"**
3. Pilih **"Email/Password"**
4. Toggle **"Email/Password"** menjadi **Enabled**
5. Klik **"Save"**

### 1.3 Aktifkan Firestore Database

1. Di menu kiri, pilih **"Firestore Database"**
2. Klik **"Create Database"**
3. Pilih **"Start in production mode"**
4. Pilih lokasi server (pilih yang terdekat)
5. Klik **"Enable"**

### 1.4 Setup Firestore Rules

1. Pilih tab **"Rules"**
2. Hapus semua rules yang ada
3. Copy paste rules berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admins/{adminId} {
      allow read, write: if request.auth != null;
    }
    
    match /students/{studentId} {
      allow read, write: if request.auth != null;
    }
    
    match /attendance/{attendanceId} {
      allow read, write: if request.auth != null;
    }
    
    match /settings/{settingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Klik **"Publish"**

### 1.5 Aktifkan Storage (Opsional)

1. Di menu kiri, pilih **"Storage"**
2. Klik **"Get Started"**
3. Gunakan rules default
4. Klik **"Done"**

### 1.6 Dapatkan Config Firebase

1. Klik ⚙️ (Settings) di samping "Project Overview"
2. Pilih **"Project Settings"**
3. Scroll ke bawah, pilih **"Web App"** (icon </>)
4. Beri nama app: **"E-Absensi-Web"**
5. Klik **"Register App"**
6. **COPY** semua kode konfigurasi yang muncul
7. Simpan di notepad sementara

## Langkah 2: Setup Project

### 2.1 Extract Project

1. Extract file ZIP project ke folder pilihan Anda
2. Buka folder project

### 2.2 Konfigurasi Firebase

1. Buka file `assets/js/firebase.js`
2. Ganti konfigurasi dengan yang Anda copy tadi:

```javascript
const firebaseConfig = {
    apiKey: "AIza....", // Ganti dengan punya Anda
    authDomain: "xxx.firebaseapp.com", // Ganti
    projectId: "xxx", // Ganti
    storageBucket: "xxx.appspot.com", // Ganti
    messagingSenderId: "123456", // Ganti
    appId: "1:123:web:abc..." // Ganti
};
```

3. Save file

## Langkah 3: Buat Admin Pertama

### 3.1 Buat User di Authentication

1. Kembali ke Firebase Console
2. Pilih **"Authentication"** > **"Users"**
3. Klik **"Add User"**
4. Email: `admin@sekolah.com`
5. Password: `admin123` (atau password pilihan Anda)
6. Klik **"Add User"**
7. **COPY UID** user yang baru dibuat (contoh: `abc123xyz789...`)

### 3.2 Buat Data Admin di Firestore

1. Pilih **"Firestore Database"**
2. Klik **"Start Collection"**
3. Collection ID: `admins`
4. Klik **"Next"**
5. Document ID: **PASTE UID yang tadi dicopy**
6. Tambahkan fields:

| Field Name | Type | Value |
|------------|------|-------|
| email | string | admin@sekolah.com |
| nama | string | Administrator |
| role | string | Super Admin |
| status | string | Aktif |

7. Klik **"Save"**

### 3.3 Buat Dokumen Settings

#### Settings - School

1. Klik **"Start Collection"**
2. Collection ID: `settings`
3. Document ID: `school`
4. Fields:

| Field Name | Type | Value |
|------------|------|-------|
| name | string | SMP Negeri 1 |
| address | string | Jl. Pendidikan No. 1 |
| logo | string | (kosongkan dulu) |

5. Klik **"Save"**

#### Settings - Time

1. Tambah document baru di collection `settings`
2. Document ID: `time`
3. Fields:

| Field Name | Type | Value |
|------------|------|-------|
| dhuhaStart | string | 06:30 |
| dhuhaEnd | string | 07:30 |
| zuhurStart | string | 11:30 |
| zuhurEnd | string | 12:30 |

4. Klik **"Save"**

## Langkah 4: Jalankan Website

### Opsi 1: Buka Langsung (Tidak Disarankan)

1. Double klik file `index.html`
2. Website akan terbuka di browser

⚠️ **Peringatan:** Scanner QR tidak akan berfungsi

### Opsi 2: Menggunakan Python (Disarankan)

1. Buka Command Prompt / Terminal
2. Masuk ke folder project:
```bash
cd C:\path\to\e-absensi-jamaah
```

3. Jalankan server:
```bash
python -m http.server 8000
```

4. Buka browser, akses:
```
http://localhost:8000
```

### Opsi 3: Menggunakan Node.js

1. Install serve (sekali saja):
```bash
npm install -g serve
```

2. Di folder project, jalankan:
```bash
serve
```

3. Buka browser, akses URL yang ditampilkan

### Opsi 4: Menggunakan Live Server (VS Code)

1. Install extension **"Live Server"** di VS Code
2. Klik kanan file `index.html`
3. Pilih **"Open with Live Server"**

## Langkah 5: Login dan Test

### 5.1 Login

1. Buka website
2. Email: `admin@sekolah.com`
3. Password: `admin123` (atau password yang Anda buat)
4. Klik **"Masuk"**

### 5.2 Test Import Data

1. Menu **"Import Excel"**
2. Download template Excel
3. Isi beberapa data siswa contoh
4. Upload file Excel
5. Klik **"Import ke Database"**

### 5.3 Test Generate QR

1. Menu **"Generate QR"**
2. Pilih siswa yang sudah diimport
3. QR Code akan muncul
4. Download QR Code

### 5.4 Test Scan QR

1. Menu **"Scan QR"**
2. Klik **"Mulai Scan"**
3. Izinkan akses kamera
4. Arahkan ke QR Code yang sudah didownload
5. Absensi akan tercatat

## Troubleshooting

### ❌ "Firebase is not defined"

**Solusi:** Pastikan koneksi internet aktif, CDN Firebase harus bisa diakses

### ❌ Login gagal

**Solusi:** 
- Cek Firebase config sudah benar
- Cek user sudah dibuat di Authentication
- Cek data admin sudah ada di Firestore dengan UID yang sama

### ❌ Scanner tidak muncul

**Solusi:**
- Gunakan HTTPS atau localhost (http://localhost)
- Pastikan browser memiliki izin akses kamera
- Gunakan browser Chrome (paling kompatibel)

### ❌ Import Excel error

**Solusi:**
- Pastikan format Excel sesuai template
- Kolom NISN, Nama, Kelas wajib diisi

### ❌ Data tidak muncul

**Solusi:**
- Cek koneksi internet
- Buka Console Browser (F12) untuk lihat error
- Cek Firestore rules sudah benar

## 🎉 Selesai!

Website E-Absensi Jamaah sudah siap digunakan!

### Langkah Selanjutnya:

1. ✅ Ganti pengaturan sekolah di menu **Settings**
2. ✅ Import semua data siswa
3. ✅ Generate QR Code untuk semua siswa
4. ✅ Print QR Code dan bagikan ke siswa
5. ✅ Mulai gunakan sistem absensi

## 📞 Butuh Bantuan?

Jika mengalami kendala, silakan:
- Baca **README.md** untuk dokumentasi lengkap
- Cek **Console Browser** (F12) untuk error details
- Pastikan semua langkah instalasi sudah diikuti

---

**Selamat menggunakan E-Absensi Jamaah! 🚀**
