// ============================================================
// FIREBASE PROJE AYARLARI
// ============================================================
// Firebase konsolundan (console.firebase.google.com) aldığınız
// yapılandırma bilgilerini aşağıya yapıştırın.
// Adımlar için README.md dosyasına bakın.
// ============================================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

export const firebaseConfig = {
  apiKey: "BURAYA_API_KEY",
  authDomain: "BURAYA_PROJE.firebaseapp.com",
  projectId: "BURAYA_PROJE",
  storageBucket: "BURAYA_PROJE.appspot.com",
  messagingSenderId: "BURAYA_SENDER_ID",
  appId: "BURAYA_APP_ID"
};

// Yönetici hesabı oluştururken kullanılan sahte e-posta alan adı.
// Müdürler gerçek e-posta yerine kullanıcı adı ile giriş yapar;
// arka planda "kullaniciadi@DOMAIN" şeklinde bir e-postaya çevrilir.
export const LOGIN_DOMAIN = "ihdegerlendirme.local";

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
