import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

export const storage = getStorage(app);

<!-- Firebase Auth + Firestore (compat — free tier) -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>

<script>
/* ── CONFIG ─────────────────────────────────────────────── */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDp33VJKZSPDYwU5OY_Nzq-fnAck50-bDA",
  authDomain: "qeja-com.firebaseapp.com",
  databaseURL: "https://qeja-com-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "qeja-com",
  storageBucket: "qeja-com.firebasestorage.app",
  messagingSenderId: "219739142262",
  appId: "1:219739142262:web:52efbfb97bb07c32a94757"
};

// Cloudinary — free image hosting (no paid plan needed)
const CLOUDINARY_CLOUD  = 'dbyeox0j8';
const CLOUDINARY_PRESET = 'Qeja-com';
const CLOUDINARY_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

/* ── INIT ───────────────────────────────────────────────── */
firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();
const db   = firebase.firestore();

let selectedFiles = [];
let delTargetId   = null;Put images, icons and logos here.
