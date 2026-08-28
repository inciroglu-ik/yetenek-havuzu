import { app, firebaseConfig, LOGIN_DOMAIN } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, updatePassword
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query,
  where, serverTimestamp, writeBatch, getDocs, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
const el = (sel) => document.querySelector(sel);
const root = () => document.getElementById("app");

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => (t.style.display = "none"), 2600);
}

// ---------------------------------------------------------------
// Competency configuration (mirrors the original Excel structure)
// ---------------------------------------------------------------
const SCORE_LABELS = [
  { v: 1, l: "1 · Zayıf" },
  { v: 2, l: "2 · Gelişim İhtiyacı" },
  { v: 3, l: "3 · Yetkin" },
  { v: 4, l: "4 · Fark Yaratan" },
  { v: 5, l: "5 · Rol Model" }
];

// POTANSİYEL (YETENEK HAVUZU.xlsx · L–R sütunları) — 1–5 puan
const POTANSIYEL_FIELDS = [
  ["belirsizlikYonetimi", "Belirsizliği Yönetmek", "İşler veya yolun gidişatı belirgin olmasa bile etkili biçimde çalışmak."],
  ["isbirligiGelistirme", "İş Birliği Geliştirmek", "Ortak hedeflere ulaşmak için ortaklıklar kurar ve iş birliği yapar."],
  ["kisiselFarkindalik", "Kişisel Farkındalık Göstermek", "Geri bildirim ve özdüşünümle güçlü/zayıf yanlarına dair içgörü edinmek."],
  ["sorumlulukAlma", "Sorumluluk Almak", "Kendini ve başkalarını taahhütleri yerine getirme konusunda sorumlu tutar."],
  ["stratejikDusunme", "Stratejik Düşünme", "Gelecek olasılıkları önceden görüp çığır açan stratejilere dönüştürmek."],
  ["vizyonAmac", "Vizyon ve Amacı Sürdürmek", "Başkalarını harekete geçiren, etkileyici bir vizyon ve stratejiyi görünür kılar."],
  ["guvenYaratma", "Güven Yaratma", "Dürüstlük, doğruluk ve güvenilirlik yoluyla başkalarının güvenini kazanmak."]
];

// ÖĞRENME ÇEVİKLİĞİ (AJ–AN) — Var / Yok
const CEVIKLIK_FIELDS = [
  ["zihinselCeviklik", "Zihinsel Çeviklik", "Meraklıdır ve yeni, karmaşık durumlarla mücadele edebilir."],
  ["insanCevikligi", "İnsan Çevikliği", "Anlayışlı; kişilerarası durumlar ve işleri halletmekte ustalık sergiler."],
  ["degisimCevikligi", "Değişim Çevikliği", "Değişimin tadını çıkarır, yeni yaklaşımlar inşa etmekten keyif alır."],
  ["sonucCevikligi", "Sonuç Çevikliği", "Engellere rağmen esneklikle sonuçlara ulaşır."],
  ["durumsalOzFarkindalik", "Durumsal Öz Farkındalık", "Anın koşullarına göre kendi etkisini fark eder, yaklaşımını uyarlar."]
];

// PERFORMANS (T–AH) — Düşük / Orta / Yüksek · [key, label, negatif?]
const PERFORMANS_FIELDS = [
  ["rolZorlukBasaCikma", "Mevcut Rolünde Zorluklarla Başa Çıkma Becerisi", false],
  ["davranisIstikrar", "Davranışlarında İstikrar Tutumu", false],
  ["stresKapaliTutum", "Stres Altında Kapalı Bir Tutum Sergiliyor mu?", true],
  ["isBilgisi", "İş Bilgisi ve Mesleki Hakimiyet", false],
  ["dijitalYetkinlik", "Dijital Yetkinlik", false],
  ["iknaMuzakere", "İkna / Müzakere Gücü", false],
  ["kurumsalDeger", "Kurumsal Değerlere Uyum ve Temsil", false],
  ["meslekiBilgiBeceri", "Gerekli Mesleki Bilgi ve Beceriye Sahip mi?", false],
  ["yeterliDeneyim", "Yeterli Deneyime Sahip mi?", false],
  ["isbirligiEgilim", "İş Birliği Yapma Eğilimi", false],
  ["dogalLiderlik", "Doğal Liderlik Özellikleri / Liderlikle Motive Olma", false],
  ["inisiyatifAlternatif", "İnisiyatif Alma ve Alternatif Üretme", false],
  ["deneyimdenOgrenme", "Deneyimlerden Ders Çıkarma", false],
  ["sonucOdaklilik", "Sonuç Odaklılık", false],
  ["musteriOdaklilik", "Müşteri Odaklılık", false]
];
const DOY_OPTS = [{ v: "Düşük", l: "Düşük" }, { v: "Orta", l: "Orta" }, { v: "Yüksek", l: "Yüksek" }];

// ESKİ (İlk Değerlendirme) metrikleri — SADECE admin görür, salt gösterim
const ESKI_POTANSIYEL_FIELDS = [
  ["musteriOdaklilik", "Müşteri Odaklılık"], ["belirsizlikYonetimi", "Belirsizliği Yönetmek"],
  ["sonucOdaklilik", "Sonuç Odaklılık"], ["isbirligiGelistirme", "İş Birliği Geliştirmek"],
  ["kisiselFarkindalik", "Kişisel Farkındalık Göstermek"], ["sorumlulukAlma", "Sorumluluk Almak"],
  ["stratejikDusunme", "Stratejik Düşünme"], ["vizyonAmac", "Vizyon ve Amacı Sürdürmek"], ["guvenYaratma", "Güven Yaratma"]
];
const ESKI_TEKNIK_FIELDS = [
  ["isBilgisi", "İş Bilgisi ve Mesleki Hakimiyet"], ["dijitalYetkinlik", "Dijital Yetkinlik"],
  ["iknaMuzakere", "İkna ve Müzakere Gücü"], ["kurumsalDeger", "Kurumsal Değerlere Uyum ve Temsil"]
];
const ESKI_EK_KRITERLER = [
  ["rolZorlukBasaCikma", "Rolünde Zorluklarla Başa Çıkma"], ["davranisIstikrar", "Davranışlarında İstikrarlı mı?"],
  ["stresKapaliTutum", "Stres Altında Kapalı Tutum?"], ["meslekiBilgiBeceri", "Gerekli Mesleki Bilgi/Beceri?"],
  ["yeterliDeneyim", "Yeterli Deneyim?"], ["isbirligiEgilim", "İş Birliği Eğilimi?"],
  ["dogalLiderlik", "Doğal Liderlik?"], ["inisiyatifAlternatif", "İnisiyatif / Alternatif Üretme?"],
  ["deneyimdenOgrenme", "Deneyimden Öğrenme?"], ["sonucaUlasmaKararli", "Sonuca Ulaşmada Kararlı?"]
];
// Bu değerlendirme eski model verisi içeriyor mu? (İlk Değerlendirme)
function eskiDegerlendirmeVar(ev) {
  return !!(ev && (ev.teknikHakimiyet || ev.ekKriterler || ev.egitimOnerileri ||
    (ev.potansiyel && (ev.potansiyel.musteriOdaklilik != null || ev.potansiyel.sonucOdaklilik != null))));
}

// Kıdemi bu değerin altında (yıl) olanlar değerlendirme dışıdır (6 ay = 0.5)
const KIDEM_ESIK = 0.5;
function kidemDisi(emp) {
  return emp && typeof emp.kurumKidemiYil === "number" && emp.kurumKidemiYil < KIDEM_ESIK;
}

// ---------------------------------------------------------------
// 9-GRID (Performans × Liderlik Potansiyeli) — İnsanlar Üzerine Değerlendirme
// pot: 0 Duran · 1 Gelişen · 2 Hızlanan   |   perf: 0 Düşük · 1 Normal · 2 Yüksek
// ---------------------------------------------------------------
const POT_ETIKET = ["Duran", "Gelişen", "Hızlanan"];
const PERF_ETIKET = ["Düşük Performans", "Normal Performans", "Yüksek Performans"];
const GRID9 = {
  "2-0": { baslik: "ROLÜ YENİ ÜSTLENEN", renk: "#1f7a8c", aciklama: ["Potansiyeline bağlı olarak yeni işe alınmış veya terfi ettirilmiştir; gelecekte mevcut pozisyonun ötesinde gelişmesi beklenir.", "Mevcut pozisyonunda henüz kısa süredir bulunmaktadır.", "Sonuç/performans/potansiyel ortaya koyması için daha fazla zamana ihtiyacı vardır."] },
  "2-1": { baslik: "BÜYÜYEN ÇALIŞAN", renk: "#3d7a52", aciklama: ["Performans gereklerini tutarlı biçimde yerine getirir ve arada sırada beklentileri aşar.", "Mevcut pozisyonunun ötesinde liderlik becerileri, tutum ve perspektif sergileyebilir.", "Artan karmaşıklıkta rolleri üstlenecek kapasite ve arzu gösterir; bir sonraki pozisyona taşınabilecek potansiyeli vardır."] },
  "2-2": { baslik: "YÜKSEK POTANSİYEL", renk: "#2e9e5b", aciklama: ["Tutarlı biçimde performans beklentilerini aşar.", "Mevcut pozisyonunun ötesinde liderlik becerileri, tutum ve perspektif sergiler.", "Artan karmaşıklıkta rolleri üstlenecek kapasite ve arzu gösterir; uzun vadeli esnekliğe sahiptir."] },
  "1-0": { baslik: "GELİŞİM", renk: "#d4a017", aciklama: ["Mevcut pozisyonundaki performans ve liderlik beklentilerinin bazılarını yerine getirir.", "Daha geniş kapsamlı/karmaşık bir pozisyonda performans gösterebileceğinin işaretleri vardır.", "Koçluk ve gelişim desteği gereklidir."] },
  "1-1": { baslik: "TEMEL ÇALIŞAN", renk: "#2d6cb5", aciklama: ["Performans gereklerini tutarlı biçimde yerine getirir ve arada sırada beklentileri aşar.", "Zamanla daha zorlu/karmaşık bir pozisyonda performans gösterecek kapasiteye sahip olabilir.", "Lider ve rol modeli olarak kabul edilir."] },
  "1-2": { baslik: "YÜKSEK ETKİLİ PERFORMANS", renk: "#3d7a52", aciklama: ["Tutarlı biçimde performans beklentilerini aşar.", "Daha geniş kapsamlı/karmaşık bir pozisyonda da performans gösterebilir.", "Lider ve rol modeli; mevcut pozisyonunun ötesinde büyümeye adaydır."] },
  "0-0": { baslik: "DÜŞÜK PERFORMANS", renk: "#c0392b", aciklama: ["Performans gereklerini yerine getirememektedir.", "Zayıf bir potansiyel sergiler ve mevcut pozisyonunda gelişim istekliliği düşüktür."] },
  "0-1": { baslik: "SAĞLAM PERFORMANS", renk: "#2d6cb5", aciklama: ["Performans gereklerini tutarlı biçimde yerine getirir ve arada sırada beklentileri aşar.", "Mevcut pozisyonunda kalmayı ve gelişmeyi arzular.", "Potansiyeline ulaşmıştır veya yeni bir pozisyona geçmeye istekli değildir."] },
  "0-2": { baslik: "KİLİT PERFORMANS", renk: "#2b5797", aciklama: ["Tutarlı biçimde performans beklentilerini aşar.", "Mevcut pozisyonunda kalmayı ve gelişmeyi arzular.", "Potansiyeline ulaşmıştır; lider ve rol modeli olarak kabul edilir."] }
};

// 9-Grid konumuna göre gelişim/yönlendirme önerisi
const YONLENDIRME = {
  "2-2": "Kritik pozisyon yedeği olarak konumlandırılmalı; hızlandırılmış liderlik gelişim programına ve stratejik projelere dahil edilmelidir.",
  "2-1": "Artan sorumluluk ve karmaşıklıkta görevlerle, mentorluk desteğiyle bir sonraki pozisyona hazırlanmalıdır.",
  "2-0": "Rolünde henüz yeni olduğundan yakın takip ve oryantasyonla desteklenmeli, performansını göstermesi için makul süre tanınmalıdır.",
  "1-2": "Güçlü performansı ödüllendirilmeli; yatay/dikey gelişim fırsatları ve liderlik deneyimleriyle potansiyeli açığa çıkarılmalıdır.",
  "1-1": "Hedefli eğitim ve geri bildirimle güçlendirilmeli; potansiyel sinyalleri düzenli gözlemlenmelidir.",
  "1-0": "Birebir koçluk ve net bir gelişim planıyla desteklenmeli, kısa vadeli hedeflerle ilerlemesi izlenmelidir.",
  "0-2": "Uzmanlığı kritik olduğundan mevcut rolünde elde tutulmalı ve derinliği ödüllendirilmelidir; yükseltme isteği düşükse zorlanmamalıdır.",
  "0-1": "İstikrarı korunmalı; motivasyonu ve bağlılığı desteklenerek mevcut katkısı sürdürülmelidir.",
  "0-0": "Performans iyileştirme planına alınmalı; beklentiler netleştirilip yakından izlenmeli, gerekirse rol uyumu değerlendirilmelidir."
};

// Düşük/Orta/Yüksek -> 1/2/3
function doyNum(v) { return v === "Düşük" ? 1 : v === "Orta" ? 2 : v === "Yüksek" ? 3 : null; }
// PERFORMANS bloğu ortalaması (1–3); negatif maddede yüksek = olumsuz (ters çevrilir)
function performansOrt(perf) {
  if (!perf) return null;
  const vals = PERFORMANS_FIELDS.map(([k, , neg]) => { const n = doyNum(perf[k]); if (n == null) return null; return neg ? (4 - n) : n; }).filter((v) => v != null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}
function performansSkoru(ev) { const o = performansOrt(ev.performans); return o == null ? null : (o - 1) / 2 * 100; }
// Potansiyel ekseni = Potansiyel (%60) + Öğrenme Çevikliği (%40) ağırlıklı
function potansiyelSkoru(ev) {
  const a = ev.ortalamaPotansiyel != null ? ev.ortalamaPotansiyel / 5 * 100 : null;
  const b = ev.ortalamaOgrenmeCevikligi != null ? ev.ortalamaOgrenmeCevikligi * 100 : null;
  if (a != null && b != null) return 0.6 * a + 0.4 * b;
  return a != null ? a : (b != null ? b : null);
}
function band100(x) { if (x == null) return null; if (x >= 75) return 2; if (x >= 50) return 1; return 0; }
function sinifLabel(x) { const b = band100(x); return b == null ? "—" : b === 2 ? "YÜKSEK" : b === 1 ? "YETKİN" : "GELİŞİM İHTİYACI"; }
function gridPos(ev) {
  if (!ev) return null;
  const p = band100(potansiyelSkoru(ev));
  const q = band100(performansSkoru(ev));
  if (p == null || q == null) return null;
  return { pot: p, perf: q };
}

// İK sistem önerisi: performans + potansiyel + çeviklik + liderlik -> Evet/Hayır
function sistemOnerisi(ev) {
  const pot = potansiyelSkoru(ev), perf = performansSkoru(ev);
  if (pot == null || perf == null) return null;
  const lider = ev.liderlikPotansiyeli === "Var";
  const evet = (pot >= 60 && perf >= 55) || pot >= 75 || (perf >= 80 && pot >= 50) || (lider && pot >= 60 && perf >= 50);
  return evet ? "Evet" : "Hayır";
}
// Neden havuzda olmalı/olmamalı — 2–3 cümle otomatik gerekçe
function sistemGerekce(ev) {
  const pot = potansiyelSkoru(ev), perf = performansSkoru(ev);
  if (pot == null || perf == null) return "";
  const pos = gridPos(ev); const cell = pos ? GRID9[pos.pot + "-" + pos.perf] : null;
  const ad = ev.adSoyad || "Personel";
  const potT = band100(pot) === 2 ? "yüksek" : band100(pot) === 1 ? "orta" : "gelişime açık";
  const perfT = band100(perf) === 2 ? "yüksek" : band100(perf) === 1 ? "normal" : "düşük";
  const guclu = [];
  if (ev.ortalamaPotansiyel != null && ev.ortalamaPotansiyel >= 3.75) guclu.push("potansiyel yetkinlikleri güçlü");
  if (ev.ortalamaOgrenmeCevikligi != null && ev.ortalamaOgrenmeCevikligi >= 0.7) guclu.push("öğrenme çevikliği yüksek");
  const perfYuksek = PERFORMANS_FIELDS.filter(([k, , neg]) => { const v = ev.performans && ev.performans[k]; return neg ? v === "Düşük" : v === "Yüksek"; }).map(([, l]) => l);
  if (perfYuksek.length) guclu.push("performansta öne çıkanlar: " + perfYuksek.slice(0, 3).join(", "));
  if (ev.liderlikPotansiyeli === "Var") guclu.push("liderlik potansiyeli mevcut");
  // gelişim alanları (düşük/orta performans maddeleri)
  const zayif = PERFORMANS_FIELDS.filter(([k, , neg]) => { const v = ev.performans && ev.performans[k]; return neg ? v === "Yüksek" : v === "Düşük"; }).map(([, l]) => l);
  const s1 = `${ad}, liderlik potansiyeli ekseninde ${potT}, performans ekseninde ${perfT} seviyededir${cell ? ` — 9-Grid konumu: ${cell.baslik}` : ""}.`;
  const s2 = guclu.length ? `Öne çıkan yönleri: ${guclu.join("; ")}.` : "Değerlendirme verisi sınırlı olduğundan güçlü yön tespiti kısıtlı.";
  const yon = pos ? YONLENDIRME[pos.pot + "-" + pos.perf] : "";
  const s3 = `Öneri: ${yon}${zayif.length ? ` Gelişime açık alanlar: ${zayif.slice(0, 3).join(", ")}.` : ""}`;
  const s4 = sistemOnerisi(ev) === "Evet"
    ? "Sonuç olarak bu profil, gelişim ve kritik pozisyon yedeklemesi açısından yetenek havuzuna dahil edilmelidir."
    : "Sonuç olarak bu profil şu an havuz kriterlerini tam karşılamamaktadır; hedefli gelişim sonrası yeniden değerlendirilmelidir.";
  return `${s1} ${s2} ${s3} ${s4}`;
}

function computeDerived(d) {
  const pVals = POTANSIYEL_FIELDS.map(([k]) => d.potansiyel?.[k]).filter((v) => v);
  const ortalamaPotansiyel = pVals.length ? pVals.reduce((a, b) => a + b, 0) / pVals.length : 0;
  const cVals = CEVIKLIK_FIELDS.map(([k]) => d.ogrenmeCevikligi?.[k]);
  const cFilled = cVals.filter((v) => v !== undefined && v !== null);
  const ortalamaOgrenmeCevikligi = cFilled.length ? cFilled.filter(Boolean).length / CEVIKLIK_FIELDS.length : 0;
  const pOrt = performansOrt(d.performans) || 0;
  const perfSk = pOrt ? (pOrt - 1) / 2 * 100 : 0;
  return {
    ortalamaPotansiyel: Math.round(ortalamaPotansiyel * 100) / 100,
    ortalamaOgrenmeCevikligi: Math.round(ortalamaOgrenmeCevikligi * 100) / 100,
    performansOrt: Math.round(pOrt * 100) / 100,
    performansSinifi: sinifLabel(perfSk),
    potansiyelDegerlendirme: sinifLabel(perfSk)
  };
}

function isComplete(d) {
  const pOk = POTANSIYEL_FIELDS.every(([k]) => d.potansiyel?.[k]);
  const cOk = CEVIKLIK_FIELDS.every(([k]) => d.ogrenmeCevikligi?.[k] !== undefined && d.ogrenmeCevikligi?.[k] !== null);
  const perfOk = PERFORMANS_FIELDS.every(([k]) => d.performans?.[k]);
  return pOk && cOk && perfOk && d.liderlikPotansiyeli && d.hazirOlmaSuresi && d.ayrilmaRiski;
}

function formatKidem(kurumKidemiYil) {
  if (kurumKidemiYil === null || kurumKidemiYil === undefined || isNaN(kurumKidemiYil)) return "—";
  let years = Math.floor(kurumKidemiYil);
  let months = Math.round((kurumKidemiYil - years) * 12);
  if (months === 12) { years += 1; months = 0; }
  return `${years} yıl ${months} ay`;
}

// ---------------------------------------------------------------
// UI kit: avatars, sidebar icons
// ---------------------------------------------------------------
const AVATAR_COLORS = ["#233047", "#a9772c", "#3d7a52", "#6b4fa0", "#1f7a8c", "#a13030", "#4a5568", "#8a5a2b"];
function avatarHtml(name, size) {
  size = size || 34;
  const n = (name || "?").trim();
  const initials = n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toLocaleUpperCase("tr") || "?";
  let hash = 0;
  for (let i = 0; i < n.length; i++) hash = (hash * 31 + n.charCodeAt(i)) >>> 0;
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return `<span class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px;background:${color}">${initials}</span>`;
}

const ICONS = {
  grid: `<svg width="16" height="16" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor"/><rect x="13" y="3" width="8" height="8" rx="1.5" fill="currentColor" opacity=".55"/><rect x="3" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity=".55"/><rect x="13" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity=".85"/></svg>`,
  people: `<svg width="16" height="16" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4" fill="currentColor"/><path d="M2.5 20c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5" fill="currentColor" opacity=".85"/><circle cx="17.5" cy="8.5" r="2.6" fill="currentColor" opacity=".55"/><path d="M14.8 13.9c1-.6 2.1-.9 3-.9 2.8 0 5 2 5.2 5" fill="currentColor" opacity=".55"/></svg>`,
  gear: `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z" fill="currentColor"/><path d="M19.4 13.6l1.7-1-2-3.4-1.9.7a6.9 6.9 0 0 0-1.5-.9l-.3-2h-4l-.3 2a6.9 6.9 0 0 0-1.5.9l-1.9-.7-2 3.4 1.7 1a7 7 0 0 0 0 1.7l-1.7 1 2 3.4 1.9-.7c.4.4 1 .7 1.5.9l.3 2h4l.3-2c.5-.2 1.1-.5 1.5-.9l1.9.7 2-3.4-1.7-1a7 7 0 0 0 0-1.7Z" fill="currentColor" opacity=".55"/></svg>`
};

function sidebarHtml(items, activeKey) {
  return `<div class="sidebar">
    ${items.map((it) => `<div class="nav-item ${it.key === activeKey ? "active" : ""}" data-nav="${it.key}"><span class="ic">${it.icon}</span>${it.label}</div>`).join("")}
  </div>`;
}

// ---------------------------------------------------------------
// State
// ---------------------------------------------------------------
let currentUid = null;
let currentProfile = null; // { isAdmin, adSoyad, muduluk, direktorluk, roller, username }
let employeesCache = [];   // from Firestore 'employees'
let allEvalsMap = {};      // docId -> evaluation doc (tüm dönemler)
let evaluationsMap = {};   // employeeId -> evaluation doc (SEÇİLİ dönem)
let unsubEval = null;
let unsubEmp = null;

// --- Dönem durumu ---
const DEF_AKTIF = (typeof AKTIF_DONEM !== "undefined") ? AKTIF_DONEM : "3. Çeyrek Sonu";
const DEF_ESKI = (typeof ESKI_DONEM !== "undefined") ? ESKI_DONEM : "2. Çeyrek Sonu";
const DEF_DONEMLER = (typeof DONEMLER !== "undefined") ? DONEMLER : [DEF_ESKI, DEF_AKTIF];
let aktifDonem = DEF_AKTIF;     // düzenlemeye açık dönem
let donemList = DEF_DONEMLER;   // seçilebilir dönemler
let viewDonem = DEF_AKTIF;      // ekranda görüntülenen dönem
const DONEM_AYAR_ID = "_ayar_donem"; // "managers" koleksiyonunda dönem ayar dokümanı (uid ile çakışmaz)

// Türkçe-duyarsız isim anahtarı (eski değerlendirmeleri güncel roster'a isimle eşlemek için)
function trFold(s) {
  return (s || "").toString()
    .replace(/İ/g, "I").replace(/ı/g, "i")
    .toLocaleUpperCase("tr")
    .replace(/Ç/g, "C").replace(/Ğ/g, "G").replace(/Ö/g, "O").replace(/Ş/g, "S").replace(/Ü/g, "U").replace(/İ/g, "I")
    .replace(/\s+/g, " ").trim();
}
function nameKey(s) { return trFold(s); }
function evalDahaYeni(a, b) {
  const ta = a.updatedAt && a.updatedAt.toMillis ? a.updatedAt.toMillis() : 0;
  const tb = b.updatedAt && b.updatedAt.toMillis ? b.updatedAt.toMillis() : 0;
  if (ta !== tb) return ta > tb;
  return !!a.donem && !b.donem;
}
// Bir kişinin ESKİ (ilk) değerlendirmesini isimle bul (yeni kayıt olsa bile arşivden)
function eskiEvalBul(adSoyad) {
  const nk = nameKey(adSoyad || "");
  let best = null;
  Object.values(allEvalsMap).forEach((e) => {
    if (nameKey(e.adSoyad || "") !== nk) return;
    if (eskiDegerlendirmeVar(e) && (!best || evalDahaYeni(e, best))) best = e;
  });
  return best;
}

// Tüm değerlendirmeleri (eski + yeni) tek yıl havuzunda birleştir; güncel roster'a İSİMLE eşle.
function rebuildEvalMap() {
  evaluationsMap = {};
  const nameToId = {};
  employeesCache.forEach((e) => { if (e.adSoyad) nameToId[nameKey(e.adSoyad)] = e.id; });
  Object.values(allEvalsMap).forEach((ev) => {
    const nk = nameKey(ev.adSoyad || "");
    const key = nameToId[nk] || ev.employeeId || ev.id;
    const cur = evaluationsMap[key];
    if (!cur || evalDahaYeni(ev, cur)) evaluationsMap[key] = ev;
  });
}

// Düzenleme yapılabilir mi? (sadece aktif dönem düzenlenebilir)
function isDuzenlenebilir() { return viewDonem === aktifDonem; }

// ---------------------------------------------------------------
// Rol / kapsam yardımcıları (müdür + direktör)
// ---------------------------------------------------------------
function profilRolleri(p) {
  if (!p) return [];
  if (Array.isArray(p.roller) && p.roller.length) return p.roller;
  if (p.isAdmin || p.role === "admin") return ["admin"];
  const r = [];
  if (p.muduluk) r.push("manager");
  if (p.direktorluk) r.push("direktor");
  if (!r.length) r.push("manager");
  return r;
}
// Müdür olarak değerlendireceği personel (kendisi hariç)
function mudurEkibi(p) {
  if (!p.muduluk) return [];
  return employeesCache.filter((e) => e.muduluk === p.muduluk && e.adSoyad !== p.muduluk);
}
// Direktör olarak değerlendireceği müdürler (altındaki, müdürlük sütununda kendi adı olanlar)
function direktorMudurleri(p) {
  if (!p.direktorluk) return [];
  return employeesCache.filter((e) => e.direktor === p.direktorluk && e.muduluk === e.adSoyad);
}
// Direktörün SADECE görüntüleyebileceği (düzenleyemez) personel: altındaki müdürlerin ekipleri
function direktorGorunen(p) {
  if (!p.direktorluk) return [];
  const duzenlenebilirIds = new Set(direktorMudurleri(p).map((e) => e.id));
  return employeesCache.filter((e) => e.direktor === p.direktorluk && !duzenlenebilirIds.has(e.id));
}

// Bir değerlendirme kaydından "personel benzeri" nesne üret (eski dönem görüntüleme için)
function evToEmp(ev) {
  return { id: ev.employeeId || ev.id, adSoyad: ev.adSoyad, mevcutUnvan: ev.unvan, departman: ev.departman, bolum: ev.bolum, muduluk: ev.muduluk, kurumKidemiYil: null };
}
// Id ile personel bul: önce güncel roster, yoksa seçili dönemin kayıtlarından
function findEmpById(id) {
  const inRoster = employeesCache.find((e) => e.id === id);
  if (inRoster) return inRoster;
  const ev = evaluationsMap[id];
  return ev ? evToEmp(ev) : null;
}
// Admin görünümünde seçili döneme göre personel kümesi
function adminRoster() {
  if (isDuzenlenebilir()) return employeesCache;
  return Object.values(evaluationsMap).map(evToEmp);
}

// ---------------------------------------------------------------
// Auth
// ---------------------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (unsubEval) unsubEval();
  if (unsubEmp) unsubEmp();
  if (!user) {
    currentUid = null;
    currentProfile = null;
    renderLogin();
    return;
  }
  currentUid = user.uid;
  try {
    // Dönem ayarları — mevcut (izinli) "managers" koleksiyonunda saklanır (yeni koleksiyon kural gerektirir)
    try {
      const cfg = await getDoc(doc(db, "managers", DONEM_AYAR_ID));
      if (cfg.exists()) {
        const c = cfg.data();
        if (c.aktifDonem) aktifDonem = c.aktifDonem;
        if (Array.isArray(c.donemler) && c.donemler.length) donemList = c.donemler;
      }
    } catch (e) { console.warn("dönem ayarı okunamadı", e); }
    viewDonem = aktifDonem;

    // Yetki: önce managers/{username} (yeni profil), yoksa managers/{uid} (eski model)
    const username = (user.email || "").split("@")[0].toLowerCase();
    let prof = null;
    let pSnap = null;
    try { pSnap = await getDoc(doc(db, "managers", username)); } catch (e) { console.warn("profil okunamadı", e); }
    if (pSnap && pSnap.exists() && pSnap.data().profil === true) {
      const d = pSnap.data();
      prof = {
        isAdmin: !!d.isAdmin,
        adSoyad: d.adSoyad || username,
        muduluk: d.muduluk || null,
        direktorluk: d.direktorluk || null,
        roller: d.roller || null,
        username
      };
    } else {
      const mSnap = await getDoc(doc(db, "managers", user.uid));
      if (mSnap.exists()) {
        const d = mSnap.data();
        prof = {
          isAdmin: d.role === "admin",
          adSoyad: d.adSoyad || username,
          muduluk: d.muduluk || null,
          direktorluk: d.direktorluk || null,
          roller: d.roller || null,
          username: d.username || username
        };
      }
    }
    if (!prof) {
      renderLogin("Bu hesap sisteme tanımlı değil. Lütfen yöneticinizle (İK) iletişime geçin.");
      await signOut(auth);
      return;
    }
    currentProfile = prof;
    subscribeEmployees();
  } catch (e) {
    console.error(e);
    renderLogin("Giriş sırasında bir hata oluştu: " + e.message);
  }
});

function subscribeEmployees() {
  unsubEmp = onSnapshot(collection(db, "employees"), (qs) => {
    employeesCache = [];
    qs.forEach((d) => employeesCache.push({ id: d.id, ...d.data() }));
    subscribeEvaluations();
  }, (err) => console.error(err));
}

function subscribeEvaluations() {
  if (unsubEval) unsubEval();
  // Tüm değerlendirmeler çekilir; dönem + kapsam istemci tarafında filtrelenir.
  // (Eski dönem herkese görünür olmalı; direktör kapsamı tek bir müdürlükle sınırlı değil.)
  unsubEval = onSnapshot(collection(db, "evaluations"), (qs) => {
    allEvalsMap = {};
    qs.forEach((d) => (allEvalsMap[d.id] = { id: d.id, ...d.data() }));
    rebuildEvalMap();
    render();
  }, (err) => console.error(err));
}

function render() {
  if (currentProfile.isAdmin) renderAdmin();
  else renderManager();
}

// Dönem değiştir (üst çubuktaki seçici)
function setViewDonem(d) {
  viewDonem = d;
  rebuildEvalMap();
  render();
}

// ---------------------------------------------------------------
// LOGIN SCREEN
// ---------------------------------------------------------------
function renderLogin(errMsg) {
  root().innerHTML = `
  <div class="center-screen">
    <div class="login-card">
      <div class="login-brand">
        <div class="mark">İH</div>
        <div>
          <div class="name">Yetenek Havuzu Değerlendirme</div>
          <div class="sub">İnciroğlu Otomotiv · İnsan Kaynakları</div>
        </div>
      </div>
      <h1>Giriş Yap</h1>
      <p class="hint">Size iletilen kullanıcı adı ve şifre ile giriş yapın.</p>
      <div class="error-box" id="loginErr" style="${errMsg ? "display:block" : ""}">${errMsg || ""}</div>
      <form id="loginForm">
        <div class="field">
          <label>Kullanıcı Adı</label>
          <input type="text" id="username" autocomplete="username" required placeholder="orn: ahmet.yilmaz">
        </div>
        <div class="field">
          <label>Şifre</label>
          <input type="password" id="password" autocomplete="current-password" required placeholder="••••••••">
        </div>
        <button class="btn btn-primary" type="submit">Giriş Yap</button>
      </form>
      <div class="login-foot">Sorun yaşıyorsanız İK departmanı ile iletişime geçin.</div>
    </div>
  </div>`;
  el("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = el("#username").value.trim().toLowerCase();
    const p = el("#password").value;
    const btn = e.target.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Giriş yapılıyor…";
    try {
      await signInWithEmailAndPassword(auth, `${u}@${LOGIN_DOMAIN}`, p);
    } catch (err) {
      const box = el("#loginErr");
      box.style.display = "block";
      box.textContent = "Kullanıcı adı veya şifre hatalı.";
      btn.disabled = false;
      btn.textContent = "Giriş Yap";
    }
  });
}

// ---------------------------------------------------------------
// TOPBAR (shared)
// ---------------------------------------------------------------
function rolEtiketi() {
  const r = profilRolleri(currentProfile);
  if (r.includes("admin")) return "İK / Admin";
  const parts = [];
  if (r.includes("direktor")) parts.push("Direktör");
  if (r.includes("manager")) parts.push("Müdür");
  return parts.join(" · ") || "Müdür";
}

function donemSelectorHtml() {
  if (!donemList || donemList.length < 2) return "";
  return `<select id="donemSel" class="donem-sel" title="Dönem seçin">
    ${donemList.map((d) => `<option value="${d}" ${d === viewDonem ? "selected" : ""}>${d}${d === aktifDonem ? " (Aktif)" : ""}</option>`).join("")}
  </select>`;
}

function topbar() {
  const isAdmin = currentProfile.isAdmin;
  return `
  <div class="topbar">
    <div class="brand">
      <div class="mark">İH</div>
      <div class="t">Yetenek Havuzu<small>${isAdmin ? "İK Değerlendirme Paneli" : "Değerlendirme Ekranı"}</small></div>
    </div>
    <div class="who">
      ${donemSelectorHtml()}
      <span class="pill">${rolEtiketi()}</span>
      <span><b>${currentProfile.adSoyad}</b></span>
      <button class="btn btn-ghost btn-sm" id="pwBtn">Şifre Değiştir</button>
      <button class="btn btn-ghost btn-sm" id="logoutBtn">Çıkış</button>
    </div>
  </div>`;
}

function wireTopbar() {
  el("#logoutBtn").addEventListener("click", () => signOut(auth));
  el("#pwBtn").addEventListener("click", () => openPasswordModal());
  const ds = el("#donemSel");
  if (ds) ds.addEventListener("change", () => setViewDonem(ds.value));
}

// ---------------------------------------------------------------
// ŞİFRE DEĞİŞTİR (Firebase Auth üzerinden — gerçek, güvenli şifre değişimi)
// Not: hesaplar sahte bir e-posta alan adı kullandığı için Firebase'in
// "şifremi unuttum" e-posta akışı burada çalışmaz (gidecek gerçek kutu yok).
// Bu yüzden yalnızca MEVCUT şifreyi bilen kişi kendi şifresini değiştirebilir;
// tamamen unutulan bir şifre için tek yol Firebase konsolundan admin sıfırlamasıdır.
// ---------------------------------------------------------------
function openPasswordModal() {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="drawer" style="width:min(420px,100%)">
      <div class="drawer-head">
        <div><h2>Şifre Değiştir</h2><div class="meta">${currentProfile.adSoyad}</div></div>
        <button class="close-x" id="closePwModal">✕</button>
      </div>
      <div class="drawer-body">
        <div class="field"><label>Mevcut Şifre</label><input type="password" id="pwCur"></div>
        <div class="field"><label>Yeni Şifre</label><input type="password" id="pwNew1" placeholder="en az 6 karakter"></div>
        <div class="field"><label>Yeni Şifre (Tekrar)</label><input type="password" id="pwNew2"></div>
        <div id="pwMsg" style="font-size:12.5px;margin-top:6px"></div>
      </div>
      <div class="drawer-foot">
        <button class="btn btn-ghost" id="pwVazgec">Vazgeç</button>
        <button class="btn btn-brass" id="pwKaydet">Kaydet</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  el("#closePwModal").onclick = () => overlay.remove();
  el("#pwVazgec").onclick = () => overlay.remove();
  el("#pwKaydet").onclick = async () => {
    const cur = el("#pwCur").value, n1 = el("#pwNew1").value, n2 = el("#pwNew2").value;
    const msg = el("#pwMsg");
    if (!cur) { msg.innerHTML = '<span style="color:var(--bad)">Mevcut şifrenizi girin.</span>'; return; }
    if (!n1 || n1.length < 6) { msg.innerHTML = '<span style="color:var(--bad)">Yeni şifre en az 6 karakter olmalı.</span>'; return; }
    if (n1 !== n2) { msg.innerHTML = '<span style="color:var(--bad)">Yeni şifreler birbiriyle uyuşmuyor.</span>'; return; }
    const btn = el("#pwKaydet");
    btn.disabled = true; btn.textContent = "Kaydediliyor…";
    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, cur);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, n1);
      msg.innerHTML = '<span style="color:var(--good)">✓ Şifre güncellendi.</span>';
      setTimeout(() => overlay.remove(), 1200);
    } catch (e) {
      msg.innerHTML = '<span style="color:var(--bad)">' + (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential" ? "Mevcut şifre hatalı." : "Hata: " + e.message) + '</span>';
      btn.disabled = false; btn.textContent = "Kaydet";
    }
  };
}

// ---------------------------------------------------------------
// MANAGER VIEW
// ---------------------------------------------------------------
// Seçili döneme göre bu kullanıcının göreceği personel listeleri
function kapsamListeleri() {
  const p = currentProfile;
  const roles = profilRolleri(p);
  const aktif = isDuzenlenebilir();

  if (aktif) {
    // AKTİF DÖNEM: güncel roster üzerinden
    const editMap = new Map();
    if (roles.includes("manager")) mudurEkibi(p).forEach((e) => editMap.set(e.id, e));
    if (roles.includes("direktor")) direktorMudurleri(p).forEach((e) => editMap.set(e.id, e));
    const readMap = new Map();
    if (roles.includes("direktor")) direktorGorunen(p).forEach((e) => { if (!editMap.has(e.id)) readMap.set(e.id, e); });
    return { duzenlenebilir: [...editMap.values()], salt: [...readMap.values()], aktif: true };
  }

  // ESKİ DÖNEM: o döneme ait değerlendirme kayıtlarından (salt okunur)
  // Kapsam: kendi müdürlüğü + (direktörse) altındaki müdürlüklerin etiketleri
  const kapsamMud = new Set();
  if (p.muduluk) kapsamMud.add(p.muduluk);
  if (roles.includes("direktor") && p.direktorluk) {
    employeesCache.filter((e) => e.direktor === p.direktorluk).forEach((e) => { if (e.muduluk) kapsamMud.add(e.muduluk); });
  }
  const items = Object.values(evaluationsMap)
    .filter((ev) => kapsamMud.has(ev.muduluk))
    .map((ev) => ({ id: ev.employeeId || ev.id, adSoyad: ev.adSoyad, mevcutUnvan: ev.unvan, departman: ev.departman, bolum: ev.bolum, muduluk: ev.muduluk, kurumKidemiYil: null }));
  return { duzenlenebilir: [], salt: items, aktif: false };
}

function renderManager() {
  const { duzenlenebilir, salt, aktif } = kapsamListeleri();
  const degerlendirilebilir = duzenlenebilir.filter((e) => !kidemDisi(e));
  const disiSayi = duzenlenebilir.length - degerlendirilebilir.length;
  const total = degerlendirilebilir.length;
  const done = degerlendirilebilir.filter((e) => evaluationsMap[e.id]?.status === "tamamlandi").length;
  const draft = degerlendirilebilir.filter((e) => evaluationsMap[e.id]?.status === "taslak").length;
  const pending = total - done - draft;
  const roles = profilRolleri(currentProfile);
  const direktorMu = roles.includes("direktor");

  const banner = !aktif
    ? `<div class="error-box" style="display:block;background:var(--warn-bg);color:var(--warn)"><b>${viewDonem}</b> dönemini görüntülüyorsunuz — bu dönem <b>salt okunur</b>dur, değişiklik yapılamaz. Düzenleme için sağ üstten <b>${aktifDonem} (Aktif)</b> dönemini seçin.</div>`
    : "";

  const baslik = direktorMu && aktif
    ? "Değerlendirmelerim"
    : "Ekibimin Değerlendirmesi";
  const altYazi = aktif
    ? `${aktifDonem} dönemi için ${total} kişilik değerlendirme.`
    : `${viewDonem} döneminde kaydedilen değerlendirmeler (salt okunur).`;

  root().innerHTML = `
  ${topbar()}
  <div class="app-body">
    ${sidebarHtml([{ key: "ekip", icon: ICONS.people, label: "Değerlendirmeler" }], "ekip")}
    <div class="main-content">
      <div class="wrap">
        <div class="page-head">
          <div>
            <h1>${baslik}</h1>
            <p>${altYazi}</p>
          </div>
        </div>
        ${banner}
        ${aktif ? `<div class="stat-row">
          <div class="stat-card"><div class="n">${total}</div><div class="l">Değerlendirilecek</div></div>
          <div class="stat-card"><div class="n">${done}</div><div class="l">Tamamlandı</div></div>
          <div class="stat-card"><div class="n">${draft}</div><div class="l">Taslak</div></div>
          <div class="stat-card"><div class="n">${pending}</div><div class="l">Bekliyor</div></div>
          ${disiSayi ? `<div class="stat-card"><div class="n">${disiSayi}</div><div class="l">Kıdem &lt; 6 Ay (Dışı)</div></div>` : ""}
        </div>` : ""}
        <div class="toolbar">
          <input type="text" id="searchBox" placeholder="İsimle ara…" style="min-width:220px">
          <select id="statusFilter">
            <option value="">Tüm Durumlar</option>
            <option value="tamamlandi">Tamamlandı</option>
            <option value="taslak">Taslak</option>
            <option value="bekliyor">Bekliyor</option>
          </select>
        </div>
        ${(aktif && direktorMu) ? `<div class="section-title" style="margin-top:4px">Değerlendireceğim Müdürler / Personel</div>` : ""}
        <div class="card-list" id="empList"></div>
        ${(aktif && direktorMu && salt.length) ? `
          <div class="section-title" style="margin-top:22px">Müdürlerimin Ekipleri (Görüntüleme)</div>
          <p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 10px">Bu personeli görüntüleyebilirsiniz; değerlendirmeleri kendi müdürleri doldurur.</p>
          <div class="card-list" id="viewList"></div>` : ""}
      </div>
    </div>
  </div>`;
  wireTopbar();

  function empCardHtml(e, saltOkunur) {
    const disi = kidemDisi(e) && !saltOkunur;
    const ev = evaluationsMap[e.id];
    const st = ev?.status || "bekliyor";
    const stLabel = st === "tamamlandi" ? "Tamamlandı" : st === "taslak" ? "Taslak" : (saltOkunur ? "Kayıt yok" : "Bekliyor");
    if (disi) {
      return `
      <div class="emp-card" id="card-${e.id}" style="opacity:.72;cursor:not-allowed">
        <div style="display:flex;align-items:center;gap:12px;">
          ${avatarHtml(e.adSoyad, 36)}
          <div class="main">
            <b>${e.adSoyad}</b>
            <div class="meta">${e.mevcutUnvan || ""} · ${e.departman || ""} / ${e.bolum || ""}</div>
          </div>
        </div>
        <span class="status-badge" style="background:#eef0f4;color:#6b7280">Kıdem &lt; 6 Ay · Değerlendirme Dışı</span>
      </div>`;
    }
    return `
    <div class="emp-card" id="card-${e.id}" style="cursor:pointer">
      <div style="display:flex;align-items:center;gap:12px;">
        ${avatarHtml(e.adSoyad, 36)}
        <div class="main">
          <b>${e.adSoyad}</b>
          <div class="meta">${e.mevcutUnvan || ""} · ${e.departman || ""} / ${e.bolum || ""}${e.muduluk ? " · Müdür: " + e.muduluk : ""}</div>
        </div>
      </div>
      <span class="status-badge status-${st}">${stLabel}</span>
    </div>`;
  }

  function draw() {
    const term = el("#searchBox").value.trim().toLocaleLowerCase("tr");
    const statusF = el("#statusFilter").value;
    const filt = (arr) => arr
      .filter((e) => (e.adSoyad || "").toLocaleLowerCase("tr").includes(term))
      .filter((e) => { const st = evaluationsMap[e.id]?.status || "bekliyor"; return !statusF || st === statusF; })
      .sort((a, b) => (a.adSoyad || "").localeCompare(b.adSoyad || "", "tr"));

    const mainList = aktif ? filt(duzenlenebilir) : filt(salt);
    el("#empList").innerHTML = mainList.length
      ? mainList.map((e) => empCardHtml(e, !aktif)).join("")
      : `<div class="empty-state">${aktif ? "Aramanızla eşleşen personel bulunamadı." : "Bu dönemde kayıt bulunamadı."}</div>`;
    mainList.forEach((e) => {
      const node = document.getElementById("card-" + e.id);
      if (!node) return;
      if (aktif && kidemDisi(e)) {
        node.addEventListener("click", () => toast("Bu personel kıdemi 6 aydan az olduğu için değerlendirme dışıdır."));
      } else {
        node.addEventListener("click", () => aktif ? openEvalDrawer(e) : openAdminDetailDrawer(e));
      }
    });

    const vl = document.getElementById("viewList");
    if (vl) {
      const vList = filt(salt);
      vl.innerHTML = vList.length ? vList.map((e) => empCardHtml(e, true)).join("") : `<div class="empty-state">Görüntülenecek personel yok.</div>`;
      vList.forEach((e) => {
        const node = document.getElementById("card-" + e.id);
        if (node) node.addEventListener("click", () => openAdminDetailDrawer(e));
      });
    }
  }

  el("#searchBox").addEventListener("input", draw);
  el("#statusFilter").addEventListener("change", draw);
  draw();
}

// ---------------------------------------------------------------
// EVALUATION DRAWER (used by manager)
// ---------------------------------------------------------------
function openEvalDrawer(emp) {
  const existing = evaluationsMap[emp.id] || {};
  const d = {
    potansiyel: { ...(existing.potansiyel || {}) },
    ogrenmeCevikligi: { ...(existing.ogrenmeCevikligi || {}) },
    performans: { ...(existing.performans || {}) },
    liderlikPotansiyeli: existing.liderlikPotansiyeli || "",
    yetenekHavuzuAlinmali: existing.yetenekHavuzuAlinmali || "",
    hazirOlmaSuresi: existing.hazirOlmaSuresi || "",
    yedekPozisyonlar: existing.yedekPozisyonlar || "",
    ayrilmaRiski: existing.ayrilmaRiski || "",
    gelisimAlanlari: existing.gelisimAlanlari || "",
    fonksiyonelGecisUygun: existing.fonksiyonelGecisUygun || "",
    fonksiyonelGecisDept: existing.fonksiyonelGecisDept || "",
    gerekce: existing.gerekce || ""
  };

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="drawer">
      <div class="drawer-head">
        <div style="display:flex;align-items:center;gap:12px;">
          ${avatarHtml(emp.adSoyad, 38)}
          <div>
            <h2>${emp.adSoyad}</h2>
            <div class="meta">${emp.mevcutUnvan || ""} · ${emp.departman || ""} / ${emp.bolum || ""}</div>
            <div class="save-status" id="saveStatus"></div>
          </div>
        </div>
        <button class="close-x" id="closeDrawer">✕</button>
      </div>
      <div class="drawer-body" id="drawerBody"></div>
      <div class="drawer-foot">
        <button class="btn btn-ghost" id="saveDraft">Taslak Olarak Kaydet</button>
        <button class="btn btn-brass" id="saveFinal">Değerlendirmeyi Tamamla</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  function closeOverlay() {
    clearTimeout(autosaveTimer);
    overlay.remove();
  }
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeOverlay(); });
  el("#closeDrawer").onclick = closeOverlay;

  function segHtml(groupKey, key, label, desc, options, isBool) {
    const val = groupKey ? d[groupKey][key] : d[key];
    return `
    <div class="comp-row" data-fieldkey="${groupKey ? groupKey + "." + key : key}">
      <div class="q">${label}<br><span style="font-weight:400;color:var(--ink-soft);font-size:12px">${desc}</span></div>
      <div class="seg ${isBool ? "two" : ""}" data-group="${groupKey || ""}" data-key="${key}">
        ${options.map((o) => `<button type="button" data-v="${o.v}" class="${val == o.v ? "active" : ""}">${o.l}</button>`).join("")}
      </div>
    </div>`;
  }

  function summaryHtml() {
    const der = computeDerived(d);
    const ev = { ...d, ...der };
    const pos = gridPos(ev);
    const oneri = sistemOnerisi(ev);
    return `
    <div class="summary-box">
      <div class="row"><span>Ortalama Potansiyel</span><b>${der.ortalamaPotansiyel} / 5</b></div>
      <div class="row"><span>Öğrenme Çevikliği Oranı</span><b>${Math.round(der.ortalamaOgrenmeCevikligi * 100)}%</b></div>
      <div class="row"><span>Performans Sınıfı</span><b>${der.performansSinifi}</b></div>
      ${pos ? `<div class="row"><span>9-Grid Konumu</span><b>${GRID9[pos.pot + "-" + pos.perf].baslik}</b></div>` : ""}
      ${oneri ? `<div class="verdict ${oneri === "Evet" ? "ok" : "dev"}">Sistem Önerisi — Yetenek Havuzuna: ${oneri.toLocaleUpperCase("tr")}</div>` : ""}
    </div>`;
  }

  function sistemKutuHtml() {
    const der = computeDerived(d);
    const ev = { ...d, ...der, adSoyad: emp.adSoyad };
    const gk = gridPos(ev) ? sistemGerekce(ev) : "";
    if (!gk) return `<div class="field"><div style="background:#f3f4f7;border:1px dashed var(--line);border-radius:8px;padding:12px 14px;font-size:12.5px;color:var(--ink-soft)">Metrikleri (Potansiyel, Performans, Öğrenme Çevikliği) doldurdukça sistem burada otomatik bir <b>öneri ve gerekçe</b> oluşturacaktır.</div></div>`;
    return `<div class="field">
      <label style="color:var(--brass)">Sistem Önerisi ve Gerekçesi (otomatik oluşturulur)</label>
      <div style="background:#faf8f3;border:1px solid var(--brass);border-radius:8px;padding:12px 14px;font-size:13px;line-height:1.55;color:var(--ink)">${gk}</div>
    </div>`;
  }

  function bodyHtml() {
    return `
    <div class="section-title">Genel</div>
    <div class="comp-row">
      <div class="q">Yetenek Havuzuna Alınmalı mı?</div>
      <div class="seg two" data-key="yetenekHavuzuAlinmali">
        ${["Evet", "Hayır"].map((o) => `<button type="button" data-v="${o}" class="${d.yetenekHavuzuAlinmali === o ? "active" : ""}">${o}</button>`).join("")}
      </div>
    </div>
    <div class="comp-row" data-fieldkey="liderlikPotansiyeli">
      <div class="q">Liderlik Potansiyeli / Ekip Yönetim Potansiyeli</div>
      <div class="seg two" data-key="liderlikPotansiyeli">
        ${["Var", "Yok"].map((o) => `<button type="button" data-v="${o}" class="${d.liderlikPotansiyeli === o ? "active" : ""}">${o}</button>`).join("")}
      </div>
    </div>

    <div class="section-title">Potansiyel Yetkinlikleri (1–5)</div>
    ${POTANSIYEL_FIELDS.map(([k, l, ds]) => segHtml("potansiyel", k, l, ds, SCORE_LABELS.map((s) => ({ v: s.v, l: s.l })))).join("")}

    <div class="section-title">Performans (Düşük / Orta / Yüksek)</div>
    ${PERFORMANS_FIELDS.map(([k, l]) => segHtml("performans", k, l, "", DOY_OPTS)).join("")}

    <div class="section-title">Öğrenme Çevikliği (Var / Yok)</div>
    ${CEVIKLIK_FIELDS.map(([k, l, ds]) => segHtml("ogrenmeCevikligi", k, l, ds, [{ v: "true", l: "Var" }, { v: "false", l: "Yok" }], true)).join("")}

    ${summaryHtml()}

    <div class="section-title">Gelişim ve Planlama</div>
    <div class="two-col">
      <div class="field">
        <label>Hazır Olma Süresi</label>
        <select id="hazirOlmaSuresi">
          <option value="">Seçiniz</option>
          ${["Hazır", "0-1 yıl", "1-2 Yıl"].map((o) => `<option value="${o}" ${d.hazirOlmaSuresi === o ? "selected" : ""}>${o}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Ayrılma Riski</label>
        <select id="ayrilmaRiski">
          <option value="">Seçiniz</option>
          ${["Düşük", "Orta", "Yüksek"].map((o) => `<option value="${o}" ${d.ayrilmaRiski === o ? "selected" : ""}>${o}</option>`).join("")}
        </select>
      </div>
    </div>
    <div class="field">
      <label>Yedekleyebileceği Pozisyonlar</label>
      <input type="text" id="yedekPozisyonlar" value="${d.yedekPozisyonlar || ""}" placeholder="Örn: Servis Şefi">
    </div>
    <div class="field">
      <label>Gelişim Alanları</label>
      <textarea id="gelisimAlanlari" rows="2" placeholder="Geliştirilmesi gereken alanlar…">${d.gelisimAlanlari || ""}</textarea>
    </div>
    <div class="two-col">
      <div class="field">
        <label>Fonksiyonel Geçişe Uygun mu?</label>
        <select id="fonksiyonelGecisUygun">
          <option value="">Seçiniz</option>
          ${["Evet", "Hayır"].map((o) => `<option value="${o}" ${d.fonksiyonelGecisUygun === o ? "selected" : ""}>${o}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Uygun Departman / Rol</label>
        <input type="text" id="fonksiyonelGecisDept" value="${d.fonksiyonelGecisDept || ""}" placeholder="Örn: Yedek Parça">
      </div>
    </div>
    ${sistemKutuHtml()}
    <div class="field">
      <label>Müdür Görüşü / Gerekçe (Vaka · Çıktı · Reaksiyon — opsiyonel)</label>
      <div style="font-size:12px;color:var(--ink-soft);margin-bottom:5px">Yukarıdaki öneriyi sistem otomatik yazar. Buraya <b>kendi görüşünüzü</b> ekleyin: hangi olayda bu yetkinliği sergiledi? Hangi iş sonucuna katkı sağladı?</div>
      <textarea id="gerekce" rows="4" placeholder="Kendi değerlendirmenizi ve somut örneği buraya yazın…">${d.gerekce || ""}</textarea>
    </div>`;
  }

  function refresh() {
    el("#drawerBody").innerHTML = bodyHtml();
    wireInteractions();
    if (attemptedFinal) validateAndHighlight();
  }

  let attemptedFinal = false;
  function validateAndHighlight() {
    document.querySelectorAll(".field-error").forEach((n) => n.classList.remove("field-error"));
    let firstBad = null;
    function mark(selector) {
      const node = document.querySelector(selector);
      if (node) { if (attemptedFinal) node.classList.add("field-error"); if (!firstBad) firstBad = node; }
    }
    POTANSIYEL_FIELDS.forEach(([k]) => { if (!d.potansiyel[k]) mark(`.comp-row[data-fieldkey="potansiyel.${k}"]`); });
    PERFORMANS_FIELDS.forEach(([k]) => { if (!d.performans[k]) mark(`.comp-row[data-fieldkey="performans.${k}"]`); });
    CEVIKLIK_FIELDS.forEach(([k]) => { if (d.ogrenmeCevikligi[k] === undefined || d.ogrenmeCevikligi[k] === null) mark(`.comp-row[data-fieldkey="ogrenmeCevikligi.${k}"]`); });
    if (!d.liderlikPotansiyeli) mark('.comp-row[data-fieldkey="liderlikPotansiyeli"]');
    if (!d.hazirOlmaSuresi) mark("#hazirOlmaSuresi");
    if (!d.ayrilmaRiski) mark("#ayrilmaRiski");
    return firstBad;
  }

  let autosaveTimer = null;
  function setSaveStatus(state, text) {
    const s = document.getElementById("saveStatus");
    if (!s) return;
    s.className = "save-status " + state;
    s.textContent = text;
  }
  function scheduleAutosave() {
    setSaveStatus("saving", "Değişiklikler kaydediliyor…");
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      const keepFinal = existing.status === "tamamlandi" && isComplete(d);
      save(keepFinal ? "tamamlandi" : "taslak", false);
    }, 1100);
  }

  function wireInteractions() {
    document.querySelectorAll(".seg[data-key], .seg[data-group]").forEach((seg) => {
      seg.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const group = seg.dataset.group;
          const key = seg.dataset.key;
          let v = btn.dataset.v;
          if (v === "true") v = true;
          else if (v === "false") v = false;
          else if (!isNaN(v)) v = Number(v);
          if (group) d[group][key] = v;
          else d[key] = v;
          refresh();
          scheduleAutosave();
        });
      });
    });
    ["hazirOlmaSuresi", "ayrilmaRiski", "yedekPozisyonlar", "gelisimAlanlari", "fonksiyonelGecisUygun", "fonksiyonelGecisDept", "gerekce"].forEach((id) => {
      const node = document.getElementById(id);
      if (node) node.addEventListener("input", () => { d[id] = node.value; validateAndHighlight(); scheduleAutosave(); });
    });
  }

  refresh();

  async function save(status, close) {
    if (close === undefined) close = true;
    const der = computeDerived(d);
    const payload = {
      employeeId: emp.id,
      donem: aktifDonem,
      adSoyad: emp.adSoyad,
      departman: emp.departman || "",
      bolum: emp.bolum || "",
      unvan: emp.mevcutUnvan || "",
      muduluk: emp.muduluk,
      ...d,
      ...der,
      sistemGerekcesi: sistemGerekce({ ...d, ...der, adSoyad: emp.adSoyad }),
      status,
      submittedByUid: currentUid,
      submittedByName: currentProfile.adSoyad,
      updatedAt: serverTimestamp()
    };
    try {
      await setDoc(doc(db, "evaluations", `${aktifDonem}::${emp.id}`), payload, { merge: true });
      if (close) {
        toast(status === "tamamlandi" ? "Değerlendirme tamamlandı olarak kaydedildi." : "Taslak kaydedildi.");
        closeOverlay();
      } else {
        const now = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        setSaveStatus("saved", `Kaydedildi ✓ ${now}`);
      }
    } catch (e) {
      if (close) toast("Kaydedilemedi: " + e.message);
      else setSaveStatus("error", "Kaydedilemedi: bağlantınızı kontrol edin");
    }
  }

  el("#saveDraft").onclick = () => save("taslak");
  el("#saveFinal").onclick = () => {
    if (!isComplete(d)) {
      attemptedFinal = true;
      const firstBad = validateAndHighlight();
      if (firstBad) firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
      toast("Tamamlamak için tüm yetkinlikleri (Potansiyel, Performans, Öğrenme Çevikliği), liderlik potansiyelini, hazır olma süresini ve ayrılma riskini doldurun.");
      return;
    }
    save("tamamlandi");
  };
}

// ---------------------------------------------------------------
// ADMIN: READ-ONLY PERSON DETAIL CARD
// ---------------------------------------------------------------
function scoreLabelText(v) {
  const found = SCORE_LABELS.find((s) => s.v === v);
  return found ? found.l : "—";
}

function openAdminDetailDrawer(emp) {
  const ev = evaluationsMap[emp.id];
  const eskiEv = currentProfile.isAdmin ? eskiEvalBul(emp.adSoyad) : null;

  const overlay = document.createElement("div");
  overlay.className = "overlay";

  function rowHtml(label, value) {
    return `<div class="comp-row" style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
      <div class="q" style="margin:0">${label}</div>
      <div style="font-weight:700;color:var(--navy);text-align:right">${value ?? "—"}</div>
    </div>`;
  }

  function bodyHtml() {
    if (!ev) {
      if (kidemDisi(emp)) return `<div class="empty-state">Bu personel <b>kıdemi 6 aydan az</b> olduğu için değerlendirme dışıdır; müdürüne metrikler doldurtulmaz.</div>`;
      const bos = `<div class="empty-state">Bu personel için henüz (yeni metriklerle) değerlendirme girilmedi.</div>`;
      return bos + eskiBlokHtml();
    }
    const pos = gridPos(ev);
    const oneri = sistemOnerisi(ev);
    const gerekceSis = sistemGerekce(ev);
    return `
    ${pos ? `<div class="summary-box" style="margin-top:0">
      <div class="row"><span>9-Grid Konumu</span><b>${GRID9[pos.pot + "-" + pos.perf].baslik} (${POT_ETIKET[pos.pot]} / ${PERF_ETIKET[pos.perf]})</b></div>
      <div class="row"><span>Sistem Önerisi — Yetenek Havuzuna</span><b style="color:${oneri === "Evet" ? "var(--good)" : "var(--bad)"}">${(oneri || "—").toLocaleUpperCase("tr")}</b></div>
      <div class="row"><span>Yönetici Görüşü (AY)</span><b>${ev.yetenekHavuzuAlinmali || "—"}</b></div>
      <div style="font-size:12.5px;color:var(--ink);line-height:1.5;margin-top:8px;padding-top:8px;border-top:1px solid var(--line)"><b>Sistem Gerekçesi:</b> ${gerekceSis}</div>
    </div>` : ""}

    <div class="section-title" style="margin-top:0">Genel</div>
    ${rowHtml("Yetenek Havuzuna Alınmalı mı? (Yönetici)", ev.yetenekHavuzuAlinmali)}
    ${rowHtml("Liderlik Potansiyeli / Ekip Yönetim Potansiyeli", ev.liderlikPotansiyeli)}

    <div class="section-title">Potansiyel Yetkinlikleri</div>
    ${POTANSIYEL_FIELDS.map(([k, l]) => rowHtml(l, scoreLabelText(ev.potansiyel?.[k]))).join("")}

    <div class="section-title">Performans (Düşük / Orta / Yüksek)</div>
    ${PERFORMANS_FIELDS.map(([k, l]) => rowHtml(l, ev.performans?.[k])).join("")}

    <div class="section-title">Öğrenme Çevikliği</div>
    ${CEVIKLIK_FIELDS.map(([k, l]) => rowHtml(l, ev.ogrenmeCevikligi?.[k] === true ? "Var" : ev.ogrenmeCevikligi?.[k] === false ? "Yok" : "—")).join("")}

    <div class="summary-box">
      <div class="row"><span>Ortalama Potansiyel</span><b>${ev.ortalamaPotansiyel ?? "—"} / 5</b></div>
      <div class="row"><span>Öğrenme Çevikliği Oranı</span><b>${ev.ortalamaOgrenmeCevikligi != null ? Math.round(ev.ortalamaOgrenmeCevikligi * 100) + "%" : "—"}</b></div>
      <div class="row"><span>Performans Sınıfı</span><b>${ev.performansSinifi || sinifLabel(performansSkoru(ev))}</b></div>
    </div>

    <div class="section-title">Planlama (Bağımsız Değerlendirmeler)</div>
    ${rowHtml("Hazır Olma Süresi", ev.hazirOlmaSuresi)}
    ${rowHtml("Ayrılma Riski", ev.ayrilmaRiski)}
    ${rowHtml("Yedekleyebileceği Pozisyonlar", ev.yedekPozisyonlar)}
    ${rowHtml("Fonksiyonel Geçişe Uygun mu?", ev.fonksiyonelGecisUygun)}
    ${rowHtml("Uygun Departman / Rol", ev.fonksiyonelGecisDept)}
    <div class="comp-row">
      <div class="q">Gelişim Alanları</div>
      <div style="font-size:13px;color:var(--ink)">${ev.gelisimAlanlari || "—"}</div>
    </div>
    <div class="comp-row">
      <div class="q">Gerekçe (Yönetici)</div>
      <div style="font-size:13px;color:var(--ink);white-space:pre-wrap">${ev.gerekce || "—"}</div>
    </div>
    <div class="comp-row">
      <div class="q">Bilgiyi Giren</div>
      <div style="font-size:13px;color:var(--ink-soft)">${ev.submittedByName || "—"} · ${ev.updatedAt?.toDate ? ev.updatedAt.toDate().toLocaleDateString("tr-TR") : "—"}</div>
    </div>
    ${eskiBlokHtml()}`;
  }

  function eskiBlokHtml() {
    if (!eskiEv) return "";
    const e = eskiEv;
    return `
    <div class="section-title" style="margin-top:26px;background:#eef0f4;color:var(--navy);padding:7px 10px;border-radius:6px">İlk Değerlendirme (Eski Metrikler) — yalnızca İK görür</div>
    <p style="font-size:12px;color:var(--ink-soft);margin:6px 0 4px">Bu kişinin önceki dönem eski metriklerle doldurulmuş değerlendirmesidir; arşiv amaçlı gösterilir. ${e.updatedAt?.toDate ? "(" + e.updatedAt.toDate().toLocaleDateString("tr-TR") + ")" : ""}</p>
    ${ESKI_POTANSIYEL_FIELDS.some(([k]) => e.potansiyel?.[k] != null) ? `<div class="section-title">İlk Değ. · Potansiyel Yetkinlikleri</div>
      ${ESKI_POTANSIYEL_FIELDS.map(([k, l]) => e.potansiyel?.[k] != null ? rowHtml(l, scoreLabelText(e.potansiyel[k])) : "").join("")}` : ""}
    ${e.teknikHakimiyet ? `<div class="section-title">İlk Değ. · Teknik Hakimiyet</div>
      ${ESKI_TEKNIK_FIELDS.map(([k, l]) => rowHtml(l, scoreLabelText(e.teknikHakimiyet?.[k]))).join("")}` : ""}
    ${e.ekKriterler ? `<div class="section-title">İlk Değ. · Ek Kriterler</div>
      ${ESKI_EK_KRITERLER.map(([k, l]) => e.ekKriterler?.[k] ? rowHtml(l, e.ekKriterler[k]) : "").join("")}` : ""}
    ${(e.egitimOnerileri && e.egitimOnerileri.length) ? `<div class="comp-row"><div class="q">İlk Değ. · Önerilen Eğitimler</div><div style="font-size:13px;color:var(--ink)">${e.egitimOnerileri.map((t) => `<span class="tag">${t}</span>`).join(" ")}</div></div>` : ""}
    ${e.teknikHakimiyetOrt != null ? rowHtml("İlk Değ. · Teknik Hakimiyet Ort.", (e.teknikHakimiyetOrt ?? "—") + " / 5") : ""}
    ${e.gerekce ? `<div class="comp-row"><div class="q">İlk Değ. · Gerekçe</div><div style="font-size:13px;color:var(--ink);white-space:pre-wrap">${e.gerekce}</div></div>` : ""}`;
  }

  overlay.innerHTML = `
    <div class="drawer">
      <div class="drawer-head">
        <div style="display:flex;align-items:center;gap:12px;">
          ${avatarHtml(emp.adSoyad, 38)}
          <div>
            <h2>${emp.adSoyad}</h2>
            <div class="meta">${emp.mevcutUnvan || ""} · ${emp.departman || ""} / ${emp.bolum || ""} · Müdür: ${emp.muduluk || "Atanmadı"} · Kıdem: ${formatKidem(emp.kurumKidemiYil)}</div>
          </div>
        </div>
        <button class="close-x" id="closeAdminDrawer">✕</button>
      </div>
      <div class="drawer-body">${bodyHtml()}</div>
      <div class="drawer-foot">
        <button class="btn btn-brass" id="downloadPersonExcel">Excel Raporu İndir</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  el("#closeAdminDrawer").onclick = () => overlay.remove();
  el("#downloadPersonExcel").onclick = () => exportSinglePersonExcel(emp, ev);
}

// ---------------------------------------------------------------
// ADMIN: SINGLE-PERSON STYLED EXCEL REPORT
// ---------------------------------------------------------------
let _exceljsLoadPromise = null;
function loadExcelJS() {
  if (window.ExcelJS) return Promise.resolve();
  if (_exceljsLoadPromise) return _exceljsLoadPromise;
  _exceljsLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js";
    s.onload = () => resolve();
    s.onerror = () => { _exceljsLoadPromise = null; reject(new Error("Excel kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edin.")); };
    document.head.appendChild(s);
  });
  return _exceljsLoadPromise;
}

async function exportSinglePersonExcel(emp, ev) {
  const btn = el("#downloadPersonExcel");
  if (btn) { btn.disabled = true; btn.textContent = "Hazırlanıyor…"; }
  try {
    await loadExcelJS();
    const wb = new ExcelJS.Workbook();
    wb.creator = "Yetenek Havuzu Değerlendirme";
    const ws = wb.addWorksheet("Değerlendirme", { views: [{ showGridLines: false }] });
    ws.columns = [{ width: 32 }, { width: 46 }];

    const NAVY = "FF233047", BRASS = "FFA9772C", LIGHT = "FFF6F5F1", LINE = "FFE2DDD2";
    let r = 1;

    function titleRow(text) {
      ws.mergeCells(r, 1, r, 2);
      const cell = ws.getCell(r, 1);
      cell.value = text;
      cell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
      cell.alignment = { vertical: "middle", horizontal: "left" };
      ws.getRow(r).height = 30;
      r++;
    }
    function subtitleRow(text) {
      ws.mergeCells(r, 1, r, 2);
      const cell = ws.getCell(r, 1);
      cell.value = text;
      cell.font = { size: 11, color: { argb: "FF4A5568" }, italic: true };
      ws.getRow(r).height = 20;
      r++;
    }
    function sectionRow(text) {
      r++;
      ws.mergeCells(r, 1, r, 2);
      const cell = ws.getCell(r, 1);
      cell.value = text.toUpperCase();
      cell.font = { size: 11, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRASS } };
      cell.alignment = { vertical: "middle" };
      ws.getRow(r).height = 20;
      r++;
    }
    function dataRow(label, value, opts) {
      const a = ws.getCell(r, 1), b = ws.getCell(r, 2);
      a.value = label; b.value = (value === null || value === undefined || value === "") ? "—" : value;
      a.font = { bold: true, size: 10.5, color: { argb: "FF1C2530" } };
      b.font = { size: 10.5, color: { argb: "FF1C2530" } };
      a.alignment = { vertical: "middle", wrapText: true };
      b.alignment = { vertical: "middle", wrapText: true };
      [a, b].forEach((c) => {
        c.border = { bottom: { style: "thin", color: { argb: LINE } } };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: (opts && opts.shade) ? LIGHT : "FFFFFFFF" } };
      });
      if (opts && opts.height) ws.getRow(r).height = opts.height;
      r++;
    }

    titleRow("Yetenek Havuzu Değerlendirme Raporu");
    subtitleRow("İnciroğlu Otomotiv · İnsan Kaynakları");
    r++;

    sectionRow("Personel Bilgileri");
    let shade = false;
    dataRow("Ad Soyad", emp.adSoyad, { shade: (shade = !shade) });
    dataRow("Unvan", emp.mevcutUnvan, { shade: (shade = !shade) });
    dataRow("Departman / Bölüm", `${emp.departman || ""} / ${emp.bolum || ""}`, { shade: (shade = !shade) });
    dataRow("Müdür", emp.muduluk || "Atanmadı", { shade: (shade = !shade) });
    dataRow("Kurum Kıdemi", formatKidem(emp.kurumKidemiYil), { shade: (shade = !shade) });
    dataRow("Eğitim Durumu", emp.egitimDurumu, { shade: (shade = !shade) });
    dataRow("Yabancı Dil", emp.yabanciDil, { shade: (shade = !shade) });

    if (!ev) {
      sectionRow("Değerlendirme Durumu");
      dataRow("Durum", "Bu personel için henüz değerlendirme girilmedi.", { shade: true, height: 30 });
    } else {
      sectionRow("Genel Değerlendirme");
      shade = false;
      dataRow("Yetenek Havuzuna Alınmalı mı?", ev.yetenekHavuzuAlinmali, { shade: (shade = !shade) });
      dataRow("Liderlik Potansiyeli / Ekip Yönetim Potansiyeli", ev.liderlikPotansiyeli, { shade: (shade = !shade) });

      const pos = gridPos(ev);
      sectionRow("Sistem Analizi (İK)");
      shade = false;
      dataRow("9-Grid Konumu", pos ? `${GRID9[pos.pot + "-" + pos.perf].baslik} (${POT_ETIKET[pos.pot]} / ${PERF_ETIKET[pos.perf]})` : "—", { shade: (shade = !shade) });
      dataRow("Sistem Önerisi — Yetenek Havuzuna", (sistemOnerisi(ev) || "—").toLocaleUpperCase("tr"), { shade: (shade = !shade) });
      dataRow("Neden (Gerekçe)", sistemGerekce(ev), { shade: (shade = !shade), height: 60 });

      sectionRow("Potansiyel Yetkinlikleri");
      shade = false;
      POTANSIYEL_FIELDS.forEach(([k, l]) => dataRow(l, scoreLabelText(ev.potansiyel?.[k]), { shade: (shade = !shade) }));

      sectionRow("Performans (Düşük / Orta / Yüksek)");
      shade = false;
      PERFORMANS_FIELDS.forEach(([k, l]) => dataRow(l, ev.performans?.[k], { shade: (shade = !shade) }));

      sectionRow("Öğrenme Çevikliği");
      shade = false;
      CEVIKLIK_FIELDS.forEach(([k, l]) => dataRow(l, ev.ogrenmeCevikligi?.[k] === true ? "Var" : ev.ogrenmeCevikligi?.[k] === false ? "Yok" : "—", { shade: (shade = !shade) }));

      sectionRow("Hesaplanan Sonuçlar");
      shade = false;
      dataRow("Ortalama Potansiyel (/5)", ev.ortalamaPotansiyel, { shade: (shade = !shade) });
      dataRow("Öğrenme Çevikliği Oranı", ev.ortalamaOgrenmeCevikligi != null ? Math.round(ev.ortalamaOgrenmeCevikligi * 100) + "%" : "—", { shade: (shade = !shade) });
      dataRow("Performans Sınıfı", ev.performansSinifi || sinifLabel(performansSkoru(ev)), { shade: (shade = !shade) });

      sectionRow("Planlama (Bağımsız Değerlendirmeler)");
      shade = false;
      dataRow("Hazır Olma Süresi", ev.hazirOlmaSuresi, { shade: (shade = !shade) });
      dataRow("Ayrılma Riski", ev.ayrilmaRiski, { shade: (shade = !shade) });
      dataRow("Yedekleyebileceği Pozisyonlar", ev.yedekPozisyonlar, { shade: (shade = !shade) });
      dataRow("Fonksiyonel Geçişe Uygun mu?", ev.fonksiyonelGecisUygun, { shade: (shade = !shade) });
      dataRow("Uygun Departman / Rol", ev.fonksiyonelGecisDept, { shade: (shade = !shade) });
      dataRow("Gelişim Alanları", ev.gelisimAlanlari, { shade: (shade = !shade), height: 30 });
      dataRow("Gerekçe (Yönetici)", ev.gerekce, { shade: (shade = !shade), height: 46 });
      dataRow("Bilgiyi Giren", `${ev.submittedByName || "—"} (${ev.updatedAt?.toDate ? ev.updatedAt.toDate().toLocaleDateString("tr-TR") : "—"})`, { shade: (shade = !shade) });
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${emp.adSoyad.replace(/\s+/g, "-")}-degerlendirme-raporu.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    toast("Rapor oluşturulamadı: " + e.message);
  }
  if (btn) { btn.disabled = false; btn.textContent = "Excel Raporu İndir"; }
}

// ---------------------------------------------------------------
// ADMIN: STAT CARD DRILL-DOWN (list of people behind a stat number)
// ---------------------------------------------------------------
function openStatListDrawer(title, list) {
  const sorted = [...list].sort((a, b) => a.adSoyad.localeCompare(b.adSoyad, "tr"));
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="drawer">
      <div class="drawer-head">
        <div>
          <h2>${title}</h2>
          <div class="meta">${sorted.length} personel</div>
        </div>
        <button class="close-x" id="closeStatDrawer">✕</button>
      </div>
      <div class="drawer-body">
        <div class="card-list">
          ${sorted.length ? sorted.map((e) => `
            <div class="emp-card" data-id="${e.id}" style="cursor:pointer">
              <div style="display:flex;align-items:center;gap:12px;">
                ${avatarHtml(e.adSoyad, 36)}
                <div class="main">
                  <b>${e.adSoyad}</b>
                  <div class="meta">${e.mevcutUnvan || ""} · ${e.departman || ""} / ${e.bolum || ""} · Müdür: ${e.muduluk || "Atanmadı"}</div>
                </div>
              </div>
            </div>`).join("") : `<div class="empty-state">Bu kritere uyan personel bulunamadı.</div>`}
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector("#closeStatDrawer").onclick = () => overlay.remove();
  overlay.querySelectorAll(".emp-card[data-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const emp = findEmpById(card.dataset.id);
      if (emp) openAdminDetailDrawer(emp);
    });
  });
}

// ---------------------------------------------------------------
// ADMIN: DASHBOARD HELPERS (charts, 9-box banding, print summary)
// ---------------------------------------------------------------
function band(v) {
  if (v >= 3.75) return 2; // Yüksek
  if (v >= 2.5) return 1;  // Orta
  return 0;                // Düşük
}
const BAND_LABELS = ["Düşük", "Orta", "Yüksek"];

function donutChart(segments, size) {
  size = size || 132;
  const total = segments.reduce((a, s) => a + s.value, 0);
  let acc = 0;
  const stops = total
    ? segments.map((s) => {
        const start = (acc / total) * 360;
        acc += s.value;
        const end = (acc / total) * 360;
        return `${s.color} ${start}deg ${end}deg`;
      }).join(", ")
    : "#eef0f4 0deg 360deg";
  const legend = segments.map((s) => `
    <div style="display:flex;align-items:center;gap:7px;font-size:12.3px;margin-bottom:6px">
      <span style="width:10px;height:10px;border-radius:3px;background:${s.color};display:inline-block;flex:none"></span>
      <span style="flex:1;color:var(--ink-soft)">${s.label}</span>
      <b style="color:var(--ink)">${s.value}${total ? " · " + Math.round((s.value / total) * 100) + "%" : ""}</b>
    </div>`).join("");
  return `
    <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:conic-gradient(${stops});position:relative;flex:none">
        <div style="position:absolute;inset:19%;background:var(--panel);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column">
          <div style="font-family:'Source Serif 4',serif;font-size:19px;font-weight:700;color:var(--navy)">${total}</div>
          <div style="font-size:9px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.03em">Toplam</div>
        </div>
      </div>
      <div style="flex:1;min-width:130px">${legend}</div>
    </div>`;
}

function barListHtml(data) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return data.map((d) => `
    <div class="bar-row">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
        <span style="color:var(--ink)">${d.label}</span>
        <b style="color:var(--navy)">${d.value}</b>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round((d.value / max) * 100)}%"></div></div>
    </div>`).join("");
}

let _jspdfLoadPromise = null;
function loadJsPDF() {
  if (window.jspdf) return Promise.resolve();
  if (_jspdfLoadPromise) return _jspdfLoadPromise;
  _jspdfLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js";
    s.onload = () => resolve();
    s.onerror = () => { _jspdfLoadPromise = null; reject(new Error("PDF kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edin.")); };
    document.head.appendChild(s);
  });
  return _jspdfLoadPromise;
}

async function downloadExecutivePdf(ctx) {
  const btn = document.getElementById("printSummary");
  if (btn) { btn.disabled = true; btn.textContent = "Hazırlanıyor…"; }
  try {
    await loadJsPDF();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const NAVY = [35, 48, 71], BRASS = [169, 119, 44], INK = [28, 37, 48], INKSOFT = [74, 86, 104], LINE = [226, 221, 210];
    const W = 210, M = 16;
    let y = 0;

    function header() {
      pdf.setFillColor(...NAVY); pdf.rect(0, 0, W, 26, "F");
      pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(15);
      pdf.text("Yetenek Havuzu Değerlendirme — Yönetici Özeti", M, 14);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(220, 224, 232);
      pdf.text(`İnciroğlu Otomotiv · İnsan Kaynakları · ${new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}`, M, 21);
      y = 34;
    }
    function sectionTitle(t) {
      if (y > 262) { pdf.addPage(); y = 20; }
      pdf.setFillColor(...BRASS); pdf.rect(M, y, W - 2 * M, 7, "F");
      pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10);
      pdf.text(t.toUpperCase(), M + 3, y + 5);
      y += 12;
    }
    function statTile(x, val, label, w) {
      pdf.setDrawColor(...LINE); pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(x, y, w, 18, 2, 2, "FD");
      pdf.setTextColor(...NAVY); pdf.setFont("helvetica", "bold"); pdf.setFontSize(15);
      pdf.text(String(val), x + 4, y + 9);
      pdf.setTextColor(...INKSOFT); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7);
      pdf.text(label, x + 4, y + 15, { maxWidth: w - 8 });
    }
    function tableRow(cols, widths, opts) {
      opts = opts || {};
      const rh = opts.h || 6.4;
      if (y + rh > 285) { pdf.addPage(); y = 20; }
      if (opts.shade) { pdf.setFillColor(246, 245, 241); pdf.rect(M, y, W - 2 * M, rh, "F"); }
      pdf.setTextColor(...INK); pdf.setFont("helvetica", opts.bold ? "bold" : "normal"); pdf.setFontSize(8.3);
      let x = M + 2;
      cols.forEach((c, i) => { pdf.text(String(c), x, y + rh - 2, { maxWidth: widths[i] - 3 }); x += widths[i]; });
      pdf.setDrawColor(...LINE); pdf.line(M, y + rh, W - M, y + rh);
      y += rh;
    }

    header();
    const tileW = (W - 2 * M - 3 * 4) / 4;
    const stats = [
      [ctx.total, "Toplam Personel"], [ctx.done, "Tamamlandı"], [ctx.draft, "Taslak"], [ctx.total - ctx.done - ctx.draft, "Bekliyor"],
      [ctx.havuzEvet, "Yetenek Havuzuna Alınmalı"], [ctx.liderlikVar, "Liderlik Potansiyeli"], [ctx.fonksiyonelEvet, "Fonksiyonel Geçişe Uygun"], [ctx.kritikRisk.length, "Kritik Risk"]
    ];
    let sx = M;
    stats.forEach((s, i) => {
      statTile(sx, s[0], s[1], tileW);
      sx += tileW + 4;
      if (i === 3) { sx = M; y += 22; }
    });
    y += 26;

    sectionTitle("Departman Dağılımı");
    const dW = [(W - 2 * M) * 0.7, (W - 2 * M) * 0.3];
    tableRow(["Departman", "Personel Sayısı"], dW, { bold: true });
    ctx.deptData.forEach((d, i) => tableRow([d.label, d.value], dW, { shade: i % 2 === 1 }));
    y += 6;

    sectionTitle("9-Grid (Performans × Liderlik Potansiyeli)");
    const bW = [(W - 2 * M) * 0.30, (W - 2 * M) * 0.24, (W - 2 * M) * 0.28, (W - 2 * M) * 0.18];
    tableRow(["Grup", "Liderlik Pot.", "Performans", "Kişi"], bW, { bold: true });
    ctx.box9.forEach((c, i) => tableRow([c.cell.baslik, POT_ETIKET[c.pot], PERF_ETIKET[c.perf], c.list.length], bW, { shade: i % 2 === 1 }));
    y += 6;

    sectionTitle("Kritik Risk — Havuzda ve Ayrılma Riski Yüksek");
    const kW = [(W - 2 * M) * 0.32, (W - 2 * M) * 0.28, (W - 2 * M) * 0.28, (W - 2 * M) * 0.12];
    tableRow(["Ad Soyad", "Departman", "Müdür", "Hazır Olma"], kW, { bold: true });
    if (ctx.kritikRisk.length) {
      ctx.kritikRisk.forEach((e) => tableRow([e.adSoyad, e.departman || "", e.muduluk || "Atanmadı", ctx.evaluationsMap[e.id]?.hazirOlmaSuresi || "—"], kW, { shade: true }));
    } else {
      tableRow(["Kritere uyan personel yok.", "", "", ""], kW, {});
    }

    pdf.save(`yetenek-havuzu-yonetici-ozeti-${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (e) {
    toast("PDF oluşturulamadı: " + e.message);
  }
  if (btn) { btn.disabled = false; btn.textContent = "Yönetici PDF Raporu İndir"; }
}

// ---------------------------------------------------------------
// ADMIN VIEW
// ---------------------------------------------------------------
const ADMIN_COLUMNS = [
  { key: "adSoyad", label: "Ad Soyad", get: (e, ev) => e.adSoyad },
  { key: "departman", label: "Departman", get: (e, ev) => e.departman || "" },
  { key: "bolum", label: "Bölüm", get: (e, ev) => e.bolum || "" },
  { key: "kidem", label: "Kıdem", get: (e, ev) => (e.kurumKidemiYil ?? -1) },
  { key: "status", label: "Durum", get: (e, ev) => ev?.status || "bekliyor" },
  { key: "ortalamaPotansiyel", label: "Ort. Potansiyel<br>(9 yetkinlik)", get: (e, ev) => (ev?.ortalamaPotansiyel ?? -1) },
  { key: "ortalamaOgrenmeCevikligi", label: "Öğr. Çevikliği<br>(5 yetkinlik)", get: (e, ev) => (ev?.ortalamaOgrenmeCevikligi ?? -1) },
  { key: "potansiyelDegerlendirme", label: "Değerlendirme", get: (e, ev) => ev?.potansiyelDegerlendirme || "" },
  { key: "yetenekHavuzuAlinmali", label: "Yetenek<br>Havuzu", get: (e, ev) => ev?.yetenekHavuzuAlinmali || "" },
  { key: "liderlikPotansiyeli", label: "Liderlik<br>Potansiyeli", get: (e, ev) => ev?.liderlikPotansiyeli || "" },
  { key: "sistemOneri", label: "Sistem<br>Önerisi", get: (e, ev) => (ev ? (sistemOnerisi(ev) || "") : "") },
  { key: "hazirOlmaSuresi", label: "Hazır Olma<br>Süresi", get: (e, ev) => ev?.hazirOlmaSuresi || "" },
  { key: "ayrilmaRiski", label: "Ayrılma<br>Riski", get: (e, ev) => ev?.ayrilmaRiski || "" },
  { key: "fonksiyonelGecisUygun", label: "Fonk. Geçişe<br>Uygun mu", get: (e, ev) => ev?.fonksiyonelGecisUygun || "" },
  { key: "fonksiyonelGecisDept", label: "Fonk. Geçiş<br>Dept/Rol", get: (e, ev) => ev?.fonksiyonelGecisDept || "" }
];

function renderAdmin() {
  const roster = adminRoster();
  const total = roster.length;
  const done = roster.filter((e) => evaluationsMap[e.id]?.status === "tamamlandi").length;
  const draft = roster.filter((e) => evaluationsMap[e.id]?.status === "taslak").length;
  const noManager = roster.filter((e) => !e.muduluk).length;
  const managers = Array.from(new Set(roster.map((e) => e.muduluk).filter(Boolean))).sort((a, b) => a.localeCompare(b, "tr"));
  const depts = Array.from(new Set(roster.map((e) => e.departman).filter(Boolean))).sort((a, b) => a.localeCompare(b, "tr"));
  const havuzEvet = Object.values(evaluationsMap).filter((e) => e.yetenekHavuzuAlinmali === "Evet").length;
  const liderlikVar = Object.values(evaluationsMap).filter((e) => e.liderlikPotansiyeli === "Var").length;
  const fonksiyonelEvet = Object.values(evaluationsMap).filter((e) => e.fonksiyonelGecisUygun === "Evet").length;

  // --- department distribution (top 8 + "Diğer") ---
  const deptCounts = {};
  roster.forEach((e) => { const k = e.departman || "Belirtilmemiş"; deptCounts[k] = (deptCounts[k] || 0) + 1; });
  const deptSorted = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
  const deptTop = deptSorted.slice(0, 8).map(([label, value]) => ({ label, value }));
  const deptRestTotal = deptSorted.slice(8).reduce((a, [, v]) => a + v, 0);
  const deptData = deptRestTotal ? [...deptTop, { label: "Diğer", value: deptRestTotal }] : deptTop;

  // --- completion status donut ---
  const completionSegs = [
    { label: "Tamamlandı", value: done, color: "var(--good)" },
    { label: "Taslak", value: draft, color: "var(--warn)" },
    { label: "Bekliyor", value: total - done - draft, color: "#9aa2ad" }
  ];

  // --- attrition risk donut (only employees with a recorded risk) ---
  const riskCounts = { "Düşük": 0, "Orta": 0, "Yüksek": 0 };
  Object.values(evaluationsMap).forEach((ev) => { if (riskCounts[ev.ayrilmaRiski] !== undefined) riskCounts[ev.ayrilmaRiski]++; });
  const riskSegs = [
    { label: "Düşük Risk", value: riskCounts["Düşük"], color: "var(--good)" },
    { label: "Orta Risk", value: riskCounts["Orta"], color: "var(--warn)" },
    { label: "Yüksek Risk", value: riskCounts["Yüksek"], color: "var(--bad)" }
  ];

  // --- 9-GRID: Liderlik Potansiyeli (satır, yüksek→düşük) × Performans (sütun, düşük→yüksek) ---
  const grid9 = {};
  Object.keys(GRID9).forEach((k) => (grid9[k] = []));
  let yerlesenSayi = 0;
  roster.forEach((e) => {
    const pos = gridPos(evaluationsMap[e.id]);
    if (pos) { grid9[`${pos.pot}-${pos.perf}`].push(e); yerlesenSayi++; }
  });
  const box9 = [];
  for (let pot = 2; pot >= 0; pot--) {
    for (let perf = 0; perf <= 2; perf++) {
      const key = pot + "-" + perf;
      box9.push({ pot, perf, key, list: grid9[key], cell: GRID9[key] });
    }
  }

  // --- critical retention risk: in talent pool AND high attrition risk ---
  const kritikRisk = roster
    .filter((e) => { const ev = evaluationsMap[e.id]; return ev?.yetenekHavuzuAlinmali === "Evet" && ev?.ayrilmaRiski === "Yüksek"; })
    .sort((a, b) => (evaluationsMap[b.id]?.ortalamaPotansiyel || 0) - (evaluationsMap[a.id]?.ortalamaPotansiyel || 0));

  const summaryCtx = { total, done, draft, havuzEvet, liderlikVar, fonksiyonelEvet, deptData, box9, kritikRisk, evaluationsMap };

  root().innerHTML = `
  ${topbar()}
  <div class="app-body">
    ${sidebarHtml([
      { key: "overview", icon: ICONS.grid, label: "Genel Bakış" },
      { key: "list", icon: ICONS.people, label: "Personel Listesi" },
      { key: "manage", icon: ICONS.gear, label: "Yönetim" }
    ], "overview")}
    <div class="main-content">
    <div class="wrap wide">
    <div class="page-head">
      <div>
        <h1>İK Değerlendirme Paneli</h1>
        <p>Tüm müdürlerden gelen yetenek havuzu değerlendirmelerini canlı olarak izleyin.</p>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost btn-sm" id="printSummary">Yönetici PDF Raporu İndir</button>
        <button class="btn btn-ghost btn-sm" id="exportCsv">CSV İndir</button>
      </div>
    </div>
    <div class="stat-row">
      <div class="stat-card"><div class="n">${total}</div><div class="l">Toplam Personel</div></div>
      <div class="stat-card"><div class="n">${done}</div><div class="l">Tamamlandı</div></div>
      <div class="stat-card"><div class="n">${draft}</div><div class="l">Taslak</div></div>
      <div class="stat-card"><div class="n">${total - done - draft}</div><div class="l">Bekliyor</div></div>
    </div>
    <div class="stat-row">
      <div class="stat-card" id="statHavuz" style="cursor:pointer"><div class="n">${havuzEvet}</div><div class="l">Yetenek Havuzuna Alınmalı (Evet)</div></div>
      <div class="stat-card" id="statLiderlik" style="cursor:pointer"><div class="n">${liderlikVar}</div><div class="l">Liderlik Potansiyeli (Var)</div></div>
      <div class="stat-card" id="statFonksiyonel" style="cursor:pointer"><div class="n">${fonksiyonelEvet}</div><div class="l">Fonksiyonel Geçişe Uygun (Evet)</div></div>
    </div>
    ${!isDuzenlenebilir() ? `<div class="error-box" style="display:block;background:var(--warn-bg);color:var(--warn)"><b>${viewDonem}</b> dönemi görüntüleniyor (salt okunur, geçmiş kayıtlar). Güncel dönem için sağ üstten <b>${aktifDonem} (Aktif)</b> seçin.</div>` : ""}
    ${(isDuzenlenebilir() && noManager) ? `<div class="error-box" style="display:block;background:var(--warn-bg);color:var(--warn)">${noManager} personelin müdürü eşleşmedi. "Yönetim" menüsünden atayabilirsiniz.</div>` : ""}

    <div id="tabOverview">
      <div class="chart-grid">
        <div class="chart-card">
          <h3>Departman Dağılımı</h3>
          ${barListHtml(deptData)}
        </div>
        <div class="chart-card">
          <h3>Değerlendirme Tamamlanma Durumu</h3>
          ${donutChart(completionSegs)}
        </div>
        <div class="chart-card">
          <h3>Ayrılma Riski Dağılımı</h3>
          ${donutChart(riskSegs)}
        </div>
      </div>

      <div class="box9-wrap">
        <h3 style="margin:0 0 4px">9-Grid · İnsanlar Üzerine Değerlendirme</h3>
        <p style="margin:0 0 14px;font-size:12px;color:var(--ink-soft)">Değerlendirmesi tamamlanan <b>${yerlesenSayi}</b> personel, <b>Performans</b> (T–AH bloğu · Düşük/Orta/Yüksek) ve <b>Liderlik Potansiyeli</b> (Potansiyel yetkinlikleri %60 + Öğrenme Çevikliği %40) puanlarına göre otomatik yerleştirilir. Her kutunun açıklaması, o gruba <i>neden</i> dahil olunduğunu anlatır — kılavuz niteliğindedir. Kutuya tıklayınca kişiler listelenir.</p>
        <div style="display:flex;gap:10px;align-items:stretch">
          <div style="writing-mode:vertical-rl;transform:rotate(180deg);text-align:center;font-weight:700;color:var(--navy);font-size:12.5px;letter-spacing:.04em;padding:4px 0">LİDERLİK POTANSİYELİ →</div>
          <div style="flex:1;overflow-x:auto">
            <div style="display:grid;grid-template-columns:74px 1fr 1fr 1fr;gap:8px;min-width:760px" id="grid9">
              ${[0, 3, 6].map((start) => {
                const potBand = box9[start].pot;
                return `<div style="display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--navy);font-size:12.5px;text-align:center">${POT_ETIKET[potBand]}</div>` +
                  box9.slice(start, start + 3).map((c, j) => `
                    <div class="g9cell" data-idx="${start + j}" style="cursor:pointer;background:${c.cell.renk};color:#fff;border-radius:8px;padding:10px 11px;min-height:132px;display:flex;flex-direction:column;gap:6px">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
                        <b style="font-size:12.5px;line-height:1.25">${c.cell.baslik}</b>
                        <span style="flex:none;background:rgba(255,255,255,.22);border-radius:20px;padding:1px 9px;font-weight:700;font-size:12.5px">${c.list.length}</span>
                      </div>
                      <ul style="margin:0;padding-left:15px;font-size:10.5px;line-height:1.35;opacity:.94">${c.cell.aciklama.map((a) => `<li style="margin-bottom:2px">${a}</li>`).join("")}</ul>
                      ${c.list.length ? `<div style="margin-top:auto;font-size:10.5px;font-weight:600;background:rgba(255,255,255,.16);border-radius:5px;padding:4px 6px">${c.list.slice(0, 5).map((e) => e.adSoyad).join(", ")}${c.list.length > 5 ? " +" + (c.list.length - 5) : ""}</div>` : ""}
                    </div>`).join("");
              }).join("")}
              <div></div>
              <div style="text-align:center;font-size:12px;font-weight:600;color:var(--ink-soft)">Düşük Performans</div>
              <div style="text-align:center;font-size:12px;font-weight:600;color:var(--ink-soft)">Normal Performans</div>
              <div style="text-align:center;font-size:12px;font-weight:600;color:var(--ink-soft)">Yüksek Performans</div>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-panel">
        <div class="section-title" style="margin-top:0">Kritik Risk — Havuzda ve Ayrılma Riski Yüksek Olan Personel</div>
        <div id="kritikRiskList">
          ${kritikRisk.length ? kritikRisk.map((e) => `
            <div class="risk-alert-card" data-id="${e.id}" style="cursor:pointer">
              <div style="display:flex;align-items:center;gap:12px;">
                ${avatarHtml(e.adSoyad, 34)}
                <div class="main">
                  <b>${e.adSoyad}</b>
                  <div class="meta">${e.mevcutUnvan || ""} · ${e.departman || ""} / ${e.bolum || ""} · Müdür: ${e.muduluk || "Atanmadı"}</div>
                </div>
              </div>
              <span class="status-badge" style="background:var(--bad-bg);color:var(--bad)">Ayrılma Riski Yüksek</span>
            </div>`).join("") : `<p style="font-size:13px;color:var(--ink-soft);margin:0">Şu anda yetenek havuzunda ve ayrılma riski yüksek olarak işaretlenmiş personel bulunmuyor.</p>`}
        </div>
      </div>
    </div>

    <div id="tabList" style="display:none">
      <div class="toolbar">
        <input type="text" id="searchBox" placeholder="İsimle ara…" style="min-width:200px">
        <select id="managerFilter"><option value="">Tüm Müdürler</option>${managers.map((m) => `<option value="${m}">${m}</option>`).join("")}</select>
        <select id="deptFilter"><option value="">Tüm Departmanlar</option>${depts.map((m) => `<option value="${m}">${m}</option>`).join("")}</select>
        <select id="statusFilter">
          <option value="">Tüm Durumlar</option>
          <option value="tamamlandi">Tamamlandı</option>
          <option value="taslak">Taslak</option>
          <option value="bekliyor">Bekliyor</option>
        </select>
        <select id="riskFilter">
          <option value="">Tüm Ayrılma Riskleri</option>
          <option value="Düşük">Düşük</option>
          <option value="Orta">Orta</option>
          <option value="Yüksek">Yüksek</option>
        </select>
        <select id="readyFilter">
          <option value="">Tüm Hazır Olma Süreleri</option>
          <option value="Hazır">Hazır</option>
          <option value="0-1 yıl">0-1 yıl</option>
          <option value="1-2 Yıl">1-2 Yıl</option>
        </select>
      </div>
      <div class="table-scroll no-x-scroll">
        <table class="admin-table">
          <colgroup>
            <col style="width:10%"><col style="width:6%"><col style="width:6%"><col style="width:7%"><col style="width:8%">
            <col style="width:7%"><col style="width:7%"><col style="width:8%"><col style="width:6%"><col style="width:7%">
            <col style="width:5%"><col style="width:7%"><col style="width:5%"><col style="width:6%"><col style="width:5%">
          </colgroup>
          <thead><tr>
            ${ADMIN_COLUMNS.map((c) => `<th data-key="${c.key}">${c.label} <span class="sort-ind" data-key="${c.key}"></span></th>`).join("")}
          </tr></thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
    </div>
    </div>
    </div>
  </div>`;
  wireTopbar();

  el("#printSummary").addEventListener("click", () => downloadExecutivePdf(summaryCtx));

  el("#statHavuz").addEventListener("click", () => openStatListDrawer(
    "Yetenek Havuzuna Alınmalı (Evet)",
    roster.filter((e) => evaluationsMap[e.id]?.yetenekHavuzuAlinmali === "Evet")
  ));
  el("#statLiderlik").addEventListener("click", () => openStatListDrawer(
    "Liderlik Potansiyeli (Var)",
    roster.filter((e) => evaluationsMap[e.id]?.liderlikPotansiyeli === "Var")
  ));
  el("#statFonksiyonel").addEventListener("click", () => openStatListDrawer(
    "Fonksiyonel Geçişe Uygun (Evet)",
    roster.filter((e) => evaluationsMap[e.id]?.fonksiyonelGecisUygun === "Evet")
  ));

  document.querySelectorAll("#grid9 .g9cell").forEach((cell) => {
    cell.addEventListener("click", () => {
      const c = box9[Number(cell.dataset.idx)];
      openStatListDrawer(`${c.cell.baslik} · ${POT_ETIKET[c.pot]} / ${PERF_ETIKET[c.perf]}`, c.list);
    });
  });

  document.querySelectorAll("#kritikRiskList .risk-alert-card").forEach((card) => {
    card.addEventListener("click", () => {
      const emp = findEmpById(card.dataset.id);
      if (emp) openAdminDetailDrawer(emp);
    });
  });

  document.querySelectorAll(".sidebar .nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      const key = item.dataset.nav;
      if (key === "manage") { openManagePanel(); return; }
      document.querySelectorAll(".sidebar .nav-item").forEach((n) => n.classList.toggle("active", n === item));
      el("#tabOverview").style.display = key === "overview" ? "" : "none";
      el("#tabList").style.display = key === "list" ? "" : "none";
    });
  });

  let sortState = { key: "adSoyad", dir: 1 };

  function draw() {
    const term = el("#searchBox").value.trim().toLocaleLowerCase("tr");
    const mgrF = el("#managerFilter").value;
    const deptF = el("#deptFilter").value;
    const stF = el("#statusFilter").value;
    const riskF = el("#riskFilter").value;
    const readyF = el("#readyFilter").value;
    const col = ADMIN_COLUMNS.find((c) => c.key === sortState.key);
    const list = roster
      .filter((e) => e.adSoyad.toLocaleLowerCase("tr").includes(term))
      .filter((e) => !mgrF || e.muduluk === mgrF)
      .filter((e) => !deptF || e.departman === deptF)
      .filter((e) => {
        const st = evaluationsMap[e.id]?.status || "bekliyor";
        return !stF || st === stF;
      })
      .filter((e) => !riskF || evaluationsMap[e.id]?.ayrilmaRiski === riskF)
      .filter((e) => !readyF || evaluationsMap[e.id]?.hazirOlmaSuresi === readyF)
      .sort((a, b) => {
        const va = col.get(a, evaluationsMap[a.id]);
        const vb = col.get(b, evaluationsMap[b.id]);
        const cmp = (typeof va === "number" && typeof vb === "number") ? va - vb : String(va).localeCompare(String(vb), "tr");
        return sortState.dir * cmp;
      });

    el("#tbody").innerHTML = list.map((e) => {
      const ev = evaluationsMap[e.id];
      const st = ev?.status || "bekliyor";
      const stLabel = st === "tamamlandi" ? "Tamamlandı" : st === "taslak" ? "Taslak" : "Bekliyor";
      return `<tr>
        <td><button type="button" class="link-btn person-link" data-id="${e.id}" style="font-weight:700;text-align:left;font-size:inherit;font-family:inherit;color:var(--navy)">${e.adSoyad}</button></td>
        <td>${e.departman || ""}</td>
        <td>${e.bolum || ""}</td>
        <td>${formatKidem(e.kurumKidemiYil)}</td>
        <td><span class="status-badge status-${st}">${stLabel}</span></td>
        <td>${ev?.ortalamaPotansiyel ?? "—"}</td>
        <td>${ev ? Math.round((ev.ortalamaOgrenmeCevikligi || 0) * 100) + "%" : "—"}</td>
        <td style="font-size:10px">${ev?.potansiyelDegerlendirme || "—"}</td>
        <td>${ev?.yetenekHavuzuAlinmali || "—"}</td>
        <td>${ev?.liderlikPotansiyeli || "—"}</td>
        <td>${ev ? (sistemOnerisi(ev) || "—") : "—"}</td>
        <td>${ev?.hazirOlmaSuresi || "—"}</td>
        <td>${ev?.ayrilmaRiski || "—"}</td>
        <td>${ev?.fonksiyonelGecisUygun || "—"}</td>
        <td>${ev?.fonksiyonelGecisDept || "—"}</td>
      </tr>`;
    }).join("") || `<tr><td colspan="15" class="empty-state">Kayıt bulunamadı.</td></tr>`;

    document.querySelectorAll(".person-link").forEach((btn) => {
      btn.addEventListener("click", () => {
        const emp = findEmpById(btn.dataset.id);
        if (emp) openAdminDetailDrawer(emp);
      });
    });

    document.querySelectorAll(".sort-ind").forEach((s) => {
      s.textContent = s.dataset.key === sortState.key ? (sortState.dir === 1 ? "▲" : "▼") : "";
    });
  }

  document.querySelectorAll("table.admin-table th[data-key]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      if (sortState.key === key) sortState.dir *= -1;
      else sortState = { key, dir: 1 };
      draw();
    });
  });

  ["searchBox", "managerFilter", "deptFilter", "statusFilter", "riskFilter", "readyFilter"].forEach((id) => {
    el("#" + id).addEventListener("input", draw);
    el("#" + id).addEventListener("change", draw);
  });
  draw();

  el("#exportCsv").addEventListener("click", exportCsv);
}

function exportCsv() {
  const headers = ["Ad Soyad", "Departman", "Bölüm", "Unvan", "Müdür", "Kıdem", "Durum", "9-Grid Grubu", "Liderlik Pot. (eksen)", "Performans (eksen)", "Ort. Potansiyel", "Öğr. Çeviklik %", "Performans Sınıfı", "Sistem Önerisi (Havuz)", "Sistem Gerekçesi", "Yönetici Görüşü (Havuz)", "Liderlik Potansiyeli", "Hazır Olma Süresi", "Ayrılma Riski", "Fonksiyonel Geçişe Uygun", "Fonksiyonel Geçiş Departman/Rol", "Yedekleyebileceği Pozisyon", "Gelişim Alanları", "Gerekçe (Yönetici)", ...PERFORMANS_FIELDS.map(([, l]) => l)];
  const rows = adminRoster().map((e) => {
    const ev = evaluationsMap[e.id] || {};
    const pos = gridPos(ev);
    return [
      e.adSoyad, e.departman, e.bolum, e.mevcutUnvan, e.muduluk || "", formatKidem(e.kurumKidemiYil),
      kidemDisi(e) ? "Kıdem<6ay (dışı)" : (ev.status || "bekliyor"),
      pos ? GRID9[pos.pot + "-" + pos.perf].baslik : "", pos ? POT_ETIKET[pos.pot] : "", pos ? PERF_ETIKET[pos.perf] : "",
      ev.ortalamaPotansiyel ?? "", ev.ortalamaOgrenmeCevikligi != null ? Math.round(ev.ortalamaOgrenmeCevikligi * 100) : "",
      ev.performansSinifi || (ev.status ? sinifLabel(performansSkoru(ev)) : ""), (ev.status ? (sistemOnerisi(ev) || "") : ""), (ev.status ? sistemGerekce(ev) : "").replace(/\n/g, " "),
      ev.yetenekHavuzuAlinmali || "", ev.liderlikPotansiyeli || "",
      ev.hazirOlmaSuresi || "", ev.ayrilmaRiski || "", ev.fonksiyonelGecisUygun || "", ev.fonksiyonelGecisDept || "",
      ev.yedekPozisyonlar || "", ev.gelisimAlanlari || "", (ev.gerekce || "").replace(/\n/g, " "),
      ...PERFORMANS_FIELDS.map(([k]) => ev.performans?.[k] || "")
    ];
  });
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `yetenek-havuzu-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------
// ADMIN: MANAGE PANEL (seed employees, create manager accounts, fix muduluk)
// ---------------------------------------------------------------
function openManagePanel() {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="drawer">
      <div class="drawer-head">
        <div><h2>Yönetim</h2><div class="meta">Personel listesi, müdür atamaları ve kullanıcı hesapları</div></div>
        <button class="close-x" id="closeMng">✕</button>
      </div>
      <div class="drawer-body">
        <div class="admin-panel" style="border:1.5px solid var(--brass);background:var(--warn-bg)">
          <div class="section-title" style="margin-top:0">★ ${DEF_AKTIF} Yıl Havuzunu Kur</div>
          <p style="font-size:13px;color:var(--ink)">Adım 1 — Havuzu kurar: güncel çalışan listesini (<b>${typeof ROSTER_2026 !== "undefined" ? ROSTER_2026.length : 0}</b> kişi) yükler, mevcut (eski) değerlendirmeleri <b>${DEF_AKTIF}</b> yıl havuzuna dahil eder ve müdür/direktör yetkilerini yazar. Eski ve yeni değerlendirmeler tek yerde, yıl bazlı görünür.</p>
          <button class="btn btn-brass btn-sm" id="donemKurBtn">Adım 1 — Dönemi Kur</button>
          <div id="donemKurMsg" style="font-size:12.5px;margin-top:8px;white-space:pre-line"></div>
          <p style="font-size:13px;color:var(--ink);margin-top:14px">Adım 2 — Giriş hesaplarını hazırlar (<b>${typeof HESAPLAR !== "undefined" ? HESAPLAR.length : 0}</b> müdür/direktör).</p>
          <button class="btn btn-ghost btn-sm" id="hesapAcBtn">Adım 2 — Giriş Hesaplarını Hazırla</button>
          <div id="hesapAcMsg" style="font-size:12.5px;margin-top:8px;white-space:pre-line"></div>
        </div>

        <div class="admin-panel">
          <div class="section-title" style="margin-top:0">1. Personel Listesi</div>
          <p style="font-size:13px;color:var(--ink-soft)">Firestore'da <b>${employeesCache.length}</b> personel kayıtlı (Excel'den yüklenen: ${EMPLOYEES.length}).</p>
          <button class="btn btn-ghost btn-sm" id="seedBtn">Excel Listesini Yeniden Yükle / Güncelle</button>
        </div>

        <div class="admin-panel">
          <div class="section-title" style="margin-top:0">1b. Excel'deki Mevcut Değerlendirmeleri İçe Aktar</div>
          <p style="font-size:13px;color:var(--ink-soft)">Yüklediğiniz Excel'de <b>${EVALUATIONS_SEED.length}</b> kişi için zaten doldurulmuş değerlendirme verisi bulundu. Bu veriyi Firestore'a aktarabilirsiniz — <b>henüz kaydı olmayan</b> kişilere yazılır, bir müdürün sistemde zaten girdiği veri asla üzerine yazılmaz.</p>
          <button class="btn btn-ghost btn-sm" id="importEvalBtn">Excel Değerlendirmelerini İçe Aktar</button>
          <div id="importEvalMsg" style="font-size:12.5px;margin-top:8px"></div>
        </div>

        <div class="admin-panel">
          <div class="section-title" style="margin-top:0">2. Müdürü Eşleşmeyen Personel</div>
          <div id="unassignedList"></div>
        </div>

        <div class="admin-panel">
          <div class="section-title" style="margin-top:0">3. Yeni Müdür Hesabı Oluştur</div>
          <div class="grid2">
            <div class="field"><label>Ad Soyad</label><input id="newAdSoyad" placeholder="Örn: Ali Yağcı"></div>
            <div class="field"><label>Müdürlük Etiketi</label><input id="newMuduluk" placeholder="Personel listesindeki 'Müdürlük' ile birebir aynı olmalı" list="mgrNames"></div>
            <datalist id="mgrNames">${MANAGER_NAMES.map((m) => `<option value="${m}">`).join("")}</datalist>
            <div class="field"><label>Kullanıcı Adı</label><input id="newUsername" placeholder="orn: ali.yagci"></div>
            <div class="field"><label>Geçici Şifre</label><input id="newPassword" placeholder="en az 6 karakter"></div>
          </div>
          <label style="font-size:12.5px;display:flex;gap:6px;align-items:center;margin:6px 0 10px"><input type="checkbox" id="newIsAdmin"> İK / Admin yetkisi ver</label>
          <button class="btn btn-brass btn-sm" id="createMgrBtn">Hesap Oluştur</button>
          <div id="createMgrMsg" style="font-size:12.5px;margin-top:8px"></div>
        </div>

        <div class="admin-panel">
          <div class="section-title" style="margin-top:0">4. Kayıtlı Hesaplar</div>
          <div id="mgrAccountsList" style="font-size:13px"></div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  el("#closeMng").onclick = () => overlay.remove();

  // ★ Adım 1 — Dönemi kur: eski değerlendirmeleri dondur + yeni roster + yetki tanımları + settings
  const donemKurBtn = el("#donemKurBtn");
  if (donemKurBtn) donemKurBtn.onclick = async () => {
    const msg = el("#donemKurMsg");
    if (typeof ROSTER_2026 === "undefined" || typeof HESAPLAR === "undefined") {
      msg.style.color = "var(--bad)"; msg.textContent = "donem-data.js yüklenemedi."; return;
    }
    if (!confirm(`${DEF_AKTIF} yıl havuzu kurulacak:\n• ${ROSTER_2026.length} kişilik güncel liste yüklenecek\n• Mevcut (eski) değerlendirmeler ${DEF_AKTIF} havuzuna dahil edilecek\n• Müdür/direktör yetkileri yazılacak\n\nDevam edilsin mi?`)) return;
    donemKurBtn.disabled = true; donemKurBtn.textContent = "Kuruluyor…"; msg.style.color = "var(--ink-soft)";
    try {
      const commitChunks = async (ops) => {
        for (let i = 0; i < ops.length; i += 400) {
          const b = writeBatch(db);
          ops.slice(i, i + 400).forEach((fn) => fn(b));
          await b.commit();
        }
      };
      // 1) Eski değerlendirmeleri dönemle etiketle (donem alanı olmayanlar → DEF_ESKI)
      msg.textContent = "1/4 Eski değerlendirmeler kilitleniyor…";
      const evSnap = await getDocs(collection(db, "evaluations"));
      const evOps = [];
      evSnap.forEach((d) => { if (!d.data().donem) evOps.push((b) => b.set(doc(db, "evaluations", d.id), { donem: DEF_ESKI }, { merge: true })); });
      await commitChunks(evOps);

      // 2) Yeni roster (tam liste). Önce yükle (mutlaka), sonra listede olmayan eskileri sil (opsiyonel).
      msg.textContent = "2/4 Yeni personel listesi yükleniyor…";
      const yeniIds = new Set(ROSTER_2026.map((e) => e.id));
      await commitChunks(ROSTER_2026.map((emp) => (b) => b.set(doc(db, "employees", emp.id), emp)));
      try {
        const empSnap = await getDocs(collection(db, "employees"));
        const delOps = [];
        empSnap.forEach((d) => { if (!yeniIds.has(d.id)) delOps.push((b) => b.delete(doc(db, "employees", d.id))); });
        if (delOps.length) await commitChunks(delOps);
      } catch (e) { console.warn("eski personel silinemedi (opsiyonel)", e); }

      // 3) Yetki tanımları — managers/{username} (izinli koleksiyon; uid ile çakışmaz)
      msg.textContent = "3/4 Yetki tanımları yazılıyor…";
      const pOps = HESAPLAR.map((h) => (b) => b.set(doc(db, "managers", h.username), {
        profil: true, adSoyad: h.adSoyad, username: h.username, role: "manager",
        muduluk: h.muduluk || null, direktorluk: h.direktorluk || null,
        roller: h.roller || [], isAdmin: false, updatedAt: serverTimestamp()
      }, { merge: true }));
      await commitChunks(pOps);

      // 4) Dönem ayarı — managers/_ayar_donem
      msg.textContent = "4/4 Dönem ayarı kaydediliyor…";
      await setDoc(doc(db, "managers", DONEM_AYAR_ID), { aktifDonem: DEF_AKTIF, donemler: DEF_DONEMLER, updatedAt: serverTimestamp() }, { merge: true });
      aktifDonem = DEF_AKTIF; donemList = DEF_DONEMLER; viewDonem = DEF_AKTIF;

      msg.style.color = "var(--good)";
      msg.textContent = `✓ ${DEF_AKTIF} havuzu kuruldu. ${ROSTER_2026.length} personel yüklendi, eski değerlendirmeler ${DEF_AKTIF} havuzuna dahil edildi.\nŞimdi Adım 2 ile giriş hesaplarını hazırlayın.`;
    } catch (e) {
      msg.style.color = "var(--bad)"; msg.textContent = "Hata: " + e.message;
    }
    donemKurBtn.disabled = false; donemKurBtn.textContent = "Adım 1 — Dönemi Kur";
  };

  // ★ Adım 2 — Giriş hesaplarını hazırla (her müdür/direktör için tek tek, izole app ile)
  const hesapAcBtn = el("#hesapAcBtn");
  if (hesapAcBtn) hesapAcBtn.onclick = async () => {
    const msg = el("#hesapAcMsg");
    if (typeof HESAPLAR === "undefined") { msg.style.color = "var(--bad)"; msg.textContent = "donem-data.js yüklenemedi."; return; }
    if (!confirm(`${HESAPLAR.length} müdür/direktör için giriş hesabı hazırlanacak (varsayılan şifre: ${VARSAYILAN_SIFRE}). Zaten var olanlar atlanır. Devam?`)) return;
    hesapAcBtn.disabled = true; hesapAcBtn.textContent = "Hazırlanıyor…";
    let acildi = 0, vardi = 0, hata = 0;
    const secondary = initializeApp(firebaseConfig, "acc-" + Date.now());
    const auth2 = getAuth(secondary);
    for (let i = 0; i < HESAPLAR.length; i++) {
      const h = HESAPLAR[i];
      msg.style.color = "var(--ink-soft)";
      msg.textContent = `${i + 1}/${HESAPLAR.length} · ${h.username} işleniyor… (yeni: ${acildi}, mevcut: ${vardi})`;
      try {
        await createUserWithEmailAndPassword(auth2, `${h.username}@${LOGIN_DOMAIN}`, VARSAYILAN_SIFRE);
        acildi++;
        try { await signOut(auth2); } catch (e) {}
      } catch (e) {
        if (e.code === "auth/email-already-in-use") vardi++;
        else hata++;
      }
    }
    msg.style.color = hata ? "var(--warn)" : "var(--good)";
    msg.textContent = `✓ Tamamlandı. Yeni açılan: ${acildi}, zaten mevcut: ${vardi}${hata ? ", hata: " + hata : ""}.\nHerkesin kullanıcı adı ad.soyad, şifresi ${VARSAYILAN_SIFRE}.`;
    hesapAcBtn.disabled = false; hesapAcBtn.textContent = "Adım 2 — Giriş Hesaplarını Hazırla";
  };

  el("#seedBtn").onclick = async () => {
    el("#seedBtn").disabled = true;
    el("#seedBtn").textContent = "Yükleniyor…";
    try {
      const batch = writeBatch(db);
      EMPLOYEES.forEach((emp) => {
        const existing = employeesCache.find((e) => e.id === emp.id);
        const muduluk = existing && existing.muduluk !== undefined ? existing.muduluk : (emp.muduluk || null);
        batch.set(doc(db, "employees", emp.id), { ...emp, muduluk }, { merge: true });
      });
      await batch.commit();
      toast("Personel listesi güncellendi.");
    } catch (e) {
      toast("Hata: " + e.message);
    }
    el("#seedBtn").disabled = false;
    el("#seedBtn").textContent = "Excel Listesini Yeniden Yükle / Güncelle";
  };

  el("#importEvalBtn").onclick = async () => {
    const btn = el("#importEvalBtn");
    const msg = el("#importEvalMsg");
    btn.disabled = true;
    btn.textContent = "İçe aktarılıyor…";
    let imported = 0, skipped = 0;
    try {
      const batch = writeBatch(db);
      EVALUATIONS_SEED.forEach((seed) => {
        if (evaluationsMap[seed.employeeId]) { skipped++; return; }
        const emp = employeesCache.find((e) => e.id === seed.employeeId) || EMPLOYEES.find((e) => e.id === seed.employeeId);
        if (!emp) { skipped++; return; }
        const d = {
          potansiyel: seed.potansiyel || {},
          ogrenmeCevikligi: seed.ogrenmeCevikligi || {},
          teknikHakimiyet: seed.teknikHakimiyet || {},
          liderlikPotansiyeli: seed.liderlikPotansiyeli || "",
          yetenekHavuzuAlinmali: seed.yetenekHavuzuAlinmali || "",
          hazirOlmaSuresi: seed.hazirOlmaSuresi || "",
          yedekPozisyonlar: seed.yedekPozisyonlar || "",
          ayrilmaRiski: seed.ayrilmaRiski || "",
          gelisimAlanlari: seed.gelisimAlanlari || "",
          fonksiyonelGecisUygun: seed.fonksiyonelGecisUygun || "",
          fonksiyonelGecisDept: seed.fonksiyonelGecisDept || "",
          egitimOnerileri: seed.egitimOnerileri || [],
          gerekce: seed.gerekce || ""
        };
        const der = computeDerived(d);
        const payload = {
          employeeId: emp.id,
          adSoyad: emp.adSoyad,
          departman: emp.departman || "",
          bolum: emp.bolum || "",
          unvan: emp.mevcutUnvan || "",
          muduluk: emp.muduluk || null,
          ...d,
          ...der,
          status: isComplete(d) ? "tamamlandi" : "taslak",
          submittedByUid: currentUid,
          submittedByName: "Excel'den İçe Aktarıldı",
          updatedAt: serverTimestamp()
        };
        batch.set(doc(db, "evaluations", emp.id), payload, { merge: true });
        imported++;
      });
      await batch.commit();
      msg.style.color = "var(--good)";
      msg.textContent = `${imported} kişi için değerlendirme aktarıldı, ${skipped} kişi zaten kayıtlı olduğu için atlandı.`;
    } catch (e) {
      msg.style.color = "var(--bad)";
      msg.textContent = "Hata: " + e.message;
    }
    btn.disabled = false;
    btn.textContent = "Excel Değerlendirmelerini İçe Aktar";
  };

  function drawUnassigned() {
    const un = employeesCache.filter((e) => !e.muduluk);
    el("#unassignedList").innerHTML = un.length
      ? un.map((e) => `
        <div class="emp-card" style="cursor:default">
          <div class="main"><b>${e.adSoyad}</b><div class="meta">${e.departman || ""} / ${e.bolum || ""}</div></div>
          <select data-id="${e.id}" class="assignSel">
            <option value="">Müdür seç…</option>
            ${MANAGER_NAMES.map((m) => `<option value="${m}">${m}</option>`).join("")}
          </select>
        </div>`).join("")
      : `<p style="font-size:13px;color:var(--ink-soft)">Tüm personelin müdürü tanımlı.</p>`;

    document.querySelectorAll(".assignSel").forEach((sel) => {
      sel.addEventListener("change", async () => {
        if (!sel.value) return;
        await setDoc(doc(db, "employees", sel.dataset.id), { muduluk: sel.value }, { merge: true });
        toast("Müdür ataması güncellendi.");
      });
    });
  }
  drawUnassigned();

  async function drawAccounts() {
    const qs = await getDocs(collection(db, "managers"));
    const rows = [];
    qs.forEach((d) => { if (d.id !== DONEM_AYAR_ID) rows.push({ id: d.id, ...d.data() }); });
    rows.sort((a, b) => (a.adSoyad || "").localeCompare(b.adSoyad || "", "tr"));
    el("#mgrAccountsList").innerHTML = rows.length
      ? `<table><thead><tr><th>Ad Soyad</th><th>Kullanıcı Adı</th><th>Rol</th><th>Müdürlük</th></tr></thead><tbody>
          ${rows.map((r) => `<tr><td>${r.adSoyad || ""}</td><td>${r.username || ""}</td><td>${r.role}</td><td>${r.muduluk || "—"}</td></tr>`).join("")}
        </tbody></table>`
      : `<p style="color:var(--ink-soft)">Henüz hesap yok.</p>`;
  }
  drawAccounts();

  el("#createMgrBtn").onclick = async () => {
    const adSoyad = el("#newAdSoyad").value.trim();
    const muduluk = el("#newMuduluk").value.trim();
    const username = el("#newUsername").value.trim().toLowerCase();
    const password = el("#newPassword").value;
    const isAdminAcc = el("#newIsAdmin").checked;
    const msg = el("#createMgrMsg");
    if (!adSoyad || !username || password.length < 6 || (!isAdminAcc && !muduluk)) {
      msg.style.color = "var(--bad)";
      msg.textContent = "Lütfen tüm alanları doldurun (şifre en az 6 karakter olmalı).";
      return;
    }
    msg.style.color = "var(--ink-soft)";
    msg.textContent = "Oluşturuluyor…";
    // Use a secondary, isolated Firebase app instance so creating this
    // user does not sign the admin out of their own session.
    const secondary = initializeApp(firebaseConfig, "secondary-" + Date.now());
    const auth2 = getAuth(secondary);
    try {
      const cred = await createUserWithEmailAndPassword(auth2, `${username}@${LOGIN_DOMAIN}`, password);
      await setDoc(doc(db, "managers", cred.user.uid), {
        adSoyad, username, muduluk: isAdminAcc ? null : muduluk,
        role: isAdminAcc ? "admin" : "manager", createdAt: serverTimestamp()
      });
      await signOut(auth2);
      msg.style.color = "var(--good)";
      msg.textContent = `Hesap oluşturuldu. Kullanıcı adı: ${username}`;
      ["newAdSoyad", "newMuduluk", "newUsername", "newPassword"].forEach((id) => (el("#" + id).value = ""));
      el("#newIsAdmin").checked = false;
      drawAccounts();
    } catch (e) {
      msg.style.color = "var(--bad)";
      msg.textContent = "Hata: " + e.message;
    }
  };
}
