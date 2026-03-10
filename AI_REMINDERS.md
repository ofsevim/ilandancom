# 🧠 AI EVRENSEL ÇALIŞMA PRENSİPLERİ & KURALLAR

Bu dosya, her projede AI (Antigravity) tarafından **MUTLAKA** okunmalı ve harfiyen uyulmalıdır. Bu kurallar halüsinasyonları önlemek ve kullanıcı beklentilerini karşılamak içindir.

## 🚨 1. ALTIN KURAL: SORMADAN YAPMA (ASK BEFORE ACTING)
- **Talimat Dışına Çıkma:** Kullanıcının verdiği net talimatların dışına kesinlikle çıkma. 
- **Öneri / Değişiklik:** Eğer bir özelliğin daha iyi olacağını düşünüyorsan veya teknik bir zorunluluktan dolayı rotayı değiştirmen gerekiyorsa, **DEĞİŞİKLİĞİ YAPMADAN ÖNCE** mutlaka kullanıcıya sor: *"Şöyle bir değişiklik yapmayı öneriyorum, onaylıyor musunuz?"*
- **Kendi Başına Karar Verme:** Kullanıcı onay vermediği sürece tasarımda, UX akışında veya ana mantıkta (logic) otonom kararlar alma.

## 🎨 2. GÖRÜNÜRLÜK VE TEMA STANDARTLARI (UNIVERSAL UI/UX)
- **Kontrast Kontrolü:** Her zaman hem Light hem Dark modda elemanların (metin, ikon, border) görünürlüğünü test et. 
  - *Örn:* Beyaz arka planda açık gri metin, siyah arka planda koyu gri metin kullanma.
- **Header & Navbar Tutarlılığı:** Navbar elemanlarının (logo, menü öğeleri) her durumda (scroll, tema değişimi vb.) okunabilir kalmasını sağla.
- **Z-Index Hiyerarşisi:** Modallar en üstte, navbar onun altında, içerik ise en altta olmalıdır. Çakışmaları önceden kontrol et.

## 📱 3. MOBİL ÖNCELİKLİ (MOBILE-FIRST) YAKLAŞIM
- **Parmak Dostu Arayüz:** Butonlar ve etkileşimli alanlar mobilde kolay tıklanabilir olmalıdır.
- **Ekran Alanı Verimliliği:** Mobilde ekranı gereksiz kalabalıklaştıran öğeleri gizle veya alt menü/çekmece (drawer) yapılarına taşı.
- **Grid Stratejisi:** Küçük ekranlarda içeriklerin (kartlar, listeler) birbirine girmemesini sağla (Min-width ve auto-fill stratejilerini kullan).

## 🛠️ 4. TEMİZ KOD VE MANTIKSAL DİSİPLİN (CLEAN CODE)
- **Gereksiz Kod Temizliği:** Kullanılmayan importları, değişkenleri ve console.log'ları temizle.
- **Hata Yönetimi:** Yeni bir özellik eklerken mevcut özelliklerin kırılmadığından emin ol (Regression testing zihniyeti).
- **Yorum Satırları:** Karmaşık mantıkları kısaca açıkla ama kodu şişirme.

---
*Bu dosya projenin anayasasıdır. Her komuttan önce bu kuralları zihninde (veya bağlamında) doğrula.*
