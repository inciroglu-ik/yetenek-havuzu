// Giriş: İnciroğlu ortak kimlik modülü (tüm uygulamalarda tek hesap; TC Kimlik No + kişisel şifre).
// Yetki Firestore güvenlik kurallarıyla sunucuda denetlenir (IK-PLATFORM/guvenlik/firestore.rules).
import { db, kimlikBaslat, cikisYap, sifreDegistir } from "/IK-PLATFORM/ortak/kimlik.js";
import {
  doc, getDoc, setDoc, collection, onSnapshot, query,
  where, serverTimestamp, writeBatch, getDocs, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const el = (sel) => document.querySelector(sel);

// Not: Kişisel veri içeren eski içe aktarma dosyaları (data.js, import-data.js, donem-data.js) kaldırıldı;
// personel listesi Yönetim panelinden İK Sistemi'nin canlı verisiyle güncellenir.

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
// Çalışan listesindeki tüm distinct unvanlar (fonksiyonel geçiş seçenekleri)
function tumUnvanlar() {
  const set = new Set();
  employeesCache.forEach((e) => { if (e.mevcutUnvan) set.add(e.mevcutUnvan.trim()); });
  return [...set].sort((a, b) => a.localeCompare(b, "tr"));
}

// ---------------------------------------------------------------
// 9-GRID (Performans × Liderlik Potansiyeli) — İnsanlar Üzerine Değerlendirme
// pot: 0 Duran · 1 Gelişen · 2 Hızlanan   |   perf: 0 Düşük · 1 Normal · 2 Yüksek
// ---------------------------------------------------------------
const POT_ETIKET = ["Duran", "Gelişen", "Hızlanan"];
const PERF_ETIKET = ["Düşük Performans", "Normal Performans", "Yüksek Performans"];
const GRID9 = {
  "2-0": { baslik: "ROLÜ YENİ ÜSTLENEN", renk: "#1f7a8c", aciklama: ["Potansiyellerine bağlı olarak yeni işe alınmış veya terfi ettirilmişlerdir ve gelecekte mevcut pozisyonun ötesinde daha da gelişmeleri beklenmektedir.", "Mevcut pozisyonunda uç yakın kısa süredir bulunmaktadırlar.", "Bu pozisyonda sonuç/performans/potansiyel ortaya koymaları için daha fazla zamana ihtiyaçları vardır."] },
  "2-1": { baslik: "BÜYÜYEN ÇALIŞAN", renk: "#3d7a52", aciklama: ["Performans gereklerini tutarlı biçimde yerine getirir ve arada sırada beklentileri aşar.", "Mevcut pozisyonunun kapsamının ötesinde liderlik becerileri, tutum ve perspektif sergileyebilir.", "Giderek artan karmaşıklıkta rolleri üstlenecek kapasiteyi ve arzuyu ortaya koyar, bir sonraki pozisyonu taşıyabilecek potansiyeli mevcuttur."] },
  "2-2": { baslik: "YÜKSEK POTANSİYEL", renk: "#2e9e5b", aciklama: ["Tutarlı biçimde performans beklentilerini aşar.", "Mevcut pozisyonunun kapsamının ötesinde liderlik becerileri, tutum ve perspektif sergiler.", "Giderek artan karmaşıklıkta rolleri üstlenecek kapasiteyi ve arzuyu ortaya koyar, bir sonraki pozisyonun ötesinde uzun vadeli esnekliğe sahiptir."] },
  "1-0": { baslik: "GELİŞİM", renk: "#d4a017", aciklama: ["Mevcut pozisyonunda performans ve liderlik beklentilerinin hepsini değilse de bazılarını yerine getirmektedir.", "Daha geniş kapsamlı veya karmaşıklıktaki bir pozisyonda da performans gösterebileceğinin işaretleri vardır.", "Destek için koçluk/gelişim desteği gereklidir.", "Mevcut pozisyonunda gelişmiş performans."] },
  "1-1": { baslik: "TEMEL ÇALIŞAN", renk: "#2d6cb5", aciklama: ["Performans gereklerini tutarlı biçimde yerine getirir ve arada sırada beklentileri aşar.", "Zaman içinde daha zorlu veya daha karmaşık bir pozisyonda performans gösterecek kapasiteye sahip olabilir.", "Lider ve rol modeli olarak kabul edilir."] },
  "1-2": { baslik: "YÜKSEK ETKİLİ PERFORMANS GÖSTEREN", renk: "#3d7a52", aciklama: ["Tutarlı biçimde performans beklentilerini aşar.", "Daha geniş kapsamlı veya karmaşık bir pozisyonda da performans gösterebilir.", "Lider ve rol modeli, ayrıca da mevcut pozisyonunun ötesinde büyümeye ve gelişmeye aday olarak kabul edilir."] },
  "0-0": { baslik: "DÜŞÜK PERFORMANS GÖSTEREN", renk: "#c0392b", aciklama: ["Performans gereklerini yerine getirememektedir.", "Zayıf bir potansiyel sergiler ve mevcut pozisyonunda gelişim istekliliği düşüktür."] },
  "0-1": { baslik: "SAĞLAM PERFORMANS GÖSTEREN", renk: "#2d6cb5", aciklama: ["Performans gereklerini tutarlı biçimde yerine getirir ve arada sırada beklentileri aşar.", "Mevcut pozisyonunda kalmayı ve gelişmeyi arzular.", "Potansiyeline ulaşmıştır, VEYA yeni bir pozisyona geçmeye istekli değildir."] },
  "0-2": { baslik: "KİLİT PERFORMANS GÖSTEREN", renk: "#2b5797", aciklama: ["Tutarlı biçimde performans beklentilerini aşar.", "Mevcut pozisyonunda kalmayı ve gelişmeyi arzular.", "Potansiyeline ulaşmıştır, VEYA yeni bir pozisyona geçmeye istekli değildir.", "Lider ve rol modeli olarak kabul edilir."] }
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
// Görseldeki koordinat: dikey (üstten: Hızlanan=1, Gelişen=2, Duran=3) - yatay (soldan: Düşük=1, Normal=2, Yüksek=3)
function gridKoord(pos) { return (3 - pos.pot) + "-" + (pos.perf + 1); }

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
// Kurumsal palet — yalnız lacivert/pirinç/arduvaz/kahve tonları (mor/turkuaz yok,
// semantik kırmızı-yeşil yok ki avatar bir "uyarı/durum" gibi okunmasın).
const AVATAR_COLORS = ["#233047", "#a9772c", "#4a5568", "#8a5a2b", "#3a4a63", "#6b5738", "#5b6675", "#7a5a30"];
function avatarHtml(name, size) {
  size = size || 34;
  const n = (name || "?").trim();
  const initials = n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toLocaleUpperCase("tr") || "?";
  let hash = 0;
  for (let i = 0; i < n.length; i++) hash = (hash * 31 + n.charCodeAt(i)) >>> 0;
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return `<span class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px;background:${color}">${escH(initials)}</span>`;
}

const ICONS = {
  grid: `<svg width="16" height="16" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor"/><rect x="13" y="3" width="8" height="8" rx="1.5" fill="currentColor" opacity=".55"/><rect x="3" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity=".55"/><rect x="13" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity=".85"/></svg>`,
  people: `<svg width="16" height="16" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4" fill="currentColor"/><path d="M2.5 20c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5" fill="currentColor" opacity=".85"/><circle cx="17.5" cy="8.5" r="2.6" fill="currentColor" opacity=".55"/><path d="M14.8 13.9c1-.6 2.1-.9 3-.9 2.8 0 5 2 5.2 5" fill="currentColor" opacity=".55"/></svg>`,
  gear: `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z" fill="currentColor"/><path d="M19.4 13.6l1.7-1-2-3.4-1.9.7a6.9 6.9 0 0 0-1.5-.9l-.3-2h-4l-.3 2a6.9 6.9 0 0 0-1.5.9l-1.9-.7-2 3.4 1.7 1a7 7 0 0 0 0 1.7l-1.7 1 2 3.4 1.9-.7c.4.4 1 .7 1.5.9l.3 2h4l.3-2c.5-.2 1.1-.5 1.5-.9l1.9.7 2-3.4-1.7-1a7 7 0 0 0 0-1.7Z" fill="currentColor" opacity=".55"/></svg>`,
  progress: `<svg width="16" height="16" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="4" rx="2" fill="currentColor" opacity=".32"/><rect x="3" y="5" width="12" height="4" rx="2" fill="currentColor"/><rect x="3" y="15" width="18" height="4" rx="2" fill="currentColor" opacity=".32"/><rect x="3" y="15" width="7" height="4" rx="2" fill="currentColor" opacity=".7"/></svg>`,
  matris: `<svg width="16" height="16" viewBox="0 0 24 24"><rect x="3" y="3" width="5" height="5" rx="1" fill="currentColor" opacity=".45"/><rect x="9.5" y="3" width="5" height="5" rx="1" fill="currentColor" opacity=".7"/><rect x="16" y="3" width="5" height="5" rx="1" fill="currentColor"/><rect x="3" y="9.5" width="5" height="5" rx="1" fill="currentColor" opacity=".3"/><rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" opacity=".55"/><rect x="16" y="9.5" width="5" height="5" rx="1" fill="currentColor" opacity=".7"/><rect x="3" y="16" width="5" height="5" rx="1" fill="currentColor" opacity=".2"/><rect x="9.5" y="16" width="5" height="5" rx="1" fill="currentColor" opacity=".3"/><rect x="16" y="16" width="5" height="5" rx="1" fill="currentColor" opacity=".45"/></svg>`,
  gecis: `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M4 7h11l-3-3M20 17H9l3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18.5" cy="7" r="2.2" fill="currentColor" opacity=".55"/><circle cx="5.5" cy="17" r="2.2" fill="currentColor" opacity=".55"/></svg>`,
  doc: `<svg width="16" height="16" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2.5" fill="currentColor" opacity=".32"/><rect x="7.5" y="7" width="9" height="2" rx="1" fill="currentColor"/><rect x="7.5" y="11" width="9" height="2" rx="1" fill="currentColor"/><rect x="7.5" y="15" width="6" height="2" rx="1" fill="currentColor"/></svg>`
};

// ---------------------------------------------------------------
// "Açıklamalar" sekmesi — değerlendirme skalası tanımları (İK skala sunumundan; SCORE_LABELS ile aynı 1–5)
// ---------------------------------------------------------------
const SKALA_RENK = { 1: "var(--bad)", 2: "var(--warn)", 3: "var(--navy)", 4: "var(--good)", 5: "#1f6b43" };
const SKALA_OZET = [
  { v: 5, ad: "Rol Model", maddeler: ["Çok iyi gelişmiş bir uzmanlık.", "Etkisi çok yüksek bir sonuç yaratır.", "Şirketteki birçok kişiye bu konuda rol model olur."] },
  { v: 4, ad: "Fark Yaratan", maddeler: ["Etkileyici bir bilgi ve/veya uzmanlık.", "Kriterleri aşan bir yaklaşım.", "Şirketteki birçok kişiden bu alanda iyi."] },
  { v: 3, ad: "Yetkin", maddeler: ["Performans olarak kriterleri karşılar.", "İşi yürütecek bir performans gösterir.", "Şirketteki seviyeye denk bir performans."] },
  { v: 2, ad: "Gelişim İhtiyacı", maddeler: ["Gelişim göstermesi gereken bir performans.", "Etkinleşmesi gereken bir yaklaşım sergiler.", "Şirkette bu alanda birçok kişi ondan daha iyi."] },
  { v: 1, ad: "Zayıf", maddeler: ["Talep edilenin tam tersi davranışlar gösterir.", "Neredeyse bu alanda gelişemeyecek kadar aşağıda."] }
];
const SKALA_DETAY = [
  { v: 1, ad: "Zayıf", maddeler: [
    "Değerlendirilen yetkinliğin gereksinimlerini karşılayamaz.",
    "Yetkinliğin tersine davranış gösterir.",
    "Gelişime kapalıdır.",
    "Geri bildirime açık değildir.",
    "Spesifik örnekler karşısında savunmacıdır.",
    "Hatalarından ders çıkarmaz, sorumluluk almaz, başkalarını suçlar ve bahaneler üretir."] },
  { v: 2, ad: "Gelişim İhtiyacı", maddeler: [
    "Değerlendirilen yetkinlik ile ilişkili davranış göstergelerinde yetersizdir.",
    "Nadiren de olsa tersine davranışlar sergiler.",
    "Geri bildirim alsa dahi aksiyon almakta yeterli değildir.",
    "Süreçleri sürekli destek ve talimatla yürütür, sürekli olarak teyit ihtiyacı duyar, sıklıkla hata yapar.",
    "İnisiyatif almak konusunda yeterli bilgi ve beceriye sahip değildir.",
    "Emsal çalışanlara göre daha yavaştır, iş kalitesi düşüktür, kontrol ihtiyacı duyar."] },
  { v: 3, ad: "Yetkin", maddeler: [
    "Kendisine verilen görevleri eksiksiz şekilde yerine getirir.",
    "İlgili yetkinlikte yer alan davranış göstergelerini karşılar.",
    "Geri bildirime açıktır. Gerekli aksiyonları hızlıca alır.",
    "Çalışanlarına ihtiyaçları doğrultusunda liderlik yapar.",
    "İşini yapmak için gerekli bilgi ve beceriye sahiptir.",
    "Gerektiği durumlarda inisiyatif alır, kendi süreçlerini hatırlatmaya gerek kalmaksızın sonuçlandırır."] },
  { v: 4, ad: "Fark Yaratan", maddeler: [
    "Kendisine verilen görevleri eksiksiz şekilde yerine getirmekle birlikte kendisine talimat verilmeden süreçleri iyileştirip geliştirir.",
    "Gerekli yetkinlikler ve davranış göstergeleri ile ilgili çalışanlarını her zaman ileri taşır.",
    "Geri bildirime açıktır. Gerekli aksiyonları hızlıca alır. Aksiyonların alınmasını sağlar ve takipçisi olur.",
    "Çalışanlarına ihtiyaçları doğrultusunda liderlik yapar. Liderlik yapmalarını sağlar.",
    "İşini yapmak için gerekli bilgi ve beceriye sahiptir. Bilgi ve becerisini aktarır.",
    "Gerektiği durumlarda inisiyatif alır, ekibinin hatırlatmaya gerek kalmadan işleri sonuçlandırmasını güvence altına alır."] },
  { v: 5, ad: "Rol Model", maddeler: [
    "Kendisine verilen görevleri eksiksiz şekilde yerine getirmekle birlikte kendisine talimat verilmeden süreçleri iyileştirip geliştirir. Organizasyonun bütününe yaygınlaştırılması için gerekli aksiyonları alır.",
    "Gerekli yetkinlikler ve davranış göstergeleri ile ilgili çalışanlarını her zaman ileri taşır. Her durumda aidiyeti güçlendirir.",
    "Geri bildirime açıktır. Gerekli aksiyonları hızlıca alır. Aksiyonların alınmasını sağlar ve takipçisi olur. Aldığı aksiyonları yaygınlaştırır.",
    "Çalışanlarına ihtiyaçları doğrultusunda liderlik yapar. Liderlik yapmalarını sağlar. Kendilerini geliştirmeleri için yüksek hedefler belirler.",
    "İşini yapmak için gerekli bilgi ve beceriye sahiptir. Bilgi ve becerisini aktarır. Başkalarının da aktarması için olanaklar yaratır.",
    "Her durumda inisiyatif alarak, inisiyatif alabilen liderler yetiştirilmesini sağlar."] }
];
function aciklamaTabHtml() {
  const rozet = (v) => `<span class="sk-rozet" style="background:${SKALA_RENK[v]}">${v}</span>`;
  const ozet = SKALA_OZET.map((s) => `<div class="sk-satir">
      <div class="sk-ad">${rozet(s.v)}<span>${s.ad}</span></div>
      <ul class="sk-madde">${s.maddeler.map((m) => `<li>${m}</li>`).join("")}</ul>
    </div>`).join("");
  const detay = SKALA_DETAY.map((s) => `<div class="sk-seviye">
      <div class="sk-seviye-bas">${rozet(s.v)}<span>Değerlendirme Skalası — ${s.ad}</span></div>
      <div class="sk-barlar">${s.maddeler.map((m) => `<div class="sk-bar">${m}</div>`).join("")}</div>
    </div>`).join("");
  return `<div id="tabAciklama" style="display:none">
    <div class="sk-wrap">
      <section class="sk-kart">
        <div class="sk-ust">Puanlama</div>
        <h2>Değerlendirme Skalası (1–5)</h2>
        <p class="sk-not">Potansiyel yetkinlikleri 1–5 arasında puanlanır. Her puanın anlamı aşağıdadır.</p>
        ${ozet}
      </section>
      <section class="sk-kart">
        <div class="sk-ust">Davranış Göstergeleri</div>
        <h2>Seviyelere Göre Skala Açıklamaları</h2>
        <p class="sk-not">Her seviyede çalışandan beklenen davranışlar.</p>
        ${detay}
      </section>
    </div>
  </div>`;
}

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
let evaluationsMap = {};   // employeeId -> GÜNCEL (taze) değerlendirme
let arsivMap = {};         // employeeId -> ARŞİV (eski/içe aktarılan) değerlendirme — sadece admin
let tazeMap = {};          // employeeId -> yalnız müdürlerin girdiği taze değerlendirme (arşiv hariç) — admin Genel Bakış sayıları
// Kişinin GÜNCEL değerlendirme kayıtlarını sil (ör. deneme kayıtları). Kişi personel listesinde kalır ve
// "Bekliyor" görünür — müdürü hiç başlamamış gibi. İlk değerlendirme arşivi korunur.
async function degerlendirmeKayitlariniSil(emp) {
  const k = nameKey(emp.adSoyad || "");
  const evIds = Object.values(allEvalsMap).filter((ev) => !evalArsivMi(ev) && (nameKey(ev.adSoyad || "") === k || (emp.id && ev.employeeId === emp.id))).map((ev) => ev.id);
  if (!evIds.length) { toast("Bu kişinin silinecek güncel değerlendirme kaydı yok."); return false; }
  const metin = `${emp.adSoyad} için ${evIds.length} güncel değerlendirme kaydı KALICI olarak silinecek.\n\n` +
    `Kişi personel listesinde kalır ve "Bekliyor" görünür (müdürü hiç başlamamış gibi). İlk değerlendirme arşivi korunur.\n\n` +
    `Silinen kayıtlar geri alınamaz. Devam edilsin mi?`;
  if (!confirm(metin)) return false;
  const batch = writeBatch(db);
  evIds.forEach((id) => batch.delete(doc(db, "evaluations", id)));
  try { await batch.commit(); }
  catch (e) { alert("Silinemedi: " + (e.code === "permission-denied" ? "bu işlem için yetkiniz yok." : e.message)); return false; }
  toast(`${emp.adSoyad}: ${evIds.length} değerlendirme kaydı silindi; durumu artık "Bekliyor".`);
  return true;
}
// ONARIM (10.11.2026): kısa süre canlıda kalan eski "havuzdan çıkar" sürümü personel kaydını da silip adı
// managers/_ayar_donem.haricTutulanlar'a yazıyordu. Yönetim panelindeki onarım bu kişileri İK Sistemi kaydından
// NORMAL çalışan olarak geri yükler ve listeyi boşaltır.
let haricListe = [];
async function personelGeriYukle(adlar) {
  const roster = await rosterHazirla();
  const istenen = new Set(adlar.map((a) => nameKey(a)));
  const bulunan = roster.filter((e) => istenen.has(nameKey(e.adSoyad)));
  if (!bulunan.length) throw new Error("Bu kişiler İK Sistemi'nin aktif personel listesinde bulunamadı.");
  const bulunanK = new Set(bulunan.map((e) => nameKey(e.adSoyad)));
  const kalan = haricListe.filter((ad) => !bulunanK.has(nameKey(ad)));
  const batch = writeBatch(db);
  bulunan.forEach((e) => batch.set(doc(db, "employees", e.id), e));
  batch.set(doc(db, "managers", DONEM_AYAR_ID), { haricTutulanlar: kalan, updatedAt: serverTimestamp() }, { merge: true });
  await batch.commit();
  haricListe = kalan;
  return bulunan.map((e) => e.adSoyad);
}
// Admin ekran durumu: sekme + liste filtreleri veri yenilense (onSnapshot → render) de korunur
function admBosFiltre() { return { q: "", mgr: "", dept: "", durum: "", risk: "", ready: "", havuz: "", oneri: "", lider: "", grid: "", gecis: "" }; }
const ADM = { tab: "overview", f: admBosFiltre(), gelismis: false, sort: { key: "adSoyad", dir: 1 }, kaynak: "guncel",
  gecis: { kapsam: "tamam", tur: "", secili: null, q: "" } };

// ---------------------------------------------------------------
// FONKSİYONEL GEÇİŞ UNVANLARI: hedef unvan → o unvana işaretlenen kişiler
// Kaynaklar: "Geçiş Yapabileceği Pozisyon(lar)" (fonksiyonelGecisPozisyonlar / fonksiyonelGecisDept)
//            + "Yedekleyebileceği Pozisyonlar" (yedekPozisyonlar, serbest metin; virgül/; ile ayrılır)
// Kapsam: tamam = taze tamamlanan · taslak = taze tamamlanan + taslak · arsiv = ilk değerlendirme arşivi
// ---------------------------------------------------------------
const GECIS_BOS = /^(-+|—|yok|yoktur|bulunmamaktadır|bulunmamaktadir|n\/?a|hayır|hayir|\.)$/i;
function gecisUnvanBol(s) { return String(s || "").split(/[,;\n]/).map((x) => x.replace(/\s+/g, " ").trim()).filter((x) => x && !GECIS_BOS.test(x)); }
function gecisGrupla(roster, kapsam, tur) {
  const G = new Map();
  roster.forEach((e) => {
    let ev = null;
    if (kapsam === "arsiv") ev = arsivMap[e.id] || null;
    else { const t = tazeMap[e.id]; if (t && (t.status === "tamamlandi" || (kapsam === "taslak" && t.status === "taslak"))) ev = t; }
    if (!ev) return;
    const fg = Array.isArray(ev.fonksiyonelGecisPozisyonlar) && ev.fonksiyonelGecisPozisyonlar.length ? ev.fonksiyonelGecisPozisyonlar : gecisUnvanBol(ev.fonksiyonelGecisDept);
    const ekle = (u, kaynak) => {
      const ad = String(u || "").replace(/\s+/g, " ").trim(); if (!ad || GECIS_BOS.test(ad)) return;
      const k = ad.toLocaleUpperCase("tr");
      if (!G.has(k)) G.set(k, { ad: k, kisiler: new Map() });
      const g = G.get(k); const p = g.kisiler.get(e.id) || { e, ev, kaynak: new Set() };
      p.kaynak.add(kaynak); g.kisiler.set(e.id, p);
    };
    if (tur !== "yedek") fg.forEach((u) => ekle(u, "gecis"));
    if (tur !== "gecis") gecisUnvanBol(ev.yedekPozisyonlar).forEach((u) => ekle(u, "yedek"));
  });
  return [...G.values()].map((g) => ({ ad: g.ad, kisiler: [...g.kisiler.values()].sort((a, b) => a.e.adSoyad.localeCompare(b.e.adSoyad, "tr")) }))
    .sort((a, b) => b.kisiler.length - a.kisiler.length || a.ad.localeCompare(b.ad, "tr"));
}
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
// Bir değerlendirme ARŞİV mi? (eski model, içe aktarılan veya arsiv işaretli)
// Arşiv kayıtları müdürlere gösterilmez; sadece admin karnesinde "İlk Değerlendirme" olarak görünür.
function evalArsivMi(ev) {
  return !!(ev && (ev.arsiv === true || ev.submittedByName === "Excel'den İçe Aktarıldı" || eskiDegerlendirmeVar(ev)));
}

// GÜNCEL (taze) değerlendirmeler — müdürlerin bu dönemde girdiği; arşiv HARİÇ.
// arsivMap: kişi bazında en güncel arşiv kaydı (yalnızca admin karnesinde gösterilir).
function rebuildEvalMap() {
  evaluationsMap = {};
  arsivMap = {};
  const nameToId = {};
  employeesCache.forEach((e) => { if (e.adSoyad) nameToId[nameKey(e.adSoyad)] = e.id; });
  tazeMap = {};
  Object.values(allEvalsMap).forEach((ev) => {
    const nk = nameKey(ev.adSoyad || "");
    const key = nameToId[nk] || ev.employeeId || ev.id;
    if (evalArsivMi(ev)) {
      const c = arsivMap[key];
      if (!c || evalDahaYeni(ev, c)) arsivMap[key] = ev;
      return;
    }
    // Güncel sayılar yalnız görüntülenen dönemin kaydından (başka dönemin kaydı "güncel" sayılmaz)
    if (ev.donem && viewDonem && ev.donem !== viewDonem) return;
    const cur = tazeMap[key];
    if (!cur || evalDahaYeni(ev, cur)) tazeMap[key] = ev;
  });
  // HERKES (müdür + admin): evaluationsMap = YALNIZ taze kayıtlar. Arşiv ("İlk Değerlendirme", Excel matrisi)
  // güncel veriye HİÇBİR yerde karışmaz; admin arşivi ayrıca görür: Personel listesinde "Kaynak: İlk değerlendirme
  // (arşiv)" seçimi, kişi kartı ve karnede "İlk Değerlendirme (Arşiv)" bölümü (arsivMap).
  // (09.11: admin'de arşiv tazesi olmayan kişide güncel gibi görünüyordu → listede risk 4, tabloda 3 çelişkisi.)
  Object.assign(evaluationsMap, tazeMap);
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
// Giriş + profil (ortak kimlik modülü)
// Yönetici paneli: İK rolü. Değerlendirici kapsamı (müdürlük / direktörlük) personel listesinden, kişinin
// ADINDAN otomatik çıkarılır (listede "Müdürlük"/"Direktör" sütununda kendi adı geçen kişi). Listede yoksa
// İK'nın elle tanımladığı eski kapsam profili (managers/{kullanıcı}) kullanılır — o profildeki "admin"
// işaretine GÜVENİLMEZ; yöneticilik yalnız İK rolünden gelir.
// ---------------------------------------------------------------
const YONETIM_ROLLERI = ["ik", "direktor", "satis_mudur", "servis_mudur", "idari_mudur", "mudur"];
let OTURUM = null;
function kullaniciAdlari(ad) {
  const p = trFold(ad).toLowerCase().split(/\s+/).filter(Boolean);
  const out = [];
  if (p.length) out.push(p.join("."));
  if (p.length > 2) out.push(p[0] + "." + p[p.length - 1]);
  return out;
}
async function profilCoz(hesap) {
  const isAdmin = (hesap.roller || []).indexOf("ik") >= 0;
  const k = nameKey(hesap.ad);
  const mudKaydi = employeesCache.find((e) => e.muduluk && e.muduluk !== "-" && nameKey(e.muduluk) === k);
  const dirKaydi = employeesCache.find((e) => e.direktor && e.direktor !== "-" && nameKey(e.direktor) === k);
  let muduluk = mudKaydi ? mudKaydi.muduluk : null;
  let direktorluk = dirKaydi ? dirKaydi.direktor : null;
  if (!isAdmin && !muduluk && !direktorluk) {
    for (const u of kullaniciAdlari(hesap.ad)) {
      try {
        const s = await getDoc(doc(db, "managers", u));
        if (s.exists() && s.data().profil === true) { muduluk = s.data().muduluk || null; direktorluk = s.data().direktorluk || null; break; }
      } catch (e) { console.warn("kapsam profili okunamadı", e); }
    }
  }
  if (!isAdmin && !muduluk && !direktorluk) return null;
  const roller = isAdmin ? ["admin"] : [].concat(muduluk ? ["manager"] : [], direktorluk ? ["direktor"] : []);
  return { isAdmin, adSoyad: hesap.ad || "", muduluk, direktorluk, roller, username: kullaniciAdlari(hesap.ad)[0] || "" };
}
function escH(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function bilgiEkrani(baslik, metin, cikisli) {
  root().innerHTML = `
  <div class="center-screen">
    <div class="login-card">
      <div class="login-brand"><div class="mark">İH</div><div><div class="name">Yetenek Havuzu Değerlendirme</div><div class="sub">İnciroğlu Otomotiv · İnsan Kaynakları</div></div></div>
      <h1 style="font-size:20px">${escH(baslik)}</h1>
      <p class="hint">${escH(metin)}</p>
      ${cikisli ? '<button class="btn btn-ghost" id="bilgiCikis" type="button">Çıkış</button>' : ""}
    </div>
  </div>`;
  const b = el("#bilgiCikis"); if (b) b.onclick = () => cikisYap("cikis");
}

async function baslat() {
  OTURUM = await kimlikBaslat({ uygulama: "Yetenek Havuzu", roller: YONETIM_ROLLERI });
  currentUid = OTURUM.user.uid;
  bilgiEkrani("Yükleniyor…", "Değerlendirme verileri hazırlanıyor.", false);
  // Dönem ayarları — "managers" koleksiyonundaki ayar dokümanı
  try {
    const cfg = await getDoc(doc(db, "managers", DONEM_AYAR_ID));
    if (cfg.exists()) {
      const c = cfg.data();
      if (c.aktifDonem) aktifDonem = c.aktifDonem;
      if (Array.isArray(c.donemler) && c.donemler.length) donemList = c.donemler;
      if (Array.isArray(c.haricTutulanlar)) haricListe = c.haricTutulanlar.slice();
    }
  } catch (e) { console.warn("dönem ayarı okunamadı", e); }
  viewDonem = aktifDonem;
  subscribeEmployees();
}

function subscribeEmployees() {
  if (unsubEmp) unsubEmp();
  unsubEmp = onSnapshot(collection(db, "employees"), async (qs) => {
    employeesCache = [];
    qs.forEach((d) => employeesCache.push({ id: d.id, ...d.data() }));
    if (!currentProfile) {
      const p = await profilCoz(OTURUM.hesap);
      if (!p) {
        bilgiEkrani("Değerlendirme yetkiniz tanımlı değil", "Personel listesinde müdür ya da direktör olarak görünmüyorsunuz. Değerlendirme yapmanız gerekiyorsa İnsan Kaynakları ile görüşün.", true);
        return;
      }
      currentProfile = p;
    }
    subscribeEvaluations();
  }, (err) => { console.error(err); bilgiEkrani("Veri okunamadı", "Personel listesine erişilemedi (" + (err.code || err.message) + ").", true); });
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
    ${donemList.map((d) => `<option value="${escH(d)}" ${d === viewDonem ? "selected" : ""}>${escH(d)}${d === aktifDonem ? " (Aktif)" : ""}</option>`).join("")}
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
      <span><b>${escH(currentProfile.adSoyad)}</b></span>
      <button class="btn btn-ghost btn-sm" id="pwBtn">Şifre Değiştir</button>
      <button class="btn btn-ghost btn-sm" id="logoutBtn">Çıkış</button>
    </div>
  </div>`;
}

function wireTopbar() {
  el("#logoutBtn").addEventListener("click", () => cikisYap("cikis"));
  el("#pwBtn").addEventListener("click", () => sifreDegistir());
  const ds = el("#donemSel");
  if (ds) ds.addEventListener("change", () => setViewDonem(ds.value));
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
    ? `<div class="error-box" style="display:block;background:var(--warn-bg);color:var(--warn)"><b>${escH(viewDonem)}</b> dönemini görüntülüyorsunuz — bu dönem <b>salt okunur</b>dur, değişiklik yapılamaz. Düzenleme için sağ üstten <b>${escH(aktifDonem)} (Aktif)</b> dönemini seçin.</div>`
    : "";

  const baslik = direktorMu && aktif
    ? "Değerlendirmelerim"
    : "Ekibimin Değerlendirmesi";
  const altYazi = aktif
    ? `${escH(aktifDonem)} dönemi için ${total} kişilik değerlendirme.`
    : `${escH(viewDonem)} döneminde kaydedilen değerlendirmeler (salt okunur).`;

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
    const st = ["tamamlandi", "taslak"].includes(ev?.status) ? ev.status : "bekliyor";
    const stLabel = st === "tamamlandi" ? "Tamamlandı" : st === "taslak" ? "Taslak" : (saltOkunur ? "Kayıt yok" : "Bekliyor");
    if (disi) {
      return `
      <div class="emp-card" id="card-${escH(e.id)}" style="opacity:.72;cursor:not-allowed">
        <div style="display:flex;align-items:center;gap:12px;">
          ${avatarHtml(e.adSoyad, 36)}
          <div class="main">
            <b>${escH(e.adSoyad)}</b>
            <div class="meta">${escH(e.mevcutUnvan || "")} · ${escH(e.departman || "")} / ${escH(e.bolum || "")}</div>
          </div>
        </div>
        <span class="status-badge" style="background:#eef0f4;color:#6b7280">Kıdem &lt; 6 Ay · Değerlendirme Dışı</span>
      </div>`;
    }
    return `
    <div class="emp-card" id="card-${escH(e.id)}" style="cursor:pointer">
      <div style="display:flex;align-items:center;gap:12px;">
        ${avatarHtml(e.adSoyad, 36)}
        <div class="main">
          <b>${escH(e.adSoyad)}</b>
          <div class="meta">${escH(e.mevcutUnvan || "")} · ${escH(e.departman || "")} / ${escH(e.bolum || "")}${e.muduluk ? " · Müdür: " + escH(e.muduluk) : ""}</div>
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
    fonksiyonelGecisPozisyonlar: existing.fonksiyonelGecisPozisyonlar || (existing.fonksiyonelGecisDept ? existing.fonksiyonelGecisDept.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : []),
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
            <h2>${escH(emp.adSoyad)}</h2>
            <div class="meta">${escH(emp.mevcutUnvan || "")} · ${escH(emp.departman || "")} / ${escH(emp.bolum || "")}</div>
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
      <div class="row"><span>Performans Sınıfı</span><b>${der.performansSinifi}</b></div>
      ${pos ? `<div class="row"><span>9-Grid Konumu</span><b>${GRID9[pos.pot + "-" + pos.perf].baslik}</b></div>` : ""}
      ${oneri ? `<div class="verdict ${oneri === "Evet" ? "ok" : "dev"}">Sistem Önerisi — Yetenek Havuzuna: ${oneri.toLocaleUpperCase("tr")}</div>` : ""}
    </div>`;
  }

  function sistemKutuHtml() {
    const der = computeDerived(d);
    const ev = { ...d, ...der, adSoyad: emp.adSoyad };
    const pos = gridPos(ev);
    const gk = pos ? sistemGerekce(ev) : "";
    if (!gk) return `<div class="field"><div style="background:#f3f4f7;border:1px dashed var(--line);border-radius:8px;padding:12px 14px;font-size:12.5px;color:var(--ink-soft)">Metrikleri (Potansiyel, Performans, Öğrenme Çevikliği) doldurdukça sistem burada otomatik bir <b>öneri ve gerekçe</b> oluşturacaktır.</div></div>`;
    const cell = GRID9[pos.pot + "-" + pos.perf];
    return `<div class="field">
      <label style="color:var(--brass)">Sistem Önerisi ve Gerekçesi (otomatik oluşturulur)</label>
      <div style="font-size:16px;font-weight:800;color:var(--navy);margin-bottom:8px">9-Grid: ${gridKoord(pos)} — ${cell.baslik}</div>
      <div style="background:#eef1f6;border:1px solid #c9d2e0;border-radius:8px;padding:11px 14px;margin-bottom:8px">
        <div style="font-size:11.5px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.03em;margin-bottom:5px">Bu grubun tanımı (matris)</div>
        <ul style="margin:0;padding-left:18px;font-size:12.5px;line-height:1.5;color:var(--ink)">${cell.aciklama.map((a) => `<li style="margin-bottom:3px">${a}</li>`).join("")}</ul>
      </div>
      <div style="background:#faf8f3;border:1px solid var(--brass);border-radius:8px;padding:11px 14px">
        <div style="font-size:11.5px;font-weight:700;color:var(--brass);text-transform:uppercase;letter-spacing:.03em;margin-bottom:5px">Sistemin bu kişiye özel önerisi ve tespiti</div>
        <div style="font-size:13px;line-height:1.55;color:var(--ink)">${escH(gk)}</div>
      </div>
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
      <input type="text" id="yedekPozisyonlar" value="${escH(d.yedekPozisyonlar || "")}" placeholder="Örn: Servis Şefi">
    </div>
    <div class="field">
      <label>Gelişim Alanları</label>
      <textarea id="gelisimAlanlari" rows="2" placeholder="Geliştirilmesi gereken alanlar…">${escH(d.gelisimAlanlari || "")}</textarea>
    </div>
    <div class="field">
      <label>Fonksiyonel Geçişe Uygun mu?</label>
      <select id="fonksiyonelGecisUygun">
        <option value="">Seçiniz</option>
        ${["Evet", "Hayır"].map((o) => `<option value="${o}" ${d.fonksiyonelGecisUygun === o ? "selected" : ""}>${o}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label>Geçiş Yapabileceği Pozisyon(lar) — çalışan listesindeki unvanlardan, birden fazla seçilebilir</label>
      <input type="text" id="pozAra" placeholder="Unvan ara…" style="margin-bottom:6px">
      <div class="checklist" id="pozList" style="max-height:190px;overflow:auto;border:1px solid var(--line);border-radius:8px;padding:8px">
        ${tumUnvanlar().map((u) => `<label style="display:flex;gap:7px;align-items:center;padding:2px 0" data-unvan="${escH(u.toLocaleLowerCase("tr"))}"><input type="checkbox" value="${escH(u)}" ${d.fonksiyonelGecisPozisyonlar.includes(u) ? "checked" : ""}> ${escH(u)}</label>`).join("")}
      </div>
      <div style="font-size:12px;color:var(--ink-soft);margin-top:4px">Seçili: <b id="pozSecili">${escH(d.fonksiyonelGecisPozisyonlar.length ? d.fonksiyonelGecisPozisyonlar.join(", ") : "—")}</b></div>
    </div>
    ${sistemKutuHtml()}
    <div class="field">
      <label>Müdür Görüşü / Gerekçe (Vaka · Çıktı · Reaksiyon — opsiyonel)</label>
      <div style="font-size:12px;color:var(--ink-soft);margin-bottom:5px">Yukarıdaki öneriyi sistem otomatik yazar. Buraya <b>kendi görüşünüzü</b> ekleyin: hangi olayda bu yetkinliği sergiledi? Hangi iş sonucuna katkı sağladı?</div>
      <textarea id="gerekce" rows="4" placeholder="Kendi değerlendirmenizi ve somut örneği buraya yazın…">${escH(d.gerekce || "")}</textarea>
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
    ["hazirOlmaSuresi", "ayrilmaRiski", "yedekPozisyonlar", "gelisimAlanlari", "fonksiyonelGecisUygun", "gerekce"].forEach((id) => {
      const node = document.getElementById(id);
      if (node) node.addEventListener("input", () => { d[id] = node.value; validateAndHighlight(); scheduleAutosave(); });
    });
    const pozList = document.getElementById("pozList");
    if (pozList) {
      pozList.addEventListener("change", () => {
        d.fonksiyonelGecisPozisyonlar = Array.from(pozList.querySelectorAll("input:checked")).map((c) => c.value);
        d.fonksiyonelGecisDept = d.fonksiyonelGecisPozisyonlar.join(", ");
        const sec = document.getElementById("pozSecili");
        if (sec) sec.textContent = d.fonksiyonelGecisPozisyonlar.length ? d.fonksiyonelGecisPozisyonlar.join(", ") : "—";
        scheduleAutosave();
      });
    }
    const pozAra = document.getElementById("pozAra");
    if (pozAra) {
      pozAra.addEventListener("input", () => {
        const t = pozAra.value.trim().toLocaleLowerCase("tr");
        pozList.querySelectorAll("label[data-unvan]").forEach((lb) => { lb.style.display = (!t || lb.dataset.unvan.includes(t)) ? "flex" : "none"; });
      });
    }
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
  // İlk Değerlendirme sadece admin'e ve yalnızca AYRI bir taze kayıt varken gösterilir
  // (arşiv-only kişilerde ana bölümler zaten arşivi gösterdiği için tekrar etmez).
  const eskiEv = (currentProfile.isAdmin && arsivMap[emp.id] && arsivMap[emp.id] !== ev) ? arsivMap[emp.id] : null;

  const overlay = document.createElement("div");
  overlay.className = "overlay";

  function rowHtml(label, value) {
    return `<div class="comp-row" style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
      <div class="q" style="margin:0">${label}</div>
      <div style="font-weight:700;color:var(--navy);text-align:right">${escH(value ?? "—")}</div>
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
      <div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:.02em;margin-bottom:2px">9-Grid: ${gridKoord(pos)} — ${GRID9[pos.pot + "-" + pos.perf].baslik}</div>
      <div style="font-size:11.5px;color:#aeb7c6;margin-bottom:6px">Dikey (Liderlik Potansiyeli): ${POT_ETIKET[pos.pot]} · Yatay (Performans): ${PERF_ETIKET[pos.perf]}</div>
      <ul style="margin:0 0 10px;padding-left:18px;font-size:12px;line-height:1.45;color:#cfd6e2">${GRID9[pos.pot + "-" + pos.perf].aciklama.map((a) => `<li style="margin-bottom:2px">${a}</li>`).join("")}</ul>
      <div class="row"><span>Sistem Önerisi — Yetenek Havuzuna</span><b style="color:${oneri === "Evet" ? "var(--good)" : "var(--bad)"}">${(oneri || "—").toLocaleUpperCase("tr")}</b></div>
      <div class="row"><span>Yönetici Görüşü (AY)</span><b>${escH(ev.yetenekHavuzuAlinmali || "—")}</b></div>
      <div style="font-size:12.5px;color:#dfe3ea;line-height:1.5;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.15)"><b style="color:#fff">Sistem Gerekçesi:</b> ${escH(gerekceSis)}</div>
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
      <div class="row"><span>Ortalama Potansiyel</span><b>${escH(ev.ortalamaPotansiyel ?? "—")} / 5</b></div>
      <div class="row"><span>Performans Sınıfı</span><b>${escH(ev.performansSinifi || sinifLabel(performansSkoru(ev)))}</b></div>
    </div>

    <div class="section-title">Planlama (Bağımsız Değerlendirmeler)</div>
    ${rowHtml("Hazır Olma Süresi", ev.hazirOlmaSuresi)}
    ${rowHtml("Ayrılma Riski", ev.ayrilmaRiski)}
    ${rowHtml("Yedekleyebileceği Pozisyonlar", ev.yedekPozisyonlar)}
    ${rowHtml("Fonksiyonel Geçişe Uygun mu?", ev.fonksiyonelGecisUygun)}
    ${rowHtml("Uygun Departman / Rol", ev.fonksiyonelGecisDept)}
    <div class="comp-row">
      <div class="q">Gelişim Alanları</div>
      <div style="font-size:13px;color:var(--ink)">${escH(ev.gelisimAlanlari || "—")}</div>
    </div>
    <div class="comp-row">
      <div class="q">Gerekçe (Yönetici)</div>
      <div style="font-size:13px;color:var(--ink);white-space:pre-wrap">${escH(ev.gerekce || "—")}</div>
    </div>
    <div class="comp-row">
      <div class="q">Bilgiyi Giren</div>
      <div style="font-size:13px;color:var(--ink-soft)">${escH(ev.submittedByName || "—")} · ${ev.updatedAt?.toDate ? ev.updatedAt.toDate().toLocaleDateString("tr-TR") : "—"}</div>
    </div>
    ${eskiBlokHtml()}`;
  }

  function eskiBlokHtml() {
    if (!eskiEv) return "";
    const e = eskiEv;
    const yeniModel = !!e.performans;
    const tarih = e.updatedAt?.toDate ? "(" + e.updatedAt.toDate().toLocaleDateString("tr-TR") + ")" : "";
    const bas = `<div class="section-title" style="margin-top:26px;background:#eef0f4;color:var(--navy);padding:7px 10px;border-radius:6px">İlk Değerlendirme (Arşiv) — yalnızca İK görür</div>
      <p style="font-size:12px;color:var(--ink-soft);margin:6px 0 4px">Bu kişinin önceki/ilk değerlendirmesidir; olduğu gibi saklanır, düzenlenmez. Müdürler bu veriyi görmez. ${tarih}</p>`;
    if (yeniModel) {
      const pos = gridPos(e);
      return bas +
        (pos ? rowHtml("İlk Değ. · 9-Grid", `${gridKoord(pos)} — ${GRID9[pos.pot + "-" + pos.perf].baslik}`) : "") +
        (pos ? rowHtml("İlk Değ. · Sistem Önerisi", (sistemOnerisi(e) || "—").toLocaleUpperCase("tr")) : "") +
        `<div class="section-title">İlk Değ. · Potansiyel Yetkinlikleri</div>` +
        POTANSIYEL_FIELDS.map(([k, l]) => rowHtml(l, scoreLabelText(e.potansiyel?.[k]))).join("") +
        `<div class="section-title">İlk Değ. · Performans</div>` +
        PERFORMANS_FIELDS.map(([k, l]) => rowHtml(l, e.performans?.[k])).join("") +
        `<div class="section-title">İlk Değ. · Öğrenme Çevikliği</div>` +
        CEVIKLIK_FIELDS.map(([k, l]) => rowHtml(l, e.ogrenmeCevikligi?.[k] === true ? "Var" : e.ogrenmeCevikligi?.[k] === false ? "Yok" : "—")).join("") +
        `<div class="section-title">İlk Değ. · Planlama</div>` +
        rowHtml("Hazır Olma Süresi", e.hazirOlmaSuresi) + rowHtml("Ayrılma Riski", e.ayrilmaRiski) +
        rowHtml("Yedekleyebileceği Pozisyonlar", e.yedekPozisyonlar) + rowHtml("Fonksiyonel Geçişe Uygun mu?", e.fonksiyonelGecisUygun) +
        rowHtml("Uygun Departman / Rol", e.fonksiyonelGecisDept) + rowHtml("Liderlik Potansiyeli", e.liderlikPotansiyeli) +
        rowHtml("Yetenek Havuzuna Alınmalı (Yönetici)", e.yetenekHavuzuAlinmali);
    }
    return bas +
      (ESKI_POTANSIYEL_FIELDS.some(([k]) => e.potansiyel?.[k] != null) ? `<div class="section-title">İlk Değ. · Potansiyel Yetkinlikleri</div>` + ESKI_POTANSIYEL_FIELDS.map(([k, l]) => e.potansiyel?.[k] != null ? rowHtml(l, scoreLabelText(e.potansiyel[k])) : "").join("") : "") +
      (e.teknikHakimiyet ? `<div class="section-title">İlk Değ. · Teknik Hakimiyet</div>` + ESKI_TEKNIK_FIELDS.map(([k, l]) => rowHtml(l, scoreLabelText(e.teknikHakimiyet?.[k]))).join("") : "") +
      (e.ekKriterler ? `<div class="section-title">İlk Değ. · Ek Kriterler</div>` + ESKI_EK_KRITERLER.map(([k, l]) => e.ekKriterler?.[k] ? rowHtml(l, e.ekKriterler[k]) : "").join("") : "") +
      ((e.egitimOnerileri && e.egitimOnerileri.length) ? `<div class="comp-row"><div class="q">İlk Değ. · Önerilen Eğitimler</div><div style="font-size:13px;color:var(--ink)">${e.egitimOnerileri.map((t) => `<span class="tag">${escH(t)}</span>`).join(" ")}</div></div>` : "") +
      (e.gerekce ? `<div class="comp-row"><div class="q">İlk Değ. · Gerekçe</div><div style="font-size:13px;color:var(--ink);white-space:pre-wrap">${escH(e.gerekce)}</div></div>` : "");
  }

  overlay.innerHTML = `
    <div class="drawer">
      <div class="drawer-head">
        <div style="display:flex;align-items:center;gap:12px;">
          ${avatarHtml(emp.adSoyad, 38)}
          <div>
            <h2>${escH(emp.adSoyad)}</h2>
            <div class="meta">${escH(emp.mevcutUnvan || "")} · ${escH(emp.departman || "")} / ${escH(emp.bolum || "")} · Müdür: ${escH(emp.muduluk || "Atanmadı")} · Kıdem: ${formatKidem(emp.kurumKidemiYil)}</div>
          </div>
        </div>
        <button class="close-x" id="closeAdminDrawer">✕</button>
      </div>
      <div class="drawer-body">${bodyHtml()}</div>
      <div class="drawer-foot">
        ${currentProfile.isAdmin && isDuzenlenebilir() ? `<button class="btn btn-brass" id="editFromDetail">Değerlendirmeyi Düzenle</button>` : ""}
        <button class="btn btn-ghost" id="printKarneA4">A4 Karne Yazdır</button>
        <button class="btn btn-ghost" id="downloadPersonExcel">Excel Raporu İndir</button>
        ${currentProfile.isAdmin && isDuzenlenebilir() && tazeMap[emp.id] ? `<button class="btn btn-danger" id="yhCikarBtn" style="margin-right:auto;order:-1" title="Güncel değerlendirme kayıtlarını siler; kişi listede kalır ve Bekliyor görünür">Değerlendirme Kayıtlarını Sil</button>` : ""}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  el("#closeAdminDrawer").onclick = () => overlay.remove();
  const _cikarBtn = el("#yhCikarBtn");
  if (_cikarBtn) _cikarBtn.onclick = async () => { _cikarBtn.disabled = true; const ok = await degerlendirmeKayitlariniSil(emp); if (ok) overlay.remove(); else _cikarBtn.disabled = false; };
  el("#downloadPersonExcel").onclick = () => exportSinglePersonExcel(emp, ev);
  el("#printKarneA4").onclick = () => karneYazdir([emp]);
  const _editBtn = el("#editFromDetail");
  if (_editBtn) _editBtn.onclick = () => { overlay.remove(); openEvalDrawer(emp); };
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
      dataRow("9-Grid Konumu", pos ? `${gridKoord(pos)} — ${GRID9[pos.pot + "-" + pos.perf].baslik} (${POT_ETIKET[pos.pot]} / ${PERF_ETIKET[pos.perf]})` : "—", { shade: (shade = !shade) });
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
            <div class="emp-card" data-id="${escH(e.id)}" style="cursor:pointer">
              <div style="display:flex;align-items:center;gap:12px;">
                ${avatarHtml(e.adSoyad, 36)}
                <div class="main">
                  <b>${escH(e.adSoyad)}</b>
                  <div class="meta">${escH(e.mevcutUnvan || "")} · ${escH(e.departman || "")} / ${escH(e.bolum || "")} · Müdür: ${escH(e.muduluk || "Atanmadı")}</div>
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
        <span style="color:var(--ink)">${escH(d.label)}</span>
        <b style="color:var(--navy)">${d.value}</b>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round((d.value / max) * 100)}%"></div></div>
    </div>`).join("");
}

// ---------------------------------------------------------------
// TAMAMLAMA ORANLARI (müdür + direktör)
// ---------------------------------------------------------------
// Oran rengi: tam (yeşil) · kısmi (kehribar) · düşük (kırmızı)
function tcRenk(r) {
  if (r == null) return "#9aa2ad";
  if (r >= 0.999) return "var(--good)";   // tamam
  if (r >= 0.8) return "var(--navy)";     // yolunda
  if (r >= 0.5) return "var(--warn)";     // kısmi
  return "var(--bad)";                    // düşük
}
// Yüzde şeridi (etiket + done/total + dolu çubuk)
function pbarHtml(label, sub, rate) {
  if (rate == null) {
    return `<div class="pbar">
      <div class="lab"><span>${label}</span><b style="color:var(--ink-soft);font-weight:500">${sub ? sub + " · " : ""}veri yok</b></div>
      <div class="bar-track bar-empty"></div>
    </div>`;
  }
  const pct = Math.round(rate * 100);
  return `<div class="pbar">
    <div class="lab"><span>${label}</span><b>${sub ? sub + " · " : ""}${pct}%</b></div>
    <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${tcRenk(rate)}${pct === 0 ? ";min-width:3px" : ""}"></div></div>
  </div>`;
}
// Aç/kapa oku (font-bağımsız SVG; .tc-row.open ile 90° döner)
const TC_CHEV = `<svg class="tc-chev" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// İsimle güvenli sıralama (adSoyad boş olabilir)
function tcAdSirala(a, b) { return (a.adSoyad || "").localeCompare(b.adSoyad || "", "tr"); }
// Şerit çubuğu HTML'i (null→soluk, %0→ince işaret)
function tcBar(rate) {
  if (rate == null) return `<div class="bar-track bar-empty" style="margin-top:7px"></div>`;
  const pct = Math.round(rate * 100);
  return `<div class="bar-track" style="margin-top:7px"><div class="bar-fill" style="width:${pct}%;background:${tcRenk(rate)}${pct === 0 ? ";min-width:3px" : ""}"></div></div>`;
}
// Bir kişinin değerlendirme durum rozeti
function tcRozet(id, tamamMetin) {
  const st = evaluationsMap[id]?.status;
  if (st === "tamamlandi") return `<span class="status-badge status-tamamlandi">${tamamMetin || "Tamamlandı"}</span>`;
  if (st === "taslak") return `<span class="status-badge status-taslak">Taslak</span>`;
  return `<span class="status-badge status-bekliyor">Bekliyor</span>`;
}
// Müdür + direktör tamamlama verisini employeesCache + evaluationsMap'ten üretir.
function buildCompletionData() {
  const emps = employeesCache;
  const isDone = (e) => tazeMap[e.id]?.status === "tamamlandi";
  const empByName = {};
  emps.forEach((e) => { if (e.adSoyad) empByName[nameKey(e.adSoyad)] = e; });
  // İşten ayrılan: tamamlanmış güncel değerlendirmesi olup bugünkü personel listesinde olmayan kişi.
  // Değerlendirmeyi KİM GİRDİYSE (submittedByName) ona yazılır — "Kim doldurdu" ile aynı mantık.
  const rosterIds = new Set(emps.map((e) => e.id));
  const ayrTamam = Object.entries(tazeMap).filter(([k, ev]) => !rosterIds.has(k) && ev.status === "tamamlandi").map(([, ev]) => ev);
  const ayrSay = (ad) => ayrTamam.filter((ev) => nameKey(ev.submittedByName || "") === nameKey(ad)).length;

  // --- MÜDÜRLER: müdürlük sütunundaki her benzersiz isim bir müdürdür ---
  const mgrNames = Array.from(new Set(emps.map((e) => e.muduluk).filter((m) => m && m !== "-")))
    .sort((a, b) => a.localeCompare(b, "tr"));
  const mgrs = mgrNames.map((mgr) => {
    const rec = empByName[nameKey(mgr)] || null;
    const team = emps.filter((e) => e.muduluk === mgr && e.adSoyad !== mgr && !kidemDisi(e));
    const doneCount = team.filter(isDone).length;
    return {
      name: mgr,
      dept: (rec && rec.departman) || (team[0] && team[0].departman) || "",
      direktor: (rec && rec.direktor) || (team[0] && team[0].direktor) || "",
      team, total: team.length, doneCount, ayrDone: ayrSay(mgr),
      rate: team.length ? doneCount / team.length : null
    };
  });
  const mgrByName = {};
  mgrs.forEach((m) => { mgrByName[nameKey(m.name)] = m; });

  // --- DİREKTÖRLER: direktör sütunundaki her benzersiz isim bir direktördür ---
  const dirNames = Array.from(new Set(emps.map((e) => e.direktor).filter((d) => d && d !== "-")))
    .sort((a, b) => a.localeCompare(b, "tr"));
  const dirs = dirNames.map((dir) => {
    const rec = empByName[nameKey(dir)] || null;
    // Bu direktöre bağlı müdürler (müdürlük sütununda kendi adı olan personel)
    const mudurEmps = emps.filter((e) => e.direktor === dir && e.muduluk === e.adSoyad && !kidemDisi(e));
    // A ETKENİ: direktörün müdürlerini kendisi değerlendirmesi
    const aDone = mudurEmps.filter(isDone).length;
    const rateA = mudurEmps.length ? aDone / mudurEmps.length : null;
    // B ETKENİ: bağlı müdürlerin ekip-tamamlama oranlarının ortalaması (ekibi olmayan müdür hariç)
    const bMgrs = mudurEmps.map((me) => mgrByName[nameKey(me.adSoyad)]).filter(Boolean);
    const bWithTeam = bMgrs.filter((m) => m.total > 0);
    const rateB = bWithTeam.length ? bWithTeam.reduce((s, m) => s + m.rate, 0) / bWithTeam.length : null;
    return {
      name: dir, dept: (rec && rec.departman) || "",
      mudurEmps, aDone, aTotal: mudurEmps.length, rateA,
      bMgrs, rateB, bWithTeamCount: bWithTeam.length, ayrDone: ayrSay(dir)
    };
  });
  return { mgrs, dirs, ayrToplam: ayrTamam.length };
}
// Bir müdür satırı (şerit + tıklanınca ekip kırılımı)
function tcMgrRow(m) {
  const pct = m.rate == null ? "—" : Math.round(m.rate * 100) + "%";
  const col = tcRenk(m.rate);
  const detail = m.total === 0
    ? `<div style="color:var(--ink-soft);font-size:12.5px">Değerlendirilecek ekip üyesi yok.</div>`
    : m.team.slice().sort(tcAdSirala).map((e) =>
        `<div class="tc-mini"><span>${escH(e.adSoyad)}<small style="color:var(--ink-soft)"> · ${escH(e.mevcutUnvan || "")}</small></span>${tcRozet(e.id)}</div>`
      ).join("");
  return `<div class="tc-row">
    <div class="tc-head" role="button" tabindex="0" aria-expanded="false">
      ${avatarHtml(m.name, 38)}
      <div class="tc-body">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px">
          <span class="tc-name">${escH(m.name)}</span>
          <span class="tc-pct" style="color:${col}">${pct}</span>
        </div>
        <div class="tc-sub">${escH(m.dept || "—")} · ${m.doneCount}/${m.total} tamamlandı${m.ayrDone ? ` · <span class="ayr-not">+${m.ayrDone} işten ayrılan kişiyi değerlendirdi</span>` : ""}</div>
        ${tcBar(m.rate)}
      </div>
      ${TC_CHEV}
    </div>
    <div class="tc-detail">${detail}</div>
  </div>`;
}
// Bir direktör satırı (iki şerit: A=müdürlerini değerlendirme, B=ekip tamamlanması)
function tcDirRow(d) {
  const aDetail = d.mudurEmps.length
    ? d.mudurEmps.slice().sort(tcAdSirala).map((me) =>
        `<div class="tc-mini"><span>${escH(me.adSoyad)}</span>${tcRozet(me.id, "Değerlendirildi")}</div>`).join("")
    : `<div style="color:var(--ink-soft);font-size:12.5px">Bağlı müdür bulunamadı.</div>`;
  const bDetail = d.bMgrs.length
    ? d.bMgrs.slice().sort((a, b) => (a.name || "").localeCompare(b.name || "", "tr")).map((m) => {
        const p = m.rate == null ? "—" : Math.round(m.rate * 100) + "%";
        return `<div class="tc-mini"><span>${escH(m.name)}<small style="color:var(--ink-soft)"> · ${m.doneCount}/${m.total}</small></span><b style="color:${tcRenk(m.rate)}">${p}</b></div>`;
      }).join("")
    : `<div style="color:var(--ink-soft);font-size:12.5px">Bağlı müdür bulunamadı.</div>`;
  const headPct = d.rateB == null ? "—" : Math.round(d.rateB * 100) + "%";
  return `<div class="tc-row">
    <div class="tc-head" role="button" tabindex="0" aria-expanded="false">
      ${avatarHtml(d.name, 38)}
      <div class="tc-body">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px">
          <span class="tc-name">${escH(d.name)}${d.dept ? ` <span class="tc-sub" style="display:inline;margin-left:4px">· ${escH(d.dept)}</span>` : ""}</span>
          <span class="tc-pct" style="color:${tcRenk(d.rateB)}" title="Müdür ekiplerinin tamamlanması">${headPct}</span>
        </div>
        ${pbarHtml("Müdürlerini değerlendirmesi", d.aDone + "/" + d.aTotal, d.rateA)}
        ${pbarHtml("Müdür ekiplerinin tamamlanması", d.bWithTeamCount + " müdür", d.rateB)}
        ${d.ayrDone ? `<div class="tc-sub"><span class="ayr-not">+${d.ayrDone} işten ayrılan kişiyi değerlendirdi</span></div>` : ""}
      </div>
      ${TC_CHEV}
    </div>
    <div class="tc-detail">
      <div class="tc-cap">Direktörün müdür değerlendirmeleri</div>
      ${aDetail}
      <div class="tc-cap">Müdür ekiplerinin tamamlanma oranı</div>
      ${bDetail}
    </div>
  </div>`;
}
// "Tamamlama Oranları" sekmesinin tüm gövdesi
function tamamlamaTabHtml(cd) {
  const withTeam = cd.mgrs.filter((m) => m.total > 0);
  const avgMgr = withTeam.length ? withTeam.reduce((s, m) => s + m.rate, 0) / withTeam.length : null;
  const fullMgr = withTeam.filter((m) => m.rate >= 0.999).length;
  return `<div id="tabTamamlama" style="display:none">
    <div style="max-width:1060px">
    <div class="stat-row">
      <div class="stat-card"><div class="n">${cd.mgrs.length}</div><div class="l">Müdür</div></div>
      <div class="stat-card"><div class="n">${avgMgr == null ? "—" : Math.round(avgMgr * 100) + "%"}</div><div class="l">Ort. Müdür Tamamlama</div></div>
      <div class="stat-card"><div class="n">${fullMgr}</div><div class="l">Tümünü Tamamlayan Müdür</div></div>
      <div class="stat-card"><div class="n">${cd.dirs.length}</div><div class="l">Direktör</div></div>
      <div class="stat-card"><div class="n">${cd.ayrToplam}</div><div class="l">İşten Ayrılan (Değerlendirilmiş)</div></div>
    </div>
    <div class="section-title" style="margin-top:8px">Müdür Tamamlama Oranları</div>
    <p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 12px">Her müdürün kendi ekibi için tamamladığı değerlendirme oranı (bugünkü ekip). Satıra tıklayınca ekibindeki kişilerin durumu (tamamlandı / taslak / bekliyor) görünür.${cd.ayrToplam ? ` Ayrıca <b>${cd.ayrToplam}</b> değerlendirme sonradan işten ayrılan çalışanlara ait; değerlendirmeyi giren müdürün satırında “+ işten ayrılan” olarak yazar.` : ""}</p>
    <div class="card-list">${cd.mgrs.map(tcMgrRow).join("") || `<div class="empty-state">Müdür bulunamadı.</div>`}</div>
    <div class="section-title" style="margin-top:26px">Direktör Tamamlama Oranları</div>
    <p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 12px">İki ölçüt: <b>müdürlerini değerlendirmesi</b> (direktörün kendi doldurduğu) ve <b>müdür ekiplerinin tamamlanması</b> (bağlı müdürlerin ekip oranlarının ortalaması). Satıra tıklayınca kırılım görünür.</p>
    <div class="card-list">${cd.dirs.map(tcDirRow).join("") || `<div class="empty-state">Direktör bulunamadı.</div>`}</div>
    </div>
  </div>`;
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
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(7);
      // helvetica ğ/ı/ş/İ basamaz (harfler bozulup kutudan taşar) → kutu etiketinde sadeleştir
      const sade = String(label).replace(/[ğĞıİşŞ]/g, (c) => ({ "ğ": "g", "Ğ": "G", "ı": "i", "İ": "I", "ş": "s", "Ş": "S" }[c]));
      const satirlar = pdf.splitTextToSize(sade, w - 8).slice(0, 2);
      const iki = satirlar.length > 1;
      pdf.setTextColor(...NAVY); pdf.setFont("helvetica", "bold"); pdf.setFontSize(15);
      pdf.text(String(val), x + 4, y + (iki ? 8 : 9));
      pdf.setTextColor(...INKSOFT); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7);
      pdf.text(satirlar, x + 4, y + (iki ? 12.6 : 15));
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
    // 1. satır 5 kutu (Toplam · Değerlendirme Dışı · Tamamlandı · Taslak · Bekliyor), 2. satır 4 kutu
    const statRows = [
      [[ctx.total, "Toplam Personel"], [ctx.disi, "Değerlendirme Dışı (6 Ay Altı Kıdem)"], [ctx.done, "Tamamlandı"], [ctx.draft, "Taslak"], [ctx.bekliyor, "Bekliyor"]],
      [[ctx.havuzEvet, "Yetenek Havuzuna Alınmalı"], [ctx.liderlikVar, "Liderlik Potansiyeli"], [ctx.fonksiyonelEvet, "Fonksiyonel Geçişe Uygun"], [ctx.kritikRisk.length, "Kritik Risk"]]
    ];
    statRows.forEach((satir, ri) => {
      const tileW = (W - 2 * M - (satir.length - 1) * 4) / satir.length;
      let sx = M;
      satir.forEach((s) => { statTile(sx, s[0], s[1], tileW); sx += tileW + 4; });
      if (ri === 0) y += 22;
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
function statusBadgeHtml(ev, emp) {
  if (ev && evalArsivMi(ev)) return `<span class="status-badge status-arsiv" title="İlk değerlendirme turundan (Excel matrisi) arşiv kaydı — güncel değerlendirme değildir">Arşiv</span>`;
  // Sıra Genel Bakış (durumOf) ile aynı: önce girilmiş taze durum, sonra 6 ay altı kıdem
  const dolu = ["tamamlandi", "taslak"].includes(ev?.status);
  if (!dolu && emp && kidemDisi(emp)) return `<span class="status-badge" style="background:#eef0f4;color:#6b7280">Değerlendirme Dışı</span>`;
  const st = dolu ? ev.status : "bekliyor";
  const l = st === "tamamlandi" ? "Tamamlandı" : st === "taslak" ? "Taslak" : "Bekliyor";
  return `<span class="status-badge status-${st}">${l}</span>`;
}
const ADMIN_COLUMNS = [
  { key: "adSoyad", label: "Ad Soyad", get: (e, ev) => e.adSoyad, render: (e, ev) => `<button type="button" class="link-btn person-link" data-id="${escH(e.id)}" style="font-weight:700;text-align:left;font-size:inherit;font-family:inherit;color:var(--navy)">${escH(e.adSoyad)}</button>` },
  { key: "departman", label: "Departman", get: (e, ev) => e.departman || "", render: (e, ev) => escH(e.departman || "") },
  { key: "bolum", label: "Bölüm", get: (e, ev) => e.bolum || "", render: (e, ev) => escH(e.bolum || "") },
  { key: "kidem", label: "Kıdem", get: (e, ev) => (e.kurumKidemiYil ?? -1), render: (e, ev) => formatKidem(e.kurumKidemiYil) },
  { key: "gridKod", label: "9-Grid", get: (e, ev) => { const p = ev && gridPos(ev); return p ? (3 - p.pot) * 10 + (p.perf + 1) : -1; }, render: (e, ev) => { const p = ev && gridPos(ev); return p ? `<b>${gridKoord(p)}</b>` : "—"; } },
  { key: "status", label: "Durum", get: (e, ev) => (["tamamlandi", "taslak"].includes(ev?.status) ? ev.status : (kidemDisi(e) ? "dışı" : "bekliyor")), render: (e, ev) => statusBadgeHtml(ev, e) },
  { key: "ortalamaPotansiyel", label: "Ort.<br>Potansiyel", get: (e, ev) => (ev?.ortalamaPotansiyel ?? -1), render: (e, ev) => escH(ev?.ortalamaPotansiyel ?? "—") },
  { key: "performansSinifi", label: "Performans<br>Sınıfı", get: (e, ev) => ev?.performansSinifi || "", render: (e, ev) => `<span style="font-size:10px">${escH(ev?.performansSinifi || "—")}</span>` },
  { key: "yetenekHavuzuAlinmali", label: "Yetenek<br>Havuzu", get: (e, ev) => ev?.yetenekHavuzuAlinmali || "", render: (e, ev) => escH(ev?.yetenekHavuzuAlinmali || "—") },
  { key: "liderlikPotansiyeli", label: "Liderlik<br>Potansiyeli", get: (e, ev) => ev?.liderlikPotansiyeli || "", render: (e, ev) => escH(ev?.liderlikPotansiyeli || "—") },
  { key: "sistemOneri", label: "Sistem<br>Önerisi", get: (e, ev) => (ev ? (sistemOnerisi(ev) || "") : ""), render: (e, ev) => { const o = ev ? sistemOnerisi(ev) : null; return o ? `<b style="color:${o === "Evet" ? "var(--good)" : "var(--bad)"}">${o}</b>` : "—"; } },
  { key: "hazirOlmaSuresi", label: "Hazır Olma<br>Süresi", get: (e, ev) => ev?.hazirOlmaSuresi || "", render: (e, ev) => escH(ev?.hazirOlmaSuresi || "—") },
  { key: "ayrilmaRiski", label: "Ayrılma<br>Riski", get: (e, ev) => ev?.ayrilmaRiski || "", render: (e, ev) => escH(ev?.ayrilmaRiski || "—") },
  { key: "fonksiyonelGecisUygun", label: "Fonk. Geçişe<br>Uygun mu", get: (e, ev) => ev?.fonksiyonelGecisUygun || "", render: (e, ev) => escH(ev?.fonksiyonelGecisUygun || "—") }
];

function renderAdmin() {
  const roster = adminRoster();
  const total = roster.length;
  // GENEL BAKIŞ sayıları YALNIZ bugünkü personelin müdürlerce girilen (taze) değerlendirmelerinden gelir:
  // İlk değerlendirme arşivi (Excel matrisi) ve işten ayrılanların kayıtları kart, oran ve grafiklere girmez
  // (Personel Listesi ve karnede görünmeye devam eder). Risk/havuz/liderlik/9-Grid = yalnız TAMAMLANANLAR.
  const tazeDurum = (e) => tazeMap[e.id]?.status;
  const tamamEv = (e) => (tazeDurum(e) === "tamamlandi" ? tazeMap[e.id] : null);
  const tamamlananlar = roster.map(tamamEv).filter(Boolean);
  const done = tamamlananlar.length;
  const draft = roster.filter((e) => tazeDurum(e) === "taslak").length;
  // 6 ay altı kıdem: değerlendirme dışı; Bekliyor'a sayılmaz (Toplam = Dışı + Tamamlandı + Taslak + Bekliyor)
  const doluMu = (e) => ["tamamlandi", "taslak"].includes(tazeDurum(e));
  const disi = roster.filter((e) => kidemDisi(e) && !doluMu(e)).length;
  const bekliyor = total - done - draft - disi;
  const noManager = roster.filter((e) => !e.muduluk).length;
  const managers = Array.from(new Set(roster.map((e) => e.muduluk).filter(Boolean))).sort((a, b) => a.localeCompare(b, "tr"));
  const depts = Array.from(new Set(roster.map((e) => e.departman).filter(Boolean))).sort((a, b) => a.localeCompare(b, "tr"));
  const havuzEvet = tamamlananlar.filter((ev) => ev.yetenekHavuzuAlinmali === "Evet").length;
  const liderlikVar = tamamlananlar.filter((ev) => ev.liderlikPotansiyeli === "Var").length;
  const fonksiyonelEvet = tamamlananlar.filter((ev) => ev.fonksiyonelGecisUygun === "Evet").length;
  // --- İşten ayrılanlar: güncel değerlendirmesi olup bugünkü personel listesinde OLMAYANLAR (birikimli görünüm) ---
  const rosterIdSet = new Set(roster.map((e) => e.id));
  const ayrilanEvler = Object.entries(tazeMap).filter(([k]) => !rosterIdSet.has(k)).map(([, ev]) => ev);
  const ayrTamam = ayrilanEvler.filter((ev) => ev.status === "tamamlandi");
  const ayrTaslakSay = ayrilanEvler.filter((ev) => ev.status === "taslak").length;
  const arsivAyrilanSay = Object.keys(arsivMap).filter((k) => !rosterIdSet.has(k)).length;
  const ayrGridSay = ayrTamam.filter((ev) => gridPos(ev)).length;

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
    { label: "Bekliyor", value: bekliyor, color: "#9aa2ad" }
  ];

  // --- VERİ KAPSAMLARI (yalnız bugünkü personel): tamamlanan · taslaklar dahil · ilk değerlendirme arşivi ---
  const taslakEvler = roster.map((e) => (tazeDurum(e) === "taslak" ? tazeMap[e.id] : null)).filter(Boolean);
  const taslakDahil = tamamlananlar.concat(taslakEvler);
  const arsivEvler = roster.map((e) => arsivMap[e.id]).filter(Boolean);
  const riskSay = (L) => { const r = { "Düşük": 0, "Orta": 0, "Yüksek": 0 }; L.forEach((ev) => { if (r[ev.ayrilmaRiski] !== undefined) r[ev.ayrilmaRiski]++; }); return r; };
  const riskSegsOf = (L) => { const r = riskSay(L); return [
    { label: "Düşük Risk", value: r["Düşük"], color: "var(--good)" },
    { label: "Orta Risk", value: r["Orta"], color: "var(--warn)" },
    { label: "Yüksek Risk", value: r["Yüksek"], color: "var(--bad)" }
  ]; };
  const riskKart = (baslik, aciklama, L) => {
    const r = riskSay(L); const girilen = r["Düşük"] + r["Orta"] + r["Yüksek"];
    return `<div class="chart-card risk-kart"><h3>${baslik}</h3>
      <div class="ck-alt">${aciklama} · <b>${L.length}</b> kayıt${L.length !== girilen ? ` (${L.length - girilen} kayıtta risk girilmemiş)` : ""}</div>
      ${L.length ? donutChart(riskSegsOf(L)) : `<div class="ck-bos">Bu kapsamda kayıt yok.</div>`}</div>`;
  };
  const kapsamlar = [["Tamamlanan", tamamlananlar], ["Taslak dahil", taslakDahil], ["İlk değ. (arşiv)", arsivEvler]];
  const olculer = [
    ["Kayıt", (L) => L.length],
    ["Havuza alınmalı", (L) => L.filter((ev) => ev.yetenekHavuzuAlinmali === "Evet").length],
    ["Liderlik potansiyeli", (L) => L.filter((ev) => ev.liderlikPotansiyeli === "Var").length],
    ["Fonksiyonel geçiş", (L) => L.filter((ev) => ev.fonksiyonelGecisUygun === "Evet").length],
    ["Yüksek ayrılma riski", (L) => L.filter((ev) => ev.ayrilmaRiski === "Yüksek").length]
  ];
  const kapsamTablo = `<table class="kapsam-tbl"><thead><tr><th></th>${kapsamlar.map(([k]) => `<th>${k}</th>`).join("")}</tr></thead>
    <tbody>${olculer.map(([ad, f], i) => `<tr${i === 0 ? ' class="ana"' : ""}><td>${ad}</td>${kapsamlar.map(([, L]) => `<td>${f(L)}</td>`).join("")}</tr>`).join("")}
    <tr class="ayr-satir"><td>+ İşten ayrılan (ayrıca)</td><td>${ayrTamam.length}</td><td>${ayrTamam.length + ayrTaslakSay}</td><td>${arsivAyrilanSay}</td></tr></tbody></table>
    <div class="ck-not">Üstteki satırlar bugün çalışan personel içindir; kartlar ve 9-Grid <b>Tamamlanan</b> sütununu esas alır. Son satır, değerlendirmesi olup sonradan işten ayrılan kişilerdir (Personel → İşten ayrılanlar). Arşiv yeni dönem verisiyle karışmaz.</div>`;

  // --- 9-GRID: Liderlik Potansiyeli (satır, yüksek→düşük) × Performans (sütun, düşük→yüksek) ---
  const grid9 = {};
  Object.keys(GRID9).forEach((k) => (grid9[k] = []));
  let yerlesenSayi = 0;
  roster.forEach((e) => {
    const pos = gridPos(tamamEv(e));
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
    .filter((e) => { const ev = tamamEv(e); return ev?.yetenekHavuzuAlinmali === "Evet" && ev?.ayrilmaRiski === "Yüksek"; })
    .sort((a, b) => (tamamEv(b)?.ortalamaPotansiyel || 0) - (tamamEv(a)?.ortalamaPotansiyel || 0));

  const summaryCtx = { total, done, draft, disi, bekliyor, havuzEvet, liderlikVar, fonksiyonelEvet, deptData, box9, kritikRisk, evaluationsMap };
  const compData = buildCompletionData();

  // --- tazelik: son değerlendirme girişi ---
  const sonMs = Object.values(tazeMap).reduce((m, ev) => { const t = ev.updatedAt && ev.updatedAt.toMillis ? ev.updatedAt.toMillis() : 0; return t > m ? t : m; }, 0);
  const sonGun = sonMs ? Math.floor((Date.now() - sonMs) / 864e5) : null;
  const sonTarihMetni = sonMs ? new Date(sonMs).toLocaleDateString("tr-TR") : "—";
  const degerlendirilebilir = total - disi;
  const oranTamam = degerlendirilebilir ? Math.round(done / degerlendirilebilir * 100) : 0;
  const durumOf = (e) => { const s = tazeDurum(e); if (s === "tamamlandi" || s === "taslak") return s; return kidemDisi(e) ? "disi" : "bekliyor"; };
  const durumSay = { "": roster.length, tamamlandi: 0, taslak: 0, bekliyor: 0, disi: 0 };
  roster.forEach((e) => { durumSay[durumOf(e)]++; });

  // --- müdürlere göre ilerleme (en çok bekleyen üstte) ---
  const mgrIlerleme = compData.mgrs.filter((m) => m.total > 0)
    .map((m) => ({ ...m, bekleyen: m.total - m.doneCount }))
    .sort((a, b) => b.bekleyen - a.bekleyen || (a.rate ?? 0) - (b.rate ?? 0));
  const mgrSatir = (m) => {
    const p = Math.round((m.rate || 0) * 100);
    const renk = p >= 100 ? "var(--good)" : p > 0 ? "var(--warn)" : "var(--bad)";
    return `<button type="button" class="mgr-row" data-mgr="${escH(m.name)}" title="${escH(m.name)} ekibini listede aç">
      <span class="mr-ad">${escH(m.name)}<small>${escH(m.dept || "")}${m.ayrDone ? ` · <span class="ayr-not">+${m.ayrDone} işten ayrılan değerlendirdi</span>` : ""}</small></span>
      <span class="mr-bar"><i style="width:${p}%;background:${renk}"></i></span>
      <span class="mr-say"><b>${m.doneCount}</b>/${m.total}</span>
      <span class="mr-bek ${m.bekleyen ? "" : "ok"}">${m.bekleyen ? m.bekleyen + " bekliyor" : "Tamam"}</span>
    </button>`;
  };
  const baslamayanMudur = mgrIlerleme.filter((m) => m.doneCount === 0).length;

  // --- kompakt 9-Grid ısı haritası ---
  const hmHucre = (c, idx) => `<button type="button" class="hm-cell" data-idx="${idx}" style="--c:${c.cell.renk};--a:${c.list.length ? Math.min(1, 0.35 + c.list.length / Math.max(1, yerlesenSayi) * 2.2) : 0.12}" title="${escH(c.cell.baslik)} · ${escH(POT_ETIKET[c.pot])} / ${escH(PERF_ETIKET[c.perf])}">
      <span class="hm-n">${c.list.length}</span><span class="hm-t">${escH(c.cell.baslik)}</span></button>`;

  // --- yetenek göstergeleri (yalnız tamamlananlar) ---
  const miniKpi = (id, n, l, alt, cls) => `<button type="button" class="mini-kpi ${cls || ""}" id="${id}"><span class="mk-n">${n}</span><span class="mk-l">${l}</span><span class="mk-a">${alt}</span></button>`;
  const yuzde = (n) => (done ? Math.round(n / done * 100) : 0);

  const NAV = [
    { key: "overview", icon: ICONS.grid, label: "Genel Bakış" },
    { key: "list", icon: ICONS.people, label: "Personel" },
    { key: "grid", icon: ICONS.matris, label: "Yetenek Matrisi" },
    { key: "gecis", icon: ICONS.gecis, label: "Fonksiyonel Geçiş Unvanları" },
    { key: "tamamlama", icon: ICONS.progress, label: "Tamamlama Oranları" },
    { key: "manage", icon: ICONS.gear, label: "Yönetim" },
    { key: "aciklama", icon: ICONS.doc, label: "Açıklamalar" }
  ];
  if (!NAV.some((n) => n.key === ADM.tab) || ADM.tab === "manage") ADM.tab = "overview";
  const F = ADM.f;
  const gelismisSay = ["risk", "ready", "havuz", "oneri", "lider", "grid", "gecis"].filter((k) => F[k]).length;

  root().innerHTML = `
  ${topbar()}
  <div class="app-body">
    ${sidebarHtml(NAV, ADM.tab)}
    <div class="main-content">
    <div class="wrap wide">
    <div class="page-head">
      <div>
        <h1>İK Değerlendirme Paneli</h1>
        <p>${escH(viewDonem)} dönemi · ${total} çalışan · Son değerlendirme girişi <b>${sonTarihMetni}</b>${sonGun != null ? ` (${sonGun === 0 ? "bugün" : sonGun + " gün önce"})` : ""}</p>
      </div>
      <div class="dd">
        <button class="btn btn-ghost btn-sm" id="ddBtn" type="button" aria-haspopup="true" aria-expanded="false">Dışa Aktar ▾</button>
        <div class="dd-menu" id="ddMenu" hidden>
          <button type="button" id="printSummary">Yönetici PDF raporu</button>
          <button type="button" id="exportCsv">CSV (tüm personel)</button>
          <button type="button" id="exportSunum" title="Yönetim sunumu için güncel verileri tek dosyada indirir">Sunum verisi (JSON)</button>
        </div>
      </div>
    </div>
    ${!isDuzenlenebilir() ? `<div class="error-box" style="display:block;background:var(--warn-bg);color:var(--warn)"><b>${viewDonem}</b> dönemi görüntüleniyor (salt okunur, geçmiş kayıtlar). Güncel dönem için sağ üstten <b>${aktifDonem} (Aktif)</b> seçin.</div>` : ""}
    ${(isDuzenlenebilir() && noManager) ? `<div class="error-box" style="display:block;background:var(--warn-bg);color:var(--warn)">${noManager} personelin müdürü eşleşmedi. "Yönetim" menüsünden atayabilirsiniz.</div>` : ""}

    <div id="tabOverview" class="sekme">
      <div class="kpi-serit">
        <button type="button" class="kpi" data-durum=""><span class="kpi-l">Toplam Personel</span><span class="kpi-n">${total}</span><span class="kpi-a">${degerlendirilebilir} kişi değerlendirilebilir</span></button>
        <button type="button" class="kpi" data-durum="disi" title="İşe başlama tarihine göre kıdemi 6 aydan kısa olan çalışanlar değerlendirme dışıdır; Bekliyor sayısına dahil edilmez."><span class="kpi-l">Kişi Değerlendirme Dışı (6 Ay Altı Kıdem)</span><span class="kpi-n">${disi}</span><span class="kpi-a">Kıdemi 6 ayı doldurunca açılır</span></button>
        <button type="button" class="kpi vurgu" data-durum="tamamlandi"><span class="kpi-l">Tamamlandı</span><span class="kpi-n">${done}<small>%${oranTamam}</small></span><span class="kpi-bar"><i style="width:${oranTamam}%"></i></span><span class="kpi-a">${degerlendirilebilir} değerlendirilebilir kişiden${ayrTamam.length ? `<br><b class="ayr-not">+${ayrTamam.length} işten ayrılan</b> · ilk günden bugüne ${done + ayrTamam.length}` : ""}</span></button>
        <button type="button" class="kpi" data-durum="taslak"><span class="kpi-l">Taslak</span><span class="kpi-n">${draft}</span><span class="kpi-a">Kaydedildi, tamamlanmadı</span></button>
        <button type="button" class="kpi ${bekliyor ? "dikkat" : ""}" data-durum="bekliyor"><span class="kpi-l">Bekliyor</span><span class="kpi-n">${bekliyor}</span><span class="kpi-a">Henüz değerlendirilmedi</span></button>
        <div class="kpi bilgi ${sonGun != null && sonGun > 14 ? "dikkat" : ""}"><span class="kpi-l">Son Değerlendirme</span><span class="kpi-n kucuk">${sonTarihMetni}</span><span class="kpi-a">${sonGun == null ? "Henüz giriş yok" : sonGun > 14 ? sonGun + " gündür yeni giriş yok" : sonGun + " gün önce"}</span></div>
      </div>

      <div class="ov-grid">
        <section class="pnl span8">
          <div class="pnl-h"><div><h3>Müdürlere Göre İlerleme</h3><p>En çok bekleyen ekip üstte · ${mgrIlerleme.length} müdürden <b>${baslamayanMudur}</b>'i hiç başlamadı · satıra tıklayınca o ekip açılır</p></div><button type="button" class="pnl-link" data-git="tamamlama">Tüm müdür ve direktörler →</button></div>
          <div class="mgr-list">${mgrIlerleme.slice(0, 9).map(mgrSatir).join("") || `<div class="bos-not">Müdür kaydı yok.</div>`}</div>
        </section>
        <section class="pnl span4">
          <div class="pnl-h"><div><h3>Değerlendirme Durumu</h3><p>Değerlendirilebilir ${degerlendirilebilir} kişi (6 ay altı hariç)</p></div></div>
          ${donutChart(completionSegs)}
        </section>

        <section class="pnl span6">
          <div class="pnl-h"><div><h3>Yetenek Matrisi (9-Grid)</h3><p>Tamamlanan ${yerlesenSayi} kişi · kutuya tıklayınca kişiler açılır${ayrGridSay ? ` · <span class="ayr-not">işten ayrılan ${ayrGridSay} kişi matriste gösterilmez</span>` : ""}</p></div><button type="button" class="pnl-link" data-git="grid">Ayrıntılı matris →</button></div>
          <div class="hm-wrap">
            <div class="hm-y">Liderlik potansiyeli →</div>
            <div class="hm-grid">
              ${[0, 3, 6].map((s) => `<div class="hm-rl">${POT_ETIKET[box9[s].pot]}</div>` + box9.slice(s, s + 3).map((c, j) => hmHucre(c, s + j)).join("")).join("")}
              <div></div><div class="hm-cl">Düşük</div><div class="hm-cl">Normal</div><div class="hm-cl">Yüksek</div>
            </div>
          </div>
          <div class="hm-x">Performans →</div>
        </section>
        <section class="pnl span6">
          <div class="pnl-h"><div><h3>Yetenek Göstergeleri</h3><p>Yalnız tamamlanan ${done} değerlendirme · kutuya tıklayınca kişiler açılır</p></div></div>
          <div class="mini-grid">
            ${miniKpi("statHavuz", havuzEvet, "Havuza alınmalı", "%" + yuzde(havuzEvet) + " · yönetici önerisi")}
            ${miniKpi("statLiderlik", liderlikVar, "Liderlik potansiyeli", "%" + yuzde(liderlikVar) + " · var")}
            ${miniKpi("statFonksiyonel", fonksiyonelEvet, "Fonksiyonel geçişe uygun", "%" + yuzde(fonksiyonelEvet) + " · evet")}
            ${miniKpi("statKritik", kritikRisk.length, "Kritik risk", "Havuzda + ayrılma riski yüksek", kritikRisk.length ? "kirmizi" : "")}
          </div>
          <div class="kr-list" id="kritikRiskList">
            ${kritikRisk.length ? kritikRisk.slice(0, 4).map((e) => `<button type="button" class="kr-row risk-alert-card" data-id="${escH(e.id)}">${avatarHtml(e.adSoyad, 28)}<span><b>${escH(e.adSoyad)}</b><small>${escH(e.mevcutUnvan || "")} · ${escH(e.departman || "")}</small></span><em>Yüksek risk</em></button>`).join("") + (kritikRisk.length > 4 ? `<div class="bos-not">+${kritikRisk.length - 4} kişi daha — "Kritik risk" kutusuna tıklayın</div>` : "") : `<div class="bos-not">Havuzda olup ayrılma riski yüksek kişi yok.</div>`}
          </div>
        </section>
      </div>

      <div class="ck-bolum">Ayrılma Riski · Veri Kapsamına Göre</div>
      <div class="chart-grid uc">
        ${riskKart("Tamamlanan (Taslaklar Hariç)", "Müdürlerin tamamladığı değerlendirmeler", tamamlananlar)}
        ${riskKart("Taslaklar Dahil", "Tamamlanan + kaydedilmiş taslaklar", taslakDahil)}
        ${riskKart("İlk Değerlendirme (Arşiv)", "İlk tur Excel matrisinden aktarılan, güncel sayılara dahil değil", arsivEvler)}
      </div>

      <div class="ov-grid">
        <section class="pnl span6"><div class="pnl-h"><div><h3>Departman Dağılımı</h3><p>Bugünkü personel</p></div></div>${barListHtml(deptData)}</section>
        <section class="pnl span6"><div class="pnl-h"><div><h3>Kapsam Karşılaştırması</h3><p>Aynı kişiler, üç farklı veri kapsamında</p></div></div>${kapsamTablo}</section>
      </div>
    </div>

    <div id="tabGrid" class="sekme">
      <div class="box9-wrap">
        <h3 style="margin:0 0 4px">9-Grid · İnsanlar Üzerine Değerlendirme</h3>
        <p style="margin:0 0 14px;font-size:12px;color:var(--ink-soft)">Değerlendirmesi tamamlanan <b>${yerlesenSayi}</b> personel, <b>Performans</b> (T–AH bloğu · Düşük/Orta/Yüksek) ve <b>Liderlik Potansiyeli</b> (Potansiyel yetkinlikleri %60 + Öğrenme Çevikliği %40) puanlarına göre otomatik yerleştirilir. Her kutunun açıklaması, o gruba <i>neden</i> dahil olunduğunu anlatır — kılavuz niteliğindedir. Kutuya tıklayınca kişiler listelenir.${ayrGridSay ? ` <b>İşten ayrılan ${ayrGridSay} kişinin</b> tamamlanmış değerlendirmesi matriste gösterilmez; Personel → “İşten ayrılanlar”da görülebilir.` : ""}</p>
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
                        <b style="font-size:12.5px;line-height:1.25">${c.cell.baslik}${["2-2", "2-1", "1-2"].includes(c.pot + "-" + c.perf) ? ` <span style="font-weight:600;opacity:.92;white-space:nowrap">(Terfiye Uygun: ${c.list.length})</span>` : ""}</b>
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
    </div>

    <div id="tabGecis" class="sekme"></div>

    <div id="tabList" class="sekme">
      <div class="kaynak-sec" role="tablist" aria-label="Veri kaynağı">
        <button type="button" role="tab" data-kaynak="guncel" class="${ADM.kaynak === "guncel" ? "on" : ""}">Güncel değerlendirmeler</button>
        <button type="button" role="tab" data-kaynak="ayrilan" class="${ADM.kaynak === "ayrilan" ? "on" : ""}">İşten ayrılanlar · ${ayrilanEvler.length} kişi</button>
        <button type="button" role="tab" data-kaynak="arsiv" class="${ADM.kaynak === "arsiv" ? "on" : ""}">İlk değerlendirme (arşiv) · ${arsivEvler.length} kişi</button>
      </div>
      ${ADM.kaynak === "arsiv" ? `<div class="arsiv-not">Bu görünüm, ilk tur Excel matrisinden aktarılan <b>arşiv</b> kayıtlarını gösterir (bugün çalışan ${arsivEvler.length} kişi${arsivAyrilanSay ? `; ayrıca ${arsivAyrilanSay} arşiv kaydı bugün listede olmayan kişilere ait` : ""}). Güncel sayılara, grafiklere ve tamamlama oranlarına <b>dahil değildir</b>.</div>` : ""}
      ${ADM.kaynak === "ayrilan" ? `<div class="arsiv-not">Bu görünüm, güncel değerlendirmesi girilmiş ama <b>sonradan işten ayrılmış</b> ${ayrilanEvler.length} kişiyi gösterir (${ayrTamam.length} tamamlandı${ayrTaslakSay ? `, ${ayrTaslakSay} taslak` : ""}). Bugünkü personel sayılarına ve oranlara dahil değildir; “ilk günden bugüne” toplamlarında ayrıca belirtilir.</div>` : ""}
      <div class="chip-row" id="durumCipler" ${ADM.kaynak === "arsiv" ? "hidden" : ""}>
        ${[["", "Tümü"], ["tamamlandi", "Tamamlandı"], ["taslak", "Taslak"], ["bekliyor", "Bekliyor"], ["disi", "Değerlendirme dışı"]].map(([k, l]) => `<button type="button" class="chip ${F.durum === k ? "on" : ""}" data-durum="${k}">${l}<b>${durumSay[k]}</b></button>`).join("")}
      </div>
      <div class="toolbar">
        <input type="text" id="searchBox" placeholder="İsimle ara…" style="min-width:220px" value="${escH(F.q)}">
        <select id="managerFilter"><option value="">Tüm Müdürler</option>${managers.map((m) => `<option value="${escH(m)}"${F.mgr === m ? " selected" : ""}>${escH(m)}</option>`).join("")}</select>
        <select id="deptFilter"><option value="">Tüm Departmanlar</option>${depts.map((m) => `<option value="${escH(m)}"${F.dept === m ? " selected" : ""}>${escH(m)}</option>`).join("")}</select>
        <button type="button" class="btn btn-ghost btn-sm" id="gelismisBtn" aria-expanded="${ADM.gelismis ? "true" : "false"}">Gelişmiş filtreler${gelismisSay ? ` <span class="rozet">${gelismisSay}</span>` : ""} ▾</button>
        <button type="button" class="link-btn" id="filtreTemizle">Filtreleri temizle</button>
        <span class="tb-bosluk"></span>
        <span class="sonuc-say" id="sonucSay"></span>
        ${ADM.kaynak === "arsiv" ? "" : `<button class="btn btn-brass btn-sm" id="topluKarneBtn" type="button">Listeyi A4 Karne Yazdır</button>`}
      </div>
      <div class="toolbar gelismis" id="gelismisAlan" ${ADM.gelismis ? "" : "hidden"}>
        <select id="riskFilter"><option value="">Tüm Ayrılma Riskleri</option>${["Düşük", "Orta", "Yüksek"].map((v) => `<option value="${v}"${F.risk === v ? " selected" : ""}>${v}</option>`).join("")}</select>
        <select id="readyFilter"><option value="">Tüm Hazır Olma Süreleri</option>${["Hazır", "0-1 yıl", "1-2 Yıl"].map((v) => `<option value="${v}"${F.ready === v ? " selected" : ""}>${v}</option>`).join("")}</select>
        <select id="havuzFilter"><option value="">Yetenek Havuzu (Yönetici) — Hepsi</option><option value="Evet"${F.havuz === "Evet" ? " selected" : ""}>Havuza: Evet</option><option value="Hayır"${F.havuz === "Hayır" ? " selected" : ""}>Havuza: Hayır</option></select>
        <select id="oneriFilter"><option value="">Sistem Önerisi — Hepsi</option><option value="Evet"${F.oneri === "Evet" ? " selected" : ""}>Öneri: Evet</option><option value="Hayır"${F.oneri === "Hayır" ? " selected" : ""}>Öneri: Hayır</option></select>
        <select id="liderlikFilter"><option value="">Liderlik — Hepsi</option><option value="Var"${F.lider === "Var" ? " selected" : ""}>Liderlik: Var</option><option value="Yok"${F.lider === "Yok" ? " selected" : ""}>Liderlik: Yok</option></select>
        <select id="gridFilter"><option value="">9-Grid — Hepsi</option>${Object.keys(GRID9).map((k) => { const pt = Number(k.split("-")[0]), pf = Number(k.split("-")[1]); return `<option value="${k}"${F.grid === k ? " selected" : ""}>${(3 - pt)}-${(pf + 1)} · ${GRID9[k].baslik}</option>`; }).join("")}</select>
        <select id="gecisFilter" title="Fonksiyonel geçiş yapabileceği pozisyon"><option value="">Geçiş Pozisyonu — Hepsi</option>${tumUnvanlar().map((u) => `<option value="${escH(u)}"${F.gecis === u ? " selected" : ""}>${escH(u)}</option>`).join("")}</select>
      </div>
      <div class="table-scroll">
        <table class="admin-table" style="min-width:1050px">
          <thead><tr>
            ${ADMIN_COLUMNS.map((c) => `<th data-key="${c.key}">${c.label} <span class="sort-ind" data-key="${c.key}"></span></th>`).join("")}
            <th>Düzenle / Karne</th>
          </tr></thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
    </div>
    ${tamamlamaTabHtml(compData)}
    ${aciklamaTabHtml()}
    </div>
    </div>
  </div>`;
  wireTopbar();

  // --- sekme göster (hafızalı) ---
  const SEKMELER = { overview: "#tabOverview", list: "#tabList", grid: "#tabGrid", gecis: "#tabGecis", tamamlama: "#tabTamamlama", aciklama: "#tabAciklama" };

  // --- Fonksiyonel Geçiş Unvanları sekmesi (kendi içinde yeniden çizilir; seçimler ADM.gecis'te korunur) ---
  function gecisCiz() {
    const G = ADM.gecis;
    const gruplar = gecisGrupla(roster, G.kapsam, G.tur);
    const q = (G.q || "").trim().toLocaleUpperCase("tr");
    const gorunen = gruplar.filter((g) => !q || g.ad.includes(q));
    if (!G.secili || !gruplar.some((g) => g.ad === G.secili)) G.secili = gorunen.length ? gorunen[0].ad : null;
    const sec = gruplar.find((g) => g.ad === G.secili);
    const kisiSay = new Set(gruplar.flatMap((g) => g.kisiler.map((p) => p.e.id))).size;
    const enCok = gruplar.length ? gruplar[0].kisiler.length : 1;
    const seg = (alan, secenekler) => `<div class="kaynak-sec" data-alan="${alan}">${secenekler.map(([v, l]) => `<button type="button" data-v="${v}" class="${G[alan] === v ? "on" : ""}">${l}</button>`).join("")}</div>`;
    const kisiHtml = (p) => {
      const ev = p.ev; const e = p.e;
      const etiket = [...p.kaynak].map((k) => k === "gecis" ? `<span class="gk-et">Fonksiyonel geçiş</span>` : `<span class="gk-et y">Yedekleyebilir</span>`).join("");
      const durum = G.kapsam === "arsiv" ? `<span class="status-badge status-arsiv">Arşiv</span>` : (ev.status === "taslak" ? `<span class="status-badge status-taslak">Taslak</span>` : "");
      return `<button type="button" class="gk-kisi" data-id="${escH(e.id)}">
        ${avatarHtml(e.adSoyad, 34)}
        <span class="gk-ana"><b>${escH(e.adSoyad)}</b>
          <small>Bugün: <strong>${escH(e.mevcutUnvan || "—")}</strong> · ${escH(e.departman || "")}${e.muduluk && e.muduluk !== "-" ? " · Müdürü: " + escH(e.muduluk) : ""}</small>
          <small class="gk-ok">${escH(e.mevcutUnvan || "Mevcut unvan")} → <strong>${escH(sec.ad)}</strong> olabilir${ev.hazirOlmaSuresi ? " · Hazır olma: " + escH(ev.hazirOlmaSuresi) : ""}</small></span>
        <span class="gk-sag">${etiket}${durum}</span>
      </button>`;
    };
    el("#tabGecis").innerHTML = `
      <div class="gecis-ust">
        ${seg("kapsam", [["tamam", "Tamamlanan"], ["taslak", "Taslak dahil"], ["arsiv", "İlk değerlendirme (arşiv)"]])}
        ${seg("tur", [["", "Tümü"], ["gecis", "Fonksiyonel geçiş"], ["yedek", "Yedekleyebileceği"]])}
        <input type="text" id="gecisAra" placeholder="Unvan ara…" value="${escH(G.q || "")}">
      </div>
      <p class="gecis-ozet"><b>${gruplar.length}</b> hedef unvan · <b>${kisiSay}</b> kişi (bir kişi birden fazla unvana işaretlenmiş olabilir) · kaynak: “Geçiş Yapabileceği Pozisyon(lar)” ve “Yedekleyebileceği Pozisyonlar”</p>
      ${gruplar.length ? `<div class="gecis-grid">
        <div class="pnl gecis-sol">
          ${gorunen.map((g) => `<button type="button" class="gk-unvan ${g.ad === G.secili ? "on" : ""}" data-unvan="${escH(g.ad)}"><span class="gu-ad">${escH(g.ad)}</span><span class="gu-bar"><i style="width:${Math.round(g.kisiler.length / enCok * 100)}%"></i></span><b>${g.kisiler.length}</b></button>`).join("") || `<div class="bos-not">Aramaya uyan unvan yok.</div>`}
        </div>
        <div class="pnl gecis-sag">
          ${sec ? `<div class="pnl-h"><div><h3>${escH(sec.ad)}</h3><p><b>${sec.kisiler.length}</b> kişi bu unvana işaretlenmiş · kişiye tıklayınca karnesi açılır</p></div></div>
          <div class="gk-liste">${sec.kisiler.map(kisiHtml).join("")}</div>` : `<div class="bos-not">Soldan bir unvan seçin.</div>`}
        </div>
      </div>` : `<div class="pnl"><div class="bos-not">Bu kapsamda fonksiyonel geçiş ya da yedekleme unvanı girilmiş değerlendirme yok.</div></div>`}`;
    document.querySelectorAll("#tabGecis .kaynak-sec").forEach((sg) => sg.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { G[sg.dataset.alan] = b.dataset.v; gecisCiz(); })));
    document.querySelectorAll("#tabGecis .gk-unvan").forEach((b) => b.addEventListener("click", () => { G.secili = b.dataset.unvan; gecisCiz(); }));
    document.querySelectorAll("#tabGecis .gk-kisi").forEach((b) => b.addEventListener("click", () => { const emp = findEmpById(b.dataset.id); if (emp) openAdminDetailDrawer(emp); }));
    const ara = el("#gecisAra");
    if (ara) ara.addEventListener("input", () => { G.q = ara.value; const pos = ara.selectionStart; gecisCiz(); const a2 = el("#gecisAra"); if (a2) { a2.focus(); a2.setSelectionRange(pos, pos); } });
  }
  gecisCiz();
  function sekmeGoster(key) {
    ADM.tab = key;
    Object.entries(SEKMELER).forEach(([k, sel]) => { const d = el(sel); if (d) d.style.display = k === key ? "block" : "none"; });
    document.querySelectorAll(".sidebar .nav-item").forEach((n) => n.classList.toggle("active", n.dataset.nav === key));
  }
  sekmeGoster(ADM.tab);
  document.querySelectorAll(".sidebar .nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      const key = item.dataset.nav;
      if (key === "manage") { openManagePanel(); return; }
      sekmeGoster(key); window.scrollTo(0, 0);
    });
  });
  // Genel Bakış'tan tek tıkla listeye: filtreyi kur, Personel sekmesine geç
  function listeyeGit(f) {
    ADM.f = Object.assign(admBosFiltre(), f || {});
    ADM.gelismis = ["risk", "ready", "havuz", "oneri", "lider", "grid", "gecis"].some((k) => ADM.f[k]);
    ADM.tab = "list"; renderAdmin(); window.scrollTo(0, 0);
  }
  document.querySelectorAll(".kpi[data-durum]").forEach((b) => b.addEventListener("click", () => listeyeGit({ durum: b.dataset.durum })));
  document.querySelectorAll(".mgr-row").forEach((b) => b.addEventListener("click", () => listeyeGit({ mgr: b.dataset.mgr })));
  document.querySelectorAll("[data-git]").forEach((b) => b.addEventListener("click", () => { sekmeGoster(b.dataset.git); window.scrollTo(0, 0); }));

  // --- Dışa Aktar menüsü ---
  const ddBtn = el("#ddBtn"), ddMenu = el("#ddMenu");
  const ddKapat = () => { ddMenu.hidden = true; ddBtn.setAttribute("aria-expanded", "false"); };
  ddBtn.addEventListener("click", (ev) => { ev.stopPropagation(); ddMenu.hidden = !ddMenu.hidden; ddBtn.setAttribute("aria-expanded", ddMenu.hidden ? "false" : "true"); });
  document.addEventListener("click", ddKapat);
  el("#printSummary").addEventListener("click", () => { ddKapat(); downloadExecutivePdf(summaryCtx); });
  el("#exportCsv").addEventListener("click", () => { ddKapat(); exportCsv(); });
  const sb = el("#exportSunum"); if (sb) sb.addEventListener("click", () => { ddKapat(); exportSunumVerisi(); });

  // --- göstergeler ve matris: tek tıkla kişi listesi ---
  el("#statHavuz").addEventListener("click", () => openStatListDrawer("Yetenek Havuzuna Alınmalı (Evet)", roster.filter((e) => tamamEv(e)?.yetenekHavuzuAlinmali === "Evet")));
  el("#statLiderlik").addEventListener("click", () => openStatListDrawer("Liderlik Potansiyeli (Var)", roster.filter((e) => tamamEv(e)?.liderlikPotansiyeli === "Var")));
  el("#statFonksiyonel").addEventListener("click", () => openStatListDrawer("Fonksiyonel Geçişe Uygun (Evet)", roster.filter((e) => tamamEv(e)?.fonksiyonelGecisUygun === "Evet")));
  el("#statKritik").addEventListener("click", () => openStatListDrawer("Kritik Risk — Havuzda ve Ayrılma Riski Yüksek", kritikRisk));
  const hucreAc = (idx) => { const c = box9[Number(idx)]; openStatListDrawer(`${c.cell.baslik} · ${POT_ETIKET[c.pot]} / ${PERF_ETIKET[c.perf]}`, c.list); };
  document.querySelectorAll("#grid9 .g9cell, .hm-cell").forEach((cell) => cell.addEventListener("click", () => hucreAc(cell.dataset.idx)));
  document.querySelectorAll("#kritikRiskList .risk-alert-card").forEach((card) => {
    card.addEventListener("click", () => { const emp = findEmpById(card.dataset.id); if (emp) openAdminDetailDrawer(emp); });
  });

  // Tamamlama satırlarını aç/kapa (fare + klavye + aria)
  document.querySelectorAll("#tabTamamlama .tc-head").forEach((h) => {
    const toggle = () => {
      const open = h.parentElement.classList.toggle("open");
      h.setAttribute("aria-expanded", open ? "true" : "false");
    };
    h.addEventListener("click", toggle);
    h.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });

  // --- Personel listesi (filtreler ADM.f'de saklanır; veri yenilense de kaybolmaz) ---
  let sonFiltreli = [];
  // Kaynak: güncel (taze) ya da ilk değerlendirme arşivi — ikisi ASLA aynı satırda karışmaz
  const arsivModu = ADM.kaynak === "arsiv";
  const ayrModu = ADM.kaynak === "ayrilan";
  const evOf = (e) => (arsivModu ? arsivMap[e.id] : evaluationsMap[e.id]);
  // İşten ayrılanlar görünümünde satırlar değerlendirme kaydından üretilir (kişi bugünkü listede yok)
  const tabanListe = ayrModu ? ayrilanEvler.map((ev) => evToEmp(ev)) : roster;
  function draw() {
    const term = (F.q || "").trim().toLocaleLowerCase("tr");
    const col = ADMIN_COLUMNS.find((c) => c.key === ADM.sort.key) || ADMIN_COLUMNS[0];
    // Durum DIŞINDAKİ TÜM filtreler → çip sayıları bu kümeden. Böylece müdür satırındaki "3/6" ve
    // Kapsam tablosundaki "Tamamlanan / Taslak dahil" sayıları çiplerde birebir görünür (ör. Yüksek risk: Tamamlandı 3 · Taslak 1).
    const onDurum = tabanListe
      .filter((e) => !arsivModu || arsivMap[e.id])
      .filter((e) => e.adSoyad.toLocaleLowerCase("tr").includes(term))
      .filter((e) => !F.mgr || (e.muduluk === F.mgr && e.adSoyad !== F.mgr))
      .filter((e) => !F.dept || e.departman === F.dept)
      .filter((e) => !F.risk || evOf(e)?.ayrilmaRiski === F.risk)
      .filter((e) => !F.ready || evOf(e)?.hazirOlmaSuresi === F.ready)
      .filter((e) => !F.havuz || evOf(e)?.yetenekHavuzuAlinmali === F.havuz)
      .filter((e) => !F.oneri || (evOf(e) && sistemOnerisi(evOf(e)) === F.oneri))
      .filter((e) => !F.lider || evOf(e)?.liderlikPotansiyeli === F.lider)
      .filter((e) => { if (!F.grid) return true; const p = evOf(e) && gridPos(evOf(e)); return p && (p.pot + "-" + p.perf) === F.grid; })
      .filter((e) => {
        if (!F.gecis) return true;
        const ev = evOf(e); if (!ev) return false;
        if (Array.isArray(ev.fonksiyonelGecisPozisyonlar)) return ev.fonksiyonelGecisPozisyonlar.includes(F.gecis);
        return (ev.fonksiyonelGecisDept || "").split(/[,;]/).map((x) => x.trim()).includes(F.gecis);
      });
    const cipSay = { "": onDurum.length, tamamlandi: 0, taslak: 0, bekliyor: 0, disi: 0 };
    onDurum.forEach((e) => { cipSay[durumOf(e)]++; });
    document.querySelectorAll("#durumCipler .chip").forEach((c) => { const b = c.querySelector("b"); if (b) b.textContent = cipSay[c.dataset.durum]; });
    const list = onDurum
      .filter((e) => arsivModu || !F.durum || durumOf(e) === F.durum)
      .sort((a, b) => {
        const va = col.get(a, evOf(a));
        const vb = col.get(b, evOf(b));
        const cmp = (typeof va === "number" && typeof vb === "number") ? va - vb : String(va).localeCompare(String(vb), "tr");
        return ADM.sort.dir * cmp;
      });
    sonFiltreli = list;
    el("#sonucSay").innerHTML = `<b>${list.length}</b> kişi listeleniyor${arsivModu ? " · arşiv" : ayrModu ? " · işten ayrılan" : ""}`;

    const canEdit = isDuzenlenebilir() && !arsivModu && !ayrModu;
    el("#tbody").innerHTML = list.map((e) => {
      const ev = evOf(e);
      const duzenleBtn = canEdit ?`<button type="button" class="link-btn eval-edit" data-id="${escH(e.id)}" style="color:var(--navy);font-weight:600;margin-right:10px">Düzenle</button>` : "";
      const a4Btn = arsivModu ? "" : `<button type="button" class="link-btn karne-print" data-id="${escH(e.id)}" style="color:var(--brass);font-weight:600">A4</button>`;
      return `<tr>${ADMIN_COLUMNS.map((c) => `<td>${c.render(e, ev)}</td>`).join("")}<td style="white-space:nowrap">${duzenleBtn}${a4Btn || (arsivModu ? `<span style="font-size:11px;color:var(--ink-soft)" title="Arşiv kaydı salt görüntülenir">—</span>` : "")}</td></tr>`;
    }).join("") || `<tr><td colspan="${ADMIN_COLUMNS.length + 1}" class="empty-state">Bu filtrelerle kayıt bulunamadı. <button type="button" class="link-btn" id="bosTemizle">Filtreleri temizle</button></td></tr>`;
    const bt = el("#bosTemizle"); if (bt) bt.addEventListener("click", () => listeyeGit({}));

    document.querySelectorAll(".person-link").forEach((btn) => {
      btn.addEventListener("click", () => { const emp = findEmpById(btn.dataset.id); if (emp) openAdminDetailDrawer(emp); });
    });
    document.querySelectorAll(".eval-edit").forEach((btn) => {
      btn.addEventListener("click", () => { const emp = findEmpById(btn.dataset.id); if (emp) openEvalDrawer(emp); });
    });
    document.querySelectorAll(".karne-print").forEach((btn) => {
      btn.addEventListener("click", () => { const emp = findEmpById(btn.dataset.id); if (emp) karneYazdir([emp]); });
    });
    document.querySelectorAll(".sort-ind").forEach((s) => {
      s.textContent = s.dataset.key === ADM.sort.key ? (ADM.sort.dir === 1 ? "▲" : "▼") : "";
    });
  }
  const topluBtn = el("#topluKarneBtn");
  if (topluBtn) topluBtn.addEventListener("click", () => {
    if (!sonFiltreli.length) { toast("Yazdırılacak kayıt yok."); return; }
    karneYazdir(sonFiltreli);
  });
  document.querySelectorAll("table.admin-table th[data-key]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      if (ADM.sort.key === key) ADM.sort.dir *= -1;
      else ADM.sort = { key, dir: 1 };
      draw();
    });
  });
  document.querySelectorAll("#durumCipler .chip").forEach((c) => c.addEventListener("click", () => {
    F.durum = c.dataset.durum;
    document.querySelectorAll("#durumCipler .chip").forEach((x) => x.classList.toggle("on", x === c));
    draw();
  }));
  const FILTRE_ALAN = { searchBox: "q", managerFilter: "mgr", deptFilter: "dept", riskFilter: "risk", readyFilter: "ready", havuzFilter: "havuz", oneriFilter: "oneri", liderlikFilter: "lider", gridFilter: "grid", gecisFilter: "gecis" };
  Object.entries(FILTRE_ALAN).forEach(([id, k]) => {
    const inp = el("#" + id);
    const guncelle = () => { F[k] = inp.value; draw(); };
    inp.addEventListener("input", guncelle);
    inp.addEventListener("change", guncelle);
  });
  el("#gelismisBtn").addEventListener("click", () => {
    ADM.gelismis = !ADM.gelismis;
    el("#gelismisAlan").hidden = !ADM.gelismis;
    el("#gelismisBtn").setAttribute("aria-expanded", ADM.gelismis ? "true" : "false");
  });
  el("#filtreTemizle").addEventListener("click", () => listeyeGit({}));
  document.querySelectorAll(".kaynak-sec [data-kaynak]").forEach((b) => b.addEventListener("click", () => {
    if (ADM.kaynak === b.dataset.kaynak) return;
    ADM.kaynak = b.dataset.kaynak; ADM.tab = "list"; renderAdmin();
  }));
  draw();
}

// ---------------------------------------------------------------
// A4 KİŞİYE ÖZEL KARNE (yazdırılabilir) — tek veya toplu
// ---------------------------------------------------------------
function karneYazdir(empList) {
  const esc = (s) => String(s == null ? "—" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const kutu = (baslik, ic) => `<div class="k-box"><div class="k-h">${baslik}</div>${ic}</div>`;
  const ikili = (rows) => `<div class="k-grid">${rows.map(([l, v]) => `<div class="k-row"><span>${l}</span><b>${esc(v)}</b></div>`).join("")}</div>`;

  const sayfalar = empList.map((emp) => {
    const ev = evaluationsMap[emp.id] || {};
    const dolu = !!ev.status;
    const pos = dolu ? gridPos(ev) : null;
    const cell = pos ? GRID9[pos.pot + "-" + pos.perf] : null;
    const oneri = pos ? sistemOnerisi(ev) : null;
    const potRows = POTANSIYEL_FIELDS.map(([k, l]) => [l, scoreLabelText(ev.potansiyel?.[k])]);
    const perfRows = PERFORMANS_FIELDS.map(([k, l]) => [l, ev.performans?.[k] || "—"]);
    const cevRows = CEVIKLIK_FIELDS.map(([k, l]) => [l, ev.ogrenmeCevikligi?.[k] === true ? "Var" : ev.ogrenmeCevikligi?.[k] === false ? "Yok" : "—"]);
    const planRows = [
      ["Hazır Olma Süresi", ev.hazirOlmaSuresi], ["Ayrılma Riski", ev.ayrilmaRiski],
      ["Yedekleyebileceği Pozisyonlar", ev.yedekPozisyonlar], ["Fonksiyonel Geçişe Uygun mu?", ev.fonksiyonelGecisUygun],
      ["Uygun Departman / Rol", ev.fonksiyonelGecisDept], ["Liderlik Potansiyeli", ev.liderlikPotansiyeli],
      ["Yetenek Havuzuna Alınmalı (Yönetici)", ev.yetenekHavuzuAlinmali]
    ];
    return `<section class="karne">
      <div class="k-top">
        <div class="k-mark">İH</div>
        <div class="k-title">
          <div class="k-name">${esc(emp.adSoyad)}</div>
          <div class="k-sub">${esc(emp.mevcutUnvan)} · ${esc(emp.departman)} / ${esc(emp.bolum)} · Müdür: ${esc(emp.muduluk || "—")} · Kıdem: ${esc(formatKidem(emp.kurumKidemiYil))}</div>
        </div>
        <div class="k-brand">Yetenek Havuzu Karnesi<br><span>İnciroğlu Otomotiv · İK · ${new Date().toLocaleDateString("tr-TR")}</span></div>
      </div>
      ${!dolu ? `<div class="k-empty">Bu personel için değerlendirme henüz girilmemiştir.</div>` : `
      <div class="k-grid9">
        <div class="k-g9-l">
          <div class="k-g9-code">9-Grid: ${pos ? gridKoord(pos) : "—"}</div>
          <div class="k-g9-name">${cell ? cell.baslik : "—"}</div>
          <div class="k-g9-ax">Liderlik Potansiyeli: <b>${pos ? POT_ETIKET[pos.pot] : "—"}</b> · Performans: <b>${pos ? PERF_ETIKET[pos.perf] : "—"}</b></div>
          ${cell ? `<ul class="k-g9-desc">${cell.aciklama.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}
        </div>
        <div class="k-g9-r ${oneri === "Evet" ? "evet" : "hayir"}">
          <div class="k-g9-oneri-l">Sistem Önerisi</div>
          <div class="k-g9-oneri-v">${(oneri || "—").toLocaleUpperCase("tr")}</div>
          <div class="k-g9-oneri-s">Yetenek Havuzuna</div>
        </div>
      </div>
      <div class="k-gerekce"><b>Sistem Gerekçesi:</b> ${esc(pos ? sistemGerekce(ev) : "")}</div>
      <div class="k-cols">
        ${kutu("Potansiyel Yetkinlikleri (1–5) · Ort: " + esc(ev.ortalamaPotansiyel ?? "—"), ikili(potRows))}
        ${kutu("Performans (Düşük / Orta / Yüksek) · Sınıf: " + esc(ev.performansSinifi || "—"), ikili(perfRows))}
        ${kutu("Öğrenme Çevikliği (Var / Yok)", ikili(cevRows))}
        ${kutu("Planlama ve Yönlendirme", ikili(planRows))}
      </div>
      ${ev.gelisimAlanlari ? `<div class="k-note"><b>Gelişim Alanları:</b> ${esc(ev.gelisimAlanlari)}</div>` : ""}
      ${ev.gerekce ? `<div class="k-note"><b>Müdür Görüşü:</b> ${esc(ev.gerekce)}</div>` : ""}
      `}
    </section>`;
  }).join("");

  const css = `
    @page { size: A4; margin: 11mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1c2530; margin: 0; }
    .karne { page-break-after: always; padding: 0; }
    .karne:last-child { page-break-after: auto; }
    .k-top { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid #a9772c; padding-bottom: 10px; }
    .k-mark { width: 46px; height: 46px; background: #233047; color: #fff; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; flex: none; }
    .k-title { flex: 1; }
    .k-name { font-size: 20px; font-weight: 800; color: #233047; }
    .k-sub { font-size: 10.5px; color: #555; margin-top: 2px; }
    .k-brand { text-align: right; font-size: 10.5px; font-weight: 700; color: #a9772c; }
    .k-brand span { font-weight: 400; color: #777; font-size: 9px; }
    .k-grid9 { display: flex; gap: 10px; margin-top: 12px; }
    .k-g9-l { flex: 1; border: 1px solid #d9d3c6; border-left: 5px solid #233047; border-radius: 8px; padding: 9px 12px; }
    .k-g9-code { font-size: 15px; font-weight: 800; color: #233047; }
    .k-g9-name { font-size: 13px; font-weight: 700; color: #a9772c; margin-bottom: 3px; }
    .k-g9-ax { font-size: 10px; color: #444; }
    .k-g9-desc { margin: 6px 0 0; padding-left: 16px; font-size: 9.5px; color: #333; line-height: 1.35; }
    .k-g9-r { width: 150px; flex: none; border-radius: 8px; padding: 9px; text-align: center; color: #fff; display: flex; flex-direction: column; justify-content: center; }
    .k-g9-r.evet { background: #2e7d4f; } .k-g9-r.hayir { background: #a13030; }
    .k-g9-oneri-l { font-size: 10px; opacity: .9; } .k-g9-oneri-v { font-size: 26px; font-weight: 800; line-height: 1; } .k-g9-oneri-s { font-size: 10px; opacity: .9; }
    .k-gerekce { margin-top: 9px; font-size: 10.5px; line-height: 1.45; background: #faf8f3; border: 1px solid #e2ddd2; border-radius: 7px; padding: 8px 11px; }
    .k-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 9px; }
    .k-box { border: 1px solid #e2ddd2; border-radius: 7px; overflow: hidden; break-inside: avoid; }
    .k-h { background: #233047; color: #fff; font-size: 10.5px; font-weight: 700; padding: 5px 9px; }
    .k-grid { padding: 5px 9px; }
    .k-row { display: flex; justify-content: space-between; gap: 8px; font-size: 9.8px; padding: 2.5px 0; border-bottom: 1px dotted #eee; }
    .k-row span { color: #555; } .k-row b { color: #1c2530; text-align: right; }
    .k-note { margin-top: 8px; font-size: 10px; line-height: 1.45; border-left: 3px solid #a9772c; padding: 4px 10px; background: #fbfaf7; }
    .k-empty { margin-top: 30px; text-align: center; color: #888; font-size: 13px; }
  `;
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Yetenek Havuzu Karnesi</title><style>${css}</style></head><body>${sayfalar}</body></html>`;
  const w = window.open("", "_blank");
  if (!w) { toast("Yazdırma penceresi açılamadı. Tarayıcıda açılır pencerelere (popup) izin verin."); return; }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { try { w.print(); } catch (e) {} }, 500);
}

// Yönetim sunumu verisi (yalnız İK): güncel personel listesi + tüm değerlendirme kayıtları (taze/arşiv ayrımı ve
// 9-Grid konumu uygulamanın kendi hesabıyla). Serbest metin alanları (gerekçe, gelişim alanları vb.) DAHİL EDİLMEZ.
function exportSunumVerisi() {
  if (!currentProfile || !currentProfile.isAdmin) return;
  const ms = (t) => (t && t.toMillis ? t.toMillis() : null);
  const employees = employeesCache.map((e) => ({
    id: e.id, adSoyad: e.adSoyad || "", departman: e.departman || "", bolum: e.bolum || "", mevcutUnvan: e.mevcutUnvan || "",
    muduluk: e.muduluk || "", direktor: e.direktor || "", iseBaslamaTarihi: e.iseBaslamaTarihi || "", kurumKidemiYil: e.kurumKidemiYil ?? null
  }));
  const evaluations = Object.values(allEvalsMap).map((ev) => {
    const pos = gridPos(ev);
    return {
      id: ev.id, employeeId: ev.employeeId || "", adSoyad: ev.adSoyad || "", donem: ev.donem || "", status: ev.status || "",
      submittedByName: ev.submittedByName || "", arsiv: evalArsivMi(ev), tamamMi: !!isComplete(ev), updatedAt: ms(ev.updatedAt),
      departman: ev.departman || "", bolum: ev.bolum || "", muduluk: ev.muduluk || "",
      grid: pos ? { pot: pos.pot, perf: pos.perf, kod: gridKoord(pos), baslik: GRID9[pos.pot + "-" + pos.perf].baslik } : null,
      sistemOnerisi: ev.status ? (sistemOnerisi(ev) || "") : ""
    };
  });
  const veri = { uretim: new Date().toISOString(), aktifDonem, kidemEsik: KIDEM_ESIK, employees, evaluations };
  const blob = new Blob([JSON.stringify(veri)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `yetenek-havuzu-sunum-verisi-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`Sunum verisi indirildi: ${employees.length} çalışan, ${evaluations.length} değerlendirme kaydı.`);
}

function exportCsv() {
  const headers = ["Ad Soyad", "Departman", "Bölüm", "Unvan", "Müdür", "Kıdem", "Durum", "9-Grid Kod", "9-Grid Grubu", "Liderlik Pot. (eksen)", "Performans (eksen)", "Ort. Potansiyel", "Performans Sınıfı", "Sistem Önerisi (Havuz)", "Sistem Gerekçesi", "Yönetici Görüşü (Havuz)", "Liderlik Potansiyeli", "Hazır Olma Süresi", "Ayrılma Riski", "Fonksiyonel Geçişe Uygun", "Fonksiyonel Geçiş Departman/Rol", "Yedekleyebileceği Pozisyon", "Gelişim Alanları", "Gerekçe (Yönetici)", ...PERFORMANS_FIELDS.map(([, l]) => l)];
  const rows = adminRoster().map((e) => {
    const ev = evaluationsMap[e.id] || {};
    const pos = gridPos(ev);
    return [
      e.adSoyad, e.departman, e.bolum, e.mevcutUnvan, e.muduluk || "", formatKidem(e.kurumKidemiYil),
      ["tamamlandi", "taslak"].includes(ev.status) ? ev.status : (kidemDisi(e) ? "Kıdem<6ay (dışı)" : "bekliyor"),
      pos ? gridKoord(pos) : "", pos ? GRID9[pos.pot + "-" + pos.perf].baslik : "", pos ? POT_ETIKET[pos.pot] : "", pos ? PERF_ETIKET[pos.perf] : "",
      ev.ortalamaPotansiyel ?? "",
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
// ADMIN: YÖNETİM PANELİ (yalnız İK)
// Personel listesi, İK Sistemi'nin canlı personel verisinden (satisVeri/mrPersonel — yalnız İK okuyabilir) kurulur;
// kaynak kodda kişisel veri tutulmaz. Giriş hesapları İK Sistemi → Ayarlar → Erişim Ayarları → Kullanıcı
// Hesapları'ndan yönetilir. Kurallar eski roster üreticisiyle (roster_gen) birebir: aktif çalışanlar,
// stajyer ve Vİ hariç; kimlik = ad-soyaddan (devam eden değerlendirmeler kopmaz).
// ---------------------------------------------------------------
function rosterKimlik(ad) { return trFold(ad).toLowerCase().replace(/\s+/g, " ").trim().replace(/ /g, "."); }
function kidemYil(t) {
  const m = String(t || "").match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (!m) return 0;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return Math.round(((Date.now() - d.getTime()) / (365.25 * 864e5)) * 100) / 100;
}
async function rosterHazirla() {
  const s = await getDoc(doc(db, "satisVeri", "mrPersonel"));
  const d = s.exists() ? s.data() : null;
  if (!d || !Array.isArray(d.aktif) || d.aktif.length < 50) throw new Error("İK Sistemi'nin personel listesi okunamadı.");
  const temiz = (v) => String(v == null ? "" : v).trim();
  const emps = [], goruldu = {};
  d.aktif.forEach((p) => {
    const ad = temiz(p.ad).replace(/\s+/g, " ");
    if (!ad) return;
    const unvan = temiz(p.unvan), bolum = temiz(p.bolum), dept = temiz(p.departman);
    if (trFold(unvan).indexOf("STAJYER") >= 0 || trFold(bolum) === "STAJYER") return;
    if (trFold(dept).replace(/[^A-Z0-9]/g, "") === "VI") return;
    let id = rosterKimlik(ad);
    if (goruldu[id]) { let n = 2; while (goruldu[id + "-" + n]) n++; id = id + "-" + n; }
    goruldu[id] = true;
    let mud = temiz(p.mudurluk).replace(/[.\s]+$/, "").trim(); if (!mud || mud === "-") mud = "-";
    let dir = temiz(p.direktor).replace(/[.\s]+$/, "").trim(); if (dir === "-") dir = "";
    emps.push({ id, adSoyad: ad, departman: dept, bolum, mevcutUnvan: unvan, muduluk: mud, direktor: dir, iseBaslamaTarihi: temiz(p.giris), kurumKidemiYil: kidemYil(p.giris) });
  });
  // Boş direktör → kişinin müdürünün direktörü; yoksa "-"
  const adDir = {};
  emps.forEach((e) => { if (e.direktor) adDir[nameKey(e.adSoyad)] = e.direktor; });
  emps.forEach((e) => { if (!e.direktor) e.direktor = (e.muduluk !== "-" && adDir[nameKey(e.muduluk)]) ? adDir[nameKey(e.muduluk)] : "-"; });
  return emps;
}
function yoneticiAdlari() {
  return [...new Set(employeesCache.map((e) => e.muduluk).filter((m) => m && m !== "-"))].sort((a, b) => a.localeCompare(b, "tr"));
}

function openManagePanel() {
  if (!currentProfile || !currentProfile.isAdmin) return;
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="drawer">
      <div class="drawer-head">
        <div><h2>Yönetim</h2><div class="meta">Personel listesi ve değerlendirici kapsamları</div></div>
        <button class="close-x" id="closeMng">✕</button>
      </div>
      <div class="drawer-body">
        <div class="admin-panel" style="border:1.5px solid var(--brass);background:var(--warn-bg)">
          <div class="section-title" style="margin-top:0">★ ${escH(DEF_AKTIF)} Yıl Havuzu — Personel Listesini Güncelle</div>
          <p style="font-size:13px;color:var(--ink)">Güncel aktif çalışan listesi <b>İK Sistemi</b>'nden alınır (stajyer ve Vİ hariç). Listede artık olmayan kişiler havuzdan çıkar; <b>değerlendirmeleri silinmez</b>. Kişi kimlikleri ad-soyaddan üretildiği için devam eden değerlendirmeler kopmaz.</p>
          <button class="btn btn-ghost btn-sm" id="rosterOnizBtn">Önizle</button>
          <button class="btn btn-brass btn-sm" id="rosterUygBtn" disabled>Listeyi Güncelle</button>
          <div id="rosterMsg" style="font-size:12.5px;margin-top:8px;white-space:pre-line"></div>
        </div>
        <div class="admin-panel">
          <div class="section-title" style="margin-top:0">Değerlendiriciler</div>
          <p style="font-size:13px;color:var(--ink-soft)">Kimin kimleri değerlendireceği, personel listesindeki <b>Müdürlük</b> ve <b>Direktör</b> sütunlarından otomatik belirlenir. Giriş hesapları <b>İK Sistemi → Ayarlar → Erişim Ayarları → Kullanıcı Hesapları</b>'ndan açılır.</p>
          <div id="degerlendiriciList" style="font-size:13px"></div>
        </div>
        <div class="admin-panel">
          <div class="section-title" style="margin-top:0">Müdürü Eşleşmeyen Personel</div>
          <div id="unassignedList"></div>
        </div>
        <div id="haricOnarim"></div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  el("#closeMng").onclick = () => overlay.remove();
  // ONARIM: eski "havuzdan çıkar" sürümüyle personel kaydı silinmiş kişiler (yalnız varsa görünür)
  const onarimCiz = () => {
    const kutu = el("#haricOnarim"); if (!kutu) return;
    if (!haricListe.length) { kutu.innerHTML = ""; return; }
    kutu.innerHTML = `<div class="admin-panel" style="border:1.5px solid var(--warn);background:var(--warn-bg)">
      <div class="section-title" style="margin-top:0">Onarım · Silinen Personel Kayıtları</div>
      <p style="font-size:13px;color:var(--ink)">Şu kişilerin personel kaydı önceki bir işlemde yanlışlıkla silindi: <b>${haricListe.map(escH).join(", ")}</b>. “Geri yükle” bilgilerini İK Sistemi'nden alır; kişiler <b>normal çalışan</b> olarak listeye döner, toplam personele sayılır ve değerlendirmeleri olmadığı için <b>Bekliyor</b> görünür.</p>
      <button type="button" class="btn btn-brass btn-sm" id="onarimBtn">Personel kayıtlarını geri yükle (${haricListe.length})</button>
      <div id="onarimMsg" style="font-size:12.5px;margin-top:8px"></div>
    </div>`;
    el("#onarimBtn").onclick = async () => {
      const b = el("#onarimBtn"), msg = el("#onarimMsg");
      b.disabled = true; b.textContent = "Geri yükleniyor…";
      try {
        const eklenen = await personelGeriYukle(haricListe.slice());
        toast(`${eklenen.length} kişi personel listesine geri eklendi.`);
        msg.style.color = "var(--good)"; msg.textContent = "✓ Geri yüklendi: " + eklenen.join(", ");
        setTimeout(onarimCiz, 1500);
      } catch (e) {
        msg.style.color = "var(--bad)"; msg.textContent = "Hata: " + (e.code === "permission-denied" ? "bu işlem için yetkiniz yok." : e.message);
        b.disabled = false; b.textContent = `Personel kayıtlarını geri yükle (${haricListe.length})`;
      }
    };
  };
  onarimCiz();

  // ★ Personel listesi: önce önizle, sonra uygula
  let yeniRoster = null;
  el("#rosterOnizBtn").onclick = async () => {
    const msg = el("#rosterMsg"), b = el("#rosterOnizBtn");
    b.disabled = true; msg.style.color = "var(--ink-soft)"; msg.textContent = "İK Sistemi'nden okunuyor…";
    try {
      yeniRoster = await rosterHazirla();
      const eskiIds = new Set(employeesCache.map((e) => e.id)), yeniIds = new Set(yeniRoster.map((e) => e.id));
      const eklenen = yeniRoster.filter((e) => !eskiIds.has(e.id));
      const cikan = employeesCache.filter((e) => !yeniIds.has(e.id));
      const alan = ["adSoyad", "departman", "bolum", "mevcutUnvan", "muduluk", "direktor"];
      const degisen = yeniRoster.filter((e) => { const o = employeesCache.find((x) => x.id === e.id); return o && alan.some((k) => String(o[k] || "") !== String(e[k] || "")); });
      const ilk = (L) => L.slice(0, 8).map((e) => e.adSoyad).join(", ") + (L.length > 8 ? " …" : "");
      msg.style.color = "var(--ink)";
      msg.textContent = `Yeni liste: ${yeniRoster.length} kişi\n• Eklenecek: ${eklenen.length}${eklenen.length ? " (" + ilk(eklenen) + ")" : ""}\n• Havuzdan çıkacak: ${cikan.length}${cikan.length ? " (" + ilk(cikan) + ")" : ""}\n• Bilgisi güncellenecek: ${degisen.length}`;
      el("#rosterUygBtn").disabled = false;
    } catch (e) {
      msg.style.color = "var(--bad)"; msg.textContent = "Hata: " + (e.code === "permission-denied" ? "İK Sistemi verisine erişim yetkiniz yok." : e.message);
    }
    b.disabled = false;
  };
  el("#rosterUygBtn").onclick = async () => {
    const msg = el("#rosterMsg"), b = el("#rosterUygBtn");
    if (!yeniRoster || !yeniRoster.length) return;
    if (!confirm(`${DEF_AKTIF} havuzunun personel listesi ${yeniRoster.length} kişiyle güncellenecek. Değerlendirmeler silinmez. Devam edilsin mi?`)) return;
    b.disabled = true; b.textContent = "Güncelleniyor…"; msg.style.color = "var(--ink-soft)";
    try {
      const commitChunks = async (ops) => {
        for (let i = 0; i < ops.length; i += 400) {
          const batch = writeBatch(db);
          ops.slice(i, i + 400).forEach((fn) => fn(batch));
          await batch.commit();
        }
      };
      msg.textContent = "1/3 Dönemsiz eski değerlendirmeler etiketleniyor…";
      const evSnap = await getDocs(collection(db, "evaluations"));
      const evOps = [];
      evSnap.forEach((d) => { if (!d.data().donem) evOps.push((x) => x.set(doc(db, "evaluations", d.id), { donem: DEF_ESKI }, { merge: true })); });
      await commitChunks(evOps);
      msg.textContent = "2/3 Personel listesi yazılıyor…";
      const yeniIds = new Set(yeniRoster.map((e) => e.id));
      await commitChunks(yeniRoster.map((emp) => (x) => x.set(doc(db, "employees", emp.id), emp)));
      const empSnap = await getDocs(collection(db, "employees"));
      const delOps = [];
      empSnap.forEach((d) => { if (!yeniIds.has(d.id)) delOps.push((x) => x.delete(doc(db, "employees", d.id))); });
      if (delOps.length) await commitChunks(delOps);
      msg.textContent = "3/3 Dönem ayarı kaydediliyor…";
      await setDoc(doc(db, "managers", DONEM_AYAR_ID), { aktifDonem: DEF_AKTIF, donemler: DEF_DONEMLER, updatedAt: serverTimestamp() }, { merge: true });
      aktifDonem = DEF_AKTIF; donemList = DEF_DONEMLER; viewDonem = DEF_AKTIF;
      msg.style.color = "var(--good)";
      msg.textContent = `✓ Personel listesi güncellendi: ${yeniRoster.length} kişi${delOps.length ? ", " + delOps.length + " kişi havuzdan çıkarıldı (değerlendirmeleri korunuyor)" : ""}.`;
      yeniRoster = null;
    } catch (e) {
      msg.style.color = "var(--bad)"; msg.textContent = "Hata: " + (e.code === "permission-denied" ? "bu işlem için yetkiniz yok." : e.message);
    }
    b.textContent = "Listeyi Güncelle";
  };

  // Değerlendiriciler (otomatik)
  (function () {
    const mud = {}, dir = {};
    employeesCache.forEach((e) => {
      if (e.muduluk && e.muduluk !== "-" && e.adSoyad !== e.muduluk) mud[e.muduluk] = (mud[e.muduluk] || 0) + 1;
      if (e.direktor && e.direktor !== "-") dir[e.direktor] = (dir[e.direktor] || 0) + 1;
    });
    const satir = (ad, n, tur) => `<tr><td>${escH(ad)}</td><td>${tur}</td><td style="text-align:right">${n}</td></tr>`;
    const mL = Object.keys(mud).sort((a, b) => a.localeCompare(b, "tr")), dL = Object.keys(dir).sort((a, b) => a.localeCompare(b, "tr"));
    el("#degerlendiriciList").innerHTML = (mL.length || dL.length)
      ? `<table><thead><tr><th>Ad Soyad</th><th>Rol</th><th style="text-align:right">Kişi</th></tr></thead><tbody>${dL.map((d) => satir(d, dir[d], "Direktör")).join("")}${mL.map((m) => satir(m, mud[m], "Müdür")).join("")}</tbody></table>`
      : `<p style="color:var(--ink-soft)">Personel listesinde müdür/direktör bilgisi yok.</p>`;
  })();

  function drawUnassigned() {
    const un = employeesCache.filter((e) => !e.muduluk || e.muduluk === "-");
    const adlar = yoneticiAdlari();
    el("#unassignedList").innerHTML = un.length
      ? un.map((e) => `
        <div class="emp-card" style="cursor:default">
          <div class="main"><b>${escH(e.adSoyad)}</b><div class="meta">${escH(e.departman || "")} / ${escH(e.bolum || "")}</div></div>
          <select data-id="${escH(e.id)}" class="assignSel">
            <option value="">Müdür seç…</option>
            ${adlar.map((m) => `<option value="${escH(m)}">${escH(m)}</option>`).join("")}
          </select>
        </div>`).join("")
      : `<p style="font-size:13px;color:var(--ink-soft)">Tüm personelin müdürü tanımlı.</p>`;
    document.querySelectorAll(".assignSel").forEach((sel) => {
      sel.addEventListener("change", async () => {
        if (!sel.value) return;
        try { await setDoc(doc(db, "employees", sel.dataset.id), { muduluk: sel.value }, { merge: true }); toast("Müdür ataması güncellendi."); }
        catch (e) { toast("Kaydedilemedi: " + e.message); }
      });
    });
  }
  drawUnassigned();
}

// ---------------------------------------------------------------
// BAŞLAT — tüm tanımlar yüklendikten sonra giriş istenir
// ---------------------------------------------------------------
baslat();
