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

// عناصر الواجهة
const loginModal = document.getElementById('loginModal');
const authBtn = document.getElementById('authBtn');
const addBookModal = document.getElementById('addBookModal');
const addBookBtn = document.getElementById('addBookBtn');
const booksGrid = document.getElementById('booksGrid');

// إظهار/إخفاء النوافذ
authBtn.onclick = () => {
    if(auth.currentUser) { signOut(auth); } 
    else { loginModal.classList.remove('hidden'); }
};
document.getElementById('closeModal').onclick = () => loginModal.classList.add('hidden');
addBookBtn.onclick = () => addBookModal.classList.remove('hidden');
document.getElementById('closeBookModal').onclick = () => addBookModal.classList.add('hidden');

// تسجيل الدخول والإنشاء
document.getElementById('submitAuth').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        loginModal.classList.add('hidden');
    } catch {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            loginModal.classList.add('hidden');
        } catch (e) { alert("خطأ في الدخول: " + e.message); }
    }
};

// حالة المستخدم
onAuthStateChanged(auth, (user) => {
    if (user) {
        authBtn.innerText = "خروج";
        document.getElementById('userStatus').innerText = user.email;
        document.getElementById('userStatus').classList.remove('hidden');
        addBookBtn.classList.remove('hidden');
    } else {
        authBtn.innerText = "تسجيل الدخول";
        document.getElementById('userStatus').classList.add('hidden');
        addBookBtn.classList.add('hidden');
    }
    loadBooks();
});

// إضافة كتاب جديد
document.getElementById('saveBook').onclick = async () => {
    const title = document.getElementById('bookTitle').value;
    const university = document.getElementById('uniSelect').value;
    const price = document.getElementById('bookPrice').value;

    if(!title || !price) return alert("يرجى ملء كافة التفاصيل");

    try {
        await addDoc(collection(db, "books"), {
            title, university, price, 
            seller: auth.currentUser.email,
            createdAt: new Date()
        });
        alert("تم نشر كتابك بنجاح!");
        addBookModal.classList.add('hidden');
        loadBooks();
    } catch (e) { alert("فشل النشر: " + e.message); }
};

// تحميل وعرض الكتب
async function loadBooks() {
    booksGrid.innerHTML = "";
    const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        booksGrid.innerHTML = `<p class="text-center col-span-full py-10 text-gray-400">لا توجد كتب معروضة حالياً.</p>`;
        return;
    }

    querySnapshot.forEach((doc) => {
        const book = doc.data();
        const card = `
            <div class="bg-white rounded-2xl shadow-md overflow-hidden p-5 border border-gray-100 hover:shadow-xl transition">
                <span class="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full">${book.university}</span>
                <h4 class="text-lg font-bold mt-3 text-gray-800">${book.title}</h4>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-green-600 font-bold text-xl">${book.price} د.أ</span>
                    <button onclick="alert('تواصل مع البائع عبر: ${book.seller}')" 
                        class="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition">
                        مراسلة
                    </button>
                </div>
            </div>
        `;
        booksGrid.innerHTML += card;
    });
}
