/**
 * Students Module
 * CRUD operations untuk data siswa
 */

checkAuth();

let currentPage = 1;
const itemsPerPage = 10;
let allStudents = [];
let filteredStudents = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    initSearchFilter();
    initAddButton();
    initForm();
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
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Tidak ada data siswa</td></tr>';
        return;
    }
    
    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
    
    paginatedStudents.forEach((student) => {
        const row = `
            <tr>
                <td>${student.nisn}</td>
                <td>${student.nama}</td>
                <td>${student.jenisKelamin}</td>
                <td>${student.kelas || '-'}</td>
                <td>${student.noHp || '-'}</td>
                <td><span class="badge ${student.status === 'Aktif' ? 'badge-success' : 'badge-danger'}">${student.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="showQR('${student.id}', '${student.nisn}', '${student.nama.replace(/'/g, "\\'")}', '${student.kelas || '-'}')">
                        <i class="bi bi-qr-code"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="editStudent('${student.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.id}', '${student.nama}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    renderPagination();
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
function showQR(id, nisn, nama, kelas) {
    // Store student data
    currentStudentData = { id, nisn, nama, kelas };
    
    // Set student info
    document.getElementById('qrStudentName').textContent = nama;
    document.getElementById('qrStudentNISN').textContent = nisn;
    document.getElementById('qrStudentClass').textContent = kelas;
    
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
