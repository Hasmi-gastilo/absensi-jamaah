# 🔥 Konfigurasi Firebase - Step by Step

## 📌 Langkah 1: Buat Project Firebase

1. Buka https://console.firebase.google.com/
2. Klik **"Tambah Project"** atau **"Add Project"**
3. Nama project: `e-absensi-jamaah`
4. Matikan Google Analytics (opsional, bisa diaktifkan nanti)
5. Klik **"Buat Project"**
6. Tunggu beberapa detik hingga project selesai dibuat

---

## 🔐 Langkah 2: Setup Authentication

### Enable Email/Password Authentication

1. Di sidebar kiri, klik **"Authentication"**
2. Klik **"Get Started"** atau **"Mulai"**
3. Pilih tab **"Sign-in method"**
4. Klik **"Email/Password"**
5. Toggle switch **"Enable"**
6. Klik **"Save"** atau **"Simpan"**

### Buat User Admin Pertama

1. Pilih tab **"Users"**
2. Klik **"Add User"** atau **"Tambahkan Pengguna"**
3. Email: `admin@sekolah.com` (atau email pilihan Anda)
4. Password: `admin123` (minimal 6 karakter)
5. Klik **"Add User"**
6. **PENTING:** Copy dan simpan **UID** user tersebut
   - Contoh UID: `a1b2c3d4e5f6g7h8i9j0`
   - UID ini akan digunakan untuk membuat data admin di Firestore

---

## 🗄️ Langkah 3: Setup Firestore Database

### Create Database

1. Di sidebar kiri, klik **"Firestore Database"**
2. Klik **"Create Database"** atau **"Buat Database"**
3. Pilih **"Start in production mode"**
   - Kita akan setup rules manual nanti
4. Pilih lokasi server:
   - Pilih yang terdekat dengan lokasi Anda
   - Contoh: `asia-southeast1` (Singapura) untuk Indonesia
5. Klik **"Enable"**
6. Tunggu hingga database selesai dibuat

### Setup Security Rules

1. Setelah database dibuat, pilih tab **"Rules"**
2. Delete semua rules yang ada
3. Copy dan paste rules berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection: admins
    match /admins/{adminId} {
      allow read, write: if request.auth != null;
    }
    
    // Collection: students
    match /students/{studentId} {
      allow read, write: if request.auth != null;
    }
    
    // Collection: attendance
    match /attendance/{attendanceId} {
      allow read, write: if request.auth != null;
    }
    
    // Collection: settings
    match /settings/{settingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Klik **"Publish"**

**Penjelasan Rules:**
- `request.auth != null` = hanya user yang login yang bisa akses
- Semua collection bisa read & write oleh authenticated users

### Buat Initial Data

#### 3.1 Collection: admins

1. Klik tab **"Data"**
2. Klik **"Start Collection"**
3. Collection ID: `admins` (huruf kecil semua)
4. Klik **"Next"**
5. Document ID: **PASTE UID user yang tadi dibuat**
   - Contoh: `a1b2c3d4e5f6g7h8i9j0`
6. Tambahkan field-field berikut:

| Field | Type | Value |
|-------|------|-------|
| email | string | admin@sekolah.com |
| nama | string | Administrator |
| role | string | Super Admin |
| status | string | Aktif |

7. Klik **"Save"**

**Catatan:** Document ID HARUS sama dengan UID user di Authentication!

#### 3.2 Collection: settings (Document: school)

1. Klik **"Start Collection"** (atau tombol + jika sudah ada collection)
2. Collection ID: `settings`
3. Document ID: `school` (manual, bukan auto-generated)
4. Fields:

| Field | Type | Value |
|-------|------|-------|
| name | string | SMP Negeri 1 |
| address | string | Jl. Pendidikan No. 1 |
| logo | string | (kosongkan) |

5. Klik **"Save"**

#### 3.3 Collection: settings (Document: time)

1. Masih di collection `settings`
2. Klik **"Add Document"** atau tombol +
3. Document ID: `time`
4. Fields:

| Field | Type | Value |
|-------|------|-------|
| dhuhaStart | string | 06:30 |
| dhuhaEnd | string | 07:30 |
| zuhurStart | string | 11:30 |
| zuhurEnd | string | 12:30 |

5. Klik **"Save"**

**Hasil Akhir Structure:**
```
firestore/
  ├─ admins/
  │   └─ {uid}/
  │       ├─ email: "admin@sekolah.com"
  │       ├─ nama: "Administrator"
  │       ├─ role: "Super Admin"
  │       └─ status: "Aktif"
  │
  └─ settings/
      ├─ school/
      │   ├─ name: "SMP Negeri 1"
      │   ├─ address: "Jl. Pendidikan No. 1"
      │   └─ logo: ""
      │
      └─ time/
          ├─ dhuhaStart: "06:30"
          ├─ dhuhaEnd: "07:30"
          ├─ zuhurStart: "11:30"
          └─ zuhurEnd: "12:30"
```

---

## 📦 Langkah 4: Setup Storage (OPSIONAL - Bisa Diskip) ⚠️

**PENTING:** Storage **TIDAK WAJIB** untuk E-Absensi Jamaah versi dasar!

### Kapan Storage Dibutuhkan?
- ✅ Upload logo sekolah dari file (bukan URL)
- ✅ Upload foto admin
- ✅ Fitur advanced lainnya

### Jika Ingin Skip Storage (Recommended):
- ✅ Lewati langkah ini sepenuhnya
- ✅ Website tetap 100% berfungsi
- ✅ Gunakan URL external untuk logo (dari Google Drive, ImgBB, dll)
- ✅ Bisa aktifkan Storage kapan saja nanti

### Jika Ingin Aktifkan Storage:

**CATATAN:** Storage memerlukan **Blaze Plan** (billing harus aktif)

1. Di sidebar kiri, klik **"Storage"**
2. Jika muncul **"Upgrade project"**:
   - Klik "Upgrade project"  
   - Aktifkan billing (tetap gratis dalam batas free tier)
   - Tunggu beberapa menit untuk propagasi
3. Klik **"Get Started"**
4. Pilih **"Start in production mode"**
5. Gunakan lokasi yang sama dengan Firestore
6. Klik **"Done"**

**Rekomendasi:** Skip Storage untuk sekarang, fokus ke setup website dulu!

---

## 🔑 Langkah 5: Dapatkan Firebase Config

1. Klik icon ⚙️ (Settings) di samping **"Project Overview"**
2. Pilih **"Project Settings"**
3. Scroll ke bawah ke section **"Your apps"**
4. Klik icon **</>** (Web)
5. Nickname: `e-absensi-web`
6. **JANGAN** centang Firebase Hosting (belum perlu)
7. Klik **"Register App"**
8. **Copy** kode konfigurasi yang muncul

Kode yang perlu dicopy akan terlihat seperti ini:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "e-absensi-jamaah.firebaseapp.com",
  projectId: "e-absensi-jamaah",
  storageBucket: "e-absensi-jamaah.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

9. **SIMPAN** kode ini di notepad
10. Klik **"Continue to console"**

---

## 📝 Langkah 6: Update Project Code

1. Buka project folder Anda
2. Buka file `assets/js/firebase.js`
3. Ganti bagian config dengan yang Anda copy tadi:

```javascript
// GANTI INI
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",  // ← Ganti dengan punya Anda
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

4. Save file

---

## ✅ Verifikasi Setup

### Checklist:

- [ ] Project Firebase sudah dibuat
- [ ] Authentication Email/Password sudah enabled
- [ ] User admin pertama sudah dibuat
- [ ] UID user sudah dicopy
- [ ] Firestore Database sudah dibuat
- [ ] Firestore Rules sudah di-publish
- [ ] Collection `admins` sudah dibuat dengan document UID
- [ ] Collection `settings` sudah dibuat (school & time)
- [ ] Firebase config sudah dicopy
- [ ] File `firebase.js` sudah di-update

### Test Setup:

1. Buka `index.html` di browser
2. Buka Console (F12)
3. Cek tidak ada error "Firebase is not defined"
4. Coba login dengan email dan password yang dibuat
5. Jika berhasil masuk dashboard, setup sudah benar! ✅

---

## 🚨 Troubleshooting

### Error: "Firebase is not defined"
**Solusi:** 
- Pastikan koneksi internet aktif
- CDN Firebase harus bisa diakses
- Clear browser cache

### Error: "Permission denied"
**Solusi:**
- Cek Firestore Rules sudah benar
- Pastikan rules sudah di-publish

### Login gagal: "Email not found"
**Solusi:**
- Pastikan user sudah dibuat di Authentication
- Email harus persis sama (case sensitive)

### Login gagal: "Wrong password"
**Solusi:**
- Password minimal 6 karakter
- Gunakan password yang dibuat saat setup

### Data admin tidak muncul
**Solusi:**
- Pastikan Document ID di collection `admins` sama dengan UID user
- Cek di Firestore Console apakah document sudah ada
- Pastikan field `email`, `nama`, `role`, `status` sudah diisi

### Error: "Document doesn't exist"
**Solusi:**
- Pastikan collection `settings` dengan document `school` dan `time` sudah dibuat
- Cek typo di nama collection atau document

---

## 📚 Resources

- **Firebase Console:** https://console.firebase.google.com/
- **Firebase Documentation:** https://firebase.google.com/docs
- **Firestore Rules Guide:** https://firebase.google.com/docs/firestore/security/get-started

---

## 🎉 Selesai!

Firebase sudah siap digunakan. Lanjut ke **PANDUAN_INSTALASI.md** untuk menjalankan website.

---

**Dibuat:** 15 Januari 2024
**Update Terakhir:** 15 Januari 2024
