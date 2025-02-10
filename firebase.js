// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBDDcpNJNIKk9kMeMUM8m7CdgloGFGX98A",
    authDomain: "abbyapp-f2063.firebaseapp.com",
    databaseURL: "https://abbyapp-f2063-default-rtdb.firebaseio.com",
    projectId: "abbyapp-f2063",
    storageBucket: "abbyapp-f2063.firebasestorage.app",
    messagingSenderId: "846444621215",
    appId: "1:846444621215:web:2f0883e690deb41ba021aa"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)