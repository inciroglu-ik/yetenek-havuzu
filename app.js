import { app, firebaseConfig, LOGIN_DOMAIN } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword
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

const POTANSIYEL_FIELDS = [
  ["musteriOdaklilik", "Müşteri Odaklılık", "İç/dış müşteriler ile güçlü bağlar kurmak ve müşteri merkezli çözümler sunmak."],
  ["belirsizlikYonetimi", "Belirsizliği Yönetmek", "İşler veya yolun gidişatı belirgin olmasa bile etkili biçimde çalışmak."],
  ["sonucOdaklilik", "Sonuç Odaklılık", "Zorlu koşullar altında bile tutarlı biçimde sonuç elde eder."],
  ["isbirligiGelistirme", "İş Birliği Geliştirmek", "Ortak hedeflere ulaşmak için ortaklıklar kurar ve iş birliği yapar."],
  ["kisiselFarkindalik", "Kişisel Farkındalık Göstermek", "Geri bildirim ve özdüşünümle güçlü/zayıf yanlarına dair içgörü edinmek."],
  ["sorumlulukAlma", "Sorumluluk Almak", "Kendini ve başkalarını taahhütleri yerine getirme konusunda sorumlu tutar."],
  ["stratejikDusunme", "Stratejik Düşünme", "Gelecek olasılıkları önceden görüp çığır açan stratejilere dönüştürmek."],
  ["vizyonAmac", "Vizyon ve Amacı Sürdürmek", "Başkalarını harekete geçiren, etkileyici bir vizyon ve stratejiyi görünür kılar."],
  ["guvenYaratma", "Güven Yaratma", "Dürüstlük, doğruluk ve güvenilirlik yoluyla başkalarının güvenini kazanmak."]
];

const CEVIKLIK_FIELDS = [
  ["zihinselCeviklik", "Zihinsel Çeviklik", "Meraklıdır ve yeni, karmaşık durumlarla mücadele edebilir."],
  ["insanCevikligi", "İnsan Çevikliği", "Anlayışlı, kişilerarası durumlar ve işleri halletmekte ustalık sergiler."],
  ["degisimCevikligi", "Değişim Çevikliği", "Değişimin tadını çıkarır, yeni yaklaşımlar inşa etmekten keyif alır."],
  ["sonucCevikligi", "Sonuç Çevikliği", "Engellere rağmen esneklikle sonuçlara ulaşır."],
  ["durumsalOzFarkindalik", "Durumsal Öz Farkındalık", "Anın koşullarına göre kendi etkisini fark eder, yaklaşımını uyarlar."]
];

const TEKNIK_FIELDS = [
  ["isBilgisi", "İş Bilgisi ve Mesleki Hakimiyet", "Rolünün gerektirdiği teknik donanım, mevzuat ve işleyişe hakimiyet."],
  ["dijitalYetkinlik", "Dijital Yetkinlik", "Dijital araç ve teknolojileri etkin kullanma; değişime direnç göstermeme."],
  ["iknaMuzakere", "İkna ve Müzakere Gücü", "Fikrini karşı tarafın ihtiyaç ve motivasyonlarını anlayarak kabul ettirebilme."],
  ["kurumsalDeger", "Kurumsal Değerlere Uyum ve Temsil", "Kurum kültürü ve profesyonel standartları her ortamda yansıtma."]
];

function computeDerived(d) {
  const pVals = POTANSIYEL_FIELDS.map(([k]) => d.potansiyel?.[k]).filter((v) => v);
  const ortalamaPotansiyel = pVals.length ? pVals.reduce((a, b) => a + b, 0) / POTANSIYEL_FIELDS.length : 0;
  const cVals = CEVIKLIK_FIELDS.map(([k]) => d.ogrenmeCevikligi?.[k]);
  const cFilled = cVals.filter((v) => v !== undefined && v !== null);
  const ortalamaOgrenmeCevikligi = cFilled.length ? cFilled.filter(Boolean).length / CEVIKLIK_FIELDS.length : 0;
  const tVals = TEKNIK_FIELDS.map(([k]) => d.teknikHakimiyet?.[k]).filter((v) => v);
  const teknikHakimiyetOrt = tVals.length ? tVals.reduce((a, b) => a + b, 0) / TEKNIK_FIELDS.length : 0;
  const hazir = ortalamaPotansiyel > 3.75 && ortalamaOgrenmeCevikligi > 0.7 && teknikHakimiyetOrt > 3.25;
  return {
    ortalamaPotansiyel: Math.round(ortalamaPotansiyel * 100) / 100,
    ortalamaOgrenmeCevikligi: Math.round(ortalamaOgrenmeCevikligi * 100) / 100,
    teknikHakimiyetOrt: Math.round(teknikHakimiyetOrt * 100) / 100,
    potansiyelDegerlendirme: hazir ? "EĞİTİM VERİLİP ASSESSMENT YAPILABİLİR" : "GELİŞİM İHTİYACI"
  };
}

function isComplete(d) {
  const pOk = POTANSIYEL_FIELDS.every(([k]) => d.potansiyel?.[k]);
  const cOk = CEVIKLIK_FIELDS.every(([k]) => d.ogrenmeCevikligi?.[k] !== undefined && d.ogrenmeCevikligi?.[k] !== null);
  const tOk = TEKNIK_FIELDS.every(([k]) => d.teknikHakimiyet?.[k]);
  return pOk && cOk && tOk && d.liderlikPotansiyeli && d.hazirOlmaSuresi && d.ayrilmaRiski && d.gerekce && d.gerekce.trim().length > 0;
}

// ---------------------------------------------------------------
// State
// ---------------------------------------------------------------
let currentUid = null;
let currentProfile = null; // { role, adSoyad, muduluk, username }
let employeesCache = [];   // from Firestore 'employees'
let evaluationsMap = {};   // employeeId -> evaluation doc
let unsubEval = null;
let unsubEmp = null;

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
    const snap = await getDoc(doc(db, "managers", user.uid));
    if (!snap.exists()) {
      renderLogin("Bu hesap sisteme tanımlı değil. Lütfen yöneticinizle (İK) iletişime geçin.");
      await signOut(auth);
      return;
    }
    currentProfile = snap.data();
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
  const isAdmin = currentProfile.role === "admin";
  const q = isAdmin
    ? collection(db, "evaluations")
    : query(collection(db, "evaluations"), where("muduluk", "==", currentProfile.muduluk));
  unsubEval = onSnapshot(q, (qs) => {
    evaluationsMap = {};
    qs.forEach((d) => (evaluationsMap[d.id] = { id: d.id, ...d.data() }));
    render();
  }, (err) => console.error(err));
}

function render() {
  if (currentProfile.role === "admin") renderAdmin();
  else renderManager();
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
function topbar() {
  const isAdmin = currentProfile.role === "admin";
  return `
  <div class="topbar">
    <div class="brand">
      <div class="mark">İH</div>
      <div class="t">Yetenek Havuzu<small>${isAdmin ? "İK Değerlendirme Paneli" : "Müdür Değerlendirme Ekranı"}</small></div>
    </div>
    <div class="who">
      <span class="pill">${isAdmin ? "İK / Admin" : "Müdür"}</span>
      <span><b>${currentProfile.adSoyad}</b></span>
      <button class="btn btn-ghost btn-sm" id="logoutBtn">Çıkış</button>
    </div>
  </div>`;
}

function wireTopbar() {
  el("#logoutBtn").addEventListener("click", () => signOut(auth));
}

// ---------------------------------------------------------------
// MANAGER VIEW
// ---------------------------------------------------------------
function renderManager() {
  const myEmployees = employeesCache.filter((e) => e.muduluk === currentProfile.muduluk);
  const total = myEmployees.length;
  const done = myEmployees.filter((e) => evaluationsMap[e.id]?.status === "tamamlandi").length;
  const draft = myEmployees.filter((e) => evaluationsMap[e.id]?.status === "taslak").length;
  const pending = total - done - draft;

  root().innerHTML = `
  ${topbar()}
  <div class="wrap">
    <div class="page-head">
      <div>
        <h1>Ekibimin Değerlendirmesi</h1>
        <p>${currentProfile.muduluk} ekibine bağlı ${total} kişi için yetenek havuzu değerlendirmesi.</p>
      </div>
    </div>
    <div class="stat-row">
      <div class="stat-card"><div class="n">${total}</div><div class="l">Toplam Personel</div></div>
      <div class="stat-card"><div class="n">${done}</div><div class="l">Tamamlandı</div></div>
      <div class="stat-card"><div class="n">${draft}</div><div class="l">Taslak</div></div>
      <div class="stat-card"><div class="n">${pending}</div><div class="l">Bekliyor</div></div>
    </div>
    <div class="toolbar">
      <input type="text" id="searchBox" placeholder="İsimle ara…" style="min-width:220px">
      <select id="statusFilter">
        <option value="">Tüm Durumlar</option>
        <option value="tamamlandi">Tamamlandı</option>
        <option value="taslak">Taslak</option>
        <option value="bekliyor">Bekliyor</option>
      </select>
    </div>
    <div class="card-list" id="empList"></div>
  </div>`;
  wireTopbar();

  function draw() {
    const term = el("#searchBox").value.trim().toLocaleLowerCase("tr");
    const statusF = el("#statusFilter").value;
    const list = myEmployees
      .filter((e) => e.adSoyad.toLocaleLowerCase("tr").includes(term))
      .filter((e) => {
        const st = evaluationsMap[e.id]?.status || "bekliyor";
        return !statusF || st === statusF;
      })
      .sort((a, b) => a.adSoyad.localeCompare(b.adSoyad, "tr"));

    el("#empList").innerHTML = list.length
      ? list.map((e) => empCardHtml(e)).join("")
      : `<div class="empty-state">Aramanızla eşleşen personel bulunamadı.</div>`;

    list.forEach((e) => {
      document.getElementById("card-" + e.id).addEventListener("click", () => openEvalDrawer(e));
    });
  }

  function empCardHtml(e) {
    const ev = evaluationsMap[e.id];
    const st = ev?.status || "bekliyor";
    const stLabel = st === "tamamlandi" ? "Tamamlandı" : st === "taslak" ? "Taslak" : "Bekliyor";
    return `
    <div class="emp-card" id="card-${e.id}" style="cursor:pointer">
      <div class="main">
        <b>${e.adSoyad}</b>
        <div class="meta">${e.mevcutUnvan || ""} · ${e.departman || ""} / ${e.bolum || ""}</div>
      </div>
      <span class="status-badge status-${st}">${stLabel}</span>
    </div>`;
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
    teknikHakimiyet: { ...(existing.teknikHakimiyet || {}) },
    liderlikPotansiyeli: existing.liderlikPotansiyeli || "",
    yetenekHavuzuAlinmali: existing.yetenekHavuzuAlinmali || "",
    hazirOlmaSuresi: existing.hazirOlmaSuresi || "",
    yedekPozisyonlar: existing.yedekPozisyonlar || "",
    ayrilmaRiski: existing.ayrilmaRiski || "",
    gelisimAlanlari: existing.gelisimAlanlari || "",
    fonksiyonelGecisUygun: existing.fonksiyonelGecisUygun || "",
    fonksiyonelGecisDept: existing.fonksiyonelGecisDept || "",
    egitimOnerileri: existing.egitimOnerileri || [],
    gerekce: existing.gerekce || ""
  };

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="drawer">
      <div class="drawer-head">
        <div>
          <h2>${emp.adSoyad}</h2>
          <div class="meta">${emp.mevcutUnvan || ""} · ${emp.departman || ""} / ${emp.bolum || ""} · Kurum kıdemi bilgisi personel kayıtlarından alınır</div>
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
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  el("#closeDrawer").onclick = () => overlay.remove();

  function segHtml(groupKey, key, label, desc, options, isBool) {
    const val = groupKey ? d[groupKey][key] : d[key];
    return `
    <div class="comp-row">
      <div class="q">${label}<br><span style="font-weight:400;color:var(--ink-soft);font-size:12px">${desc}</span></div>
      <div class="seg ${isBool ? "two" : ""}" data-group="${groupKey || ""}" data-key="${key}">
        ${options.map((o) => `<button type="button" data-v="${o.v}" class="${val == o.v ? "active" : ""}">${o.l}</button>`).join("")}
      </div>
    </div>`;
  }

  const trainingOptions = TRAININGS.map((t) => `${t.kategori} — ${t.baslik.split(":")[0]}`);

  function summaryHtml() {
    const der = computeDerived(d);
    return `
    <div class="summary-box">
      <div class="row"><span>Ortalama Potansiyel</span><b>${der.ortalamaPotansiyel} / 5</b></div>
      <div class="row"><span>Öğrenme Çevikliği Oranı</span><b>${Math.round(der.ortalamaOgrenmeCevikligi * 100)}%</b></div>
      <div class="row"><span>Teknik Hakimiyet Ortalaması</span><b>${der.teknikHakimiyetOrt} / 5</b></div>
      <div class="verdict ${der.potansiyelDegerlendirme.includes("GELİŞİM") ? "dev" : "ok"}">${der.potansiyelDegerlendirme}</div>
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
    <div class="comp-row">
      <div class="q">Liderlik Potansiyeli / Ekip Yönetim Potansiyeli</div>
      <div class="seg two" data-key="liderlikPotansiyeli">
        ${["Var", "Yok"].map((o) => `<button type="button" data-v="${o}" class="${d.liderlikPotansiyeli === o ? "active" : ""}">${o}</button>`).join("")}
      </div>
    </div>

    <div class="section-title">Potansiyel Yetkinlikleri (1–5)</div>
    ${POTANSIYEL_FIELDS.map(([k, l, ds]) => segHtml("potansiyel", k, l, ds, SCORE_LABELS.map((s) => ({ v: s.v, l: s.l })))).join("")}

    <div class="section-title">Öğrenme Çevikliği (Var / Yok)</div>
    ${CEVIKLIK_FIELDS.map(([k, l, ds]) => segHtml("ogrenmeCevikligi", k, l, ds, [{ v: "true", l: "Var" }, { v: "false", l: "Yok" }], true)).join("")}

    <div class="section-title">Teknik Hakimiyet (1–5)</div>
    ${TEKNIK_FIELDS.map(([k, l, ds]) => segHtml("teknikHakimiyet", k, l, ds, SCORE_LABELS.map((s) => ({ v: s.v, l: s.l })))).join("")}

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
    <div class="field">
      <label>Önerilen Eğitimler (en fazla 5)</label>
      <div class="checklist" id="egitimList">
        ${trainingOptions.map((t, i) => `
          <label><input type="checkbox" value="${t}" ${d.egitimOnerileri.includes(t) ? "checked" : ""}> ${t}</label>
        `).join("")}
      </div>
    </div>
    <div class="field">
      <label>Gerekçe (Vaka / Çıktı / Reaksiyon — en az birini temel alınız)</label>
      <textarea id="gerekce" rows="4" placeholder="Hangi olayda bu yetkinliği sergiledi? Hangi iş sonucuna katkı sağladı? Hangi krizde inisiyatif aldı?">${d.gerekce || ""}</textarea>
    </div>`;
  }

  function refresh() {
    el("#drawerBody").innerHTML = bodyHtml();
    wireInteractions();
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
        });
      });
    });
    ["hazirOlmaSuresi", "ayrilmaRiski", "yedekPozisyonlar", "gelisimAlanlari", "fonksiyonelGecisUygun", "fonksiyonelGecisDept", "gerekce"].forEach((id) => {
      const node = document.getElementById(id);
      if (node) node.addEventListener("input", () => (d[id] = node.value));
    });
    const egitimList = document.getElementById("egitimList");
    if (egitimList) {
      egitimList.addEventListener("change", (e) => {
        const checked = Array.from(egitimList.querySelectorAll("input:checked")).map((c) => c.value);
        if (checked.length > 5) {
          e.target.checked = false;
          toast("En fazla 5 eğitim seçebilirsiniz.");
          return;
        }
        d.egitimOnerileri = checked;
      });
    }
  }

  refresh();

  async function save(status) {
    const der = computeDerived(d);
    const payload = {
      employeeId: emp.id,
      adSoyad: emp.adSoyad,
      departman: emp.departman || "",
      bolum: emp.bolum || "",
      unvan: emp.mevcutUnvan || "",
      muduluk: emp.muduluk,
      ...d,
      ...der,
      status,
      submittedByUid: currentUid,
      submittedByName: currentProfile.adSoyad,
      updatedAt: serverTimestamp()
    };
    try {
      await setDoc(doc(db, "evaluations", emp.id), payload, { merge: true });
      toast(status === "tamamlandi" ? "Değerlendirme tamamlandı olarak kaydedildi." : "Taslak kaydedildi.");
      overlay.remove();
    } catch (e) {
      toast("Kaydedilemedi: " + e.message);
    }
  }

  el("#saveDraft").onclick = () => save("taslak");
  el("#saveFinal").onclick = () => {
    if (!isComplete(d)) {
      toast("Tamamlamak için tüm yetkinlikleri, hazır olma süresini, ayrılma riskini ve gerekçeyi doldurun.");
      return;
    }
    save("tamamlandi");
  };
}

// ---------------------------------------------------------------
// ADMIN VIEW
// ---------------------------------------------------------------
function renderAdmin() {
  const total = employeesCache.length;
  const done = employeesCache.filter((e) => evaluationsMap[e.id]?.status === "tamamlandi").length;
  const draft = employeesCache.filter((e) => evaluationsMap[e.id]?.status === "taslak").length;
  const noManager = employeesCache.filter((e) => !e.muduluk).length;
  const managers = Array.from(new Set(employeesCache.map((e) => e.muduluk).filter(Boolean))).sort((a, b) => a.localeCompare(b, "tr"));
  const depts = Array.from(new Set(employeesCache.map((e) => e.departman).filter(Boolean))).sort((a, b) => a.localeCompare(b, "tr"));

  root().innerHTML = `
  ${topbar()}
  <div class="wrap">
    <div class="page-head">
      <div>
        <h1>İK Değerlendirme Paneli</h1>
        <p>Tüm müdürlerden gelen yetenek havuzu değerlendirmelerini canlı olarak izleyin.</p>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost btn-sm" id="exportCsv">CSV İndir</button>
        <button class="btn btn-ghost btn-sm" id="manageBtn">Yönetim</button>
      </div>
    </div>
    <div class="stat-row">
      <div class="stat-card"><div class="n">${total}</div><div class="l">Toplam Personel</div></div>
      <div class="stat-card"><div class="n">${done}</div><div class="l">Tamamlandı</div></div>
      <div class="stat-card"><div class="n">${draft}</div><div class="l">Taslak</div></div>
      <div class="stat-card"><div class="n">${total - done - draft}</div><div class="l">Bekliyor</div></div>
    </div>
    ${noManager ? `<div class="error-box" style="display:block;background:var(--warn-bg);color:var(--warn)">${noManager} personelin müdürü eşleşmedi. "Yönetim" menüsünden atayabilirsiniz.</div>` : ""}
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
    </div>
    <div class="table-scroll">
      <table>
        <thead><tr>
          <th>Ad Soyad</th><th>Departman</th><th>Bölüm</th><th>Müdür</th><th>Durum</th>
          <th>Potansiyel</th><th>Öğr. Çeviklik</th><th>Teknik</th><th>Değerlendirme</th><th>Ayrılma Riski</th><th>Güncelleme</th>
        </tr></thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>
  </div>`;
  wireTopbar();

  function draw() {
    const term = el("#searchBox").value.trim().toLocaleLowerCase("tr");
    const mgrF = el("#managerFilter").value;
    const deptF = el("#deptFilter").value;
    const stF = el("#statusFilter").value;
    const list = employeesCache
      .filter((e) => e.adSoyad.toLocaleLowerCase("tr").includes(term))
      .filter((e) => !mgrF || e.muduluk === mgrF)
      .filter((e) => !deptF || e.departman === deptF)
      .filter((e) => {
        const st = evaluationsMap[e.id]?.status || "bekliyor";
        return !stF || st === stF;
      })
      .sort((a, b) => a.adSoyad.localeCompare(b.adSoyad, "tr"));

    el("#tbody").innerHTML = list.map((e) => {
      const ev = evaluationsMap[e.id];
      const st = ev?.status || "bekliyor";
      const stLabel = st === "tamamlandi" ? "Tamamlandı" : st === "taslak" ? "Taslak" : "Bekliyor";
      const upd = ev?.updatedAt?.toDate ? ev.updatedAt.toDate().toLocaleDateString("tr-TR") : "—";
      return `<tr>
        <td><b>${e.adSoyad}</b></td>
        <td>${e.departman || ""}</td>
        <td>${e.bolum || ""}</td>
        <td>${e.muduluk || '<span style="color:var(--bad)">Atanmadı</span>'}</td>
        <td><span class="status-badge status-${st}">${stLabel}</span></td>
        <td>${ev?.ortalamaPotansiyel ?? "—"}</td>
        <td>${ev ? Math.round((ev.ortalamaOgrenmeCevikligi || 0) * 100) + "%" : "—"}</td>
        <td>${ev?.teknikHakimiyetOrt ?? "—"}</td>
        <td style="font-size:11.5px">${ev?.potansiyelDegerlendirme || "—"}</td>
        <td>${ev?.ayrilmaRiski || "—"}</td>
        <td>${upd}</td>
      </tr>`;
    }).join("") || `<tr><td colspan="11" class="empty-state">Kayıt bulunamadı.</td></tr>`;
  }

  ["searchBox", "managerFilter", "deptFilter", "statusFilter"].forEach((id) => {
    el("#" + id).addEventListener("input", draw);
    el("#" + id).addEventListener("change", draw);
  });
  draw();

  el("#exportCsv").addEventListener("click", exportCsv);
  el("#manageBtn").addEventListener("click", openManagePanel);
}

function exportCsv() {
  const headers = ["Ad Soyad", "Departman", "Bölüm", "Unvan", "Müdür", "Durum", "Ort. Potansiyel", "Öğr. Çeviklik %", "Teknik Ort.", "Değerlendirme", "Hazır Olma Süresi", "Ayrılma Riski", "Yedekleyebileceği Pozisyon", "Gelişim Alanları", "Gerekçe"];
  const rows = employeesCache.map((e) => {
    const ev = evaluationsMap[e.id] || {};
    return [
      e.adSoyad, e.departman, e.bolum, e.mevcutUnvan, e.muduluk || "",
      ev.status || "bekliyor", ev.ortalamaPotansiyel ?? "", ev.ortalamaOgrenmeCevikligi != null ? Math.round(ev.ortalamaOgrenmeCevikligi * 100) : "",
      ev.teknikHakimiyetOrt ?? "", ev.potansiyelDegerlendirme || "", ev.hazirOlmaSuresi || "", ev.ayrilmaRiski || "",
      ev.yedekPozisyonlar || "", ev.gelisimAlanlari || "", (ev.gerekce || "").replace(/\n/g, " ")
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
        <div class="admin-panel">
          <div class="section-title" style="margin-top:0">1. Personel Listesi</div>
          <p style="font-size:13px;color:var(--ink-soft)">Firestore'da <b>${employeesCache.length}</b> personel kayıtlı (Excel'den yüklenen: ${EMPLOYEES.length}).</p>
          <button class="btn btn-ghost btn-sm" id="seedBtn">Excel Listesini Yeniden Yükle / Güncelle</button>
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
    qs.forEach((d) => rows.push({ id: d.id, ...d.data() }));
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
