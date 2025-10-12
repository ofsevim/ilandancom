# Sahibinden Clone - Supabase Entegrasyonu

Modern React + TypeScript + Tailwind CSS ile geliştirilmiş, Supabase backend entegrasyonlu ilan sitesi.

## 🚀 Özellikler

- **Modern UI/UX**: Tailwind CSS ile responsive tasarım
- **Gerçek Zamanlı Veri**: Supabase ile canlı veri senkronizasyonu
- **Kullanıcı Yönetimi**: Supabase Auth ile güvenli kimlik doğrulama
- **İlan Yönetimi**: CRUD işlemleri, resim yükleme
- **Arama & Filtreleme**: Gelişmiş arama sistemi
- **Favoriler**: Kullanıcı favori sistemi
- **Admin Paneli**: Yönetim arayüzü
- **Dark Mode**: Karanlık tema desteği

## 🛠️ Teknolojiler

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Kurulum

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd project
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Environment Variables
`.env` dosyasını oluşturun:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
VITE_APP_NAME=Sahibinden Clone
VITE_APP_VERSION=1.0.0
```

### 4. Supabase Veritabanını Kurun
1. Supabase projenizde SQL Editor'ü açın
2. `database.sql` dosyasındaki SQL kodunu çalıştırın

### 5. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

## 🗄️ Veritabanı Şeması

### Tablolar
- **users**: Kullanıcı bilgileri
- **categories**: İlan kategorileri
- **ads**: İlanlar
- **favorites**: Kullanıcı favorileri

### Storage
- **ad-images**: İlan resimleri için bucket

## 🔧 API Servisleri

### Auth Service
- `signUp()`: Kullanıcı kaydı
- `signIn()`: Giriş
- `signOut()`: Çıkış
- `getCurrentUser()`: Mevcut kullanıcı

### Ad Service
- `getAllAds()`: Tüm ilanları getir
- `getAdById()`: Tek ilan getir
- `createAd()`: Yeni ilan oluştur
- `updateAd()`: İlan güncelle
- `deleteAd()`: İlan sil

### Category Service
- `getAllCategories()`: Tüm kategorileri getir

### Storage Service
- `uploadImage()`: Resim yükle
- `getImageUrl()`: Resim URL'i al
- `deleteImage()`: Resim sil

## 🎨 Bileşenler

- **Layout**: Ana sayfa düzeni
- **Header**: Navigasyon ve arama
- **CategoryGrid**: Kategori listesi
- **AdGrid**: İlan listesi
- **AdCard**: Tek ilan kartı
- **AdDetailModal**: İlan detay modalı
- **NewAdModal**: Yeni ilan oluşturma
- **SearchFilters**: Arama filtreleri
- **AuthModal**: Giriş/kayıt modalı
- **AdminDashboard**: Admin paneli

## 🔐 Güvenlik

- **Row Level Security (RLS)**: Veritabanı seviyesinde güvenlik
- **Supabase Auth**: Güvenli kimlik doğrulama
- **Policy-based Access**: Tablo bazında erişim kontrolü

## 📱 Responsive Design

- Mobile-first yaklaşım
- Tailwind CSS breakpoint'leri
- Touch-friendly arayüz

## 🌙 Dark Mode

- Sistem tercihi desteği
- Manuel toggle
- CSS değişkenleri ile tema

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

## 📝 Geliştirme Notları

### Yeni Özellik Ekleme
1. API servisini `src/services/api.ts`'e ekle
2. Custom hook oluştur (`src/hooks/`)
3. Bileşeni geliştir (`src/components/`)
4. Type tanımlarını güncelle (`src/types/`)

### Veritabanı Değişiklikleri
1. SQL migration dosyası oluştur
2. Supabase'de çalıştır
3. Type tanımlarını güncelle
4. API servislerini güncelle

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## 📄 Lisans

MIT License

## 🆘 Destek

Sorunlarınız için issue açabilirsiniz.
