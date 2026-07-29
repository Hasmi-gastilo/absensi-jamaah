/**
 * Dashboard Module
 * Menampilkan statistik dan grafik kehadiran real-time
 */

// Check authentication
checkAuth();

let dailyChart, weeklyChart, monthlyChart;
let refreshInterval;

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardData();
    await initCharts();
    
    // Auto refresh every 30 seconds
    refreshInterval = setInterval(async () => {
        await loadStatistics();
        await loadRecentActivity();
    }, 30000);
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
            document.getElementById('schoolName').textContent = settings.name || 'SMK Negeri 1 Sangasanga';
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
        
        let totalLate = 0;
        const uniqueStudents = new Set();
        
        attendanceSnapshot.forEach((doc) => {
            const data = doc.data();
            uniqueStudents.add(data.nisn);
            
            if (data.statusWaktu === 'Terlambat') {
                totalLate++;
            }
        });
        
        // Count unique present students
        const totalPresent = uniqueStudents.size;
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
                    <td>${data.jam}</td>
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
 * Initialize charts with real data from Firebase
 */
async function initCharts() {
    await loadDailyChart();
    await loadWeeklyChart();
    await loadMonthlyChart();
}

/**
 * Load Daily Chart - Absensi per jam hari ini
 */
async function loadDailyChart() {
    const todayDate = getTodayDate();
    
    try {
        const snapshot = await db.collection('attendance')
            .where('tanggal', '==', todayDate)
            .get();
        
        // Group by hour
        const hourlyData = {};
        for (let i = 0; i < 24; i++) {
            hourlyData[i] = 0;
        }
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            const hour = parseInt(data.jam.split(':')[0]);
            hourlyData[hour]++;
        });
        
        const labels = [];
        const dataPoints = [];
        for (let i = 6; i <= 16; i++) { // 06:00 - 16:00 (jam sekolah)
            labels.push(String(i).padStart(2, '0') + ':00');
            dataPoints.push(hourlyData[i] || 0);
        }
        
        const dailyCtx = document.getElementById('dailyChart').getContext('2d');
        dailyChart = new Chart(dailyCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Jumlah Absensi',
                    data: dataPoints,
                    borderColor: '#7C3AED',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Absensi: ' + context.parsed.y + ' siswa';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading daily chart:', error);
    }
}

/**
 * Load Weekly Chart - Absensi 7 hari terakhir
 */
async function loadWeeklyChart() {
    try {
        const labels = [];
        const hadirData = [];
        const tidakHadirData = [];
        
        // Get total students
        const studentsSnapshot = await db.collection('students')
            .where('status', '==', 'Aktif')
            .get();
        const totalStudents = studentsSnapshot.size;
        
        // Get last 7 days data
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = formatDateForQuery(date);
            const dayName = getDayName(date);
            
            labels.push(dayName);
            
            const snapshot = await db.collection('attendance')
                .where('tanggal', '==', dateStr)
                .get();
            
            const uniqueStudents = new Set();
            snapshot.forEach((doc) => {
                uniqueStudents.add(doc.data().nisn);
            });
            
            const present = uniqueStudents.size;
            const absent = totalStudents - present;
            
            hadirData.push(present);
            tidakHadirData.push(absent);
        }
        
        const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
        weeklyChart = new Chart(weeklyCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Hadir',
                    data: hadirData,
                    backgroundColor: '#7C3AED'
                }, {
                    label: 'Tidak Hadir',
                    data: tidakHadirData,
                    backgroundColor: '#EF4444'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + ' siswa';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: false
                    },
                    x: {
                        stacked: false
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading weekly chart:', error);
    }
}

/**
 * Load Monthly Chart - Persentase kehadiran per minggu bulan ini
 */
async function loadMonthlyChart() {
    try {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const labels = [];
        const percentageData = [];
        
        // Get total students
        const studentsSnapshot = await db.collection('students')
            .where('status', '==', 'Aktif')
            .get();
        const totalStudents = studentsSnapshot.size;
        
        // Calculate for each week of the month
        let weekNum = 1;
        let currentDate = new Date(firstDay);
        
        while (currentDate.getMonth() === today.getMonth() && weekNum <= 4) {
            const weekStart = new Date(currentDate);
            const weekEnd = new Date(currentDate);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            if (weekEnd > today) {
                weekEnd.setTime(today.getTime());
            }
            
            labels.push('Minggu ' + weekNum);
            
            // Get attendance for this week
            let totalPresent = 0;
            let dayCount = 0;
            
            for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
                const dateStr = formatDateForQuery(d);
                const snapshot = await db.collection('attendance')
                    .where('tanggal', '==', dateStr)
                    .get();
                
                const uniqueStudents = new Set();
                snapshot.forEach((doc) => {
                    uniqueStudents.add(doc.data().nisn);
                });
                
                totalPresent += uniqueStudents.size;
                dayCount++;
            }
            
            const avgPresent = dayCount > 0 ? totalPresent / dayCount : 0;
            const percentage = totalStudents > 0 ? Math.round((avgPresent / totalStudents) * 100) : 0;
            percentageData.push(percentage);
            
            currentDate.setDate(currentDate.getDate() + 7);
            weekNum++;
        }
        
        const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
        monthlyChart = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Persentase Kehadiran',
                    data: percentageData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Kehadiran: ' + context.parsed.y + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading monthly chart:', error);
    }
}

/**
 * Helper function to format date for query
 */
function formatDateForQuery(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Helper function to get day name
 */
function getDayName(date) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
}
