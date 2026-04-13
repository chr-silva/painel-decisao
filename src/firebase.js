// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_E11qH6C-sApWOv2J8KbFAOKG948PHQs",
  authDomain: "oss-teste-db.firebaseapp.com",
  databaseURL: "https://oss-teste-db-default-rtdb.firebaseio.com",
  projectId: "oss-teste-db",
  storageBucket: "oss-teste-db.firebasestorage.app",
  messagingSenderId: "340015106460",
  appId: "1:340015106460:web:952749eea07d82b72b6059",
  measurementId: "G-1YV4323RZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);