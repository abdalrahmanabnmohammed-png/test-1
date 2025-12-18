import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, // هذه هي الدالة التي كانت ناقصة
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- ضع كود Firebase الخاص بك هنا ---
const firebaseConfig = {
  apiKey: "AIzaSyDrwbLi03PFZ2GKQEW91yH1oOk5kKBUS_I",
  authDomain: "test-1-84926.firebaseapp.com",
  projectId: "test-1-84926",
  storageBucket: "test-1-84926.firebasestorage.app",
  messagingSenderId: "83811607632",
  appId: "1:83811607632:web:d4cce6d201fb864139dd55"
};
// ------------------------------------

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

// إظهار وإخفاء النوافذ
if (authBtn) {
    authBtn.onclick = () => {
        if(auth.currentUser) { 
            signOut(auth).then(() => alert("تم تسجيل الخروج")); 
        } else { 
            loginModal.classList.remove('hidden'); 
        }
    };
}

document.getElementById('closeModal').onclick = () => loginModal.classList.add('hidden');
addBookBtn.onclick = () => addBookModal.classList.remove('hidden');
document.getElementById('closeBookModal').onclick = () => addBookModal.classList.add('hidden');

// عملية تسجيل الدخول أو إنشاء الحساب
document.getElementById('submitAuth').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) return alert("يرجى إدخال البريد وكلمة المرور");

    try {
        // المحاولة الأولى: تسجيل دخول
        await signInWithEmailAndPassword(auth, email, password);
        alert("أهلاً بك مرة أخرى!");
        loginModal.classList.add('hidden');
    } catch (error) {
        // إذا فشل (بمعنى الحساب غير موجود)، نقوم بإنشاء حساب جديد
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                alert("تم إنشاء حسابك بنجاح!");
                loginModal.classList.add('hidden');
            } catch (createError) {
                alert("فشل إنشاء الحساب: " + createError.message);
            }
        } else {
            alert("خطأ: " + error.message);
        }
    }
};

// مراقبة حالة المستخدم
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
    loadBooks(); // تحميل الكتب فوراً عند فتح الصفحة
});

// إضافة كتاب جديد
document.getElementById('saveBook').onclick = async () => {
    const title = document.getElementById('bookTitle').value;
    const university = document.getElementById('uniSelect').value;
    const price = document.getElementById('bookPrice').value;

    if(!title || !price) return alert("يرجى ملء كافة التفاصيل");

    try {
        await addDoc(collection(db, "books"), {
            title: title,
            university: university,
            price: price,
            seller: auth.currentUser.email,
            createdAt: new Date()
        });
        alert("تم نشر إعلانك بنجاح!");
        addBookModal.classList.add('hidden');
        loadBooks(); // تحديث القائمة بعد الإضافة
    } catch (e) {
        alert("فشل النشر: " + e.message);
    }
};

// دالة تحميل وعرض الكتب من القاعدة
async function loadBooks() {
    booksGrid.innerHTML = '<p class="text-center col-span-full py-10 text-gray-400">جاري التحميل...</p>';
    try {
        const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        booksGrid.innerHTML = "";
        
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
    } catch (e) {
        console.error("Error loading books: ", e);
        booksGrid.innerHTML = '<p class="text-center col-span-full text-red-500">حدث خطأ أثناء تحميل البيانات.</p>';
    }
}
