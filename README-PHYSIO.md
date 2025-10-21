# Fizyoterapist Randevu Takip Uygulaması

Modern ve kullanıcı dostu bir fizyoterapist randevu yönetim sistemi. Freelance fizyoterapistlerin hastalarını, randevularını, seanslarını ve ödemelerini kolayca takip etmelerini sağlar.

## 🎯 Özellikler

### 📊 Dashboard
- Genel istatistikler (toplam hasta, bugünkü randevular, bekleyen ödemeler)
- Toplam gelir özeti
- Yaklaşan randevular listesi
- Randevu talepleri bildirimi

### 👥 Hasta Yönetimi
- Hasta ekleme, düzenleme ve silme
- Detaylı hasta profilleri (kişisel bilgiler, tanı, notlar)
- Toplam ve tamamlanan seans takibi
- Kalan seans görüntüleme
- Hızlı arama özelliği

### 📅 Randevu Yönetimi
- Haftalık takvim görünümü
- Randevu ekleme, düzenleme ve silme
- Randevu durumu takibi (Planlandı, Tamamlandı, İptal, Gelmedi)
- Seans numarası takibi
- Günlük boş slot görüntüleme

### 📝 Seans Takibi
- Detaylı seans kayıtları
- Tedavi notları
- Verilen egzersiz listesi
- Ağrı seviyesi takibi (1-10)
- İlerleme durumu kayıtları
- Sonraki adımlar planlaması
- Hasta bazlı filtreleme

### 💰 Ödeme Yönetimi
- Ödeme ekleme ve takibi
- Ödeme durumu (Bekliyor, Ödendi, Gecikmiş, İptal)
- Gelir raporları
- Vade tarihi takibi
- Ödeme yöntemi kayıtları
- Filtreleme (tümü, bekliyor, ödendi, gecikmiş)

### 📬 Randevu Talepleri
- Online randevu talep sistemi
- Talep onaylama/reddetme
- Talep durumu takibi
- İletişim bilgileri kayıtları

### ⚙️ Ayarlar
- Çalışma saatleri yapılandırması (haftalık)
- Varsayılan seans süresi
- Mola süresi ayarı
- Para birimi seçimi
- Varsayılan seans ücreti

## 🛠️ Teknolojiler

- **React 18** - Modern UI geliştirme
- **TypeScript** - Tip güvenliği
- **React Router** - Sayfa yönlendirme
- **Tailwind CSS** - Responsive tasarım
- **Lucide React** - İkonlar
- **date-fns** - Tarih işlemleri
- **LocalStorage** - Veri saklama

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 16+
- npm veya yarn

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

3. Tarayıcınızda açın:
```
http://localhost:5173
```

4. Üretim için build:
```bash
npm run build
```

## 📦 Veri Yapısı

Uygulama LocalStorage kullanarak tarayıcıda veri saklar. Veriler şu kategorilerde organize edilmiştir:

- **Hastalar** - Hasta bilgileri ve tedavi geçmişi
- **Randevular** - Randevu detayları ve zamanlaması
- **Seanslar** - Detaylı seans kayıtları ve tedavi notları
- **Ödemeler** - Finansal işlemler ve gelir takibi
- **Talepler** - Hasta randevu talepleri
- **Ayarlar** - Uygulama yapılandırması

## 🎨 Özellikler

### Demo Veri
İlk açılışta otomatik olarak demo veriler yüklenir:
- 2 örnek hasta
- Yaklaşan randevular
- Örnek ödeme kayıtları

### Responsive Tasarım
- Mobil uyumlu
- Tablet ve desktop desteği
- Adaptive sidebar menü

### Kullanıcı Dostu Arayüz
- Modern ve temiz tasarım
- Kolay navigasyon
- Anlaşılır bildirimler
- Hızlı erişim için shortcut'lar

## 📱 Sayfalar

1. **Dashboard** (`/`) - Genel bakış ve önemli bilgiler
2. **Hastalar** (`/patients`) - Hasta yönetimi
3. **Randevular** (`/appointments`) - Randevu takvimi
4. **Seanslar** (`/sessions`) - Seans kayıtları
5. **Ödemeler** (`/payments`) - Finansal takip
6. **Randevu Talepleri** (`/requests`) - Gelen talepler
7. **Ayarlar** (`/settings`) - Sistem ayarları

## 🔐 Güvenlik

- Tüm veriler tarayıcının LocalStorage'ında saklanır
- Hassas bilgiler için ek güvenlik önlemleri alınabilir
- Üretim ortamında backend entegrasyonu önerilir

## 🚧 Gelecek Geliştirmeler

- [ ] Backend API entegrasyonu
- [ ] Kullanıcı kimlik doğrulama
- [ ] E-posta/SMS bildirimleri
- [ ] Rapor ve istatistik sayfası
- [ ] Hasta portalı
- [ ] Takvim export (iCal, Google Calendar)
- [ ] Fatura oluşturma
- [ ] Çoklu dil desteği

## 📄 Lisans

Bu proje kişisel kullanım için geliştirilmiştir.

## 👨‍💻 Geliştirici

Ahmet Fatih Şahin - Pharmacist & Ph.D. in Computer-Aided Drug Discovery
- Email: fatihsahincadd@gmail.com
- LinkedIn: [ahmet-fatih-sahin](https://www.linkedin.com/in/ahmet-fatih-sahin-9bb20518a/)

---

**Not**: Bu uygulama demo amaçlıdır ve üretim ortamında kullanılmadan önce güvenlik ve performans testlerinden geçirilmelidir.
