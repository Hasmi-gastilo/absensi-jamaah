/**
 * Firebase Configuration
 * Konfigurasi koneksi ke Firebase
 */

// TODO: Ganti dengan konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyDs6WOn1w3bEDvzP77w-S_COIBgXDC8qAE",
  authDomain: "absensi-jamaah.firebaseapp.com",
  projectId: "absensi-jamaah",
  storageBucket: "absensi-jamaah.firebasestorage.app",
  messagingSenderId: "878406946480",
  appId: "1:878406946480:web:0e63c7316c0d8f92d67575"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();
// Note: Storage tidak digunakan dalam versi ini

// Collections Reference
const studentsRef = db.collection('students');
const attendanceRef = db.collection('attendance');
const adminsRef = db.collection('admins');
const settingsRef = db.collection('settings');

/**
 * Enable offline persistence
 */
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code == 'unimplemented') {
            console.log('The current browser does not support persistence.');
        }
    });

console.log('Firebase initialized successfully');
