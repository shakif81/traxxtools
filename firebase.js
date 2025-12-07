// CONFIGURACIÓN FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBZvSfAi2AO_FF1rqDqKDH6-VDFrbeCdhg",
    authDomain: "taller-herramientas-79e58.firebaseapp.com",
    projectId: "taller-herramientas-79e58",
    storageBucket: "taller-herramientas-79e58.firebasestorage.app",
    messagingSenderId: "1010208693381",
    appId: "1:1010208693381:web:cd5736b779a41d2c4eddec"
};

// Inicializar Firebase
let firebaseApp = null;
let firestore = null;

const initializeFirebase = () => {
    try {
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            firestore = firebase.firestore();
            console.log('✅ Firebase inicializado correctamente');
        } else {
            firebaseApp = firebase.apps[0];
            firestore = firebase.firestore();
            console.log('✅ Firebase ya estaba inicializado');
        }
        return { firebaseApp, firestore };
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error);
        throw error;
    }
};

const getFirestore = () => {
    if (!firestore) {
        throw new Error('Firebase no ha sido inicializado');
    }
    return firestore;
};

const getFirebaseApp = () => {
    if (!firebaseApp) {
        throw new Error('Firebase no ha sido inicializado');
    }
    return firebaseApp;
};