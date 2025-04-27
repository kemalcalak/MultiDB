# Multi-Database E-Ticaret Projesi

Bu proje, Next.js tabanlı bir e-ticaret uygulamasıdır. MongoDB ve MySQL veritabanlarını birlikte kullanarak hibrit bir veritabanı mimarisi üzerine inşa edilmiştir.

## Proje Hakkında

Bu e-ticaret platformu aşağıdaki özellikleri içermektedir:

- Kullanıcı kaydı ve kimlik doğrulama (Next-Auth)
- Ürün yönetimi (listeleme, ekleme, düzenleme, silme)
- Sepet yönetimi
- Tedarikçi paneli
- Profil yönetimi
- Duyarlı (responsive) tasarım
- Gerçek zamanlı bildirimler

## Teknoloji Yığını

- **Frontend**: Next.js, React, TypeScript
- **UI Bileşenleri**: Tailwind CSS, Shadcn/UI
- **Kimlik Doğrulama**: NextAuth.js
- **Veritabanları**:
  - MongoDB (Ürünler, sepet verileri için)
  - MySQL (Kullanıcı verileri için)
- **Diğer**: Sonner (bildirimler), Lucide React (ikonlar)

## Kurulum

### Ön Koşullar

- Node.js (v18 veya üzeri)
- npm/yarn/pnpm/bun
- MongoDB veritabanı
- MySQL veritabanı

### Adımlar

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/kemalcalak/MultiDB.git
   cd multidb2
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. `.env.local` dosyasını oluşturun ve aşağıdaki ortam değişkenlerini ayarlayın:
   ```
   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # JWT
   JWT_SECRET=your_jwt_secret
   
   # MySQL Database
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_DATABASE=ecommerce
   
   # MongoDB
   MONGODB_CONNECT=your_mongodb_connection_string

   # Mail SMTP (E-posta gönderimi için)
   MAIL_PASS=your_email_password
   MAIL_HOST=your_email_host
   MAIL_PORT=your_email_port
   MAIL_USER=your_email_user
   
   # Cloudinary (resim yükleme için)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın

## Proje Yapısı

```
multidb2/
├── app/                      # Next.js 13+ App Router yapısı
│   ├── api/                  # API rotaları
│   │   ├── auth/             # Kimlik doğrulama API'leri
│   │   │   ├── [...nextauth]/  # NextAuth konfigürasyonu
│   │   │   ├── profile/      # Profil yönetimi API'si
│   │   │   ├── protected/    # Korumalı endpoint örneği
│   │   │   └── register/     # Kullanıcı kaydı API'si
│   │   ├── cart/             # Sepet API'leri
│   │   ├── customer/         # Müşteri paneli API'leri
│   │   ├── orders/           # Sipariş API'leri
│   │   ├── supplier/         # Tedarikçi API'leri
│   │   │   └── products/     # Tedarikçi ürün yönetimi API'si
│   │   └── upload/           # Dosya yükleme API'si
│   ├── auth/                 # Kimlik doğrulama sayfaları
│   │   ├── login/            # Giriş sayfası
│   │   └── register/         # Kayıt sayfası
│   ├── cart/                 # Sepet sayfası
│   ├── profile/              # Kullanıcı profil sayfası
│   ├── supplier/             # Tedarikçi sayfaları
│   │   └── products/         # Tedarikçi ürün yönetimi sayfası
│   ├── globals.css           # Global stil tanımlamaları
│   ├── layout.tsx            # Kök düzen bileşeni
│   └── page.tsx              # Ana sayfa
├── components/               # Yeniden kullanılabilir bileşenler
│   ├── ui/                   # UI bileşenleri (shadcn/ui)
│   │   ├── alert-dialog.tsx  # Uyarı iletişim kutusu bileşeni
│   │   ├── button.tsx        # Buton bileşeni
│   │   ├── dialog.tsx        # Modal dialog bileşeni
│   │   ├── input.tsx         # Input bileşeni
│   │   ├── label.tsx         # Label bileşeni
│   │   ├── table.tsx         # Tablo bileşeni
│   │   └── textarea.tsx      # Çok satırlı metin girişi bileşeni
│   └── Header.tsx            # Üst bilgi bileşeni
├── lib/                      # Yardımcı işlevler ve yardımcı programlar
│   ├── auth/                 # Kimlik doğrulama yardımcıları
│   │   └── middleware.ts     # Kimlik doğrulama middleware'i
│   ├── db/                   # Veritabanı bağlantıları
│   │   ├── mongodb.ts        # MongoDB bağlantısı
│   │   └── mysql.ts          # MySQL bağlantısı
│   ├── email.ts              # E-posta gönderme fonksiyonları
│   └── utils.ts              # Genel yardımcı fonksiyonlar
├── models/                   # Veritabanı modelleri
│   ├── Cart.ts               # MongoDB sepet modeli
│   ├── Order.ts              # MongoDB sipariş modeli
│   ├── Product.ts            # MongoDB ürün modeli
│   ├── ResetToken.ts         # MySQL şifre sıfırlama token modeli
│   └── User.ts               # MySQL kullanıcı modeli
├── public/                   # Statik dosyalar
├── .env.local                # Ortam değişkenleri (oluşturulacak)
├── next.config.js            # Next.js yapılandırması
├── next.config.mjs           # Alternatif Next.js yapılandırması
├── postcss.config.mjs        # PostCSS yapılandırması
├── tailwind.config.ts        # Tailwind CSS yapılandırması
└── package.json              # Proje bağımlılıkları
```

## Veritabanı Yapısı

### MySQL Tabloları

- **users**: Kullanıcı kimlik bilgilerini saklar
  - id (PK)
  - name
  - email
  - password (hashlenir)
  - role (kullanıcı rolü: customer, supplier)
  - createdAt
  - updatedAt

- **reset_tokens**: Şifre sıfırlama tokenlarını saklar
  - id (PK)
  - userId (FK - users tablosuna referans)
  - token
  - expiresAt
  - used
  - createdAt
  - updatedAt

### MySQL Kurulum SQL Kodları

Aşağıdaki SQL kodlarını kullanarak gerekli MySQL veritabanını ve tabloları oluşturabilirsiniz:

```sql
-- Veritabanını oluştur
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;
```
    
```sql
-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'supplier') NOT NULL DEFAULT 'customer',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```
    
```sql
-- Şifre sıfırlama token tablosu
CREATE TABLE IF NOT EXISTS reset_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId INT UNSIGNED NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiresAt DATETIME NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_userId (userId)
);
```

### MongoDB Koleksiyonları

- **products**: Ürün bilgilerini saklar
  - _id (PK)
  - name
  - description
  - price
  - imageUrl
  - stock
  - category (opsiyonel)
  - features (opsiyonel dizi)
  - ratings (kullanıcı derecelendirmeleri dizisi)
  - averageRating
  - createdAt
  - updatedAt

- **carts**: Kullanıcı sepetlerini saklar
  - _id (PK)
  - userId (MySQL User tablosundaki id'ye referans)
  - items (ürünler dizisi)
    - productId (MongoDB Product ID'sine referans)
    - name
    - price
    - quantity
    - imageUrl
  - totalPrice
  - active
  - createdAt
  - updatedAt

- **orders**: Siparişleri saklar
  - _id (PK)
  - userId (MySQL User tablosundaki id'ye referans)
  - orderItems (sipariş edilen ürünlerin dizisi)
    - productId (MongoDB Product ID'sine referans)
    - name
    - price
    - quantity
  - shippingAddress
    - address
    - city
    - postalCode
    - country
  - paymentMethod
  - totalPrice
  - isPaid
  - paidAt
  - isDelivered
  - deliveredAt
  - createdAt
  - updatedAt

## Temel İş Akışları

### Kullanıcı Kimlik Doğrulama

1. Kullanıcı kayıt olur (MySQL'de saklanır)
2. Kullanıcı giriş yapar ve bir JWT token alır
3. Bu token sonraki isteklerde kullanılır

### Ürün Yönetimi (Tedarikçiler için)

1. Tedarikçi giriş yapar
2. Ürün ekler/düzenler/siler (MongoDB'de saklanır)
3. Ürünleri listeler ve yönetir

### Alışveriş Süreci

1. Kullanıcı ürünleri görüntüler
2. Ürünleri sepete ekler (MongoDB'de saklanır)
3. Sepeti görüntüler ve günceller
4. Sipariş verir
