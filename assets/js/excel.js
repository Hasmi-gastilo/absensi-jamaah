/**
 * Excel Import Module
 * Import data siswa dari file Excel
 */

checkAuth();

let excelData = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initUploadArea();
    initImportButton();
});

/**
 * Initialize upload area
 */
function initUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('excelFile');
    const btnSelectFile = document.getElementById('btnSelectFile');
    
    // Click to select file
    btnSelectFile.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#7C3AED';
        uploadArea.style.background = 'rgba(124, 58, 237, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
}

/**
 * Handle file upload
 */
function handleFile(file) {
    // Validate file type
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type)) {
        showError('Format file tidak valid. Gunakan file .xlsx atau .xls');
        return;
    }
    
    // Show file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileInfo').style.display = 'block';
    
    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
                showError('File Excel kosong');
                return;
            }
            
            // Process data
            processExcelData(jsonData);
            
        } catch (error) {
            console.error('Error reading Excel:', error);
            showError('Gagal membaca file Excel');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

/**
 * Process Excel data
 */
function processExcelData(data) {
    excelData = [];
    
    data.forEach((row, index) => {
        // Validate required fields
        if (!row.NISN || !row.Nama) {
            console.warn(`Baris ${index + 2} dilewati: NISN atau Nama kosong`);
            return;
        }
        
        const student = {
            nisn: String(row.NISN),
            nama: row.Nama,
            jenisKelamin: row['Jenis Kelamin'] || 'Laki-laki',
            kelas: row.Kelas || '-',
            alamat: row.Alamat || '',
            noHp: row['No HP'] ? String(row['No HP']) : '',
            status: row.Status || 'Aktif'
        };
        
        excelData.push(student);
    });
    
    // Display preview
    displayPreview();
    
    // Enable import button
    document.getElementById('btnImport').disabled = false;
}

/**
 * Display preview of imported data
 */
function displayPreview() {
    const previewTable = document.getElementById('previewTable');
    previewTable.innerHTML = '';
    
    // Show only first 5 rows
    const previewData = excelData.slice(0, 5);
    
    previewData.forEach((student, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${student.nisn}</td>
                <td>${student.nama}</td>
                <td>${student.jenisKelamin}</td>
                <td>${student.kelas}</td>
                <td><span class="badge ${student.status === 'Aktif' ? 'badge-success' : 'badge-danger'}">${student.status}</span></td>
            </tr>
        `;
        previewTable.innerHTML += row;
    });
    
    // Show total
    document.getElementById('totalData').textContent = excelData.length;
    
    // Show preview section
    document.getElementById('previewSection').style.display = 'block';
}

/**
 * Initialize import button
 */
function initImportButton() {
    document.getElementById('btnImport').addEventListener('click', async () => {
        if (excelData.length === 0) {
            showError('Tidak ada data untuk diimport');
            return;
        }
        
        const result = await Swal.fire({
            title: 'Konfirmasi Import',
            text: `Import ${excelData.length} data siswa ke database?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#7C3AED',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Ya, Import',
            cancelButtonText: 'Batal'
        });
        
        if (result.isConfirmed) {
            await importToFirestore();
        }
    });
}

/**
 * Import data to Firestore
 */
async function importToFirestore() {
    try {
        showLoading('Mengimport data ke database...');
        
        let successCount = 0;
        let errorCount = 0;
        
        // Use batch for better performance
        const batch = db.batch();
        
        for (const student of excelData) {
            try {
                // Check if NISN already exists
                const existingStudent = await db.collection('students')
                    .where('nisn', '==', student.nisn)
                    .get();
                
                if (!existingStudent.empty) {
                    // Update existing
                    const docId = existingStudent.docs[0].id;
                    const docRef = db.collection('students').doc(docId);
                    batch.update(docRef, {
                        ...student,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    // Add new
                    const docRef = db.collection('students').doc();
                    batch.set(docRef, {
                        ...student,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                successCount++;
                
            } catch (error) {
                console.error(`Error importing student ${student.nisn}:`, error);
                errorCount++;
            }
        }
        
        // Commit batch
        await batch.commit();
        
        Swal.fire({
            icon: 'success',
            title: 'Import Berhasil!',
            html: `
                <p>Berhasil: ${successCount} data</p>
                ${errorCount > 0 ? `<p>Gagal: ${errorCount} data</p>` : ''}
            `,
            confirmButtonColor: '#7C3AED'
        }).then(() => {
            // Reset
            excelData = [];
            document.getElementById('excelFile').value = '';
            document.getElementById('fileInfo').style.display = 'none';
            document.getElementById('previewSection').style.display = 'none';
            document.getElementById('btnImport').disabled = true;
        });
        
    } catch (error) {
        console.error('Error importing to Firestore:', error);
        showError('Gagal mengimport data ke database');
    }
}

/**
 * Download template Excel
 */
function downloadTemplate() {
    try {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Template data dengan contoh SMK
        const templateData = [
            {
                'No': 1,
                'NISN': '253164',
                'Nama': 'Ahmad Desmon Firmanda',
                'Jenis Kelamin': 'Laki-laki',
                'Kelas': 'XI TEKNIK INSTALASI TENAGA LISTRIK A',
                'Alamat': 'Jl. Mawar No. 10',
                'No HP': '081234567890',
                'Status': 'Aktif'
            },
            {
                'No': 2,
                'NISN': '253155',
                'Nama': 'Ajni Sulian Muhammad',
                'Jenis Kelamin': 'Laki-laki',
                'Kelas': 'XI TEKNIK INSTALASI TENAGA LISTRIK A',
                'Alamat': 'Jl. Melati No. 5',
                'No HP': '082345678901',
                'Status': 'Aktif'
            },
            {
                'No': 3,
                'NISN': '253178',
                'Nama': 'Adrian Akhinaya Asliono',
                'Jenis Kelamin': 'Laki-laki',
                'Kelas': 'XI TEKNIK INSTALASI TENAGA LISTRIK B',
                'Alamat': 'Jl. Anggrek No. 15',
                'No HP': '083456789012',
                'Status': 'Aktif'
            },
            {
                'No': 4,
                'NISN': '253203',
                'Nama': 'Abdul Hafiz',
                'Jenis Kelamin': 'Laki-laki',
                'Kelas': 'XI TEKNIK KENDARAAN RINGAN OTOMOTIF B',
                'Alamat': 'Jl. Dahlia No. 20',
                'No HP': '084567890123',
                'Status': 'Aktif'
            }
        ];
        
        // Convert to worksheet
        const ws = XLSX.utils.json_to_sheet(templateData);
        
        // Set column widths (adjust for longer class names)
        ws['!cols'] = [
            { wch: 5 },  // No
            { wch: 12 }, // NISN
            { wch: 30 }, // Nama
            { wch: 15 }, // Jenis Kelamin
            { wch: 45 }, // Kelas (lebih lebar untuk nama kelas panjang)
            { wch: 30 }, // Alamat
            { wch: 15 }, // No HP
            { wch: 12 }  // Status
        ];
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
        
        // Add instruction sheet
        const instructions = [
            { 'PETUNJUK PENGISIAN': 'Kolom yang WAJIB diisi:' },
            { 'PETUNJUK PENGISIAN': '1. NISN (wajib, unik per siswa)' },
            { 'PETUNJUK PENGISIAN': '2. Nama (wajib)' },
            { 'PETUNJUK PENGISIAN': '' },
            { 'PETUNJUK PENGISIAN': 'Kolom opsional:' },
            { 'PETUNJUK PENGISIAN': '- Jenis Kelamin: Laki-laki atau Perempuan' },
            { 'PETUNJUK PENGISIAN': '- Kelas: Tulis lengkap dengan jurusan' },
            { 'PETUNJUK PENGISIAN': '  Contoh: XI TEKNIK INSTALASI TENAGA LISTRIK A' },
            { 'PETUNJUK PENGISIAN': '- Alamat, No HP: Boleh dikosongkan' },
            { 'PETUNJUK PENGISIAN': '- Status: Aktif atau Tidak Aktif' },
            { 'PETUNJUK PENGISIAN': '' },
            { 'PETUNJUK PENGISIAN': 'TIPS:' },
            { 'PETUNJUK PENGISIAN': '- Hapus data contoh di sheet "Data Siswa"' },
            { 'PETUNJUK PENGISIAN': '- Isi dengan data siswa Anda' },
            { 'PETUNJUK PENGISIAN': '- Nama kelas boleh panjang (maksimal 100 karakter)' },
            { 'PETUNJUK PENGISIAN': '- Gunakan format yang konsisten untuk nama kelas' }
        ];
        
        const wsInstructions = XLSX.utils.json_to_sheet(instructions);
        wsInstructions['!cols'] = [{ wch: 60 }];
        XLSX.utils.book_append_sheet(wb, wsInstructions, 'Petunjuk');
        
        // Generate filename dengan tanggal
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const fileName = `Template_Data_Siswa_${dateStr}.xlsx`;
        
        // Write and download
        XLSX.writeFile(wb, fileName);
        
        showSuccess('Template Excel berhasil didownload! Baca sheet "Petunjuk" untuk cara pengisian.');
        
    } catch (error) {
        console.error('Error downloading template:', error);
        showError('Gagal mendownload template Excel');
    }
}

// Initialize download template button
document.addEventListener('DOMContentLoaded', () => {
    const btnDownloadTemplate = document.getElementById('btnDownloadTemplate');
    if (btnDownloadTemplate) {
        btnDownloadTemplate.addEventListener('click', downloadTemplate);
    }
});
