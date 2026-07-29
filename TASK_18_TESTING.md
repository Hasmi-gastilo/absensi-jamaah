# Task 18 - Report Filters Testing Guide

## ✅ SELESAI - Task 18: Update Report Filters
**Status**: Completed & Pushed to GitHub
**Commits**: 
- `b1fdc6b` - Update report filters: use Month + Tingkat + Jurusan instead of date range
- `da9f7b1` - Perbaiki branding: ubah 'SMK N 1' menjadi 'SMK Negeri 1' di seluruh halaman
- `725d756` - Update CHANGELOG: Add Task 18 - Report filters with Month + Tingkat + Jurusan

---

## 🎯 Perubahan yang Dilakukan

### 1. Filter Sistem Baru
**SEBELUM:**
- Tanggal Mulai dan Tanggal Akhir (date range)
- Text input untuk "Kelas"

**SETELAH:**
- **Bulan** - Month picker (`<input type="month">`)
- **Tingkat** - Dropdown (X, XI, XII, Semua)
- **Jurusan** - Dropdown dinamis (TKR A, TKR B, TITL A, TKP, ATPH, dll)
- **Jenis Absensi** - Dropdown (Sholat Dhuha, Sholat Zuhur, Semua)

### 2. Logic Filter yang Ditingkatkan
- ✅ Support nama singkat (TKR, TITL, TKP, ATPH)
- ✅ Support nama lengkap dari database (Teknik Kendaraan Ringan, Teknik Konstruksi dan Perumahan, dll)
- ✅ Jurusan tanpa angka (TKP, ATPH) → menampilkan SEMUA siswa di jurusan tersebut
- ✅ Jurusan dengan angka (TKR A) → hanya menampilkan siswa dengan EXACT MATCH (tidak B atau C)

### 3. Export & Nama File
- ✅ Excel filename: `Laporan_Absensi_2026-07.xlsx` (menggunakan bulan)
- ✅ PDF filename: `Laporan_Absensi_2026-07.pdf`
- ✅ PDF header menampilkan: "Bulan: 2026-07 | Tingkat: X | Jurusan: TKR A"

---

## 🧪 Cara Testing

### Test 1: Filter by Month Only
1. Buka **reports.html**
2. Pilih **Bulan**: `2026-07` (bulan sekarang)
3. Biarkan **Tingkat**: `Semua`
4. Biarkan **Jurusan**: `Semua`
5. Klik **Filter**
6. ✅ Harus menampilkan SEMUA absensi bulan Juli 2026

### Test 2: Filter by Month + Tingkat
1. Pilih **Bulan**: `2026-07`
2. Pilih **Tingkat**: `X`
3. Biarkan **Jurusan**: `Semua`
4. Klik **Filter**
5. ✅ Harus menampilkan hanya siswa kelas X (X TKR A, X TKR B, X TITL A, dll)

### Test 3: Filter by Month + Tingkat + Jurusan (dengan angka)
1. Pilih **Bulan**: `2026-07`
2. Pilih **Tingkat**: `X`
3. Pilih **Jurusan**: `TKR A`
4. Klik **Filter**
5. ✅ Harus menampilkan HANYA X TKR A (TIDAK menampilkan X TKR B atau X TKR C)

### Test 4: Filter TKP (jurusan tanpa angka)
1. Pilih **Bulan**: `2026-07`
2. Pilih **Tingkat**: `X`
3. Pilih **Jurusan**: `TKP`
4. Klik **Filter**
5. ✅ Harus menampilkan SEMUA siswa X TKP (karena TKP tidak punya angka A/B/C)

### Test 5: Filter ATPH (jurusan tanpa angka)
1. Pilih **Bulan**: `2026-07`
2. Pilih **Tingkat**: `XI`
3. Pilih **Jurusan**: `ATPH`
4. Klik **Filter**
5. ✅ Harus menampilkan SEMUA siswa XI ATPH
6. ✅ Database mungkin pakai nama lengkap: "Agribisnis Tanaman Pangan dan Hortikultura"

### Test 6: Export to Excel
1. Setelah filter (misal: Bulan: 2026-07, Tingkat: X, Jurusan: TKR A)
2. Klik **Export Excel**
3. ✅ File harus ter-download dengan nama: `Laporan_Absensi_2026-07.xlsx`
4. ✅ Buka file, pastikan data sesuai dengan filter

### Test 7: Export to PDF
1. Setelah filter (sama seperti Test 6)
2. Klik **Export PDF**
3. ✅ File harus ter-download dengan nama: `Laporan_Absensi_2026-07.pdf`
4. ✅ Buka PDF, pastikan:
   - Header: "SMK Negeri 1 Sangasanga"
   - Info filter: "Bulan: 2026-07 | Tingkat: X | Jurusan: TKR A"
   - Data sesuai dengan filter

### Test 8: Print
1. Setelah filter
2. Klik **Print**
3. ✅ Print dialog harus terbuka
4. ✅ Preview print menampilkan data sesuai filter

### Test 9: Dynamic Jurusan Dropdown
1. Pilih **Tingkat**: `X`
2. ✅ Dropdown **Jurusan** harus berisi: TKR A, TKR B, TKR C, TITL A, TITL B, TKP, ATPH
3. Ganti **Tingkat**: `XI`
4. ✅ Dropdown **Jurusan** harus ter-refresh (sama seperti X)
5. Pilih **Tingkat**: `Semua`
6. ✅ Dropdown **Jurusan** harus kosong/reset ke "Semua"

### Test 10: Empty Result
1. Pilih **Bulan**: `2025-01` (bulan yang belum ada data)
2. Klik **Filter**
3. ✅ Harus menampilkan: "Tidak ada data untuk periode yang dipilih"

---

## 🔍 Yang Harus Dicek di Console Browser

Buka **Developer Tools** (F12) → **Console** tab

### Saat Filter:
```
Querying from 2026-07-01 to 2026-07-31
```
- ✅ Pastikan tanggal start dan end benar

### Saat Apply Filter (contoh X TKR A):
```
Filter: Tingkat=X, Singkat=TKR, Angka=A
✓ Ahmad: "X TKR A" -> Tingkat=X, Singkat=TKR, Angka=A
✗ Budi: "X TKR B" -> not match (angka berbeda)
Filtered count: 15
```
- ✅ Log harus menunjukkan proses filtering yang benar

---

## 📋 Checklist Sebelum Deploy ke Production

- [x] ✅ Code committed & pushed ke GitHub
- [x] ✅ CHANGELOG.md updated
- [ ] 🔲 Test di browser (Chrome, Firefox, Edge)
- [ ] 🔲 Test dengan data real
- [ ] 🔲 Test export Excel & PDF
- [ ] 🔲 Test print functionality
- [ ] 🔲 Test di mobile/tablet
- [ ] 🔲 Test filter dengan berbagai kombinasi
- [ ] 🔲 Verify nama jurusan lengkap di database match dengan filter

---

## 🐛 Known Issues to Watch

### Issue 1: Nama Jurusan di Database Tidak Konsisten
**Problem**: Database bisa punya:
- "X TKR A" (singkat)
- "X Teknik Kendaraan Ringan A" (lengkap)
- "X TEKNIK KENDARAAN RINGAN A" (uppercase)

**Solution**: Code sudah handle dengan:
- Case-insensitive matching (`.toUpperCase()`)
- Mapping `JURUSAN_NAMA_LENGKAP` untuk TKR, TITL, TKP, ATPH
- Flexible matching: `includes()` untuk singkat dan lengkap

### Issue 2: TKP di Database Bisa 2 Varian
**Problem**: 
- "Teknik Konstruksi Permesinan"
- "Teknik Konstruksi dan Perumahan"

**Solution**: Code handle keduanya:
```javascript
kelasUpper.includes('TKP') || 
kelasUpper.includes('TEKNIK KONSTRUKSI PERMESINAN') ||
kelasUpper.includes('TEKNIK KONSTRUKSI DAN PERUMAHAN')
```

---

## 📞 Next Steps

1. **User Testing** - Minta user coba filter dengan berbagai kombinasi
2. **Data Verification** - Pastikan data di Firestore konsisten
3. **Performance Check** - Test dengan dataset besar (1000+ records)
4. **Mobile Testing** - Test responsiveness di mobile

---

## 📝 Technical Notes

### Files Modified:
1. `reports.html` - UI dengan month picker + tingkat/jurusan dropdown
2. `assets/js/report.js` - Filter logic dengan support nama lengkap jurusan

### Key Functions:
- `setDefaultMonth()` - Set current month as default
- `initTingkatJurusanDropdown()` - Dynamic jurusan based on tingkat
- `generateReport()` - Query Firestore + client-side filtering
- `exportToExcel()` - Export with month in filename
- `exportToPDF()` - Export with month in filename + filter info in header

### Constants:
```javascript
const JURUSAN_OPTIONS = {
    'X': ['TKR A', 'TKR B', 'TKR C', 'TITL A', 'TITL B', 'TKP', 'ATPH'],
    'XI': [...],
    'XII': [...]
};

const JURUSAN_NAMA_LENGKAP = {
    'TKR': 'Teknik Kendaraan Ringan',
    'TITL': 'Teknik Instalasi Tenaga Listrik',
    'TKP': 'Teknik Konstruksi dan Perumahan',
    'ATPH': 'Agribisnis Tanaman Pangan dan Hortikultura'
};
```

---

**Created**: 2026-07-29
**Status**: ✅ Ready for Testing
