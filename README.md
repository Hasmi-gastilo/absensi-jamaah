# E-Absensi Jamaah - Website Premium

Website absensi jamaah modern dengan UI/UX premium menggunakan Firebase.

## 🚀 Fitur

- ✅ Login Admin dengan Firebase Authentication
- 📊 Dashboard dengan Statistik Real-time
- 👥 CRUD Data Siswa
- 📥 Import Data dari Excel
- 📱 Generate QR Code per Siswa
- 📷 Scan QR Code untuk Absensi
- ⏰ Pengaturan Waktu Absensi
- 📈 Laporan dengan Export Excel & PDF
- 🎨 UI Modern dengan Purple Gradient
- 📱 Responsive Design (Desktop & Mobile)

## 🛠️ Teknologi

**Frontend:**
- HTML5
- CSS3
- JavaScript (Vanilla)
- Bootstrap 5
- Chart.js
- SweetAlert2
- SheetJS (xlsx)
- QRCode.js
- html5-qrcode

**Backend:**
- Firebase Authentication
- Firebase Firestore
- Firebase Storage

## 📦 Instalasi

### 1. Clone atau Download Project

```bash
git clone <repository-url>
cd e-absensi-jamaah
```

### 2. Konfigurasi Firebase

1. Buat project baru di [Firebase Console](https://console.firebase.google.com/)
2. Aktifkan **Firebase Authentication** (Email/Password)
3. Aktifkan **Cloud Firestore**
4. Aktifkan **Firebase Storage**
5. Copy konfigurasi Firebase Anda

### 3. Update Firebase Config

Edit file `assets/js/firebase.js` dan ganti dengan konfigurasi Firebase Anda:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 4. Setup Firestore Rules

Di Firebase Console > Firestore Database > Rules, paste rules berikut:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admins collection
    match /admins/{adminId} {
      allow read, write: if request.auth != null;
    }
    
    // Students collection
    match /students/{studentId} {
      allow read, write: if request.auth != null;
    }
    
    // Attendance collection
    match /attendance/{attendanceId} {
      allow read, write: if request.auth != null;
    }
    
    // Settings collection
    match /settings/{settingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Buat Admin Pertama

1. Di Firebase Console > Authentication > Users
2. Klik "Add User"
3. Masukkan email dan password
4. Copy UID user tersebut
5. Di Firestore > admins collection > Add document
6. Document ID: [paste UID]
7. Fields:
   ```
   email: "admin@sekolah.com"
   nama: "Administrator"
   role: "Super Admin"
   status: "Aktif"
   ```

### 6. Jalankan Website

Buka `index.html` di browser atau gunakan local server:

```bash
# Dengan Python
python -m http.server 8000

# Atau dengan Node.js
npx serve
```

Akses: `http://localhost:8000`

## 📝 Cara Penggunaan

### Login
1. Buka halaman login
2. Masukkan email dan password admin
3. Klik "Masuk"

### Import Data Siswa
1. Menu "Import Excel"
2. Download template Excel
3. Isi data siswa sesuai format
4. Upload file Excel
5. Preview data
6. Klik "Import ke Database"

### Generate QR Code
1. Menu "Generate QR"
2. Pilih siswa dari list
3. QR Code otomatis dibuat
4. Download atau Print QR Code

### Scan QR untuk Absensi
1. Menu "Scan QR"
2. Pilih jenis absensi (Dhuha/Zuhur)
3. Klik "Mulai Scan"
4. Izinkan akses kamera
5. Arahkan ke QR Code siswa
6. Absensi otomatis tersimpan

### Laporan
1. Menu "Laporan"
2. Pilih tanggal dan filter
3. Klik "Filter"
4. Export ke Excel atau PDF

### Pengaturan
1. Menu "Setting"
2. Atur informasi sekolah
3. Atur jam absensi Dhuha dan Zuhur
4. Simpan

## 📱 Struktur Database

### Collection: students
```javascript
{
  nis: "12345",
  nisn: "1234567890",
  nama: "Ahmad Rizki",
  jenisKelamin: "Laki-laki",
  kelas: "VII-A",
  alamat: "Jl. Contoh No. 123",
  noHp: "081234567890",
  status: "Aktif",
  createdAt: timestamp
}
```

### Collection: attendance
```javascript
{
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

## 🎨 Customization

### Warna
Edit `assets/css/style.css`:
```css
:root {
    --primary: #7C3AED;
    --primary-light: #8B5CF6;
    /* ... */
}
```

### Logo
Ganti logo di `assets/img/logo.png`

## 🔒 Keamanan

- ✅ Authentication required untuk semua halaman
- ✅ Session management
- ✅ Firestore security rules
- ✅ Input validation
- ✅ XSS protection

## 📄 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 🐛 Troubleshooting

### QR Scanner tidak muncul
- Pastikan browser memiliki izin akses kamera
- Gunakan HTTPS atau localhost
- Test di browser Chrome

### Import Excel error
- Pastikan format Excel sesuai template
- Kolom wajib: NIS, NISN, Nama, Kelas

### Data tidak muncul
- Cek koneksi internet
- Cek Firestore rules
- Cek console browser untuk error

## 📞 Support

Untuk bantuan dan pertanyaan, silakan buka issue di repository ini.

## 📜 License

© 2024 E-Absensi Jamaah. All rights reserved.

---

**Dibuat dengan ❤️ menggunakan Firebase & Bootstrap**
