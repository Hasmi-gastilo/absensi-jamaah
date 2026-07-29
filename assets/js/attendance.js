/**
 * Attendance Module
 * Menampilkan data absensi dengan filter
 */

checkAuth();

let currentPage = 1;
const itemsPerPage = 15;
let allAttendance = [];
let filteredAttendance = [];

// Mapping singkat ke nama lengkap jurusan
const JURUSAN_NAMA_LENGKAP = {
    'TKR': 'Teknik Kendaraan Ringan',
    'TITL': 'Teknik Instalasi Tenaga Listrik',
    'TKP': 'Teknik Konstruksi dan Perumahan',
    'ATPH': 'Agribisnis Tanaman Pangan dan Hortikultura',
    'ATP': 'Agribisnis Tanaman Pangan',
    'H': 'Perhotelan'
};

/**
 * Parse kelas menjadi tingkat dan jurusan
 * Handle both short (XI TKR A) and long format (XI Teknik Kendaraan Ringan A)
 */
function parseKelas(kelas) {
    if (!kelas || kelas === '-') {
        return { tingkat: '-', jurusan: '-' };
    }
    
    const kelasUpper = kelas.toUpperCase().trim();
    
    // Extract tingkat (X, XI, XII)
    const tingkatMatch = kelasUpper.match(/^(X|XI|XII)\s+/);
    if (!tingkatMatch) {
        return { tingkat: kelas, jurusan: '-' };
    }
    
    const tingkat = tingkatMatch[1];
    const sisaNama = kelasUpper.substring(tingkatMatch[0].length).trim();
    
    // Try to identify jurusan and convert to full name
    let jurusan = sisaNama;
    
    // Check if it's a short format and convert to long format
    if (sisaNama.startsWith('TKR')) {
        jurusan = sisaNama.replace('TKR', 'TEKNIK KENDARAAN RINGAN');
    } else if (sisaNama.startsWith('TITL')) {
        jurusan = sisaNama.replace('TITL', 'TEKNIK INSTALASI TENAGA LISTRIK');
    } else if (sisaNama.startsWith('TKP')) {
        jurusan = sisaNama.replace('TKP', 'TEKNIK KONSTRUKSI DAN PERUMAHAN');
    } else if (sisaNama.startsWith('ATPH')) {
        jurusan = sisaNama.replace('ATPH', 'AGRIBISNIS TANAMAN PANGAN DAN HORTIKULTURA');
    } else if (sisaNama.startsWith('ATP')) {
        jurusan = sisaNama.replace('ATP', 'AGRIBISNIS TANAMAN PANGAN');
    }
    
    return { tingkat, jurusan };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAttendance();
    initFilters();
});

/**
 * Load all attendance data
 */
async function loadAttendance() {
    try {
        showLoading('Memuat data absensi...');
        
        const snapshot = await db.collection('attendance')
            .orderBy('timestamp', 'desc')
            .limit(500)
            .get();
        
        allAttendance = [];
        snapshot.forEach((doc) => {
            allAttendance.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        filteredAttendance = [...allAttendance];
        displayAttendance();
        Swal.close();
        
    } catch (error) {
        console.error('Error loading attendance:', error);
        showError('Gagal memuat data absensi');
    }
}

/**
 * Display attendance in table
 */
function displayAttendance() {
    const tbody = document.getElementById('attendanceTable');
    tbody.innerHTML = '';
    
    if (filteredAttendance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Tidak ada data absensi</td></tr>';
        return;
    }
    
    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredAttendance.slice(startIndex, endIndex);
    
    paginatedData.forEach((data) => {
        const { tingkat, jurusan } = parseKelas(data.kelas);
        
        const row = `
            <tr>
                <td>${data.tanggal}</td>
                <td>${data.jam}</td>
                <td>${data.nisn}</td>
                <td>${data.nama}</td>
                <td>${tingkat}</td>
                <td>${jurusan}</td>
                <td>${data.jenisAbsensi}</td>
                <td><span class="badge ${data.statusWaktu === 'Tepat Waktu' ? 'badge-success' : 'badge-warning'}">${data.statusWaktu}</span></td>
                <td>${data.operator || '-'}</td>
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
    const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<ul class="pagination">';
    
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
             </li>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                     </li>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
             </li>`;
    
    html += '</ul>';
    pagination.innerHTML = html;
}

/**
 * Change page
 */
function changePage(page) {
    const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayAttendance();
}

/**
 * Initialize filters
 */
function initFilters() {
    // Set today's date as default
    document.getElementById('filterDate').valueAsDate = new Date();
    
    // Date filter
    document.getElementById('filterDate').addEventListener('change', applyFilters);
    
    // Jenis filter
    document.getElementById('filterJenis').addEventListener('change', applyFilters);
    
    // Status filter
    document.getElementById('filterStatus').addEventListener('change', applyFilters);
    
    // Search filter
    document.getElementById('searchAttendance').addEventListener('input', applyFilters);
    
    // Apply initial filter (today)
    applyFilters();
}

/**
 * Apply all filters
 */
function applyFilters() {
    const filterDate = document.getElementById('filterDate').value;
    const filterJenis = document.getElementById('filterJenis').value;
    const filterStatus = document.getElementById('filterStatus').value;
    const searchQuery = document.getElementById('searchAttendance').value.toLowerCase();
    
    filteredAttendance = allAttendance.filter((data) => {
        // Date filter
        if (filterDate && data.tanggal !== filterDate) return false;
        
        // Jenis filter
        if (filterJenis && data.jenisAbsensi !== filterJenis) return false;
        
        // Status filter
        if (filterStatus && data.statusWaktu !== filterStatus) return false;
        
        // Search filter
        if (searchQuery) {
            const searchText = `${data.nama} ${data.nisn} ${data.kelas}`.toLowerCase();
            if (!searchText.includes(searchQuery)) return false;
        }
        
        return true;
    });
    
    currentPage = 1;
    displayAttendance();
}

// Make function global
window.changePage = changePage;
