import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
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
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// --- إعدادات فايربيس الخاصة بمشروعك ---
const firebaseConfig = {
    apiKey: "AIzaSyDrwbLi03PFZ2GKQEW91yH1oOk5kKBUS_I",
    authDomain: "test-1-84926.firebaseapp.com",
    projectId: "test-1-84926",
    storageBucket: "test-1-84926.firebasestorage.app",
    messagingSenderId: "83811607632",
    appId: "1:83811607632:web:d4cce6d201fb864139dd55"
};

// تشغيل الخدمات
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// عناصر الواجهة
const loginModal = document.getElementById('loginModal');
const authBtn = document.getElementById('authBtn');
const addBookModal = document.getElementById('addBookModal');
const addBookBtn = document.getElementById('addBookBtn');
const booksGrid = document.getElementById('booksGrid');
const btnText = document.getElementById('btnText');

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
if (addBookBtn) {
    addBookBtn.onclick = () => addBookModal.classList.remove('hidden');
}
document.getElementById('closeBookModal').onclick = () => addBookModal.classList.add('hidden');

// عملية تسجيل الدخول أو إنشاء الحساب
document.getElementById('submitAuth').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) return alert("يرجى إدخال البريد وكلمة المرور");

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("أهلاً بك مرة أخرى!");
        loginModal.classList.add('hidden');
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
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

// إضافة كتاب جديد مع رفع الصورة
document.getElementById('saveBook').onclick = async () => {
    const title = document.getElementById('bookTitle').value;
    const university = document.getElementById('uniSelect').value;
    const price = document.getElementById('bookPrice').value;
    const imageFile = document.getElementById('bookImage').files[0];

    if(!title || !price || !imageFile) return alert("يرجى تعبئة كافة الحقول واختيار صورة الكتاب");

    btnText.innerText = "جاري النشر...";
    
    try {
        // 1. رفع الصورة إلى Storage
        const imageRef = ref(storage, `books/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

        // 2. حفظ البيانات في Firestore
        await addDoc(collection(db, "books"), {
            title: title,
            university: university,
            price: price,
            imageUrl: imageUrl,
            seller: auth.currentUser.email,
            createdAt: new Date()
        });

        alert("تم نشر إعلانك بنجاح!");
        addBookModal.classList.add('hidden');
        loadBooks(); 
    } catch (e) {
        alert("فشل النشر: " + e.message);
    } finally {
        btnText.innerText = "نشر الإعلان";
    }
};

// دالة تحميل وعرض الكتب من القاعدة
async function loadBooks() {
    booksGrid.innerHTML = '<p class="text-center col-span-full py-10 text-gray-400">جاري تحميل الكتب...</p>';
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
                <div class="bg-white rounded-2xl shadow-md overflow-hidden p-4 border border-gray-100 hover:shadow-xl transition flex flex-col">
                    <img src="${book.imageUrl}" class="w-full h-48 object-cover rounded-xl mb-3">
                    <span class="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full w-fit">${book.university}</span>
                    <h4 class="text-lg font-bold mt-3 text-gray-800">${book.title}</h4>
                    <div class="mt-auto pt-4 flex justify-between items-center">
                        <span class="text-green-600 font-bold text-xl">${book.price} د.أ</span>
                        <button onclick="window.location.href='mailto:${book.seller}'" 
                            class="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition">
                            مراسلة
                        </button>
                    </div>
                </div>
            `;
            booksGrid.innerHTML += card;
        });
    } catch (e) {
        console.error("Error: ", e);
        booksGrid.innerHTML = '<p class="text-center col-span-full text-red-500">حدث خطأ أثناء تحميل البيانات.</p>';
    }
}

// مراقبة حالة المستخدم
onAuthStateChanged(auth, (user) => {
    const userStatus = document.getElementById('userStatus');
    if (user) {
        authBtn.innerText = "خروج";
        userStatus.innerText = user.email;
        userStatus.classList.remove('hidden');
        addBookBtn.classList.remove('hidden');
    } else {
        authBtn.innerText = "تسجيل الدخول";
        userStatus.classList.add('hidden');
        addBookBtn.classList.add('hidden');
    }
    loadBooks();
});
