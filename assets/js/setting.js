/**
 * Settings Module
 * Pengaturan aplikasi
 */

checkAuth();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initSchoolForm();
    initTimeForm();
});

/**
 * Load current settings
 */
async function loadSettings() {
    try {
        // Load school settings
        const schoolDoc = await db.collection('settings').doc('school').get();
        if (schoolDoc.exists) {
            const schoolData = schoolDoc.data();
            document.getElementById('schoolName').value = schoolData.name || '';
            document.getElementById('schoolAddress').value = schoolData.address || '';
        }
        
        // Load time settings
        const timeDoc = await db.collection('settings').doc('time').get();
        if (timeDoc.exists) {
            const timeData = timeDoc.data();
            document.getElementById('dhuhaStart').value = timeData.dhuhaStart || '06:30';
            document.getElementById('dhuhaEnd').value = timeData.dhuhaEnd || '07:30';
            document.getElementById('zuhurStart').value = timeData.zuhurStart || '11:30';
            document.getElementById('zuhurEnd').value = timeData.zuhurEnd || '12:30';
        }
        
    } catch (error) {
        console.error('Error loading settings:', error);
        showError('Gagal memuat pengaturan');
    }
}

/**
 * Initialize school form
 */
function initSchoolForm() {
    document.getElementById('schoolForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const schoolData = {
            name: document.getElementById('schoolName').value,
            address: document.getElementById('schoolAddress').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        try {
            showLoading('Menyimpan pengaturan...');
            
            await db.collection('settings').doc('school').set(schoolData, { merge: true });
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Pengaturan sekolah telah disimpan',
                confirmButtonColor: '#7C3AED'
            });
            
        } catch (error) {
            console.error('Error saving school settings:', error);
            showError('Gagal menyimpan pengaturan sekolah');
        }
    });
}

/**
 * Initialize time form
 */
function initTimeForm() {
    document.getElementById('timeSettingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const timeData = {
            dhuhaStart: document.getElementById('dhuhaStart').value,
            dhuhaEnd: document.getElementById('dhuhaEnd').value,
            zuhurStart: document.getElementById('zuhurStart').value,
            zuhurEnd: document.getElementById('zuhurEnd').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Validate times
        if (!validateTimeSettings(timeData)) {
            showError('Jam mulai harus lebih awal dari jam terakhir');
            return;
        }
        
        try {
            showLoading('Menyimpan pengaturan waktu...');
            
            await db.collection('settings').doc('time').set(timeData, { merge: true });
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Pengaturan waktu telah disimpan',
                confirmButtonColor: '#7C3AED'
            });
            
        } catch (error) {
            console.error('Error saving time settings:', error);
            showError('Gagal menyimpan pengaturan waktu');
        }
    });
}

/**
 * Validate time settings
 */
function validateTimeSettings(timeData) {
    const dhuhaStartMinutes = timeToMinutes(timeData.dhuhaStart);
    const dhuhaEndMinutes = timeToMinutes(timeData.dhuhaEnd);
    const zuhurStartMinutes = timeToMinutes(timeData.zuhurStart);
    const zuhurEndMinutes = timeToMinutes(timeData.zuhurEnd);
    
    return dhuhaStartMinutes < dhuhaEndMinutes && zuhurStartMinutes < zuhurEndMinutes;
}

/**
 * Convert time to minutes
 */
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}
