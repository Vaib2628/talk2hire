// Import the functions you need from the SDKs you need
import { initializeApp ,getApps ,getApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCloTibeQQ6ewgx_SoKF71pa0QHJf-c2M4",
  authDomain: "talk2hire-c8bb2.firebaseapp.com",
  projectId: "talk2hire-c8bb2",
  storageBucket: "talk2hire-c8bb2.firebasestorage.app",
  messagingSenderId: "1022249199935",
  appId: "1:1022249199935:web:f790b3e40571b15a8c0b8a",
  measurementId: "G-EVGDNF3MD7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

