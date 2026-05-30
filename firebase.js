import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDp33VJKZSPDYwU5OY_Nzq-fnAck50-bDA",
    authDomain: "Qejja-com.firebaseapp.com",
    databaseURL: "https://Qejja-com-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "Qejja-com",
    storageBucket: "Qejja-com.firebasestorage.app",
    messagingSenderId: "219739142262",
    appId: "1:219739142262:web:52efbfb97bb07c32a94757"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// ── Cloudinary Config ────────────────────────────────────────
export const CLOUDINARY_CLOUD  = "dbyeox0j8";
export const CLOUDINARY_PRESET = "Qejja-com";

export async function uploadToCloudinary(file, resourceType = "image") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resourceType}/upload`,
        { method: "POST", body: formData }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Cloudinary upload failed");
    return data.secure_url;
}
