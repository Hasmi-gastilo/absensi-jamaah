/**
 * Report Module
 * Generate dan export laporan absensi
 */

checkAuth();

let reportData = [];

// Jurusan options (sama seperti di students.js)
const JURUSAN_OPTIONS = {
    'X': ['TKR A', 'TKR B', 'TKR C', 'TITL A', 'TITL B', 'TKP', 'ATPH'],
    'XI': ['TKR A', 'TKR B', 'TKR C', 'TITL A', 'TITL B', 'TKP', 'ATPH'],
    'XII': ['TKR A', 'TKR B', 'TKR C', 'TITL A', 'TITL B', 'TKP', 'ATPH']
};

// Mapping singkat ke nama lengkap jurusan
const JURUSAN_NAMA_LENGKAP = {
    'TKR': 'Teknik Kendaraan Ringan',
    'TITL': 'Teknik Instalasi Tenaga Listrik',
    'TKP': 'Teknik Konstruksi dan Perumahan',
    'ATPH': 'Agribisnis Tanaman Pangan dan Hortikultura',
    'ATP': 'Agribisnis Tanaman Pangan',
    'H': 'Perhotelan'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setDefaultMonth();
    initTingkatJurusanDropdown();
    initFilterButton();
    initExportButtons();
});

/**
 * Set default month (current month)
 */
function setDefaultMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    document.getElementById('filterMonth').value = `${year}-${month}`;
}

/**
 * Initialize Tingkat and Jurusan dropdown
 */
function initTingkatJurusanDropdown() {
    // Handle tingkat change
    document.getElementById('filterTingkat').addEventListener('change', (e) => {
        const tingkat = e.target.value;
        const jurusanSelect = document.getElementById('filterJurusan');
        jurusanSelect.innerHTML = '<option value="">Semua</option>';
        
        if (tingkat && JURUSAN_OPTIONS[tingkat]) {
            JURUSAN_OPTIONS[tingkat].forEach(jurusan => {
                const option = document.createElement('option');
                option.value = jurusan;
                option.textContent = jurusan;
                jurusanSelect.appendChild(option);
            });
        }
    });
}

/**
 * Initialize filter button
 */
function initFilterButton() {
    document.getElementById('btnFilterReport').addEventListener('click', async () => {
        await generateReport();
    });
}

/**
 * Generate report based on filters
 */
async function generateReport() {
    const filterMonth = document.getElementById('filterMonth').value;
    const filterTingkat = document.getElementById('filterTingkat').value;
    const filterJurusan = document.getElementById('filterJurusan').value;
    const filterJenis = document.getElementById('filterJenisReport').value;
    
    if (!filterMonth) {
        showError('Pilih bulan untuk laporan');
        return;
    }
    
    try {
        showLoading('Membuat laporan...');
        
        // Calculate start and end date from month
        const [year, month] = filterMonth.split('-');
        const startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
        
        console.log(`Querying from ${startDate} to ${endDate}`);
        
        // Simple query without orderBy
        let query = db.collection('attendance')
            .where('tanggal', '>=', startDate)
            .where('tanggal', '<=', endDate);
        
        const snapshot = await query.get();
        
        reportData = [];
        snapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            
            // Apply class filter (tingkat + jurusan)
            if (filterTingkat || filterJurusan) {
                const kelasUpper = (data.kelas || '').toUpperCase();
                
                if (filterTingkat && !kelasUpper.startsWith(filterTingkat.toUpperCase())) {
                    return; // Skip if tingkat doesn't match
                }
                
                if (filterJurusan) {
                    const jurusanSingkat = filterJurusan.split(' ')[0];
                    const jurusanAngka = filterJurusan.split(' ')[1] || '';
                    const namaLengkap = JURUSAN_NAMA_LENGKAP[jurusanSingkat] || jurusanSingkat;
                    
                    const jurusanMatch = kelasUpper.includes(jurusanSingkat.toUpperCase()) ||
                                        kelasUpper.includes(namaLengkap.toUpperCase());
                    
                    const angkaMatch = jurusanAngka === '' ? true : kelasUpper.includes(jurusanAngka);
                    
                    if (!jurusanMatch || !angkaMatch) {
                        return; // Skip if jurusan doesn't match
                    }
                }
            }
            
            // Apply jenis filter
            if (filterJenis && data.jenisAbsensi !== filterJenis) return;
            
            reportData.push(data);
        });
        
        // Sort client-side by date and time (descending)
        reportData.sort((a, b) => {
            if (a.tanggal !== b.tanggal) {
                return b.tanggal.localeCompare(a.tanggal);
            }
            return b.jam.localeCompare(a.jam);
        });
        
        displayReport();
        Swal.close();
        
    } catch (error) {
        console.error('Error generating report:', error);
        showError('Gagal membuat laporan: ' + error.message);
    }
}

/**
 * Display report in table
 */
function displayReport() {
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = '';
    
    if (reportData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Tidak ada data untuk periode yang dipilih</td></tr>';
        return;
    }
    
    reportData.forEach((data, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${data.tanggal}</td>
                <td>${data.nisn}</td>
                <td>${data.nama}</td>
                <td>${data.kelas}</td>
                <td>${data.jenisAbsensi}</td>
                <td>${data.jam}</td>
                <td><span class="badge ${data.statusWaktu === 'Tepat Waktu' ? 'badge-success' : 'badge-warning'}">${data.statusWaktu}</span></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

/**
 * Initialize export buttons
 */
function initExportButtons() {
    document.getElementById('btnExportExcel').addEventListener('click', exportToExcel);
    document.getElementById('btnExportPDF').addEventListener('click', exportToPDF);
    document.getElementById('btnPrint').addEventListener('click', printReport);
}

/**
 * Export to Excel
 */
function exportToExcel() {
    if (reportData.length === 0) {
        showError('Tidak ada data untuk diexport');
        return;
    }
    
    try {
        const excelData = reportData.map((data, index) => ({
            'No': index + 1,
            'Tanggal': data.tanggal,
            'NISN': data.nisn,
            'Nama': data.nama,
            'Kelas': data.kelas,
            'Jenis Absensi': data.jenisAbsensi,
            'Jam': data.jam,
            'Status': data.statusWaktu
        }));
        
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan Absensi');
        
        const filterMonth = document.getElementById('filterMonth').value;
        const fileName = `Laporan_Absensi_${filterMonth}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        showSuccess('Laporan berhasil diexport ke Excel');
        
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        showError('Gagal export ke Excel');
    }
}

/**
 * Export to PDF
 */
function exportToPDF() {
    if (reportData.length === 0) {
        showError('Tidak ada data untuk diexport');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(16);
        doc.text('Laporan Absensi Jama\'ah', 14, 15);
        doc.setFontSize(12);
        doc.text('SMK Negeri 1 Sangasanga', 14, 22);
        
        // Filter info
        doc.setFontSize(10);
        const filterMonth = document.getElementById('filterMonth').value;
        const filterTingkat = document.getElementById('filterTingkat').value;
        const filterJurusan = document.getElementById('filterJurusan').value;
        
        let filterText = `Bulan: ${filterMonth}`;
        if (filterTingkat) filterText += ` | Tingkat: ${filterTingkat}`;
        if (filterJurusan) filterText += ` | Jurusan: ${filterJurusan}`;
        
        doc.text(filterText, 14, 30);
        
        // Table
        const tableData = reportData.map((data, index) => [
            index + 1,
            data.tanggal,
            data.nisn,
            data.nama,
            data.kelas,
            data.jenisAbsensi,
            data.jam,
            data.statusWaktu
        ]);
        
        doc.autoTable({
            startY: 35,
            head: [['No', 'Tanggal', 'NISN', 'Nama', 'Kelas', 'Jenis', 'Jam', 'Status']],
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [124, 58, 237] }
        });
        
        const fileName = `Laporan_Absensi_${filterMonth}.pdf`;
        doc.save(fileName);
        
        showSuccess('Laporan berhasil diexport ke PDF');
        
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        showError('Gagal export ke PDF');
    }
}

/**
 * Print report
 */
function printReport() {
    if (reportData.length === 0) {
        showError('Tidak ada data untuk dicetak');
        return;
    }
    
    window.print();
}
