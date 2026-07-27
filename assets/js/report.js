/**
 * Report Module
 * Generate dan export laporan absensi
 */

checkAuth();

let reportData = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setDefaultDates();
    initFilterButton();
    initExportButtons();
});

/**
 * Set default dates (this month)
 */
function setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('startDate').valueAsDate = firstDay;
    document.getElementById('endDate').valueAsDate = today;
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
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const filterKelas = document.getElementById('filterKelas').value;
    const filterJenis = document.getElementById('filterJenisReport').value;
    
    if (!startDate || !endDate) {
        showError('Pilih tanggal mulai dan tanggal akhir');
        return;
    }
    
    try {
        showLoading('Membuat laporan...');
        
        // Simple query without orderBy to avoid index requirements
        let query = db.collection('attendance')
            .where('tanggal', '>=', startDate)
            .where('tanggal', '<=', endDate);
        
        const snapshot = await query.get();
        
        reportData = [];
        snapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            
            // Apply additional filters
            if (filterKelas && data.kelas !== filterKelas) return;
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
        
        const fileName = `Laporan_Absensi_${getTodayDate()}.xlsx`;
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
        
        // Date range
        doc.setFontSize(10);
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 30);
        
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
        
        const fileName = `Laporan_Absensi_${getTodayDate()}.pdf`;
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
