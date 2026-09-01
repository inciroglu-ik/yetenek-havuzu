// ============================================================
// 2026 DONEM VERISI - otomatik uretildi (yetenek_gen2.ps1)
// Kaynak: Calisan Listesi - Eyl 2026.xlsx (Indirilenler, 01.09.2026)
// Stajyer + V.I. + Analist Ogrenci HARIC | Sadece Aktif
// ============================================================
const AKTIF_DONEM = "2026";
const ESKI_DONEM = "2026";
const DONEMLER = ["2026"];
const VARSAYILAN_SIFRE = "inciroglu01";
const ROSTER_2026 = [
    {
        "id":  "ahmet.gokpinar",
        "adSoyad":  "AHMET GÖKPINAR",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Araç Alım Yöneticisi",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "14/06/2008",
        "kurumKidemiYil":  18.21
    },
    {
        "id":  "ali.yagci",
        "adSoyad":  "ALİ YAĞCI",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Müdürü",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "02/03/2015",
        "kurumKidemiYil":  11.5
    },
    {
        "id":  "aykut.ozden",
        "adSoyad":  "AYKUT ÖZDEN",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Araç Alım Uzmanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "01/04/2021",
        "kurumKidemiYil":  5.42
    },
    {
        "id":  "celalettin.kayabasi",
        "adSoyad":  "CELALETTİN KAYABAŞI",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Oto Yıkama Elemanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "18/08/2025",
        "kurumKidemiYil":  1.04
    },
    {
        "id":  "emrah.kilic",
        "adSoyad":  "EMRAH KILIÇ",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Oto Yıkama Elemanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "08/12/2025",
        "kurumKidemiYil":  0.73
    },
    {
        "id":  "fikri.pinar",
        "adSoyad":  "FİKRİ PINAR",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Showrom Elemanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "10/01/2023",
        "kurumKidemiYil":  3.64
    },
    {
        "id":  "halit.yildiz",
        "adSoyad":  "HALİT YILDIZ",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "24/08/2026",
        "kurumKidemiYil":  0.02
    },
    {
        "id":  "hasan.huseyin.tekgoz",
        "adSoyad":  "HASAN HÜSEYİN TEKGÖZ",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Araç Alım Uzmanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "08/05/2023",
        "kurumKidemiYil":  3.32
    },
    {
        "id":  "hatem.tigli",
        "adSoyad":  "HATEM TIĞLI",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Showrom Elemanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "24/04/2023",
        "kurumKidemiYil":  3.36
    },
    {
        "id":  "huseyin.unlu",
        "adSoyad":  "HÜSEYİN ÜNLÜ",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "05/06/2023",
        "kurumKidemiYil":  3.24
    },
    {
        "id":  "husne.aslihan.ozdemir",
        "adSoyad":  "HÜSNE ASLIHAN ÖZDEMİR",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Lojistik Uzmanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "02/05/2016",
        "kurumKidemiYil":  10.33
    },
    {
        "id":  "mustafa.andac",
        "adSoyad":  "MUSTAFA ANDAÇ",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Araç Hazırlama Uzmanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "10/06/2025",
        "kurumKidemiYil":  1.23
    },
    {
        "id":  "mustafa.sivkagil",
        "adSoyad":  "MUSTAFA ŞIVKAGİL",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Lojistik Uzmanı",
        "muduluk":  "GÖKHAN ALTUNDAL",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "21/07/2026",
        "kurumKidemiYil":  0.11
    },
    {
        "id":  "naciye.kaya",
        "adSoyad":  "NACİYE KAYA",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Resepsiyon Elemanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "20/12/2023",
        "kurumKidemiYil":  2.7
    },
    {
        "id":  "osman.ustuner",
        "adSoyad":  "OSMAN ÜSTÜNER",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "20/08/2024",
        "kurumKidemiYil":  2.03
    },
    {
        "id":  "semra.turkmen",
        "adSoyad":  "SEMRA TÜRKMEN",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Lojistik Uzmanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "01/06/2017",
        "kurumKidemiYil":  9.25
    },
    {
        "id":  "senay.eroglu",
        "adSoyad":  "ŞENAY EROĞLU",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "İkram Görevlisi",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "05/06/2023",
        "kurumKidemiYil":  3.24
    },
    {
        "id":  "seyithan.temizsoy",
        "adSoyad":  "SEYİTHAN TEMİZSOY",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "29/11/2024",
        "kurumKidemiYil":  1.75
    },
    {
        "id":  "sukru.sevim",
        "adSoyad":  "ŞÜKRÜ SEVİM",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "23/11/2021",
        "kurumKidemiYil":  4.77
    },
    {
        "id":  "tolgahan.tarik.ayata",
        "adSoyad":  "TOLGAHAN TARIK AYATA",
        "departman":  "2. EL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "19/03/2025",
        "kurumKidemiYil":  1.45
    },
    {
        "id":  "emre.tugrul",
        "adSoyad":  "EMRE TUĞRUL",
        "departman":  "ARJ",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "UFUK ÖNSAL",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "19/09/2025",
        "kurumKidemiYil":  0.95
    },
    {
        "id":  "ibrahim.cakir",
        "adSoyad":  "İBRAHİM ÇAKIR",
        "departman":  "ARJ",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "UFUK ÖNSAL",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "16/09/2024",
        "kurumKidemiYil":  1.96
    },
    {
        "id":  "ufuk.onsal",
        "adSoyad":  "UFUK ÖNSAL",
        "departman":  "ARJ",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Müdürü",
        "muduluk":  "UFUK ÖNSAL",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "03/11/2025",
        "kurumKidemiYil":  0.83
    },
    {
        "id":  "ibrahim.enes.altunbag",
        "adSoyad":  "İBRAHİM ENES ALTUNBAĞ",
        "departman":  "BİLGİ İŞLEM",
        "bolum":  "İdari",
        "mevcutUnvan":  "Bilgi İşlem Yardımcısı",
        "muduluk":  "RIZA ÇETİNYÜREK",
        "direktor":  "MELİS SU İNCİROĞLU",
        "iseBaslamaTarihi":  "19/02/2025",
        "kurumKidemiYil":  1.53
    },
    {
        "id":  "riza.cetinyurek",
        "adSoyad":  "RIZA ÇETİNYÜREK",
        "departman":  "BİLGİ İŞLEM",
        "bolum":  "İdari",
        "mevcutUnvan":  "Bilgi İşlem Yöneticisi",
        "muduluk":  "RIZA ÇETİNYÜREK",
        "direktor":  "MELİS SU İNCİROĞLU",
        "iseBaslamaTarihi":  "12/05/2018",
        "kurumKidemiYil":  8.31
    },
    {
        "id":  "cavus.karakaya",
        "adSoyad":  "ÇAVUŞ KARAKAYA",
        "departman":  "BMW",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "PELİN ARAS",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "02/08/2023",
        "kurumKidemiYil":  3.08
    },
    {
        "id":  "cuma.calik",
        "adSoyad":  "CUMA ÇALIK",
        "departman":  "BMW",
        "bolum":  "Satış",
        "mevcutUnvan":  "Showrom Elemanı",
        "muduluk":  "PELİN ARAS",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "15/12/2023",
        "kurumKidemiYil":  2.71
    },
    {
        "id":  "furkan.benli",
        "adSoyad":  "FURKAN BENLİ",
        "departman":  "BMW",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "PELİN ARAS",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "21/04/2025",
        "kurumKidemiYil":  1.36
    },
    {
        "id":  "mehmet.aydin",
        "adSoyad":  "MEHMET AYDIN",
        "departman":  "BMW",
        "bolum":  "Satış",
        "mevcutUnvan":  "Lojistik Uzmanı",
        "muduluk":  "PELİN ARAS",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "18/07/2024",
        "kurumKidemiYil":  2.12
    },
    {
        "id":  "meryem.armagan",
        "adSoyad":  "MERYEM ARMAĞAN",
        "departman":  "BMW",
        "bolum":  "Satış",
        "mevcutUnvan":  "Resepsiyon Elemanı",
        "muduluk":  "PELİN ARAS",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "01/03/2025",
        "kurumKidemiYil":  1.5
    },
    {
        "id":  "nuri.efe.kucukoglu",
        "adSoyad":  "NURİ EFE KÜÇÜKOĞLU",
        "departman":  "BMW",
        "bolum":  "Satış",
        "mevcutUnvan":  "Teslimat Sorumlusu",
        "muduluk":  "PELİN ARAS",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "12/12/2025",
        "kurumKidemiYil":  0.72
    },
    {
        "id":  "osman.sami.ozkes",
        "adSoyad":  "OSMAN SAMİ ÖZKES",
        "departman":  "BMW",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "HAYRİ KARAHİSARLI",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "15/04/2025",
        "kurumKidemiYil":  1.38
    },
    {
        "id":  "pelin.aras",
        "adSoyad":  "PELİN ARAS",
        "departman":  "BMW",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Müdürü",
        "muduluk":  "PELİN ARAS",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "04/05/2026",
        "kurumKidemiYil":  0.33
    },
    {
        "id":  "raife.asan.karakiz",
        "adSoyad":  "RAİFE AŞAN KARAKIZ",
        "departman":  "BMW",
        "bolum":  "Satış",
        "mevcutUnvan":  "Kıdemli Satış Danışmanı",
        "muduluk":  "PELİN ARAS",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "01/02/2023",
        "kurumKidemiYil":  3.58
    },
    {
        "id":  "sila.harmanci",
        "adSoyad":  "SILA HARMANCI",
        "departman":  "BMW",
        "bolum":  "Satış",
        "mevcutUnvan":  "Müşteri İlişkileri Sorumlusu",
        "muduluk":  "PELİN ARAS",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "18/03/2024",
        "kurumKidemiYil":  2.46
    },
    {
        "id":  "zeynep.yamaner",
        "adSoyad":  "ZEYNEP YAMANER",
        "departman":  "BMW",
        "bolum":  "Satış",
        "mevcutUnvan":  "İkram Görevlisi",
        "muduluk":  "PELİN ARAS",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "27/06/2022",
        "kurumKidemiYil":  4.18
    },
    {
        "id":  "abdullah.kilic",
        "adSoyad":  "ABDULLAH KILIÇ",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Yedek Parça Danışmanı",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "03/11/2025",
        "kurumKidemiYil":  0.83
    },
    {
        "id":  "asli.bariskan",
        "adSoyad":  "ASLI BARIŞKAN",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Hasar Servis Danışmanı",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "21/08/2024",
        "kurumKidemiYil":  2.03
    },
    {
        "id":  "bahadir.akbulut",
        "adSoyad":  "BAHADIR AKBULUT",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanik Formeni",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "25/09/2019",
        "kurumKidemiYil":  6.93
    },
    {
        "id":  "beytullah.olgun",
        "adSoyad":  "BEYTULLAH OLGUN",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "13/05/2024",
        "kurumKidemiYil":  2.3
    },
    {
        "id":  "dilek.emeklioglu",
        "adSoyad":  "DİLEK EMEKLİOĞLU",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Resepsiyon Elemanı",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "25/10/2024",
        "kurumKidemiYil":  1.85
    },
    {
        "id":  "efe.can.kara",
        "adSoyad":  "EFE CAN KARA",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "06/07/2026",
        "kurumKidemiYil":  0.16
    },
    {
        "id":  "emrah.demirezen",
        "adSoyad":  "EMRAH DEMİREZEN",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Oto Yıkama Elemanı",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "12/08/2024",
        "kurumKidemiYil":  2.05
    },
    {
        "id":  "fatih.dasdemir",
        "adSoyad":  "FATİH DAŞDEMİR",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Kıdemli Servis Danışmanı",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "15/04/2021",
        "kurumKidemiYil":  5.38
    },
    {
        "id":  "fatih.sakal",
        "adSoyad":  "FATİH SAKAL",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Ön Düzen ve Balans Ayarcısı",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "22/06/2026",
        "kurumKidemiYil":  0.19
    },
    {
        "id":  "furkan.canbazoglu",
        "adSoyad":  "FURKAN CANBAZOĞLU",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Atölye Takip Uzmanı",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "25/02/2025",
        "kurumKidemiYil":  1.51
    },
    {
        "id":  "ibrahim.bilgin",
        "adSoyad":  "İBRAHİM BİLGİN",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Oto Yıkama Elemanı",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "21/01/2026",
        "kurumKidemiYil":  0.61
    },
    {
        "id":  "ibrahim.ozdemir",
        "adSoyad":  "İBRAHİM ÖZDEMİR",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Müdürü",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "25/08/2025",
        "kurumKidemiYil":  1.02
    },
    {
        "id":  "ibrahim.tekgoz",
        "adSoyad":  "İBRAHİM TEKGÖZ",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Boya Teknisyeni",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "07/03/2023",
        "kurumKidemiYil":  3.49
    },
    {
        "id":  "ismail.demirel",
        "adSoyad":  "İSMAİL DEMİREL",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "07/08/2024",
        "kurumKidemiYil":  2.07
    },
    {
        "id":  "metin.zehir",
        "adSoyad":  "METİN ZEHİR",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "02/03/2015",
        "kurumKidemiYil":  11.5
    },
    {
        "id":  "mikail.ocak",
        "adSoyad":  "MİKAİL OCAK",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "18/12/2025",
        "kurumKidemiYil":  0.7
    },
    {
        "id":  "murat.yaylak",
        "adSoyad":  "MURAT YAYLAK",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Atölye Şefi",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "03/02/2025",
        "kurumKidemiYil":  1.57
    },
    {
        "id":  "ramazan.yildirim",
        "adSoyad":  "RAMAZAN YILDIRIM",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "20/07/2026",
        "kurumKidemiYil":  0.12
    },
    {
        "id":  "songul.sahin",
        "adSoyad":  "SONGÜL ŞAHİN",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "İkram Görevlisi",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "01/06/2017",
        "kurumKidemiYil":  9.25
    },
    {
        "id":  "sukru.erdem",
        "adSoyad":  "ŞÜKRÜ ERDEM",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "15/09/2025",
        "kurumKidemiYil":  0.96
    },
    {
        "id":  "taha.kaan.canaklitas",
        "adSoyad":  "TAHA KAAN ÇANAKLITAŞ",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Yedek Parça Danışmanı",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "12/08/2024",
        "kurumKidemiYil":  2.05
    },
    {
        "id":  "yusuf.karatas",
        "adSoyad":  "YUSUF KARATAŞ",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Boya Teknisyeni",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "11/02/2025",
        "kurumKidemiYil":  1.55
    },
    {
        "id":  "yusuf.emre.kaya",
        "adSoyad":  "YUSUF EMRE KAYA",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Oto Yıkama Elemanı",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "28/02/2024",
        "kurumKidemiYil":  2.51
    },
    {
        "id":  "zeynep.ulutas",
        "adSoyad":  "ZEYNEP ULUTAŞ",
        "departman":  "BMW",
        "bolum":  "Servis",
        "mevcutUnvan":  "Garanti Uzmanı",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "04/03/2019",
        "kurumKidemiYil":  7.5
    },
    {
        "id":  "enes.guvenilir",
        "adSoyad":  "ENES GÜVENİLİR",
        "departman":  "BPS",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "HAYRİ KARAHİSARLI",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "25/09/2023",
        "kurumKidemiYil":  2.93
    },
    {
        "id":  "hayri.karahisarli",
        "adSoyad":  "HAYRİ KARAHİSARLI",
        "departman":  "BPS",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Müdürü",
        "muduluk":  "HAYRİ KARAHİSARLI",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "09/01/2023",
        "kurumKidemiYil":  3.64
    },
    {
        "id":  "muhammed.orak",
        "adSoyad":  "MUHAMMED ORAK",
        "departman":  "BPS",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "HAYRİ KARAHİSARLI",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "13/05/2024",
        "kurumKidemiYil":  2.3
    },
    {
        "id":  "mustafa.tugay.karsanti",
        "adSoyad":  "MUSTAFA TUGAY KARSANTI",
        "departman":  "BPS",
        "bolum":  "Satış",
        "mevcutUnvan":  "Lojistik Uzmanı",
        "muduluk":  "HAYRİ KARAHİSARLI",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "13/11/2025",
        "kurumKidemiYil":  0.8
    },
    {
        "id":  "ahmet.yilmaz",
        "adSoyad":  "AHMET YILMAZ",
        "departman":  "CITROEN",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "MEHMET TİRYAKİ",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "22/12/2025",
        "kurumKidemiYil":  0.69
    },
    {
        "id":  "bekir.hakkomaz",
        "adSoyad":  "BEKİR HAKKOMAZ",
        "departman":  "CITROEN",
        "bolum":  "Satış",
        "mevcutUnvan":  "Lojistik Uzmanı",
        "muduluk":  "MEHMET TİRYAKİ",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "05/11/2019",
        "kurumKidemiYil":  6.82
    },
    {
        "id":  "emre.bulut",
        "adSoyad":  "EMRE BULUT",
        "departman":  "CITROEN",
        "bolum":  "Satış",
        "mevcutUnvan":  "Teslimat Sorumlusu",
        "muduluk":  "MEHMET TİRYAKİ",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "19/10/2024",
        "kurumKidemiYil":  1.87
    },
    {
        "id":  "gul.yunusoglu",
        "adSoyad":  "GÜL YUNUSOĞLU",
        "departman":  "CITROEN",
        "bolum":  "Satış",
        "mevcutUnvan":  "Resepsiyonst",
        "muduluk":  "MEHMET TİRYAKİ",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "18/06/2026",
        "kurumKidemiYil":  0.21
    },
    {
        "id":  "havva.gunduz",
        "adSoyad":  "HAVVA GÜNDÜZ",
        "departman":  "CITROEN",
        "bolum":  "Satış",
        "mevcutUnvan":  "İkram Görevlisi",
        "muduluk":  "MEHMET TİRYAKİ",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "26/08/2025",
        "kurumKidemiYil":  1.02
    },
    {
        "id":  "mehmet.tiryaki",
        "adSoyad":  "MEHMET TİRYAKİ",
        "departman":  "CITROEN",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Müdürü",
        "muduluk":  "MEHMET TİRYAKİ",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "01/04/2024",
        "kurumKidemiYil":  2.42
    },
    {
        "id":  "nurten.kevser.yilmaz",
        "adSoyad":  "NURTEN KEVSER YILMAZ",
        "departman":  "CITROEN",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "MEHMET TİRYAKİ",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "01/04/2021",
        "kurumKidemiYil":  5.42
    },
    {
        "id":  "omer.gun",
        "adSoyad":  "ÖMER GÜN",
        "departman":  "CITROEN",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "MEHMET TİRYAKİ",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "12/05/2026",
        "kurumKidemiYil":  0.31
    },
    {
        "id":  "yakup.atay",
        "adSoyad":  "YAKUP ATAY",
        "departman":  "CITROEN",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "MEHMET TİRYAKİ",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "05/01/2023",
        "kurumKidemiYil":  3.66
    },
    {
        "id":  "hakan.gumus",
        "adSoyad":  "HAKAN GÜMÜŞ",
        "departman":  "DENETİM",
        "bolum":  "İdari",
        "mevcutUnvan":  "İc Denetim Uzmanı",
        "muduluk":  "ABDULLAH ÜNAL",
        "direktor":  "ABDULLAH ÜNAL",
        "iseBaslamaTarihi":  "06/10/2020",
        "kurumKidemiYil":  5.9
    },
    {
        "id":  "irem.sezeroglu",
        "adSoyad":  "İREM SEZEROĞLU",
        "departman":  "DENETİM",
        "bolum":  "İdari",
        "mevcutUnvan":  "İş Geliştirme Uzmanı",
        "muduluk":  "ABDULLAH ÜNAL",
        "direktor":  "ABDULLAH ÜNAL",
        "iseBaslamaTarihi":  "18/11/2024",
        "kurumKidemiYil":  1.79
    },
    {
        "id":  "mustafa.ugur",
        "adSoyad":  "MUSTAFA UĞUR",
        "departman":  "DENETİM",
        "bolum":  "İdari",
        "mevcutUnvan":  "İc Denetim Uzmanı",
        "muduluk":  "ABDULLAH ÜNAL",
        "direktor":  "ABDULLAH ÜNAL",
        "iseBaslamaTarihi":  "01/12/2022",
        "kurumKidemiYil":  3.75
    },
    {
        "id":  "davut.sayin",
        "adSoyad":  "DAVUT SAYIN",
        "departman":  "D-EXPERT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Expertiz Uzmanı",
        "muduluk":  "GÖKHAN ALTUNDAL",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "29/06/2026",
        "kurumKidemiYil":  0.18
    },
    {
        "id":  "eyyup.sabri.koseoglu",
        "adSoyad":  "EYYUP SABRİ KÖSEOĞLU",
        "departman":  "D-EXPERT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Expertiz Uzmanı",
        "muduluk":  "ALİ YAĞCI",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "12/05/2025",
        "kurumKidemiYil":  1.31
    },
    {
        "id":  "abdullah.onder.onen",
        "adSoyad":  "ABDULLAH ÖNDER ÖNEN",
        "departman":  "FIAT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Müdürü",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "04/08/2026",
        "kurumKidemiYil":  0.08
    },
    {
        "id":  "cansu.kayici",
        "adSoyad":  "CANSU KAYICI",
        "departman":  "FIAT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Müşteri İlişkileri Sorumlusu",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "04/08/2022",
        "kurumKidemiYil":  4.08
    },
    {
        "id":  "eyup.kara",
        "adSoyad":  "EYÜP KARA",
        "departman":  "FIAT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "20/01/2026",
        "kurumKidemiYil":  0.61
    },
    {
        "id":  "filiz.kilic",
        "adSoyad":  "FİLİZ KILIÇ",
        "departman":  "FIAT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "03/06/2024",
        "kurumKidemiYil":  2.25
    },
    {
        "id":  "gulsen.kapusuz",
        "adSoyad":  "GÜLSEN KAPUSUZ",
        "departman":  "FIAT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Lojistik Uzmanı",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "25/04/2024",
        "kurumKidemiYil":  2.35
    },
    {
        "id":  "hafize.sunkur",
        "adSoyad":  "HAFİZE SUNKUR",
        "departman":  "FIAT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Resepsiyon Elemanı",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "21/08/2024",
        "kurumKidemiYil":  2.03
    },
    {
        "id":  "izzet.bora.var",
        "adSoyad":  "İZZET BORA VAR",
        "departman":  "FIAT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "03/02/2025",
        "kurumKidemiYil":  1.57
    },
    {
        "id":  "mehmet.akca",
        "adSoyad":  "MEHMET AKCA",
        "departman":  "FIAT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "03/04/2023",
        "kurumKidemiYil":  3.41
    },
    {
        "id":  "okan.demir",
        "adSoyad":  "OKAN DEMİR",
        "departman":  "FIAT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Teslimat Sorumlusu",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "23/06/2026",
        "kurumKidemiYil":  0.19
    },
    {
        "id":  "ozlem.erciyes",
        "adSoyad":  "ÖZLEM ERCİYES",
        "departman":  "FIAT",
        "bolum":  "Satış",
        "mevcutUnvan":  "İkram Görevlisi",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "10/09/2024",
        "kurumKidemiYil":  1.97
    },
    {
        "id":  "ufuk.yalcin",
        "adSoyad":  "UFUK YALÇIN",
        "departman":  "FIAT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Lojistik Uzmanı",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "21/11/2024",
        "kurumKidemiYil":  1.78
    },
    {
        "id":  "yavuz.sukan",
        "adSoyad":  "YAVUZ SUKAN",
        "departman":  "FIAT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Showrom Elemanı",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "02/07/2026",
        "kurumKidemiYil":  0.17
    },
    {
        "id":  "ahmet.gursoy",
        "adSoyad":  "AHMET GÜRSOY",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Lpg Bakım Teknisyeni",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "25/08/2010",
        "kurumKidemiYil":  16.02
    },
    {
        "id":  "ahmet.guzel",
        "adSoyad":  "AHMET GÜZEL",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Yedek Parça Danışmanı",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "20/04/2026",
        "kurumKidemiYil":  0.37
    },
    {
        "id":  "ahmet.kapusuz",
        "adSoyad":  "AHMET KAPUSUZ",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "23/05/2024",
        "kurumKidemiYil":  2.28
    },
    {
        "id":  "akin.zararsiz",
        "adSoyad":  "AKIN ZARARSIZ",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Trim Teknisyeni",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "14/05/2024",
        "kurumKidemiYil":  2.3
    },
    {
        "id":  "aysegul.gok",
        "adSoyad":  "AYŞEGÜL GÖK",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Resepsiyonst",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "28/04/2026",
        "kurumKidemiYil":  0.34
    },
    {
        "id":  "burak.senel",
        "adSoyad":  "BURAK ŞENEL",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Elektrik Teknisyeni",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "29/06/2026",
        "kurumKidemiYil":  0.18
    },
    {
        "id":  "celal.tepe",
        "adSoyad":  "CELAL TEPE",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "24/12/2024",
        "kurumKidemiYil":  1.69
    },
    {
        "id":  "duran.yilmaz",
        "adSoyad":  "DURAN YILMAZ",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "01/07/2024",
        "kurumKidemiYil":  2.17
    },
    {
        "id":  "erkan.namli",
        "adSoyad":  "ERKAN NAMLI",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Elektrik Teknisyeni",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "25/08/2026",
        "kurumKidemiYil":  0.02
    },
    {
        "id":  "fatih.boru",
        "adSoyad":  "FATİH BORU",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Müdürü",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "30/05/2026",
        "kurumKidemiYil":  0.26
    },
    {
        "id":  "fatma.muhibe.durdu",
        "adSoyad":  "FATMA MÜHİBE DURDU",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Resepsiyonist",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "22/04/2026",
        "kurumKidemiYil":  0.36
    },
    {
        "id":  "gamze.karahan",
        "adSoyad":  "GAMZE KARAHAN",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Müşteri İlişkileri Sorumlusu",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "25/09/2024",
        "kurumKidemiYil":  1.93
    },
    {
        "id":  "hafize.merve.ince",
        "adSoyad":  "HAFİZE MERVE İNCE",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Müşteri İlişkileri Sorumlusu",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "09/10/2024",
        "kurumKidemiYil":  1.89
    },
    {
        "id":  "ilker.algul",
        "adSoyad":  "İLKER ALGÜL",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "08/11/2017",
        "kurumKidemiYil":  8.81
    },
    {
        "id":  "ismail.akyol",
        "adSoyad":  "İSMAİL AKYOL",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Yedek Parça Danışmanı",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "03/03/2014",
        "kurumKidemiYil":  12.5
    },
    {
        "id":  "ismail.sargin",
        "adSoyad":  "İSMAİL SARGIN",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "13/07/2026",
        "kurumKidemiYil":  0.14
    },
    {
        "id":  "mehmet.ciray",
        "adSoyad":  "MEHMET ÇIRAY",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "08/04/2013",
        "kurumKidemiYil":  13.4
    },
    {
        "id":  "mehmet.kulkuloglu",
        "adSoyad":  "MEHMET KULKULOĞLU",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Yedek Parça Danışmanı",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "21/04/2026",
        "kurumKidemiYil":  0.36
    },
    {
        "id":  "mehmet.taspinar",
        "adSoyad":  "MEHMET TAŞPINAR",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "04/11/2014",
        "kurumKidemiYil":  11.82
    },
    {
        "id":  "muammer.harun.yunusoglu",
        "adSoyad":  "MUAMMER HARUN YUNUSOĞLU",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "17/08/2026",
        "kurumKidemiYil":  0.04
    },
    {
        "id":  "mustafa.arslan",
        "adSoyad":  "MUSTAFA ARSLAN",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "22/06/2015",
        "kurumKidemiYil":  11.2
    },
    {
        "id":  "mustafa.uyar",
        "adSoyad":  "MUSTAFA UYAR",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Yedek Parça Danışmanı",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "11/05/2026",
        "kurumKidemiYil":  0.31
    },
    {
        "id":  "mustafa.yilan",
        "adSoyad":  "MUSTAFA YILAN",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "29/05/2024",
        "kurumKidemiYil":  2.26
    },
    {
        "id":  "niyazi.gun",
        "adSoyad":  "NİYAZİ GÜN",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Ön Düzen ve Balans Ayarcısı",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "03/12/2010",
        "kurumKidemiYil":  15.75
    },
    {
        "id":  "omer.erdogan",
        "adSoyad":  "ÖMER ERDOĞAN",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "11/11/2024",
        "kurumKidemiYil":  1.8
    },
    {
        "id":  "onur.derebas",
        "adSoyad":  "ONUR DEREBAŞ",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "04/08/2025",
        "kurumKidemiYil":  1.08
    },
    {
        "id":  "orhan.efe",
        "adSoyad":  "ORHAN EFE",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "09/03/2010",
        "kurumKidemiYil":  16.48
    },
    {
        "id":  "sami.berat.mizrak",
        "adSoyad":  "SAMİ BERAT MIZRAK",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "11/08/2026",
        "kurumKidemiYil":  0.06
    },
    {
        "id":  "seyithan.temel",
        "adSoyad":  "SEYİTHAN TEMEL",
        "departman":  "FIAT",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "10/07/2023",
        "kurumKidemiYil":  3.15
    },
    {
        "id":  "erdem.kan",
        "adSoyad":  "ERDEM KAN",
        "departman":  "FİLO",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "HACI MEHMET GÖZE",
        "direktor":  "BİRKAN ÇALIŞKAN",
        "iseBaslamaTarihi":  "26/02/2024",
        "kurumKidemiYil":  2.51
    },
    {
        "id":  "haci.mehmet.goze",
        "adSoyad":  "HACI MEHMET GÖZE",
        "departman":  "FİLO",
        "bolum":  "Satış",
        "mevcutUnvan":  "FİLO SATIŞ MÜDÜRÜ",
        "muduluk":  "HACI MEHMET GÖZE",
        "direktor":  "BİRKAN ÇALIŞKAN",
        "iseBaslamaTarihi":  "13/01/2010",
        "kurumKidemiYil":  16.63
    },
    {
        "id":  "fatih.polatdemir",
        "adSoyad":  "FATİH POLATDEMİR",
        "departman":  "FİNANS",
        "bolum":  "İdari",
        "mevcutUnvan":  "Finans Uzmanı",
        "muduluk":  "OSMAN MAZLUM",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "01/10/2020",
        "kurumKidemiYil":  5.92
    },
    {
        "id":  "gamze.demir",
        "adSoyad":  "GAMZE DEMİR",
        "departman":  "FİNANS",
        "bolum":  "İdari",
        "mevcutUnvan":  "Vezne",
        "muduluk":  "OSMAN MAZLUM",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "02/11/2024",
        "kurumKidemiYil":  1.83
    },
    {
        "id":  "kutay.onur.sonmez",
        "adSoyad":  "KUTAY ONUR SÖNMEZ",
        "departman":  "FİNANS",
        "bolum":  "İdari",
        "mevcutUnvan":  "Finans Uzmanı",
        "muduluk":  "OSMAN MAZLUM",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "18/11/2024",
        "kurumKidemiYil":  1.79
    },
    {
        "id":  "osman.mazlum",
        "adSoyad":  "OSMAN MAZLUM",
        "departman":  "FİNANS",
        "bolum":  "İdari",
        "mevcutUnvan":  "Finans Yöneticisi",
        "muduluk":  "OSMAN MAZLUM",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "30/11/2020",
        "kurumKidemiYil":  5.75
    },
    {
        "id":  "tugce.ustuner",
        "adSoyad":  "TUĞÇE ÜSTÜNER",
        "departman":  "FİNANS",
        "bolum":  "İdari",
        "mevcutUnvan":  "Vezne",
        "muduluk":  "OSMAN MAZLUM",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "01/03/2017",
        "kurumKidemiYil":  9.5
    },
    {
        "id":  "ahmet.demirtas",
        "adSoyad":  "AHMET DEMİRTAŞ",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "05/12/2022",
        "kurumKidemiYil":  3.74
    },
    {
        "id":  "ahmet.turkmen",
        "adSoyad":  "AHMET TÜRKMEN",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "10/08/2005",
        "kurumKidemiYil":  21.06
    },
    {
        "id":  "ahmet.yerebasmaz",
        "adSoyad":  "AHMET YEREBASMAZ",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "11/11/2022",
        "kurumKidemiYil":  3.81
    },
    {
        "id":  "bahattin.sehitoglu",
        "adSoyad":  "BAHATTİN ŞEHİTOĞLU",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Boya Elemanı",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "06/04/2026",
        "kurumKidemiYil":  0.41
    },
    {
        "id":  "bakican.sahin",
        "adSoyad":  "BAKİCAN ŞAHİN",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Hasar Servis Danışmanı",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "27/08/2026",
        "kurumKidemiYil":  0.01
    },
    {
        "id":  "dogukan.yasar",
        "adSoyad":  "DOĞUKAN YAŞAR",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "27/06/2026",
        "kurumKidemiYil":  0.18
    },
    {
        "id":  "erkan.delikaya",
        "adSoyad":  "ERKAN DELİKAYA",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Boya Formeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "21/12/2005",
        "kurumKidemiYil":  20.7
    },
    {
        "id":  "fatos.polat",
        "adSoyad":  "FATOŞ POLAT",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Hasar Servis Danışmanı",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "16/09/2024",
        "kurumKidemiYil":  1.96
    },
    {
        "id":  "furkan.cay",
        "adSoyad":  "FURKAN ÇAY",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "27/04/2026",
        "kurumKidemiYil":  0.35
    },
    {
        "id":  "hakan.borazan",
        "adSoyad":  "HAKAN BORAZAN",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Elektrik Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "10/07/2022",
        "kurumKidemiYil":  4.15
    },
    {
        "id":  "hamdi.yesil",
        "adSoyad":  "HAMDİ YEŞİL",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Hasar Servis Danışmanı",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "08/07/2024",
        "kurumKidemiYil":  2.15
    },
    {
        "id":  "hasan.aycil",
        "adSoyad":  "HASAN AYCIL",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "13/09/2024",
        "kurumKidemiYil":  1.97
    },
    {
        "id":  "ibrahim.topcu",
        "adSoyad":  "İBRAHİM TOPÇU",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Hasar Servis Müdürü",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "23/12/2024",
        "kurumKidemiYil":  1.69
    },
    {
        "id":  "mehmet.bozdag",
        "adSoyad":  "MEHMET BOZDAĞ",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "01/08/2018",
        "kurumKidemiYil":  8.08
    },
    {
        "id":  "muhammed.ali.taskan",
        "adSoyad":  "MUHAMMED ALİ TAŞKAN",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Boya Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "08/07/2025",
        "kurumKidemiYil":  1.15
    },
    {
        "id":  "mustafa.yigit.ulger",
        "adSoyad":  "MUSTAFA YİĞİT ÜLGER",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "13/07/2026",
        "kurumKidemiYil":  0.14
    },
    {
        "id":  "necla.nur.erciyes",
        "adSoyad":  "NECLA NUR ERCİYES",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Hasar Servis Danışmanı",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "21/08/2024",
        "kurumKidemiYil":  2.03
    },
    {
        "id":  "onur.palabicak",
        "adSoyad":  "ONUR PALABIÇAK",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "10/08/2021",
        "kurumKidemiYil":  5.06
    },
    {
        "id":  "orhan.ziknaringil",
        "adSoyad":  "ORHAN ZİKNARİNGİL",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "21/06/2025",
        "kurumKidemiYil":  1.2
    },
    {
        "id":  "orhan.gazi.sonmez",
        "adSoyad":  "ORHAN GAZİ SÖNMEZ",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Boya Elemanı",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "08/10/2025",
        "kurumKidemiYil":  0.9
    },
    {
        "id":  "remzi.kaya",
        "adSoyad":  "REMZİ KAYA",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Boya Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "03/05/2023",
        "kurumKidemiYil":  3.33
    },
    {
        "id":  "samet.mavili",
        "adSoyad":  "SAMET MAVİLİ",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Boya Elemanı",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "05/11/2025",
        "kurumKidemiYil":  0.82
    },
    {
        "id":  "sefure.kabak.erdogan",
        "adSoyad":  "SEFURE KABAK ERDOĞAN",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Hasar Servis Danışmanı",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "21/08/2026",
        "kurumKidemiYil":  0.03
    },
    {
        "id":  "selim.derin",
        "adSoyad":  "SELİM DERİN",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Boya Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "11/11/2021",
        "kurumKidemiYil":  4.8
    },
    {
        "id":  "selim.oruc",
        "adSoyad":  "SELİM ORUÇ",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "04/09/2004",
        "kurumKidemiYil":  21.99
    },
    {
        "id":  "yakup.polat",
        "adSoyad":  "YAKUP POLAT",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "25/08/2025",
        "kurumKidemiYil":  1.02
    },
    {
        "id":  "yunus.emre.askin",
        "adSoyad":  "YUNUS EMRE AŞKIN",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Kaporta Teknisyeni",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "25/11/2025",
        "kurumKidemiYil":  0.77
    },
    {
        "id":  "yusuf.tas",
        "adSoyad":  "YUSUF TAŞ",
        "departman":  "HASAR",
        "bolum":  "Servis",
        "mevcutUnvan":  "Hasar Servis Müdürü",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "13/04/2022",
        "kurumKidemiYil":  4.39
    },
    {
        "id":  "fatih.kara",
        "adSoyad":  "FATİH KARA",
        "departman":  "HONDA",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Şefi",
        "muduluk":  "FATİH KARA",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "06/08/2020",
        "kurumKidemiYil":  6.07
    },
    {
        "id":  "hatice.altun",
        "adSoyad":  "HATİCE ALTUN",
        "departman":  "HONDA",
        "bolum":  "Satış",
        "mevcutUnvan":  "Resepsiyonst",
        "muduluk":  "FATİH KARA",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "28/07/2026",
        "kurumKidemiYil":  0.1
    },
    {
        "id":  "adem.ozdemir",
        "adSoyad":  "ADEM ÖZDEMİR",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Oto Yıkama Elemanı",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "19/12/2025",
        "kurumKidemiYil":  0.7
    },
    {
        "id":  "ayhan.ilhan",
        "adSoyad":  "AYHAN İLHAN",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanik Formeni",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "12/01/2022",
        "kurumKidemiYil":  4.64
    },
    {
        "id":  "can.ahmet.ulker",
        "adSoyad":  "CAN AHMET ÜLKER",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "15/12/2025",
        "kurumKidemiYil":  0.71
    },
    {
        "id":  "hakan.gozutok",
        "adSoyad":  "HAKAN GÖZÜTOK",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "20/05/2025",
        "kurumKidemiYil":  1.28
    },
    {
        "id":  "hamza.tunahan.celik",
        "adSoyad":  "HAMZA TUNAHAN ÇELİK",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "17/02/2025",
        "kurumKidemiYil":  1.54
    },
    {
        "id":  "ibrahim.saricay",
        "adSoyad":  "İBRAHİM SARIÇAY",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "30/12/2024",
        "kurumKidemiYil":  1.67
    },
    {
        "id":  "kadir.karapinar",
        "adSoyad":  "KADİR KARAPINAR",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "20/05/2026",
        "kurumKidemiYil":  0.28
    },
    {
        "id":  "meltem.cimen",
        "adSoyad":  "MELTEM ÇİMEN",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "22/12/2025",
        "kurumKidemiYil":  0.69
    },
    {
        "id":  "memet.orhan.cavdar",
        "adSoyad":  "MEMET ORHAN ÇAVDAR",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Müdürü",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "18/10/2024",
        "kurumKidemiYil":  1.87
    },
    {
        "id":  "muhammed.emin.bayram",
        "adSoyad":  "MUHAMMED EMİN BAYRAM",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "03/08/2026",
        "kurumKidemiYil":  0.08
    },
    {
        "id":  "mustafa.demirag",
        "adSoyad":  "MUSTAFA DEMİRAĞ",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Oto Yıkama Elemanı",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "23/07/2025",
        "kurumKidemiYil":  1.11
    },
    {
        "id":  "muzaffer.efe.ozdemir",
        "adSoyad":  "MUZAFFER EFE ÖZDEMİR",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "01/06/2026",
        "kurumKidemiYil":  0.25
    },
    {
        "id":  "nevin.meryem.erturk",
        "adSoyad":  "NEVİN MERYEM ERTÜRK",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Müşteri İlişkileri Sorumlusu",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "23/09/2021",
        "kurumKidemiYil":  4.94
    },
    {
        "id":  "rifat.can.ozdayi",
        "adSoyad":  "RİFAT CAN ÖZDAYI",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "05/05/2025",
        "kurumKidemiYil":  1.33
    },
    {
        "id":  "seyid.burhanettin.cigdem",
        "adSoyad":  "SEYİD BURHANETTİN ÇİĞDEM",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Yedek Parça Danışmanı",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "27/03/2024",
        "kurumKidemiYil":  2.43
    },
    {
        "id":  "sibel.aktas",
        "adSoyad":  "SİBEL AKTAŞ",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "İkram Görevlisi",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "05/07/2019",
        "kurumKidemiYil":  7.16
    },
    {
        "id":  "yakup.bayraktar",
        "adSoyad":  "YAKUP BAYRAKTAR",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "02/09/2025",
        "kurumKidemiYil":  1
    },
    {
        "id":  "yasir.altinay",
        "adSoyad":  "YASİR ALTINAY",
        "departman":  "HONDA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Yedek Parça Danışmanı",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "27/09/2022",
        "kurumKidemiYil":  3.93
    },
    {
        "id":  "abdullah.unal",
        "adSoyad":  "ABDULLAH ÜNAL",
        "departman":  "İCRA KURULU",
        "bolum":  "İdari",
        "mevcutUnvan":  "Direktör",
        "muduluk":  "ABDULLAH ÜNAL",
        "direktor":  "BİRKAN ÇALIŞKAN",
        "iseBaslamaTarihi":  "10/12/2014",
        "kurumKidemiYil":  11.73
    },
    {
        "id":  "alaaddin.caglikose",
        "adSoyad":  "ALAADDİN ÇAĞLIKÖSE",
        "departman":  "İCRA KURULU",
        "bolum":  "İdari",
        "mevcutUnvan":  "Direktör",
        "muduluk":  "ALAADDİN ÇAĞLIKÖSE",
        "direktor":  "BİRKAN ÇALIŞKAN",
        "iseBaslamaTarihi":  "02/04/2025",
        "kurumKidemiYil":  1.42
    },
    {
        "id":  "ali.buyuk",
        "adSoyad":  "ALİ BÜYÜK",
        "departman":  "İCRA KURULU",
        "bolum":  "İdari",
        "mevcutUnvan":  "MARKA DİREKTÖRÜ",
        "muduluk":  "ALİ BÜYÜK",
        "direktor":  "BİRKAN ÇALIŞKAN",
        "iseBaslamaTarihi":  "01/06/2026",
        "kurumKidemiYil":  0.25
    },
    {
        "id":  "gokhan.altundal",
        "adSoyad":  "GÖKHAN ALTUNDAL",
        "departman":  "İCRA KURULU",
        "bolum":  "İdari",
        "mevcutUnvan":  "Direktör",
        "muduluk":  "GÖKHAN ALTUNDAL",
        "direktor":  "BİRKAN ÇALIŞKAN",
        "iseBaslamaTarihi":  "11/11/2011",
        "kurumKidemiYil":  14.81
    },
    {
        "id":  "huseyin.ugur.sakiroglu",
        "adSoyad":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "departman":  "İCRA KURULU",
        "bolum":  "İdari",
        "mevcutUnvan":  "MARKA DİREKTÖRÜ",
        "muduluk":  "-",
        "direktor":  "BİRKAN ÇALIŞKAN",
        "iseBaslamaTarihi":  "13/07/2026",
        "kurumKidemiYil":  0.14
    },
    {
        "id":  "melis.su.inciroglu",
        "adSoyad":  "MELİS SU İNCİROĞLU",
        "departman":  "İCRA KURULU",
        "bolum":  "İdari",
        "mevcutUnvan":  "DİJİTAL DÖNÜŞÜM \u0026 PAZARLAMA \u0026 STRATEJİ GENEL MÜDÜR YARDIMCISI",
        "muduluk":  "MELİS SU İNCİROĞLU",
        "direktor":  "BİRKAN ÇALIŞKAN",
        "iseBaslamaTarihi":  "19/02/2022",
        "kurumKidemiYil":  4.53
    },
    {
        "id":  "osman.coban",
        "adSoyad":  "OSMAN ÇOBAN",
        "departman":  "İCRA KURULU",
        "bolum":  "İdari",
        "mevcutUnvan":  "MARKA DİREKTÖRÜ",
        "muduluk":  "OSMAN ÇOBAN",
        "direktor":  "BİRKAN ÇALIŞKAN",
        "iseBaslamaTarihi":  "01/06/2026",
        "kurumKidemiYil":  0.25
    },
    {
        "id":  "rifat.erbas",
        "adSoyad":  "RIFAT ERBAŞ",
        "departman":  "İCRA KURULU",
        "bolum":  "İdari",
        "mevcutUnvan":  "Direktör",
        "muduluk":  "RIFAT ERBAŞ",
        "direktor":  "BİRKAN ÇALIŞKAN",
        "iseBaslamaTarihi":  "21/05/2025",
        "kurumKidemiYil":  1.28
    },
    {
        "id":  "serkan.uygunoglu",
        "adSoyad":  "SERKAN UYGUNOĞLU",
        "departman":  "İCRA KURULU",
        "bolum":  "İdari",
        "mevcutUnvan":  "MALİ İŞLER GENEL MÜDÜR YARDIMCISI",
        "muduluk":  "SERKAN UYGUNOĞLU",
        "direktor":  "BİRKAN ÇALIŞKAN",
        "iseBaslamaTarihi":  "27/10/2014",
        "kurumKidemiYil":  11.85
    },
    {
        "id":  "melisa.kavak",
        "adSoyad":  "MELİSA KAVAK",
        "departman":  "İNSAN KAYNAKLARI",
        "bolum":  "İdari",
        "mevcutUnvan":  "Ceo Teknik Asistanı",
        "muduluk":  "ŞAHİN TEKTAŞ",
        "direktor":  "ALADDİN ÇAĞLIKÖSE",
        "iseBaslamaTarihi":  "01/07/2025",
        "kurumKidemiYil":  1.17
    },
    {
        "id":  "sahin.tektas",
        "adSoyad":  "ŞAHİN TEKTAŞ",
        "departman":  "İNSAN KAYNAKLARI",
        "bolum":  "İdari",
        "mevcutUnvan":  "Bordro Ve Özlük İşleri Uzmanı",
        "muduluk":  "ŞAHİN TEKTAŞ",
        "direktor":  "ALADDİN ÇAĞLIKÖSE",
        "iseBaslamaTarihi":  "27/01/2025",
        "kurumKidemiYil":  1.59
    },
    {
        "id":  "sena.bostanci",
        "adSoyad":  "SENA BOSTANCI",
        "departman":  "İNSAN KAYNAKLARI",
        "bolum":  "İdari",
        "mevcutUnvan":  "İnsan Kaynakları Uzman Yardımcısı",
        "muduluk":  "ŞAHİN TEKTAŞ",
        "direktor":  "ALADDİN ÇAĞLIKÖSE",
        "iseBaslamaTarihi":  "15/10/2025",
        "kurumKidemiYil":  0.88
    },
    {
        "id":  "yakup.erdogan",
        "adSoyad":  "YAKUP ERDOĞAN",
        "departman":  "İNSAN KAYNAKLARI",
        "bolum":  "İdari",
        "mevcutUnvan":  "Plaka Tescil Sorumlusu",
        "muduluk":  "ŞAHİN TEKTAŞ",
        "direktor":  "ALADDİN ÇAĞLIKÖSE",
        "iseBaslamaTarihi":  "13/09/2023",
        "kurumKidemiYil":  2.97
    },
    {
        "id":  "asli.evler",
        "adSoyad":  "ASLI EVLER",
        "departman":  "JAECOO",
        "bolum":  "Satış",
        "mevcutUnvan":  "Müşteri İlişkileri Sorumlusu",
        "muduluk":  "GÖKHAN ALTUNDAL",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "11/06/2026",
        "kurumKidemiYil":  0.22
    },
    {
        "id":  "aziz.berkay.metin",
        "adSoyad":  "AZİZ BERKAY METİN",
        "departman":  "JAECOO",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Şefi",
        "muduluk":  "GÖKHAN ALTUNDAL",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "07/09/2022",
        "kurumKidemiYil":  3.98
    },
    {
        "id":  "goktug.berathan.seker",
        "adSoyad":  "GÖKTUĞ BERATHAN ŞEKER",
        "departman":  "JAECOO",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "GÖKHAN ALTUNDAL",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "22/09/2025",
        "kurumKidemiYil":  0.94
    },
    {
        "id":  "pempe.altintop",
        "adSoyad":  "PEMPE ALTINTOP",
        "departman":  "JAECOO",
        "bolum":  "Satış",
        "mevcutUnvan":  "Resepsiyon Elemanı",
        "muduluk":  "GÖKHAN ALTUNDAL",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "05/08/2024",
        "kurumKidemiYil":  2.07
    },
    {
        "id":  "gokhan.bozkurt",
        "adSoyad":  "GÖKHAN BOZKURT",
        "departman":  "JAECOO",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Müdürü",
        "muduluk":  "GÖKHAN BOZKURT",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "08/11/2018",
        "kurumKidemiYil":  7.81
    },
    {
        "id":  "harun.andac",
        "adSoyad":  "HARUN ANDAÇ",
        "departman":  "JAECOO",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "GÖKHAN BOZKURT",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "24/04/2023",
        "kurumKidemiYil":  3.36
    },
    {
        "id":  "mehmet.efe",
        "adSoyad":  "MEHMET EFE",
        "departman":  "JAECOO",
        "bolum":  "Servis",
        "mevcutUnvan":  "Yedek Parça Danışmanı",
        "muduluk":  "GÖKHAN BOZKURT",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "22/01/2025",
        "kurumKidemiYil":  1.61
    },
    {
        "id":  "muhammet.talha.bicer",
        "adSoyad":  "MUHAMMET TALHA BİÇER",
        "departman":  "JAECOO",
        "bolum":  "Servis",
        "mevcutUnvan":  "Oto Yıkama Elemanı",
        "muduluk":  "GÖKHAN BOZKURT",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "27/06/2026",
        "kurumKidemiYil":  0.18
    },
    {
        "id":  "salih.yilan",
        "adSoyad":  "SALİH YILAN",
        "departman":  "JAECOO",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "GÖKHAN BOZKURT",
        "direktor":  "GÖKHAN ALTUNDAL",
        "iseBaslamaTarihi":  "27/03/2026",
        "kurumKidemiYil":  0.43
    },
    {
        "id":  "ahmet.ergun.bilici",
        "adSoyad":  "AHMET ERGÜN BİLİCİ",
        "departman":  "MALİ İŞLER",
        "bolum":  "İdari",
        "mevcutUnvan":  "Marka Muhasebe Uzman Yardımcısı",
        "muduluk":  "UĞUR ERTÜRK",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "25/09/2023",
        "kurumKidemiYil":  2.93
    },
    {
        "id":  "bulent.gedik",
        "adSoyad":  "BÜLENT GEDİK",
        "departman":  "MALİ İŞLER",
        "bolum":  "İdari",
        "mevcutUnvan":  "Marka Muhasebe Sorumlusu",
        "muduluk":  "UĞUR ERTÜRK",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "01/10/2024",
        "kurumKidemiYil":  1.92
    },
    {
        "id":  "ismail.yuksel",
        "adSoyad":  "İSMAİL YÜKSEL",
        "departman":  "MALİ İŞLER",
        "bolum":  "İdari",
        "mevcutUnvan":  "Marka Muhasebe Sorumlusu",
        "muduluk":  "UĞUR ERTÜRK",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "25/01/2021",
        "kurumKidemiYil":  5.6
    },
    {
        "id":  "mustafa.aksoy",
        "adSoyad":  "MUSTAFA AKSOY",
        "departman":  "MALİ İŞLER",
        "bolum":  "İdari",
        "mevcutUnvan":  "Marka Muhasebe Sorumlusu",
        "muduluk":  "UĞUR ERTÜRK",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "02/12/2025",
        "kurumKidemiYil":  0.75
    },
    {
        "id":  "nafize.irmak",
        "adSoyad":  "NAFİZE IRMAK",
        "departman":  "MALİ İŞLER",
        "bolum":  "İdari",
        "mevcutUnvan":  "Marka Muhasebe Uzman Yardımcısı",
        "muduluk":  "UĞUR ERTÜRK",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "03/11/2025",
        "kurumKidemiYil":  0.83
    },
    {
        "id":  "nilay.ilter",
        "adSoyad":  "NİLAY İLTER",
        "departman":  "MALİ İŞLER",
        "bolum":  "İdari",
        "mevcutUnvan":  "Marka Muhasebe Uzman Yardımcısı",
        "muduluk":  "UĞUR ERTÜRK",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "08/05/2025",
        "kurumKidemiYil":  1.32
    },
    {
        "id":  "ugur.erturk",
        "adSoyad":  "UĞUR ERTÜRK",
        "departman":  "MALİ İŞLER",
        "bolum":  "İdari",
        "mevcutUnvan":  "Muhasebe Yöneticisi",
        "muduluk":  "UĞUR ERTÜRK",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "01/05/2017",
        "kurumKidemiYil":  9.34
    },
    {
        "id":  "arif.yuksel",
        "adSoyad":  "ARİF YÜKSEL",
        "departman":  "MINI",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "PELİN ARAS",
        "direktor":  "OSMAN ÇOBAN",
        "iseBaslamaTarihi":  "11/03/2024",
        "kurumKidemiYil":  2.48
    },
    {
        "id":  "akgul.yildiz",
        "adSoyad":  "AKGÜL YILDIZ",
        "departman":  "OPEL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Resepsiyon Elemanı",
        "muduluk":  "MURAT ATICI",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "01/06/2016",
        "kurumKidemiYil":  10.25
    },
    {
        "id":  "mahsut.akgun",
        "adSoyad":  "MAHSUT AKGÜN",
        "departman":  "OPEL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Showrom Elemanı",
        "muduluk":  "MURAT ATICI",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "09/09/2022",
        "kurumKidemiYil":  3.98
    },
    {
        "id":  "murat.atici",
        "adSoyad":  "MURAT ATICI",
        "departman":  "OPEL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Müdürü",
        "muduluk":  "MURAT ATICI",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "05/04/2021",
        "kurumKidemiYil":  5.41
    },
    {
        "id":  "naciye.kokce",
        "adSoyad":  "NACİYE KÖKÇE",
        "departman":  "OPEL",
        "bolum":  "Satış",
        "mevcutUnvan":  "İkram Görevlisi",
        "muduluk":  "MURAT ATICI",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "12/07/2023",
        "kurumKidemiYil":  3.14
    },
    {
        "id":  "onur.durmus",
        "adSoyad":  "ONUR DURMUŞ",
        "departman":  "OPEL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "MURAT ATICI",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "17/09/2025",
        "kurumKidemiYil":  0.96
    },
    {
        "id":  "tarik.marasli",
        "adSoyad":  "TARIK MARAŞLI",
        "departman":  "OPEL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "MURAT ATICI",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "22/12/2025",
        "kurumKidemiYil":  0.69
    },
    {
        "id":  "umit.dayandac",
        "adSoyad":  "ÜMİT DAYANDAÇ",
        "departman":  "OPEL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "MURAT ATICI",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "05/05/2025",
        "kurumKidemiYil":  1.33
    },
    {
        "id":  "yavuz.selim.kilicaslan",
        "adSoyad":  "YAVUZ SELİM KILIÇASLAN",
        "departman":  "OPEL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "MURAT ATICI",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "26/12/2022",
        "kurumKidemiYil":  3.68
    },
    {
        "id":  "zehra.araz",
        "adSoyad":  "ZEHRA ARAZ",
        "departman":  "OPEL",
        "bolum":  "Satış",
        "mevcutUnvan":  "Lojistik Uzmanı",
        "muduluk":  "MURAT ATICI",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "12/04/2011",
        "kurumKidemiYil":  15.39
    },
    {
        "id":  "can.gungor.acikgoz",
        "adSoyad":  "CAN GÜNGÖR AÇIKGÖZ",
        "departman":  "PAZARLAMA",
        "bolum":  "İdari",
        "mevcutUnvan":  "Pazarlama Uzman Yardımcısı",
        "muduluk":  "SERDAR TÜRKASLAN",
        "direktor":  "MELİS SU İNCİROĞLU",
        "iseBaslamaTarihi":  "13/08/2025",
        "kurumKidemiYil":  1.05
    },
    {
        "id":  "dilara.karadurdu",
        "adSoyad":  "DİLARA KARADURDU",
        "departman":  "PAZARLAMA",
        "bolum":  "İdari",
        "mevcutUnvan":  "Pazarlama Uzmanı",
        "muduluk":  "SERDAR TÜRKASLAN",
        "direktor":  "MELİS SU İNCİROĞLU",
        "iseBaslamaTarihi":  "18/03/2023",
        "kurumKidemiYil":  3.46
    },
    {
        "id":  "esranur.ozbek",
        "adSoyad":  "ESRANUR ÖZBEK",
        "departman":  "PAZARLAMA",
        "bolum":  "İdari",
        "mevcutUnvan":  "Pazarlama Uzmanı",
        "muduluk":  "SERDAR TÜRKASLAN",
        "direktor":  "MELİS SU İNCİROĞLU",
        "iseBaslamaTarihi":  "10/04/2025",
        "kurumKidemiYil":  1.39
    },
    {
        "id":  "ibrahim.can.toprak",
        "adSoyad":  "İBRAHİM CAN TOPRAK",
        "departman":  "PAZARLAMA",
        "bolum":  "İdari",
        "mevcutUnvan":  "Pazarlama Uzman Yardımcısı",
        "muduluk":  "SERDAR TÜRKASLAN",
        "direktor":  "MELİS SU İNCİROĞLU",
        "iseBaslamaTarihi":  "01/06/2026",
        "kurumKidemiYil":  0.25
    },
    {
        "id":  "serdar.turkaslan",
        "adSoyad":  "SERDAR TÜRKASLAN",
        "departman":  "PAZARLAMA",
        "bolum":  "İdari",
        "mevcutUnvan":  "Pazarlama Müdürü",
        "muduluk":  "SERDAR TÜRKASLAN",
        "direktor":  "MELİS SU İNCİROĞLU",
        "iseBaslamaTarihi":  "15/10/2022",
        "kurumKidemiYil":  3.88
    },
    {
        "id":  "abdurrahman.cagatay.dagdelen",
        "adSoyad":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "departman":  "PEUGEOT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Müdürü",
        "muduluk":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "03/11/2025",
        "kurumKidemiYil":  0.83
    },
    {
        "id":  "ahmet.durdu",
        "adSoyad":  "AHMET DURDU",
        "departman":  "PEUGEOT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "27/01/2025",
        "kurumKidemiYil":  1.59
    },
    {
        "id":  "cafer.yildiz",
        "adSoyad":  "CAFER YILDIZ",
        "departman":  "PEUGEOT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Showrom Elemanı",
        "muduluk":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "10/10/2017",
        "kurumKidemiYil":  8.89
    },
    {
        "id":  "fatih.bozcali",
        "adSoyad":  "FATİH BOZCALI",
        "departman":  "PEUGEOT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "24/08/2026",
        "kurumKidemiYil":  0.02
    },
    {
        "id":  "gamze.orak",
        "adSoyad":  "GAMZE ORAK",
        "departman":  "PEUGEOT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Kredi Görevlisi",
        "muduluk":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "23/10/2025",
        "kurumKidemiYil":  0.86
    },
    {
        "id":  "hafize.can",
        "adSoyad":  "HAFİZE CAN",
        "departman":  "PEUGEOT",
        "bolum":  "Satış",
        "mevcutUnvan":  "İkram Görevlisi",
        "muduluk":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "23/03/2026",
        "kurumKidemiYil":  0.44
    },
    {
        "id":  "omer.erdogdu",
        "adSoyad":  "ÖMER ERDOĞDU",
        "departman":  "PEUGEOT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "28/11/2023",
        "kurumKidemiYil":  2.76
    },
    {
        "id":  "onurhan.ilaslan",
        "adSoyad":  "ONURHAN İLASLAN",
        "departman":  "PEUGEOT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Satış Danışmanı",
        "muduluk":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "25/07/2022",
        "kurumKidemiYil":  4.1
    },
    {
        "id":  "saitcan.karabulut",
        "adSoyad":  "SAİTCAN KARABULUT",
        "departman":  "PEUGEOT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Lojistik Uzmanı",
        "muduluk":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "02/03/2026",
        "kurumKidemiYil":  0.5
    },
    {
        "id":  "sakine.senyuz",
        "adSoyad":  "SAKİNE ŞENYÜZ",
        "departman":  "PEUGEOT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Lojistik Uzmanı",
        "muduluk":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "01/12/2025",
        "kurumKidemiYil":  0.75
    },
    {
        "id":  "sertac.oz",
        "adSoyad":  "SERTAÇ ÖZ",
        "departman":  "PEUGEOT",
        "bolum":  "Satış",
        "mevcutUnvan":  "Teslimat Sorumlusu",
        "muduluk":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "22/03/2021",
        "kurumKidemiYil":  5.45
    },
    {
        "id":  "abdulkadir.akar",
        "adSoyad":  "ABDULKADİR AKAR",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "BİROL CANER",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "18/03/2025",
        "kurumKidemiYil":  1.46
    },
    {
        "id":  "ahmet.hilmi.tunahan",
        "adSoyad":  "AHMET HİLMİ TUNAHAN",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "12/01/2026",
        "kurumKidemiYil":  0.64
    },
    {
        "id":  "ali.andac",
        "adSoyad":  "ALİ ANDAÇ",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "23/06/2025",
        "kurumKidemiYil":  1.19
    },
    {
        "id":  "alper.ozdemir",
        "adSoyad":  "ALPER ÖZDEMİR",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Teknik Danışman",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "03/01/2022",
        "kurumKidemiYil":  4.66
    },
    {
        "id":  "alperen.arici",
        "adSoyad":  "ALPEREN ARICI",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "18/08/2025",
        "kurumKidemiYil":  1.04
    },
    {
        "id":  "batuhan.deringol",
        "adSoyad":  "BATUHAN DERİNGÖL",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Elektrik Teknisyeni",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "27/06/2026",
        "kurumKidemiYil":  0.18
    },
    {
        "id":  "birol.caner",
        "adSoyad":  "BİROL CANER",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Müdürü",
        "muduluk":  "BİROL CANER",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "08/07/2026",
        "kurumKidemiYil":  0.15
    },
    {
        "id":  "burcu.karakoc",
        "adSoyad":  "BURCU KARAKOÇ",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Müşteri İlişkileri Sorumlusu",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "20/10/2022",
        "kurumKidemiYil":  3.87
    },
    {
        "id":  "buse.caginda",
        "adSoyad":  "BUSE ÇAĞINDA",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "BİROL CANER",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "19/08/2026",
        "kurumKidemiYil":  0.04
    },
    {
        "id":  "cagri.daldaban",
        "adSoyad":  "ÇAĞRI DALDABAN",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Yedek Parça Danışmanı",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "14/03/2024",
        "kurumKidemiYil":  2.47
    },
    {
        "id":  "caner.anil.aksoy",
        "adSoyad":  "CANER ANIL AKSOY",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "BİROL CANER",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "02/06/2026",
        "kurumKidemiYil":  0.25
    },
    {
        "id":  "ebru.aynur",
        "adSoyad":  "EBRU AYNUR",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Randevu Planlama Sorumlusu",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "26/04/2021",
        "kurumKidemiYil":  5.35
    },
    {
        "id":  "emine.yilmaz",
        "adSoyad":  "EMİNE YILMAZ",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Müşteri İlişkileri Sorumlusu",
        "muduluk":  "BİROL CANER",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "03/08/2026",
        "kurumKidemiYil":  0.08
    },
    {
        "id":  "emre.gurgen",
        "adSoyad":  "EMRE GÜRGEN",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Yedek Parça Danışmanı",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "11/08/2025",
        "kurumKidemiYil":  1.06
    },
    {
        "id":  "emrecan.asik",
        "adSoyad":  "EMRECAN AŞIK",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "BİROL CANER",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "17/08/2026",
        "kurumKidemiYil":  0.04
    },
    {
        "id":  "emrecan.yucel",
        "adSoyad":  "EMRECAN YÜCEL",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Garanti Uzman Yardımcısı",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "05/05/2025",
        "kurumKidemiYil":  1.33
    },
    {
        "id":  "enes.tezcan",
        "adSoyad":  "ENES TEZCAN",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Ön Düzen ve Balans Ayarcısı",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "11/05/2026",
        "kurumKidemiYil":  0.31
    },
    {
        "id":  "fatih.gulluce",
        "adSoyad":  "FATİH GÜLLÜCE",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "03/03/2026",
        "kurumKidemiYil":  0.5
    },
    {
        "id":  "fevzi.albayrakli",
        "adSoyad":  "FEVZİ ALBAYRAKLI",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "17/03/2025",
        "kurumKidemiYil":  1.46
    },
    {
        "id":  "gul.pinar.tas.albayrak",
        "adSoyad":  "GÜL PINAR TAŞ ALBAYRAK",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Randevu Planlama Sorumlusu",
        "muduluk":  "BİROL CANER",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "27/08/2026",
        "kurumKidemiYil":  0.01
    },
    {
        "id":  "hakan.yuceturk",
        "adSoyad":  "HAKAN YÜCETÜRK",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "SERVİS MÜHENDİSİ",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "01/08/2022",
        "kurumKidemiYil":  4.08
    },
    {
        "id":  "hamza.mamak",
        "adSoyad":  "HAMZA MAMAK",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Elektrik Teknisyeni",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "02/04/2025",
        "kurumKidemiYil":  1.42
    },
    {
        "id":  "hatem.uzunoglu",
        "adSoyad":  "HATEM UZUNOĞLU",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "02/08/2024",
        "kurumKidemiYil":  2.08
    },
    {
        "id":  "ibrahim.dogan",
        "adSoyad":  "İBRAHIM DOĞAN",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Servis Danışmanı",
        "muduluk":  "BİROL CANER",
        "direktor":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "iseBaslamaTarihi":  "02/06/2026",
        "kurumKidemiYil":  0.25
    },
    {
        "id":  "mehmet.ozkan",
        "adSoyad":  "MEHMET OZKAN",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "11/06/2026",
        "kurumKidemiYil":  0.22
    },
    {
        "id":  "mirkan.colak",
        "adSoyad":  "MİRKAN ÇOLAK",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Garanti Uzman Yardımcısı",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "16/06/2025",
        "kurumKidemiYil":  1.21
    },
    {
        "id":  "murat.duman",
        "adSoyad":  "MURAT DUMAN",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "27/06/2026",
        "kurumKidemiYil":  0.18
    },
    {
        "id":  "mustafa.kaya",
        "adSoyad":  "MUSTAFA KAYA",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "01/06/2026",
        "kurumKidemiYil":  0.25
    },
    {
        "id":  "mustafa.tosun",
        "adSoyad":  "MUSTAFA TOSUN",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Vale",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "23/09/2023",
        "kurumKidemiYil":  2.94
    },
    {
        "id":  "nail.sahan",
        "adSoyad":  "NAİL ŞAHAN",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "27/08/2025",
        "kurumKidemiYil":  1.01
    },
    {
        "id":  "omer.aksoy",
        "adSoyad":  "ÖMER AKSOY",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Elektrik Teknisyeni",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "27/06/2026",
        "kurumKidemiYil":  0.18
    },
    {
        "id":  "omer.faruk.antal",
        "adSoyad":  "ÖMER FARUK ANTAL",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "24/03/2025",
        "kurumKidemiYil":  1.44
    },
    {
        "id":  "sabri.pinar",
        "adSoyad":  "SABRİ PINAR",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "01/11/2017",
        "kurumKidemiYil":  8.83
    },
    {
        "id":  "sevket.cakir",
        "adSoyad":  "ŞEVKET ÇAKIR",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "FATİH BORU",
        "direktor":  "ALİ BÜYÜK",
        "iseBaslamaTarihi":  "17/09/2025",
        "kurumKidemiYil":  0.96
    },
    {
        "id":  "soner.sungur",
        "adSoyad":  "SONER SUNGUR",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Yedek Parça Yöneticisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "01/12/2014",
        "kurumKidemiYil":  11.75
    },
    {
        "id":  "tatar.ince",
        "adSoyad":  "TATAR İNCE",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "28/06/2021",
        "kurumKidemiYil":  5.18
    },
    {
        "id":  "umutcan.alphan",
        "adSoyad":  "UMUTCAN ALPHAN",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanikçisi",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "23/05/2025",
        "kurumKidemiYil":  1.28
    },
    {
        "id":  "yasemin.baglamis",
        "adSoyad":  "YASEMİN BAĞLAMIŞ",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Müşteri İlişkileri Sorumlusu",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "03/12/2020",
        "kurumKidemiYil":  5.74
    },
    {
        "id":  "zafer.aksoy",
        "adSoyad":  "ZAFER AKSOY",
        "departman":  "PSA",
        "bolum":  "Servis",
        "mevcutUnvan":  "Otomotiv Mekanik Formeni",
        "muduluk":  "BİROL CANER",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "27/12/2024",
        "kurumKidemiYil":  1.68
    },
    {
        "id":  "ali.ulutekin",
        "adSoyad":  "ALİ ULUTEKİN",
        "departman":  "SATIN ALMA",
        "bolum":  "İdari",
        "mevcutUnvan":  "Satın Alma Yöneticisi",
        "muduluk":  "ALİ ULUTEKİN",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "24/05/2019",
        "kurumKidemiYil":  7.27
    },
    {
        "id":  "ramazan.ozdemir",
        "adSoyad":  "RAMAZAN ÖZDEMİR",
        "departman":  "SATIN ALMA",
        "bolum":  "İdari",
        "mevcutUnvan":  "Satın Alma Yöneticisi",
        "muduluk":  "RAMAZAN ÖZDEMİR",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "28/04/2014",
        "kurumKidemiYil":  12.34
    },
    {
        "id":  "sinan.sari",
        "adSoyad":  "SİNAN SARI",
        "departman":  "SATIN ALMA",
        "bolum":  "İdari",
        "mevcutUnvan":  "BİNA-ELEKTRİK BAKIM TEKNİSYENİ",
        "muduluk":  "RAMAZAN ÖZDEMİR",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "15/09/2025",
        "kurumKidemiYil":  0.96
    },
    {
        "id":  "tuncer.kaplan",
        "adSoyad":  "TUNCER KAPLAN",
        "departman":  "SATIN ALMA",
        "bolum":  "İdari",
        "mevcutUnvan":  "Plaza Bakım Teknisyeni",
        "muduluk":  "RAMAZAN ÖZDEMİR",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "10/05/2023",
        "kurumKidemiYil":  3.31
    },
    {
        "id":  "yalcin.temel",
        "adSoyad":  "YALÇIN TEMEL",
        "departman":  "SATIN ALMA",
        "bolum":  "İdari",
        "mevcutUnvan":  "Bahçivan",
        "muduluk":  "RAMAZAN ÖZDEMİR",
        "direktor":  "SERKAN UYGUNOĞLU",
        "iseBaslamaTarihi":  "28/06/2025",
        "kurumKidemiYil":  1.18
    },
    {
        "id":  "ertan.bildik",
        "adSoyad":  "ERTAN BİLDİK",
        "departman":  "YIKAMA BİRİMİ",
        "bolum":  "Servis",
        "mevcutUnvan":  "Oto Yıkama Yöneticisi",
        "muduluk":  "-",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "04/08/2025",
        "kurumKidemiYil":  1.08
    },
    {
        "id":  "fevzi.yucel",
        "adSoyad":  "FEVZİ YÜCEL",
        "departman":  "YIKAMA BİRİMİ",
        "bolum":  "Servis",
        "mevcutUnvan":  "Oto Yıkama Elemanı",
        "muduluk":  "ERTAN BİLDİK",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "02/07/2026",
        "kurumKidemiYil":  0.17
    },
    {
        "id":  "oguzhan.bildik",
        "adSoyad":  "OĞUZHAN BİLDİK",
        "departman":  "YIKAMA BİRİMİ",
        "bolum":  "Servis",
        "mevcutUnvan":  "Oto Yıkama Elemanı",
        "muduluk":  "ERTAN BİLDİK",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "24/11/2025",
        "kurumKidemiYil":  0.77
    },
    {
        "id":  "seref.ozdemir",
        "adSoyad":  "ŞEREF ÖZDEMİR",
        "departman":  "YIKAMA BİRİMİ",
        "bolum":  "Servis",
        "mevcutUnvan":  "Oto Yıkama Elemanı",
        "muduluk":  "ERTAN BİLDİK",
        "direktor":  "RİFAT ERBAŞ",
        "iseBaslamaTarihi":  "26/03/2024",
        "kurumKidemiYil":  2.43
    },
    {
        "id":  "birkan.caliskan",
        "adSoyad":  "BİRKAN ÇALIŞKAN",
        "departman":  "YÖNETİM KURULU",
        "bolum":  "İdari",
        "mevcutUnvan":  "Ceo",
        "muduluk":  "-",
        "direktor":  "BİRKAN ÇALIŞKAN",
        "iseBaslamaTarihi":  "05/05/2025",
        "kurumKidemiYil":  1.33
    },
    {
        "id":  "vedat.inciroglu",
        "adSoyad":  "VEDAT İNCİROĞLU",
        "departman":  "YÖNETİM KURULU",
        "bolum":  "İdari",
        "mevcutUnvan":  "Yönetim Kurulu Başkanı",
        "muduluk":  "-",
        "direktor":  "-",
        "iseBaslamaTarihi":  "02/12/2025",
        "kurumKidemiYil":  0.75
    }
];
const HESAPLAR = [
    {
        "username":  "ali.buyuk",
        "adSoyad":  "ALİ BÜYÜK",
        "muduluk":  "ALİ BÜYÜK",
        "direktorluk":  "ALİ BÜYÜK",
        "roller":  [
                       "manager",
                       "direktor"
                   ]
    },
    {
        "username":  "gokhan.altundal",
        "adSoyad":  "GÖKHAN ALTUNDAL",
        "muduluk":  "GÖKHAN ALTUNDAL",
        "direktorluk":  "GÖKHAN ALTUNDAL",
        "roller":  [
                       "manager",
                       "direktor"
                   ]
    },
    {
        "username":  "abdullah.onen",
        "adSoyad":  "ABDULLAH ÖNDER ÖNEN",
        "muduluk":  "ABDULLAH ÖNDER ÖNEN",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "sahin.tektas",
        "adSoyad":  "ŞAHİN TEKTAŞ",
        "muduluk":  "ŞAHİN TEKTAŞ",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "fatih.boru",
        "adSoyad":  "FATİH BORU",
        "muduluk":  "FATİH BORU",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "mehmet.tiryaki",
        "adSoyad":  "MEHMET TİRYAKİ",
        "muduluk":  "MEHMET TİRYAKİ",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "ramazan.ozdemir",
        "adSoyad":  "RAMAZAN ÖZDEMİR",
        "muduluk":  "RAMAZAN ÖZDEMİR",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "rifat.erbas",
        "adSoyad":  "RIFAT ERBAŞ",
        "muduluk":  "RIFAT ERBAŞ",
        "direktorluk":  "RİFAT ERBAŞ",
        "roller":  [
                       "manager",
                       "direktor"
                   ]
    },
    {
        "username":  "gokhan.bozkurt",
        "adSoyad":  "GÖKHAN BOZKURT",
        "muduluk":  "GÖKHAN BOZKURT",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "ali.ulutekin",
        "adSoyad":  "ALİ ULUTEKİN",
        "muduluk":  "ALİ ULUTEKİN",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "ufuk.onsal",
        "adSoyad":  "UFUK ÖNSAL",
        "muduluk":  "UFUK ÖNSAL",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "ertan.bildik",
        "adSoyad":  "ERTAN BİLDİK",
        "muduluk":  "ERTAN BİLDİK",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "alaaddin.caglikose",
        "adSoyad":  "ALAADDİN ÇAĞLIKÖSE",
        "muduluk":  "ALAADDİN ÇAĞLIKÖSE",
        "direktorluk":  "ALADDİN ÇAĞLIKÖSE",
        "roller":  [
                       "manager",
                       "direktor"
                   ]
    },
    {
        "username":  "memet.cavdar",
        "adSoyad":  "MEMET ORHAN ÇAVDAR",
        "muduluk":  "MEMET ORHAN ÇAVDAR",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "serdar.turkaslan",
        "adSoyad":  "SERDAR TÜRKASLAN",
        "muduluk":  "SERDAR TÜRKASLAN",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "birol.caner",
        "adSoyad":  "BİROL CANER",
        "muduluk":  "BİROL CANER",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "huseyin.sakiroglu",
        "adSoyad":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "muduluk":  null,
        "direktorluk":  "HÜSEYİN UĞUR ŞAKİROĞLU",
        "roller":  [
                       "direktor"
                   ]
    },
    {
        "username":  "pelin.aras",
        "adSoyad":  "PELİN ARAS",
        "muduluk":  "PELİN ARAS",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "ibrahim.topcu",
        "adSoyad":  "İBRAHİM TOPÇU",
        "muduluk":  "İBRAHİM TOPÇU",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "hayri.karahisarli",
        "adSoyad":  "HAYRİ KARAHİSARLI",
        "muduluk":  "HAYRİ KARAHİSARLI",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "serkan.uygunoglu",
        "adSoyad":  "SERKAN UYGUNOĞLU",
        "muduluk":  "SERKAN UYGUNOĞLU",
        "direktorluk":  "SERKAN UYGUNOĞLU",
        "roller":  [
                       "manager",
                       "direktor"
                   ]
    },
    {
        "username":  "abdurrahman.dagdelen",
        "adSoyad":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "muduluk":  "ABDURRAHMAN ÇAĞATAY DAĞDELEN",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "birkan.caliskan",
        "adSoyad":  "BİRKAN ÇALIŞKAN",
        "muduluk":  null,
        "direktorluk":  "BİRKAN ÇALIŞKAN",
        "roller":  [
                       "direktor"
                   ]
    },
    {
        "username":  "abdullah.unal",
        "adSoyad":  "ABDULLAH ÜNAL",
        "muduluk":  "ABDULLAH ÜNAL",
        "direktorluk":  "ABDULLAH ÜNAL",
        "roller":  [
                       "manager",
                       "direktor"
                   ]
    },
    {
        "username":  "melis.inciroglu",
        "adSoyad":  "MELİS SU İNCİROĞLU",
        "muduluk":  "MELİS SU İNCİROĞLU",
        "direktorluk":  "MELİS SU İNCİROĞLU",
        "roller":  [
                       "manager",
                       "direktor"
                   ]
    },
    {
        "username":  "ali.yagci",
        "adSoyad":  "ALİ YAĞCI",
        "muduluk":  "ALİ YAĞCI",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "ugur.erturk",
        "adSoyad":  "UĞUR ERTÜRK",
        "muduluk":  "UĞUR ERTÜRK",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "osman.mazlum",
        "adSoyad":  "OSMAN MAZLUM",
        "muduluk":  "OSMAN MAZLUM",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "ibrahim.ozdemir",
        "adSoyad":  "İBRAHİM ÖZDEMİR",
        "muduluk":  "İBRAHİM ÖZDEMİR",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "osman.coban",
        "adSoyad":  "OSMAN ÇOBAN",
        "muduluk":  "OSMAN ÇOBAN",
        "direktorluk":  "OSMAN ÇOBAN",
        "roller":  [
                       "manager",
                       "direktor"
                   ]
    },
    {
        "username":  "fatih.kara",
        "adSoyad":  "FATİH KARA",
        "muduluk":  "FATİH KARA",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "riza.cetinyurek",
        "adSoyad":  "RIZA ÇETİNYÜREK",
        "muduluk":  "RIZA ÇETİNYÜREK",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "haci.goze",
        "adSoyad":  "HACI MEHMET GÖZE",
        "muduluk":  "HACI MEHMET GÖZE",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    },
    {
        "username":  "murat.atici",
        "adSoyad":  "MURAT ATICI",
        "muduluk":  "MURAT ATICI",
        "direktorluk":  null,
        "roller":  [
                       "manager"
                   ]
    }
];
