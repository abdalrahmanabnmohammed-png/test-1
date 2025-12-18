import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, onSnapshot, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDrwbLi03PFZ2GKQEW91yH1oOk5kKBUS_I",
    authDomain: "test-1-84926.firebaseapp.com",
    projectId: "test-1-84926",
    storageBucket: "test-1-84926.firebasestorage.app",
    messagingSenderId: "83811607632",
    appId: "1:83811607632:web:d4cce6d201fb864139dd55"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const loginModal = document.getElementById('loginModal');
const authBtn = document.getElementById('authBtn');
const addBookModal = document.getElementById('addBookModal');
const booksGrid = document.getElementById('booksGrid');
const chatBox = document.getElementById('chatBox');
const messagesContainer = document.getElementById('messagesContainer');
let currentChatId = null;

// فتح الشات (تم تعريفه كدالة عالمية)
window.openChat = (sellerEmail) => {
    if (!auth.currentUser) return alert("سجل دخولك لمراسلة البائع");
    if (auth.currentUser.email === sellerEmail) return alert("هذا إعلانك الخاص!");
    
    chatBox.classList.remove('hidden');
    document.getElementById('chatWith').innerText = "مراسلة: " + sellerEmail;
    currentChatId = [auth.currentUser.email, sellerEmail].sort().join("_");
    loadMessages(currentChatId);
};

// إرسال رسالة
document.getElementById('sendMsgBtn').onclick = async () => {
    const text = document.getElementById('chatInput').value;
    if (!text || !currentChatId) return;
    await addDoc(collection(db, "chats"), {
        chatId: currentChatId,
        sender: auth.currentUser.email,
        text: text,
        createdAt: new Date()
    });
    document.getElementById('chatInput').value = "";
};

function loadMessages(chatId) {
    const q = query(collection(db, "chats"), where("chatId", "==", chatId), orderBy("createdAt", "asc"));
    onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = "";
        snapshot.forEach((doc) => {
            const msg = doc.data();
            const isMe = msg.sender === auth.currentUser.email;
            messagesContainer.innerHTML += `
                <div class="${isMe ? 'self-end bg-blue-600 text-white' : 'self-start bg-gray-200 text-black'} p-2 rounded-xl max-w-[85%] mb-1">
                    ${msg.text}
                </div>`;
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

// إضافة كتاب
document.getElementById('saveBook').onclick = async () => {
    const title = document.getElementById('bookTitle').value;
    const university = document.getElementById('uniSelect').value;
    const price = document.getElementById('bookPrice').value;
    const imageFile = document.getElementById('bookImage').files[0];
    const btnText = document.getElementById('btnText');

    if(!title || !price || !imageFile) return alert("أكمل البيانات واختر صورة");
    btnText.innerText = "جاري النشر...";
    try {
        const imageRef = ref(storage, `books/${Date.now()}_${imageFile.name}`);
        const snap = await uploadBytes(imageRef, imageFile);
        const url = await getDownloadURL(snap.ref);

        await addDoc(collection(db, "books"), {
            title, university, price, imageUrl: url,
            seller: auth.currentUser.email,
            createdAt: new Date()
        });
        alert("تم النشر!");
        addBookModal.classList.add('hidden');
        loadBooks();
    } catch (e) { alert("خطأ: " + e.message); }
    finally { btnText.innerText = "نشر الإعلان"; }
};

async function loadBooks() {
    booksGrid.innerHTML = "";
    const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const book = doc.data();
        booksGrid.innerHTML += `
            <div class="bg-white rounded-2xl shadow p-4 border flex flex-col">
                <img src="${book.imageUrl}" class="w-full h-40 object-cover rounded-xl mb-2">
                <h4 class="font-bold text-gray-800">${book.title}</h4>
                <div class="mt-auto flex justify-between items-center pt-3">
                    <span class="text-green-600 font-bold">${book.price} د.أ</span>
                    <button onclick="openChat('${book.seller}')" class="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs">مراسلة</button>
                </div>
            </div>`;
    });
}

authBtn.onclick = () => auth.currentUser ? signOut(auth) : loginModal.classList.remove('hidden');
document.getElementById('submitAuth').onclick = async () => {
    const e = document.getElementById('email').value, p = document.getElementById('password').value;
    try { await signInWithEmailAndPassword(auth, e, p); loginModal.classList.add('hidden'); }
    catch { try { await createUserWithEmailAndPassword(auth, e, p); loginModal.classList.add('hidden'); } catch(err) { alert(err.message); } }
};

onAuthStateChanged(auth, (u) => {
    document.getElementById('userStatus').innerText = u ? u.email : "";
    document.getElementById('userStatus').classList.toggle('hidden', !u);
    document.getElementById('addBookBtn').classList.toggle('hidden', !u);
    authBtn.innerText = u ? "خروج" : "تسجيل الدخول";
    loadBooks();
});

document.getElementById('closeModal').onclick = () => loginModal.classList.add('hidden');
document.getElementById('closeBookModal').onclick = () => addBookModal.classList.add('hidden');
document.getElementById('closeChat').onclick = () => chatBox.classList.add('hidden');
document.getElementById('addBookBtn').onclick = () => addBookModal.classList.remove('hidden');
