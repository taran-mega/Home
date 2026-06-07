// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALa11wSSCeDgOZVhhqi43MlO6XRNB2oJU",
  authDomain: "blaster-1488a.firebaseapp.com",
  projectId: "blaster-1488a",
  storageBucket: "blaster-1488a.firebasestorage.app",
  messagingSenderId: "417513539683",
  appId: "1:417513539683:web:62d5895cba2359ff55d056",
  measurementId: "G-7VZY8E3L5C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getAnalytics(app);

export { db };
