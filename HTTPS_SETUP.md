# 🔒 HTTPS Kurulum Rehberi

## Safari ve Modern Tarayıcılar İçin Güvenlik Sertifikası

### 🚨 **Sorun:**
- Safari tarayıcısı HTTP siteleri engelliyor
- Modern tarayıcılar HTTPS zorunluluğu
- Güvenlik sertifikası uyarıları

### ✅ **Çözüm:**

#### **1. HTTPS ile Geliştirme:**
```bash
# HTTPS ile çalıştır (vite.config.ts'de https: true)
npm run dev

# Network erişimi için
npm run dev:https
```

#### **2. Tarayıcı Güvenlik Uyarıları:**
- **Chrome/Edge:** "Gelişmiş" → "Güvenli olmayan siteye git"
- **Firefox:** "Gelişmiş" → "Riski kabul et"
- **Safari:** "Gelişmiş" → "Güvenli olmayan siteye git"

#### **3. Yerel Sertifika Kurulumu (İsteğe Bağlı):**

##### **Windows:**
```bash
# Sertifikayı tarayıcıya ekle
# Chrome: chrome://settings/certificates
# Edge: edge://settings/certificates
```

##### **macOS:**
```bash
# Keychain'e ekle
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain localhost.pem
```

#### **4. Network Erişimi:**
```bash
# Diğer cihazlardan erişim için
npm run dev:https -- --host
```

### 🌐 **Production Deployment:**

#### **Vercel/Netlify:**
- Otomatik HTTPS sertifikası
- Custom domain desteği

#### **VPS/Dedicated:**
- Let's Encrypt sertifikası
- Nginx/Apache SSL konfigürasyonu

### 📱 **Mobil Test:**
```bash
# Network IP ile erişim
https://192.168.1.100:5173
```

### 🔧 **Vite Konfigürasyonu:**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    https: true,
    host: true,
    port: 5173,
  },
});
```

### ⚠️ **Önemli Notlar:**
- Geliştirme ortamında self-signed sertifika kullanılır
- Production'da gerçek SSL sertifikası gerekli
- Safari en katı güvenlik politikalarına sahip
- HTTPS olmadan modern web API'leri çalışmaz

### 🎯 **Sonuç:**
HTTPS ile çalıştırdıktan sonra tüm tarayıcılarda sorunsuz açılacak! 🚀
