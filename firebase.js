import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDp33VJKZSPDYwU5OY_Nzq-fnAck50-bDA",
    authDomain: "qeja-com.firebaseapp.com",
    databaseURL: "https://qeja-com-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "qeja-com",
    storageBucket: "qeja-com.firebasestorage.app",
    messagingSenderId: "219739142262",
    appId: "1:219739142262:web:52efbfb97bb07c32a94757"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

// Cloudinary Config
export const CLOUDINARY_CLOUD = "dbyeox0j8";
export const CLOUDINARY_PRESET = "qejja-com";

export async function uploadToCloudinary(file, resourceType = "image") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resourceType}/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "Cloudinary upload failed");
    }

    return data.secure_url;
}
