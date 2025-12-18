// استيراد مكتبات Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعدادات مشروعك الخاص (ضع الكود الخاص بك هنا)
const firebaseConfig = {
  apiKey: "AIzaSyDrwbLi03PFZ2GKQEW91yH1oOk5kKBUS_I",
  authDomain: "test-1-84926.firebaseapp.com",
  projectId: "test-1-84926",
  storageBucket: "test-1-84926.firebasestorage.app",
  messagingSenderId: "83811607632",
  appId: "1:83811607632:web:d4cce6d201fb864139dd55"
};

// تشغيل Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("تم ربط الموقع بـ Firebase بنجاح!");
