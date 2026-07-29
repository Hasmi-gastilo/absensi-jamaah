/**
 * Students Module
 * CRUD operations untuk data siswa
 */

checkAuth();

let currentPage = 1;
const itemsPerPage = 10;
let allStudents = [];
let filteredStudents = [];

// Jurusan options dan mapping ke nama lengkap
const JURUSAN_OPTIONS = {
    'X': ['TKR A', 'TKR B', 'TKR C', 'TITL A', 'TITL B', 'TKP', 'ATP', 'H'],
    'XI': ['TKR A', 'TKR B', 'TKR C', 'TITL A', 'TITL B', 'TKP', 'ATP', 'H'],
    'XII': ['TKR A', 'TKR B', 'TKR C', 'TITL A', 'TITL B', 'TKP', 'ATP', 'H']
};

// Mapping singkat ke nama lengkap jurusan
const JURUSAN_NAMA_LENGKAP = {
    'TKR': 'Teknik Kendaraan Ringan',
    'TITL': 'Teknik Instalasi Tenaga Listrik',
    'TKP': 'Teknik Konstruksi Permesinan',
    'ATP': 'Agribisnis Tanaman Pangan',
    'H': 'Perhotelan'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    initSearchFilter();
    initAddButton();
    initForm();
    initPrintQRButton();
    initPrintQRModal();
});

/**
 * Load all students from Firestore
 */
async function loadStudents() {
    try {
        showLoading('Memuat data siswa...');
        
        const snapshot = await db.collection('students').get();
        
        allStudents = [];
        snapshot.forEach((doc) => {
            allStudents.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort client-side
        allStudents.sort((a, b) => a.nama.localeCompare(b.nama));
        
        filteredStudents = [...allStudents];
        displayStudents();
        Swal.close();
        
    } catch (error) {
        console.error('Error loading students:', error);
        showError('Gagal memuat data siswa: ' + error.message);
    }
}

/**
 * Display students in table
 */
function displayStudents() {
    const tbody = document.getElementById('studentTable');
    tbody.innerHTML = '';
    
    if (filteredStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Tidak ada data siswa</td></tr>';
        return;
    }
    
    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
    
    paginatedStudents.forEach((student, index) => {
        const { tingkat, jurusan } = parseKelas(student.kelas);
        const noUrut = startIndex + index + 1;
        
        const row = `
            <tr>
                <td>${noUrut}</td>
                <td>${student.nama}</td>
                <td>${student.nisn}</td>
                <td>${tingkat}</td>
                <td>${jurusan}</td>
                <td><span class="badge ${student.status === 'Aktif' ? 'badge-success' : 'badge-danger'}">${student.status}</span></td>
                <td>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-success" onclick="showQR('${student.id}', '${student.nisn}', '${student.nama.replace(/'/g, "\\'")}', '${tingkat}', '${jurusan}')" title="Generate QR">
                            <i class="bi bi-qr-code"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-primary" onclick="editStudent('${student.id}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-danger" onclick="deleteStudent('${student.id}', '${student.nama}')" title="Hapus">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    renderPagination();
}

/**
 * Parse kelas menjadi tingkat dan jurusan
 */
function parseKelas(kelas) {
    if (!kelas || kelas === '-') {
        return { tingkat: '-', jurusan: '-' };
    }
    
    // Format: "XI TKR A" atau "X TITL B"
    const parts = kelas.trim().split(/\s+/);
    if (parts.length >= 2) {
        const tingkat = parts[0];
        const jurusan = parts.slice(1).join(' ');
        return { tingkat, jurusan };
    }
    
    return { tingkat: kelas, jurusan: '-' };
}

/**
 * Render pagination
 */
function renderPagination() {
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<ul class="pagination">';
    
    // Previous button
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1});return false;">Previous</a>
             </li>`;
    
    // Page numbers - hanya tampilkan 1-5 halaman
    const maxPagesToShow = 5;
    let startPage = 1;
    let endPage = Math.min(totalPages, maxPagesToShow);
    
    // Jika ada lebih dari 5 halaman, geser window pagination
    if (totalPages > maxPagesToShow) {
        if (currentPage > 3) {
            startPage = currentPage - 2;
            endPage = Math.min(currentPage + 2, totalPages);
        }
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - (maxPagesToShow - 1));
        }
    }
    
    // Tampilkan "..." jika ada halaman sebelumnya
    if (startPage > 1) {
        html += `<li class="page-item disabled">
                    <span class="page-link">...</span>
                 </li>`;
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i});return false;">${i}</a>
                 </li>`;
    }
    
    // Tampilkan "..." jika ada halaman setelahnya
    if (endPage < totalPages) {
        html += `<li class="page-item disabled">
                    <span class="page-link">...</span>
                 </li>`;
    }
    
    // Next button
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1});return false;">Next</a>
             </li>`;
    
    html += '</ul>';
    pagination.innerHTML = html;
}

/**
 * Change page
 */
function changePage(page) {
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayStudents();
}

/**
 * Initialize search filter
 */
function initSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        filteredStudents = allStudents.filter((student) => {
            return student.nama.toLowerCase().includes(query) ||
                   student.nisn.toLowerCase().includes(query) ||
                   (student.nis && student.nis.toLowerCase().includes(query)) ||
                   student.kelas.toLowerCase().includes(query);
        });
        
        currentPage = 1;
        displayStudents();
    });
}

/**
 * Initialize add button
 */
function initAddButton() {
    document.getElementById('btnAddStudent').addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Tambah Siswa';
        document.getElementById('studentForm').reset();
        document.getElementById('studentId').value = '';
        const modal = new bootstrap.Modal(document.getElementById('studentModal'));
        modal.show();
    });
}

/**
 * Edit student
 */
async function editStudent(id) {
    try {
        const doc = await db.collection('students').doc(id).get();
        if (!doc.exists) {
            showError('Data siswa tidak ditemukan');
            return;
        }
        
        const student = doc.data();
        
        document.getElementById('modalTitle').textContent = 'Edit Siswa';
        document.getElementById('studentId').value = id;
        document.getElementById('nisn').value = student.nisn;
        document.getElementById('nama').value = student.nama;
        document.getElementById('jenisKelamin').value = student.jenisKelamin;
        document.getElementById('kelas').value = student.kelas || '';
        document.getElementById('alamat').value = student.alamat || '';
        document.getElementById('noHp').value = student.noHp || '';
        document.getElementById('status').value = student.status;
        
        const modal = new bootstrap.Modal(document.getElementById('studentModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error editing student:', error);
        showError('Gagal memuat data siswa');
    }
}

/**
 * Delete student
 */
async function deleteStudent(id, nama) {
    const result = await Swal.fire({
        title: 'Konfirmasi Hapus',
        text: `Hapus data siswa ${nama}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
        try {
            showLoading('Menghapus data...');
            await db.collection('students').doc(id).delete();
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Data siswa telah dihapus',
                confirmButtonColor: '#7C3AED'
            });
            
            loadStudents();
            
        } catch (error) {
            console.error('Error deleting student:', error);
            showError('Gagal menghapus data siswa');
        }
    }
}

/**
 * Initialize form submission
 */
function initForm() {
    document.getElementById('studentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('studentId').value;
        const studentData = {
            nisn: document.getElementById('nisn').value,
            nama: document.getElementById('nama').value,
            jenisKelamin: document.getElementById('jenisKelamin').value,
            kelas: document.getElementById('kelas').value || '-',
            alamat: document.getElementById('alamat').value,
            noHp: document.getElementById('noHp').value,
            status: document.getElementById('status').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        try {
            showLoading('Menyimpan data...');
            
            if (id) {
                // Update
                await db.collection('students').doc(id).update(studentData);
            } else {
                // Add new
                studentData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('students').add(studentData);
            }
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Data siswa telah disimpan',
                confirmButtonColor: '#7C3AED'
            });
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('studentModal'));
            modal.hide();
            
            loadStudents();
            
        } catch (error) {
            console.error('Error saving student:', error);
            showError('Gagal menyimpan data siswa');
        }
    });
}

// Make functions global for onclick handlers
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.changePage = changePage;

// QR Code functionality
window.showQR = showQR;
window.downloadQR = downloadQR;
window.printQR = printQR;

let currentQRCode = null;
let currentStudentData = {};

/**
 * Show QR Code for student
 */
function showQR(id, nisn, nama, tingkat, jurusan) {
    // Store student data
    currentStudentData = { id, nisn, nama, tingkat, jurusan };
    
    // Set student info
    document.getElementById('qrStudentName').textContent = nama;
    document.getElementById('qrStudentNISN').textContent = nisn;
    document.getElementById('qrStudentClass').textContent = `${tingkat} ${jurusan}`;
    
    // Clear previous QR code
    const container = document.getElementById('qrcodeContainer');
    container.innerHTML = '';
    
    // Generate QR Code
    currentQRCode = new QRCode(container, {
        text: nisn,
        width: 256,
        height: 256,
        colorDark: "#7C3AED",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('qrModal'));
    modal.show();
}

/**
 * Download QR Code
 */
function downloadQR() {
    const canvas = document.querySelector('#qrcodeContainer canvas');
    if (!canvas) {
        showError('QR Code tidak ditemukan');
        return;
    }
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `QR_${currentStudentData.nisn}_${currentStudentData.nama}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showSuccess('QR Code berhasil didownload');
    });
}

/**
 * Print QR Code
 */
function printQR() {
    const canvas = document.querySelector('#qrcodeContainer canvas');
    if (!canvas) {
        showError('QR Code tidak ditemukan');
        return;
    }
    
    const dataUrl = canvas.toDataURL();
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print QR Code - ${currentStudentData.nama}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                }
                .qr-container {
                    text-align: center;
                    border: 2px solid #7C3AED;
                    padding: 30px;
                    border-radius: 10px;
                }
                h2 {
                    color: #7C3AED;
                    margin-bottom: 10px;
                }
                .info {
                    margin: 15px 0;
                    font-size: 16px;
                }
                img {
                    margin: 20px 0;
                }
                @media print {
                    body {
                        margin: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="qr-container">
                <h2>${currentStudentData.nama}</h2>
                <div class="info">NISN: ${currentStudentData.nisn}</div>
                <div class="info">Kelas: ${currentStudentData.kelas}</div>
                <img src="${dataUrl}" alt="QR Code">
                <div class="info" style="margin-top: 20px; font-size: 14px; color: #666;">
                    Absensi Jama'ah SMK Negeri 1 Sangasanga
                </div>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    }
                }
            <\/script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

/**
 * Initialize Cetak QR button
 */
function initPrintQRButton() {
    const btnPrintQR = document.getElementById('btnPrintQR');
    if (btnPrintQR) {
        btnPrintQR.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('printQRModal'));
            modal.show();
        });
    }
}

/**
 * Initialize Cetak QR modal
 */
function initPrintQRModal() {
    // Handle print type change
    document.querySelectorAll('input[name="printType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const filterOptions = document.getElementById('filterOptions');
            if (e.target.value === 'filter') {
                filterOptions.style.display = 'block';
            } else {
                filterOptions.style.display = 'none';
            }
        });
    });
    
    // Handle tingkat change
    document.getElementById('filterTingkat').addEventListener('change', (e) => {
        const tingkat = e.target.value;
        const jurusanSelect = document.getElementById('filterJurusan');
        jurusanSelect.innerHTML = '<option value="">Pilih Jurusan</option>';
        
        if (tingkat && JURUSAN_OPTIONS[tingkat]) {
            JURUSAN_OPTIONS[tingkat].forEach(jurusan => {
                const option = document.createElement('option');
                option.value = jurusan;
                option.textContent = jurusan;
                jurusanSelect.appendChild(option);
            });
        }
    });
    
    // Handle cetak button
    document.getElementById('btnCetakQR').addEventListener('click', () => {
        const printType = document.querySelector('input[name="printType"]:checked').value;
        const format = document.querySelector('input[name="format"]:checked').value;
        
        if (printType === 'filter') {
            const tingkat = document.getElementById('filterTingkat').value;
            const jurusan = document.getElementById('filterJurusan').value;
            
            if (!tingkat || !jurusan) {
                showError('Pilih Tingkat dan Jurusan');
                return;
            }
            
            generateQRPrint(tingkat, jurusan, format);
        } else {
            generateQRPrint(null, null, format);
        }
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('printQRModal')).hide();
    });
}

/**
 * Generate QR print page
 */
function generateQRPrint(tingkat, jurusan, format) {
    showLoading('Membuat halaman cetak...');
    
    // Filter students
    let studentsForPrint = allStudents;
    
    if (tingkat && jurusan) {
        // Extract singkat dari jurusan (e.g., "TKR" dari "TKR A")
        const jurusanSingkat = jurusan.split(' ')[0]; // "TKR A" -> "TKR"
        const namaLengkap = JURUSAN_NAMA_LENGKAP[jurusanSingkat] || jurusan;
        
        console.log(`Filter: Tingkat=${tingkat}, Jurusan=${jurusan} (singkat=${jurusanSingkat})`);
        
        // Filter dengan strict matching - HANYA tingkat dan jurusan yang dipilih
        studentsForPrint = allStudents.filter(s => {
            if (!s.kelas) return false;
            
            const kelasUpper = s.kelas.toUpperCase();
            const tingkatMatch = kelasUpper.includes(tingkat.toUpperCase());
            
            // Extract nomor dari jurusan (A, B, C)
            const jurusanAngka = jurusan.split(' ')[1]; // "TKR A" -> "A"
            
            // Match BOTH singkat dan jurusan angka
            const jurusanMatch = (kelasUpper.includes(jurusanSingkat.toUpperCase()) || 
                                 kelasUpper.includes(namaLengkap.toUpperCase())) &&
                                kelasUpper.includes(jurusanAngka);
            
            if (tingkatMatch && jurusanMatch) {
                console.log(`✓ Match: ${s.nama} (${s.kelas})`);
            }
            
            return tingkatMatch && jurusanMatch;
        });
        
        console.log('Filtered students count:', studentsForPrint.length);
    }
    
    if (studentsForPrint.length === 0) {
        Swal.close();
        showError('Tidak ada data siswa untuk dicetak');
        return;
    }
    
    // Generate QR codes
    generateQRCodes(studentsForPrint, format, tingkat, jurusan);
}

/**
 * Generate QR codes for printing
 */
async function generateQRCodes(students, format, tingkat, jurusan) {
    try {
        showLoading('Membuat QR Code...');
        
        // Generate QR codes with proper delay
        const qrCodes = [];
        
        for (const student of students) {
            // Create temporary div for QR generation
            const tempDiv = document.createElement('div');
            tempDiv.style.display = 'none';
            document.body.appendChild(tempDiv);
            
            // Generate QR Code
            new QRCode(tempDiv, {
                text: student.nisn,
                width: 120,
                height: 120,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            
            // Wait a bit for QR to render
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Get the canvas from the QR code
            const canvas = tempDiv.querySelector('canvas');
            let qrDataUrl = '';
            
            if (canvas) {
                // Canvas QR code
                qrDataUrl = canvas.toDataURL('image/png');
            } else {
                // Fallback: SVG QR code (if library generates SVG)
                const svg = tempDiv.querySelector('svg');
                if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    qrDataUrl = 'data:image/svg+xml;base64,' + btoa(svgData);
                }
            }
            
            const { tingkat: t, jurusan: j } = parseKelas(student.kelas);
            
            qrCodes.push({
                nama: student.nama,
                nisn: student.nisn,
                tingkat: t,
                jurusan: j,
                qrImage: qrDataUrl
            });
            
            // Remove temp div
            document.body.removeChild(tempDiv);
        }
        
        Swal.close();
        
        if (format === 'pdf') {
            // Generate PDF with jsPDF
            await generatePDFWithQR(qrCodes, tingkat, jurusan);
        } else {
            // Generate print page
            generatePrintPage(qrCodes, tingkat, jurusan);
        }
        
    } catch (error) {
        Swal.close();
        console.error('Error generating QR codes:', error);
        showError('Gagal membuat QR Code: ' + error.message);
    }
}

/**
 * Generate PDF with QR codes
 */
async function generatePDFWithQR(qrCodes, tingkat, jurusan) {
    try {
        // Check if jsPDF is available
        if (typeof jsPDF === 'undefined') {
            console.warn('jsPDF not available, using print page instead');
            generatePrintPage(qrCodes, tingkat, jurusan);
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const colsPerRow = 4;
        const itemWidth = (pageWidth - margin * 2 - 6) / colsPerRow;
        const itemHeight = itemWidth + 35;
        
        let row = 0;
        let col = 0;
        let pageNum = 1;
        
        // Add header on first page
        let isFirstPage = true;
        
        qrCodes.forEach((qr, index) => {
            // Add new page if needed
            if (row * (itemHeight + 5) + margin + 30 > pageHeight - 10) {
                pdf.addPage();
                row = 0;
                col = 0;
                isFirstPage = false;
                pageNum++;
            }
            
            // Add header on first page only
            if (isFirstPage && index === 0) {
                pdf.setFontSize(14);
                pdf.setTextColor(124, 58, 237);
                pdf.text('QR Code Siswa', pageWidth / 2, 12, { align: 'center' });
                
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                pdf.text('Absensi Jama\'ah SMK Negeri 1 Sangasanga', pageWidth / 2, 18, { align: 'center' });
                
                if (tingkat) {
                    pdf.text(`Tingkat ${tingkat} - ${jurusan}`, pageWidth / 2, 24, { align: 'center' });
                }
                
                // Draw line
                pdf.setDrawColor(124, 58, 237);
                pdf.line(margin, 26, pageWidth - margin, 26);
            }
            
            // Calculate position
            const x = margin + col * (itemWidth + 1.5);
            const y = margin + 30 + row * (itemHeight + 5);
            
            // Draw border
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(x, y, itemWidth, itemHeight);
            
            // Add QR image if available
            if (qr.qrImage && qr.qrImage.length > 0) {
                try {
                    pdf.addImage(qr.qrImage, 'PNG', x + 5, y + 5, itemWidth - 10, itemWidth - 10);
                } catch (e) {
                    console.warn('Could not add QR image:', e);
                    // Draw placeholder
                    pdf.setDrawColor(200, 200, 200);
                    pdf.setFillColor(240, 240, 240);
                    pdf.rect(x + 5, y + 5, itemWidth - 10, itemWidth - 10, 'FD');
                }
            } else {
                // Draw placeholder for missing QR
                pdf.setDrawColor(200, 200, 200);
                pdf.setFillColor(240, 240, 240);
                pdf.rect(x + 5, y + 5, itemWidth - 10, itemWidth - 10, 'FD');
            }
            
            // Add text
            const textStartY = y + itemWidth;
            pdf.setFontSize(8);
            pdf.setTextColor(0, 0, 0);
            pdf.text(qr.nama, x + itemWidth / 2, textStartY + 5, { align: 'center', maxWidth: itemWidth - 4 });
            
            pdf.setFontSize(7);
            pdf.text(`NISN: ${qr.nisn}`, x + itemWidth / 2, textStartY + 11, { align: 'center' });
            pdf.text(`${qr.tingkat} ${qr.jurusan}`, x + itemWidth / 2, textStartY + 17, { align: 'center' });
            
            // Move to next position
            col++;
            if (col >= colsPerRow) {
                col = 0;
                row++;
            }
        });
        
        // Save PDF
        const fileName = `QR_${tingkat}_${jurusan}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        showSuccess(`PDF berhasil didownload: ${fileName}`);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showError('Gagal membuat PDF. Gunakan Print to PDF dari browser.');
    }
}

/**
 * Generate print page with QR codes
 */
function generatePrintPage(qrCodes, tingkat, jurusan) {
    try {
        const printWindow = window.open('', '_blank');
        
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Cetak QR Code</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    html, body {
                        width: 100%;
                        height: 100%;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        padding: 15px;
                        background: white;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 3px solid #7C3AED;
                        padding-bottom: 10px;
                    }
                    .header h2 {
                        color: #7C3AED;
                        margin-bottom: 5px;
                        font-size: 16px;
                    }
                    .header p {
                        color: #666;
                        font-size: 11px;
                        margin: 2px 0;
                    }
                    .qr-container {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 12px;
                        margin: 0;
                    }
                    .qr-card {
                        border: 1px solid #ddd;
                        padding: 10px;
                        text-align: center;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                    }
                    .qr-image {
                        width: 100%;
                        height: auto;
                        margin-bottom: 8px;
                        border: 1px solid #eee;
                        padding: 5px;
                        background: white;
                    }
                    .qr-text h5 {
                        font-size: 10px;
                        margin: 5px 0 3px 0;
                        font-weight: bold;
                        line-height: 1.2;
                    }
                    .qr-text p {
                        font-size: 8px;
                        margin: 1px 0;
                        color: #555;
                    }
                    @media print {
                        body {
                            padding: 5px;
                        }
                        .qr-container {
                            gap: 8px;
                        }
                        .qr-card {
                            padding: 8px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>QR Code Siswa</h2>
                    <p>Absensi Jama'ah SMK Negeri 1 Sangasanga</p>
                    ${tingkat ? `<p>Tingkat ${tingkat} - ${jurusan}</p>` : ''}
                </div>
                <div class="qr-container">
        `;
        
        // Add QR codes
        qrCodes.forEach(qr => {
            htmlContent += `
                <div class="qr-card">
                    ${qr.qrImage ? `<img src="${qr.qrImage}" class="qr-image" alt="QR Code">` : '<div style="width:100%;height:120px;background:#f0f0f0;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;color:#999;">QR Not Generated</div>'}
                    <div class="qr-text">
                        <h5>${qr.nama}</h5>
                        <p>NISN: ${qr.nisn}</p>
                        <p>${qr.tingkat} ${qr.jurusan}</p>
                    </div>
                </div>
            `;
        });
        
        htmlContent += `
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
        }, 800);
        
    } catch (error) {
        Swal.close();
        console.error('Error generating print page:', error);
        showError('Gagal membuat halaman cetak: ' + error.message);
    }
}
