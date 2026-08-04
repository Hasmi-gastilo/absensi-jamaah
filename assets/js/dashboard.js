/**
 * Dashboard Module
 * Menampilkan statistik dan grafik kehadiran
 */

// Check authentication
checkAuth();

let dailyChart, weeklyChart, monthlyChart;

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardData();
    initCharts();
});

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
    try {
        // Get current user info
        const user = auth.currentUser;
        if (user) {
            const adminDoc = await db.collection('admins').doc(user.uid).get();
            if (adminDoc.exists) {
                const adminData = adminDoc.data();
                document.getElementById('adminName').textContent = adminData.nama;
                document.getElementById('adminRole').textContent = adminData.role;
                document.getElementById('welcomeName').textContent = adminData.nama;
            }
        }
        
        // Get school settings
        const settingsDoc = await db.collection('settings').doc('school').get();
        if (settingsDoc.exists) {
            const settings = settingsDoc.data();
            document.getElementById('schoolName').textContent = settings.name || 'Sekolah';
        }
        
        // Display current date
        const today = new Date();
        document.getElementById('currentDate').textContent = formatDate(today);
        document.getElementById('bannerDate').textContent = formatDate(today);
        
        // Load statistics
        await loadStatistics();
        
        // Load recent activity
        await loadRecentActivity();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Gagal memuat data dashboard');
    }
}

/**
 * Load statistics
 */
async function loadStatistics() {
    const todayDate = getTodayDate();
    
    try {
        // Total students
        const studentsSnapshot = await db.collection('students')
            .where('status', '==', 'Aktif')
            .get();
        const totalStudents = studentsSnapshot.size;
        document.getElementById('totalStudents').textContent = totalStudents;
        
        // Today's attendance
        const attendanceSnapshot = await db.collection('attendance')
            .where('tanggal', '==', todayDate)
            .get();
        
        let totalPresent = 0;
        let totalLate = 0;
        const uniqueStudents = new Set();
        
        attendanceSnapshot.forEach((doc) => {
            const data = doc.data();
            uniqueStudents.add(data.nisn);
            
            if (data.statusWaktu === 'Tepat Waktu') {
                totalPresent++;
            } else if (data.statusWaktu === 'Terlambat') {
                totalLate++;
            }
        });
        
        // Count unique present students
        totalPresent = uniqueStudents.size;
        const totalAbsent = totalStudents - totalPresent;
        
        document.getElementById('totalPresent').textContent = totalPresent;
        document.getElementById('totalLate').textContent = totalLate;
        document.getElementById('totalAbsent').textContent = totalAbsent;
        
        // Calculate percentage
        const percentage = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;
        document.getElementById('attendancePercentage').textContent = percentage + '%';
        
        // Update percentage circle
        updatePercentageCircle(percentage);
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

/**
 * Update percentage circle animation
 */
function updatePercentageCircle(percentage) {
    const circle = document.getElementById('percentageCircle');
    const circumference = 2 * Math.PI * 90; // r = 90
    const offset = circumference - (percentage / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

/**
 * Load recent activity
 */
async function loadRecentActivity() {
    const todayDate = getTodayDate();
    
    try {
        const snapshot = await db.collection('attendance')
            .where('tanggal', '==', todayDate)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();
        
        const tbody = document.getElementById('recentActivityTable');
        tbody.innerHTML = '';
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Belum ada data absensi hari ini</td></tr>';
            return;
        }
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            const row = `
                <tr>
                    <td>${formatTime(data.timestamp.toDate())}</td>
                    <td>${data.nisn}</td>
                    <td>${data.nama}</td>
                    <td>${data.kelas}</td>
                    <td>${data.jenisAbsensi}</td>
                    <td><span class="badge ${data.statusWaktu === 'Tepat Waktu' ? 'badge-success' : 'badge-warning'}">${data.statusWaktu}</span></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

/**
 * Initialize charts
 */
function initCharts() {
    // Daily Chart
    const dailyCtx = document.getElementById('dailyChart').getContext('2d');
    dailyChart = new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
            datasets: [{
                label: 'Kehadiran',
                data: [0, 0, 5, 45, 30, 10, 5, 0],
                borderColor: '#7C3AED',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Weekly Chart
    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
    weeklyChart = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
            labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
            datasets: [{
                label: 'Hadir',
                data: [85, 90, 88, 92, 87, 80],
                backgroundColor: '#7C3AED'
            }, {
                label: 'Tidak Hadir',
                data: [15, 10, 12, 8, 13, 20],
                backgroundColor: '#EF4444'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Monthly Chart
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    monthlyChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Persentase Kehadiran',
                data: [88, 92, 85, 90],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}
