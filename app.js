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

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ربط العناصر من الواجهة
const loginModal = document.getElementById('loginModal');
const btnSignIn = document.getElementById('btnSignIn');

// إظهار النافذة عند الضغط على زر "تسجيل الدخول" في القائمة
document.querySelector('nav button').onclick = () => loginModal.classList.remove('hidden');
document.getElementById('closeModal').onclick = () => loginModal.classList.add('hidden');

// وظيفة التسجيل والدخول
btnSignIn.onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // يحاول الدخول، وإذا لم يجد حساباً يقوم بإنشاء واحد جديد تلقائياً
        await createUserWithEmailAndPassword(auth, email, password);
        alert("أهلاً بك! تم إنشاء حسابك بنجاح");
        loginModal.classList.add('hidden');
    } catch (error) {
        // إذا كان الحساب موجوداً أصلاً، سيقوم بتسجيل الدخول
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("تم تسجيل دخولك بنجاح");
            loginModal.classList.add('hidden');
        } catch (err) {
            alert("خطأ: " + err.message);
        }
    }
};

// مراقبة حالة المستخدم (هل هو داخل الموقع أم ضيف؟)
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.querySelector('nav button').innerText = "حسابي";
        console.log("المستخدم الحالي:", user.email);
    } else {
        document.querySelector('nav button').innerText = "تسجيل الدخول";
    }
});
