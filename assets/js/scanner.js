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
    initManualInput();
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
                subuhStart: '04:30',
                subuhEnd: '05:30',
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
            // Re-initialize with only QR Code support for faster processing
            // (0 is QR_CODE in Html5QrcodeSupportedFormats)
            html5QrCode = new Html5Qrcode("reader", { formatsToSupport: [ 0 ] });
            
            // Use facingMode: environment instead of manually picking camera ID.
            // On modern iPhones (13, 14, 15), picking by ID often selects the telephoto 
            // or ultrawide lens which cannot focus on close QR codes.
            // Letting the OS pick "environment" selects the primary wide lens with auto-focus.
            const cameraConfig = { facingMode: "environment" };
            
            // Optimized config for iOS and Android
            const config = {
                fps: 10, // 10-15 FPS is optimal. 30 FPS causes battery drain and frame dropping on older phones.
                qrbox: function(viewfinderWidth, viewfinderHeight) {
                    // Make scan box large enough to easily fit QR code
                    let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    let qrboxSize = Math.floor(minEdge * 0.85); // 85% of smaller dimension
                    return {
                        width: qrboxSize,
                        height: qrboxSize
                    };
                },
                aspectRatio: 1.0,
                disableFlip: false
            };
            
            await html5QrCode.start(
                cameraConfig,
                config,
                onScanSuccess,
                onScanError
            );
            
            isScanning = true;
            btnStart.style.display = 'none';
            btnStop.style.display = 'block';
            
            console.log('Scanner started successfully');
            
        } catch (error) {
            console.error('Error starting scanner:', error);
            
            // Show detailed error for iOS users
            let errorMsg = 'Gagal memulai scanner. ';
            
            if (error.name === 'NotAllowedError') {
                errorMsg += 'Kamera diblokir. Buka Settings > Safari > Camera dan izinkan akses kamera.';
            } else if (error.name === 'NotFoundError') {
                errorMsg += 'Kamera tidak ditemukan.';
            } else if (error.name === 'NotReadableError') {
                errorMsg += 'Kamera sedang digunakan aplikasi lain.';
            } else {
                errorMsg += 'Pastikan kamera diizinkan dan coba lagi.';
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memulai Scanner',
                html: `<p>${errorMsg}</p><p style="font-size:12px;color:#666;margin-top:10px;">Error: ${error.message}</p>`,
                confirmButtonColor: '#EF4444'
            });
        }
    });
    
    btnStop.addEventListener('click', async () => {
        if (html5QrCode) {
            try {
                await html5QrCode.stop();
                html5QrCode.clear();
                html5QrCode = null;
            } catch (error) {
                console.error('Error stopping scanner:', error);
            }
            
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
        
        // DEBUG: Log QR scan result
        console.log('=== QR SCAN DEBUG ===');
        console.log('Decoded QR Text:', decodedText);
        console.log('NISN (after trim):', nisn);
        console.log('Jenis Absensi:', jenisAbsensi);
        
        // Find student
        const studentSnapshot = await db.collection('students')
            .where('nisn', '==', nisn)
            .where('status', '==', 'Aktif')
            .get();
        
        // DEBUG: Log query result
        console.log('Query Result Size:', studentSnapshot.size);
        
        if (studentSnapshot.empty) {
            console.log('ERROR: No student found with NISN:', nisn);
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
        
        // DEBUG: Log found student
        console.log('Found Student:', {
            id: studentDoc.id,
            nisn: studentData.nisn,
            nama: studentData.nama,
            kelas: studentData.kelas
        });
        console.log('===================');
        
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
    // Ignore scan errors (too noisy in console)
}

/**
 * Initialize manual input button
 */
function initManualInput() {
    const btnManual = document.getElementById('btnManualInput');
    if (btnManual) {
        btnManual.addEventListener('click', async () => {
            const { value: nisn } = await Swal.fire({
                title: 'Input NISN Manual',
                input: 'text',
                inputLabel: 'Masukkan NISN Siswa',
                inputPlaceholder: 'Contoh: 0051234567',
                showCancelButton: true,
                confirmButtonText: 'Proses',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#7C3AED',
                inputValidator: (value) => {
                    if (!value) {
                        return 'NISN tidak boleh kosong!';
                    }
                    if (value.length < 6) {
                        return 'NISN minimal 6 digit!';
                    }
                }
            });
            
            if (nisn) {
                // Process like scan
                await onScanSuccess(nisn);
            }
        });
    }
}

/**
 * Determine time status
 */
function determineTimeStatus(jenisAbsensi, currentTime) {
    if (!timeSettings) return 'Tepat Waktu';
    
    let endTime;
    
    if (jenisAbsensi === 'Sholat Subuh') {
        endTime = timeSettings.subuhEnd;
    } else if (jenisAbsensi === 'Sholat Dhuha') {
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
