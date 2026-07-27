/**
 * QR Scanner Module
 * Scan QR Code untuk absensi
 */

checkAuth();

let html5QrCode = null;
let isScanning = false;
let currentOperator = null;
let timeSettings = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadOperatorInfo();
    await loadTimeSettings();
    await loadTodayHistory();
    initScanner();
});

/**
 * Load operator info
 */
async function loadOperatorInfo() {
    const user = auth.currentUser;
    if (user) {
        const adminDoc = await db.collection('admins').doc(user.uid).get();
        if (adminDoc.exists) {
            currentOperator = adminDoc.data().nama;
        }
    }
}

/**
 * Load time settings
 */
async function loadTimeSettings() {
    try {
        const doc = await db.collection('settings').doc('time').get();
        if (doc.exists) {
            timeSettings = doc.data();
        } else {
            // Default settings
            timeSettings = {
                dhuhaStart: '06:30',
                dhuhaEnd: '07:30',
                zuhurStart: '11:30',
                zuhurEnd: '12:30'
            };
        }
    } catch (error) {
        console.error('Error loading time settings:', error);
    }
}

/**
 * Initialize scanner
 */
function initScanner() {
    const btnStart = document.getElementById('btnStartScan');
    const btnStop = document.getElementById('btnStopScan');
    
    btnStart.addEventListener('click', async () => {
        try {
            html5QrCode = new Html5Qrcode("reader");
            
            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                onScanSuccess,
                onScanError
            );
            
            isScanning = true;
            btnStart.style.display = 'none';
            btnStop.style.display = 'block';
            
        } catch (error) {
            console.error('Error starting scanner:', error);
            showError('Gagal memulai scanner. Pastikan kamera diizinkan.');
        }
    });
    
    btnStop.addEventListener('click', async () => {
        if (html5QrCode) {
            await html5QrCode.stop();
            html5QrCode = null;
            isScanning = false;
            btnStart.style.display = 'block';
            btnStop.style.display = 'none';
        }
    });
}

/**
 * On scan success
 */
async function onScanSuccess(decodedText) {
    if (!isScanning) return;
    
    // Pause scanning temporarily
    isScanning = false;
    
    try {
        const nisn = decodedText.trim();
        const jenisAbsensi = document.getElementById('jenisAbsensi').value;
        
        // Find student
        const studentSnapshot = await db.collection('students')
            .where('nisn', '==', nisn)
            .where('status', '==', 'Aktif')
            .get();
        
        if (studentSnapshot.empty) {
            Swal.fire({
                icon: 'error',
                title: 'Siswa Tidak Ditemukan',
                text: `NISN ${nisn} tidak terdaftar atau tidak aktif`,
                confirmButtonColor: '#EF4444'
            });
            setTimeout(() => { isScanning = true; }, 2000);
            return;
        }
        
        const studentDoc = studentSnapshot.docs[0];
        const studentData = studentDoc.data();
        
        // Check duplicate
        const todayDate = getTodayDate();
        const duplicateCheck = await db.collection('attendance')
            .where('nisn', '==', nisn)
            .where('tanggal', '==', todayDate)
            .where('jenisAbsensi', '==', jenisAbsensi)
            .get();
        
        if (!duplicateCheck.empty) {
            Swal.fire({
                icon: 'warning',
                title: 'Absensi Sudah Tercatat',
                text: `${studentData.nama} sudah melakukan absensi ${jenisAbsensi} hari ini`,
                confirmButtonColor: '#F59E0B'
            });
            setTimeout(() => { isScanning = true; }, 2000);
            return;
        }
        
        // Determine status based on time
        const now = new Date();
        const currentTime = formatTime(now);
        const statusWaktu = determineTimeStatus(jenisAbsensi, currentTime);
        
        // Save attendance
        const attendanceData = {
            nisn: nisn,
            nama: studentData.nama,
            kelas: studentData.kelas,
            jenisAbsensi: jenisAbsensi,
            tanggal: todayDate,
            jam: currentTime,
            statusWaktu: statusWaktu,
            operator: currentOperator,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('attendance').add(attendanceData);
        
        // Success notification
        Swal.fire({
            icon: 'success',
            title: 'Absensi Berhasil!',
            html: `
                <p><strong>${studentData.nama}</strong></p>
                <p>NISN: ${nisn}</p>
                <p>Kelas: ${studentData.kelas}</p>
                <p>Status: <span style="color: ${statusWaktu === 'Tepat Waktu' ? '#10B981' : '#F59E0B'}">${statusWaktu}</span></p>
            `,
            confirmButtonColor: '#7C3AED',
            timer: 2000
        });
        
        // Reload history
        await loadTodayHistory();
        
        setTimeout(() => { isScanning = true; }, 2000);
        
    } catch (error) {
        console.error('Error processing scan:', error);
        showError('Terjadi kesalahan saat memproses absensi');
        setTimeout(() => { isScanning = true; }, 2000);
    }
}

/**
 * On scan error (ignore)
 */
function onScanError(error) {
    // Ignore scan errors
}

/**
 * Determine time status
 */
function determineTimeStatus(jenisAbsensi, currentTime) {
    if (!timeSettings) return 'Tepat Waktu';
    
    let endTime;
    
    if (jenisAbsensi === 'Sholat Dhuha') {
        endTime = timeSettings.dhuhaEnd;
    } else if (jenisAbsensi === 'Sholat Zuhur') {
        endTime = timeSettings.zuhurEnd;
    } else {
        return 'Tepat Waktu';
    }
    
    // Compare time
    const currentMinutes = timeToMinutes(currentTime);
    const endMinutes = timeToMinutes(endTime);
    
    return currentMinutes <= endMinutes ? 'Tepat Waktu' : 'Terlambat';
}

/**
 * Convert time to minutes
 */
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Load today's scan history
 */
async function loadTodayHistory() {
    const todayDate = getTodayDate();
    
    try {
        const snapshot = await db.collection('attendance')
            .where('tanggal', '==', todayDate)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();
        
        const historyDiv = document.getElementById('scanHistory');
        historyDiv.innerHTML = '';
        
        if (snapshot.empty) {
            historyDiv.innerHTML = '<p class="text-center text-muted">Belum ada data scan hari ini</p>';
            return;
        }
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            const item = document.createElement('div');
            item.className = 'scan-history-item';
            item.innerHTML = `
                <div>
                    <h6 class="mb-1">${data.nama}</h6>
                    <p class="text-muted mb-0">${data.jenisAbsensi} - ${data.jam}</p>
                </div>
                <span class="badge ${data.statusWaktu === 'Tepat Waktu' ? 'badge-success' : 'badge-warning'}">
                    ${data.statusWaktu}
                </span>
            `;
            historyDiv.appendChild(item);
        });
        
    } catch (error) {
        console.error('Error loading history:', error);
    }
}
