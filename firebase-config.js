// ============================================================
// FIREBASE PROJE AYARLARI
// ============================================================
// Firebase konsolundan (console.firebase.google.com) aldığınız
// yapılandırma bilgilerini aşağıya yapıştırın.
// Adımlar için README.md dosyasına bakın.
// ============================================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCWlB0nU-ETZxuo9xa6gG4VMYVu09P3fnE",
  authDomain: "yetenek-havuzu.firebaseapp.com",
  projectId: "yetenek-havuzu",
  storageBucket: "yetenek-havuzu.firebasestorage.app",
  messagingSenderId: "714642441227",
  appId: "1:714642441227:web:bf49ac51367c6d9437b30e"
};

// Yönetici hesabı oluştururken kullanılan sahte e-posta alan adı.
// Müdürler gerçek e-posta yerine kullanıcı adı ile giriş yapar;
// arka planda "kullaniciadi@DOMAIN" şeklinde bir e-postaya çevrilir.
export const LOGIN_DOMAIN = "ihdegerlendirme.local";

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
