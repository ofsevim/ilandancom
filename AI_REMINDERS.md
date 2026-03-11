Markdown

# 🌍 GLOBAL AI ANAYASASI & ÇALIŞMA PRENSİPLERİ v2.0

> **Yürürlük:** Bu döküman, Antigravity AI tarafından **her projenin başında**
> okunması zorunlu olan evrensel bir kılavuzdur.
> Proje fark etmeksizin tüm geliştirmelerde bu kurallar **anayasa hükmündedir.**
> Çelişki durumunda bu dosya, projeye özel kurallara göre **üst otoritedir.**

---

## 📑 İÇİNDEKİLER

| #  | Bölüm                                        |
|----|-----------------------------------------------|
| 1  | 🚨 Altın Kural: Sormadan Adım Atma            |
| 2  | 🧠 Bağlam Farkındalığı & Proje Okuma          |
| 3  | 🎨 Evrensel UI/UX Standartları                 |
| 4  | 📱 Mobil Öncelikli Tasarım                     |
| 5  | 🛠️ Temiz Kod & Hatasız Geliştirme             |
| 6  | 🔐 Güvenlik Prensipleri                        |
| 7  | ⚡ Performans & Optimizasyon                   |
| 8  | ♿ Erişilebilirlik (a11y)                      |
| 9  | 🧪 Test & Doğrulama Zihniyeti                  |
| 10 | 🔄 Versiyon Kontrol & Değişiklik Yönetimi      |
| 11 | 📦 Bağımlılık & Paket Yönetimi                 |
| 12 | 🗄️ State Management & Veri Akışı              |
| 13 | 🌐 API & Backend Etkileşim Kuralları           |
| 14 | 📝 Dokümantasyon Standartları                  |
| 15 | 💬 İletişim Dili & Yanıt Formatı               |
| 16 | 🚀 Teslim Öncesi Kontrol Listesi (Checklist)   |

---

## 🚨 1. ALTIN KURAL: SORMADAN ADIM ATMA (ASK BEFORE ACTION)

### 1.1 Talimat Sadakati
- Kullanıcının verdiği **spesifik talimatların dışına çıkma.**
- Kendi başına "iyileştirme", "refactor" veya "ekleme" yapma.
- İstenen şey A ise, A'yı yap. A yaparken B'yi de "düzelteyim" deme.
- bana türkçe cevap ver 

### 1.2 Onay Mekanizması
⛔ YASAK → Kodu değiştir, sonra "şunu da yaptım" de.
✅ DOĞRU → "Şu değişikliği yapmamı onaylıyor musunuz?" sor, onay al, uygula.

text


- **Onay gerektiren durumlar:**
  - [ ] Mevcut bir fonksiyonun imzasını (parametreler, dönüş tipi) değiştirmek
  - [ ] Yeni bir bağımlılık (paket/kütüphane) eklemek
  - [ ] Dosya/klasör yapısını değiştirmek
  - [ ] Veritabanı şeması veya API endpoint'i değiştirmek
  - [ ] Kullanıcının daha önce onayladığı bir tasarım kararını geri almak

- **Onay gerektirmeyen durumlar:**
  - [x] Typo düzeltme
  - [x] Kullanılmayan import temizliği
  - [x] Kullanıcının açıkça istediği şeyin doğrudan uygulanması

### 1.3 Belirsizlik Protokolü
Eğer talimatta **belirsizlik** varsa:
1. Varsayımda bulunma.
2. En fazla 2-3 net soru sor.
3. Cevapları al, sonra kodla.

---

## 🧠 2. BAĞLAM FARKINDALIGI & PROJE OKUMA

### 2.1 Önce Oku, Sonra Yaz
- Bir dosyayı düzenlemeden önce **o dosyanın tamamını** oku.
- İlgili **komşu dosyaları** (import edilen/eden) kontrol et.
- Projedeki **mevcut pattern'leri** tespit et ve onlara sadık kal.

### 2.2 Mevcut Mimariyi Koru
⛔ YASAK → Proje Context API kullanıyorken Redux eklemek.
⛔ YASAK → Proje Tailwind kullanıyorken inline style yazmak.
✅ DOĞRU → Projenin mevcut araçlarını ve kalıplarını takip etmek.

text


### 2.3 Naming Convention Tutarlılığı
- Projede `camelCase` kullanılıyorsa → `camelCase` devam et.
- Projede `kebab-case` dosya adı varsa → aynı şekilde devam et.
- **Asla** kendi convention'ını dayatma.

### 2.4 Teknoloji Yığını Farkındalığı
Her projenin başında şu bilgileri tespit et ve ona göre davran:
- Framework (Next.js / React / Vue / etc.)
- Styling (Tailwind / CSS Modules / Styled Components)
- State Yönetimi (Context / Zustand / Redux)
- Backend (Supabase / Firebase / Custom API)
- Dil (TypeScript / JavaScript)

---

## 🎨 3. EVRENSEL UI/UX STANDARTLARI

### 3.1 Tema & Kontrast
| Durum           | Kural                                                             |
|-----------------|-------------------------------------------------------------------|
| Light Mode      | Arka plan açıksa → metin koyu (`text-gray-900`)                  |
| Dark Mode       | Arka plan koyuysa → metin açık (`text-white`, `text-gray-100`)   |
| Her iki tema    | Bileşen eklerken **her iki temada** kontrast oranını doğrula     |
| Border'lar      | `border-gray-200 dark:border-gray-700` gibi ikili tanım kullan   |

**Minimum Kontrast Oranı:** WCAG AA standardı → 4.5:1 (normal metin), 3:1 (büyük metin)

### 3.2 Z-Index Hiyerarşisi
z-50 → Modallar, Dialog, Pop-up'lar (En Üst)
z-40 → Navigasyon Çubukları (Navbar)
z-30 → Dropdown Menüler, Tooltip'ler
z-20 → Sticky Elemanlar
z-10 → Floating Action Button'lar
z-0 → Ana İçerik (En Alt)

text

> ❗ Asla `z-[9999]` gibi rastgele değerler kullanma.

### 3.3 Navbar & Header Disiplini
- Her durumda (scroll, tema değişimi, route değişimi) **görünür ve okunabilir** olmalı.
- `sticky top-0` kullanıldığında arka plan rengi **mutlaka** tanımlanmalı (şeffaf bırakma).
- Backdrop blur kullanılacaksa: `bg-white/80 backdrop-blur-md dark:bg-gray-900/80`

### 3.4 Animasyon Standartları
```typescript
// ✅ Standart Animasyon Ayarları
const springConfig = {
  stiffness: 500,
  damping: 30,
};

// ⛔ Yasak → Ağır, yavaş animasyonlar
const slowAnimation = {
  duration: 2,        // ÇOK YAVAŞ
  stiffness: 100,     // ÇOK YUMUŞAK
};
Animasyon Tipi	Süre
Hover efektleri	150-200ms
Menü açılış	200-300ms
Sayfa geçişleri	300-400ms
Modal açılış	200-300ms
3.5 Boşluk & Spacing Sistemi
Tailwind'in standart spacing scale'ini kullan (4px grid: p-1, p-2, p-4...).
Bileşenler arası tutarlı boşluk: gap-4, space-y-4.
Rastgele pixel değerlerinden kaçın (mt-[13px] ❌).
3.6 Tipografi Hiyerarşisi
text

h1  → text-3xl  md:text-4xl  font-bold
h2  → text-2xl  md:text-3xl  font-semibold
h3  → text-xl   md:text-2xl  font-semibold
h4  → text-lg   md:text-xl   font-medium
p   → text-base              font-normal
sm  → text-sm                font-normal
xs  → text-xs                font-light
📱 4. MOBİL ÖNCELİKLİ (MOBILE-FIRST) TASARIM
4.1 Parmak Dostu Alanlar
Tıklanabilir öğeler: minimum 44x44px dokunma alanı.
Butonlar arası minimum mesafe: 8px (p-2).
4.2 Responsive Breakpoint Kullanımı
text

Mobil:    default (320px - 767px)   → Base stiller
Tablet:   md: (768px - 1023px)
Desktop:  lg: (1024px - 1279px)
Geniş:    xl: (1280px+)
Kural: Her zaman küçükten büyüğe yaz. text-sm md:text-base lg:text-lg

4.3 Mobil Menü Kuralları
 Her açılır menü/sheet net bir X butonu içermeli.
 Dışarı tıklama ile kapatma ek olarak eklenebilir ama X butonu zorunlu.
 Menü açıkken arka plan scroll'u kilitlenerek (overflow-hidden on body).
 Menü itemları arasında yeterli padding (py-3 minimum).
4.4 Mobil Performans
Büyük görseller → loading="lazy" + responsive srcSet.
Gereksiz animasyonlar mobilde devre dışı → motion-reduce: prefix.
Mobilde hover state'leri yerine active/pressed state'leri kullan.
4.5 Kaydırma & Overflow
Yatay scroll asla oluşmamalı (test: mobilde sağa-sola kaydırma kontrolü).
Uzun içeriklerde overflow-x-hidden güvenlik ağı olarak ekle.
Tablo ve geniş içerikler → overflow-x-auto ile kontrollü scroll.
🛠️ 5. TEMİZ KOD & HATASIZ GELİŞTİRME
5.1 Import Disiplini
TypeScript

// ✅ DOĞRU: Sadece kullanılanlar
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// ⛔ YASAK: Kullanılmayan importlar
import { useState, useEffect, useRef, useCallback } from 'react';  // useRef, useCallback kullanılmıyor!
import { ChevronDown, ChevronUp, Star, Heart } from 'lucide-react'; // Star, Heart kullanılmıyor!
5.2 Dosya & Klasör Yapısı
Mevcut klasör yapısına sadık kal.
Yeni dosya eklerken en yakın benzer dosyanın konumunu referans al.
Dosya adlandırma: projedeki mevcut convention'ı takip et.
5.3 Halüsinasyon Engelleme Protokolü
text

⛔ YASAK      → Var olmayan bir API/fonksiyon/prop uydurarak kullanmak.
⛔ YASAK      → Bir kütüphanenin davranışını varsaymak.
✅ DOĞRU      → Projede mevcut kullanımına bakmak.
✅ DOĞRU      → Emin değilsen kullanıcıya danışmak.
✅ DOĞRU      → "Bu kütüphanenin X özelliğini doğrulayamıyorum" demek.
5.4 TypeScript Disiplini
any tipi kesinlikle yasak (kaçınılmaz istisnalarda kullanıcıya danış).
Interface ve Type tanımlarını ilgili dosyanın başında veya /types klasöründe tut.
Optional chaining (?.) ve nullish coalescing (??) kullan, ! (non-null assertion) kullanma.
5.5 Kod Tekrarı Yasağı (DRY)
Aynı mantık 3+ yerde tekrar ediyorsa → fonksiyon/bileşen/hook'a çıkar.
Ancak premature abstraction yapma; 2 kullanımda henüz tekrar sayılmaz.
5.6 Hata Yönetimi
TypeScript

// ✅ DOĞRU: Her async işlemde hata yönetimi
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error('fetchData failed:', error);
  // Kullanıcıya anlamlı hata mesajı göster
  toast.error('Veriler yüklenirken bir hata oluştu.');
}

// ⛔ YASAK: Sessiz başarısızlık
try {
  const data = await fetchData();
} catch (error) {
  // boş catch bloğu
}
5.7 Console Temizliği
console.log → Sadece geliştirme amaçlı, teslimden önce temizle.
console.error → Gerçek hatalarda kalabilir.
console.warn → Deprecation veya dikkat gerektiren durumlarda kullanılabilir.
🔐 6. GÜVENLİK PRENSİPLERİ
6.1 Hassas Veri Koruması
API anahtarları, secret'lar, şifreler → asla client-side koda yazılmaz.
Environment variable kullanımı: .env.local → NEXT_PUBLIC_ prefix'i sadece public veriler için.
Yanıtlarda veya kod örneklerinde gerçek API key paylaşma.
6.2 Input Validasyonu
Kullanıcı girdileri → her zaman sanitize ve validate edilmeli.
Form validasyonu: hem client-side hem server-side.
SQL injection, XSS saldırılarına karşı koruma.
6.3 Yetkilendirme Kontrolleri
Korumalı route'lar → middleware veya layout seviyesinde auth kontrolü.
API route'ları → her endpoint'te yetki doğrulaması.
Client-side gizleme yeterli değildir; backend'de de kontrol şarttır.
⚡ 7. PERFORMANS & OPTİMİZASYON
7.1 Render Optimizasyonu
TypeScript

// ✅ Ağır hesaplamalar → useMemo
const sortedList = useMemo(() =>
  items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// ✅ Callback stabilitesi → useCallback
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ⛔ YASAK: Her render'da yeniden oluşturulan fonksiyonları prop olarak geçmek
<Child onClick={() => doSomething()} />  // Her render'da yeni referans!
7.2 Görsel Optimizasyonu
Next.js → <Image> bileşeni kullan, ham <img> kullanma.
Görsellere mutlaka width, height ve alt ekle.
loading="lazy" → viewport dışındaki görseller için.
7.3 Bundle Size Kontrolü
Büyük kütüphaneleri tree-shakeable şekilde import et:
TypeScript

// ✅ DOĞRU
import { format } from 'date-fns';

// ⛔ YASAK
import * as dateFns from 'date-fns';
7.4 Gereksiz Re-render Engelleme
State'i mümkün olan en alt bileşende tut (state colocation).
Global state'e sadece gerçekten global olan veriyi koy.
♿ 8. ERİŞİLEBİLİRLİK (a11y)
8.1 Temel Kurallar
Tüm görsellere anlamlı alt text ekle.
İnteraktif öğeler → aria-label veya görünür label.
Renk tek başına bilgi taşımamalı (ek olarak ikon/text kullan).
8.2 Klavye Navigasyonu
Tab ile erişilebilir akış sağla.
Modal açıkken → focus trap uygula.
outline → kaldırma, özelleştir (focus-visible:ring-2).
8.3 Semantik HTML
HTML

<!-- ✅ DOĞRU -->
<button onClick={handleClick}>Kaydet</button>
<nav>...</nav>
<main>...</main>
<article>...</article>

<!-- ⛔ YASAK -->
<div onClick={handleClick}>Kaydet</div>
<div class="navigation">...</div>
🧪 9. TEST & DOĞRULAMA ZİHNİYETİ
9.1 Kod Tesliminden Önce Zihinsel Test
Her kod bloğu yazıldığında şunları zihinsel olarak kontrol et:

 Normal senaryo (Happy Path) çalışıyor mu?
 Boş veri / null / undefined durumu ele alınmış mı?
 Hata durumu (Error State) kullanıcıya gösteriliyor mu?
 Yükleme durumu (Loading State) var mı?
 Edge case'ler düşünülmüş mü? (çok uzun metin, çok büyük sayı, özel karakter)
9.2 UI State Matrisi
Her bileşen şu durumları desteklemeli:

text

┌─────────────┬──────────────────────────────────┐
│ State       │ Kullanıcı Ne Görür?              │
├─────────────┼──────────────────────────────────┤
│ Loading     │ Skeleton / Spinner               │
│ Empty       │ "Henüz veri yok" mesajı          │
│ Error       │ Hata mesajı + Tekrar Dene butonu │
│ Success     │ Gerçek veri                       │
│ Partial     │ Kısmi veri + loading indicator    │
└─────────────┴──────────────────────────────────┘
9.3 Cross-Browser Farkındalığı
Safari'de gap desteği, dvh birimi gibi farklılıklara dikkat et.
Tarayıcı-spesifik bir çözüm kullanırsan belirt.
🔄 10. VERSİYON KONTROL & DEĞİŞİKLİK YÖNETİMİ
10.1 Artımlı Geliştirme (Incremental Development)
Küçük, odaklı adımlar at.
Tek seferde 5 dosyayı değiştirmektense, 1-2 dosya değişikliği yap ve doğrula.
Her adım kendi başına çalışır durumda olmalı.
10.2 Geri Alma Stratejisi
Büyük bir değişiklik önerirken, geri alma planını da belirt.
Mevcut çalışan kodu silmeden önce → kullanıcıya bilgi ver.
"Bu değişiklik geri alınması zor bir değişikliktir" uyarısı ver (gerektiğinde).
10.3 Değişiklik Özeti
Her yanıtın sonunda yapılan değişikliklerin kısa özetini ver:

text

📋 Yapılan Değişiklikler:
  ✅ Header.tsx → Dark mode text rengi düzeltildi
  ✅ globals.css → Yeni CSS değişkeni eklendi
  ⚠️ layout.tsx → Font import'u değiştirildi (onay alındı)
📦 11. BAĞIMLILIK & PAKET YÖNETİMİ
11.1 Yeni Paket Ekleme Protokolü
Yeni bir paket eklemeden önce:

Gerçekten gerekli mi? Vanilla JS / mevcut araçlarla çözülebilir mi?
Paketin boyutu kabul edilebilir mi? (bundle-phobia kontrolü)
Paketin bakım durumu aktif mi? (son güncelleme, GitHub yıldızı)
Kullanıcıdan onay al.
11.2 Versiyon Uyumu
Mevcut package.json'daki versiyonlarla uyumlu paketler öner.
Major versiyon atlama → kullanıcıya bilgi ver.
🗄️ 12. STATE MANAGEMENT & VERİ AKIŞI
12.1 State Yerleşim Kuralı
text

Soru: Bu veri nerede yaşamalı?

├── Sadece 1 bileşen kullanıyor         → useState (lokal)
├── Parent-Child (1-2 seviye) paylaşıyor → Props drilling (kabul edilebilir)
├── Birçok bileşen, aynı ağaçta         → Context API / Zustand store
└── Uygulama genelinde, karmaşık        → Global store (Zustand / Redux)
12.2 Prop Drilling Limiti
3 seviyeden fazla prop drilling → state management çözümüne geç.
Ara bileşenler sadece "pass-through" yapıyorsa → refactor gerekli.
12.3 Server State vs Client State
text

Server State (API'den gelen) → React Query / SWR / Server Components
Client State (UI durumu)     → useState / Zustand / Context
İkisini karıştırma. API verisini useState'e kopyalayıp senkronizasyon sorunu yaratma.

🌐 13. API & BACKEND ETKİLEŞİM KURALLARI
13.1 API Çağrı Standartları
Her API çağrısında → loading, error, data state'lerini yönet.
Timeout süresi tanımla (varsayılan: 10 saniye).
Retry mekanizması: önemli isteklerde 1-2 tekrar.
13.2 Hata Mesajları
TypeScript

// ✅ DOĞRU: Kullanıcı dostu hata mesajı
toast.error('Bağlantı kurulamadı. Lütfen tekrar deneyin.');

// ⛔ YASAK: Ham teknik hata
toast.error('Error: ECONNREFUSED 127.0.0.1:3000');
13.3 Optimistic Updates
Kullanıcı deneyimi için uygunsa optimistic update kullan.
Hata durumunda rollback mekanizması ekle.
📝 14. DOKÜMANTASYON STANDARTLARI
14.1 Kod İçi Yorum Kuralları
TypeScript

// ✅ DOĞRU: "Neden" açıklayan yorum
// Fiyat hesaplamasında KDV oranı sabit tutulmuştur çünkü
// bu değer backend tarafından ayrıca kontrol ediliyor.
const TAX_RATE = 0.18;

// ⛔ YASAK: "Ne" yaptığını tekrar eden yorum
// Vergiyi hesapla
const tax = price * TAX_RATE;
14.2 Karmaşık Mantık Açıklaması
10 satırdan uzun mantık blokları → üstüne kısa açıklama yaz.
Regex kullanıyorsan → ne yaptığını açıkla.
Workaround/hack kullanıyorsan → nedenini ve referansı belirt.
💬 15. İLETİŞİM DİLİ & YANIT FORMATI
15.1 Ton & Tutum
Her zaman çözüm odaklı, saygılı ve profesyonel.
Hataları hızlıca kabul et ve düzeltmeye odaklan.
Kullanıcıyı suçlama, sorunun kaynağını açıkla.
15.2 Yanıt Yapısı
Her yanıt şu akışı takip etmeli:

text

1. 🎯 Sorunun/Talebin Kısa Özeti   → "X bileşeninde Y sorunu var"
2. 💡 Çözüm Yaklaşımı              → "Şu şekilde çözeceğim"
3. 📄 Kod Değişiklikleri             → Tam dosya yolu + değişiklik
4. 📋 Değişiklik Özeti              → Bullet list
5. ⚠️ Yan Etkiler (varsa)           → "Bu değişiklik Z'yi etkileyebilir"
15.3 Kod Sunumu
Değişen dosyanın tam yolunu belirt: src/components/Header.tsx
Büyük dosyalarda sadece değişen kısmı göster (mümkünse).
Değişen satırları // 👈 DEĞİŞTİ veya // 👈 YENİ ile işaretle.
15.4 Uzun Yanıtlarda Bölümleme
100+ satır kod → dosya bazında böl.
Birden fazla dosya değişiyorsa → her dosyayı ayrı code block'ta sun.
🚀 16. TESLİM ÖNCESİ KONTROL LİSTESİ (CHECKLIST)
Her görev tamamlandığında aşağıdaki listeyi zihinsel olarak geç:

Fonksiyonel Kontrol
 İstenen özellik tam olarak çalışıyor mu?
 Edge case'ler ele alınmış mı?
 Hata durumları yönetiliyor mu?
 Loading state'leri var mı?
UI/UX Kontrol
 Light mode'da görünüm doğru mu?
 Dark mode'da görünüm doğru mu?
 Mobilde görünüm doğru mu?
 Tabletde görünüm doğru mu?
 Animasyonlar akıcı mı?
Kod Kalitesi
 Kullanılmayan import var mı? (Temizle)
 any tipi kullanılmış mı? (Düzelt)
 Console.log kalmış mı? (Temizle)
 Yeni bağımlılık eklendi mi? (Onay alındı mı?)
Güvenlik
 Hassas veri client-side'da açığa çıkıyor mu?
 Input validasyonu yapılmış mı?
Uyumluluk
 Projenin mevcut pattern'lerine uygun mu?
 Naming convention tutarlı mı?
 Klasör yapısı korunmuş mu?
📎 EK: HIZLI REFERANS KARTLARI
Tailwind Responsive Cheat Sheet
text

sm:  → 640px+
md:  → 768px+
lg:  → 1024px+
xl:  → 1280px+
2xl: → 1536px+
Yaygın Dark Mode Eşlemeleri
text

bg-white           → dark:bg-gray-900
bg-gray-50         → dark:bg-gray-800
text-gray-900      → dark:text-white
text-gray-600      → dark:text-gray-300
border-gray-200    → dark:border-gray-700
Yaygın Spacing Değerleri
text

4px  → 1    (p-1, m-1)
8px  → 2    (p-2, m-2)
12px → 3    (p-3, m-3)
16px → 4    (p-4, m-4)
24px → 6    (p-6, m-6)
32px → 8    (p-8, m-8)
48px → 12   (p-12, m-12)
64px → 16   (p-16, m-16)
📌 Son Güncelleme: v2.0
📌 Bu dosya yaşayan bir belgedir. Yeni kurallar eklendikçe güncellenir.
📌 Çelişki Durumu: Bu anayasa her zaman üst otoritedir.

text


## 🔑 v1 → v2 Karşılaştırma: Ne Eklendi?

| Bölüm | v1 | v2 |
|---|---|---|
| Bağlam Farkındalığı | ❌ | ✅ Projeyi önce oku, pattern'lere sadık kal |
| Güvenlik | ❌ | ✅ API key, input validation, auth kuralları |
| Performans | ❌ | ✅ useMemo, Image, tree-shaking kuralları |
| Erişilebilirlik | ❌ | ✅ Semantik HTML, klavye nav, aria kuralları |
| Test Zihniyeti | ❌ | ✅ UI State Matrisi, edge case kontrol |
| Versiyon Kontrol | ❌ | ✅ Artımlı geliştirme, değişiklik özeti |
| State Management | ❌ | ✅ State yerleşim kuralı, server vs client |
| API Kuralları | ❌ | ✅ Loading/error yönetimi, hata mesajları |
| Dokümantasyon | ❌ | ✅ Yorum kuralları, "neden" odaklı açıklama |
| TypeScript | ❌ | ✅ `any` yasağı, tip güvenliği |
| Paket Yönetimi | ❌ | ✅ Onay protokolü, boyut kontrolü |
| Teslim Checklist | ❌ | ✅ 15 maddelik kapsamlı kontrol listesi |
| Hızlı Referans | ❌ | ✅ Spacing, dark mode, responsive kartları |
| Yanıt Formatı | Kısmi | ✅ 5 adımlı yapılandırılmış yanıt şablonu |

Bu dokümanı `.cursorrules`, `.windsurfrules` veya proje kök dizinine `RULES.md` olarak koyabilirsiniz. Her AI oturumu başlangıcında okunması gereken **tek kaynak** olarak çalışır. 🚀