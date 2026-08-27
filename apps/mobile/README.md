# @psikosanal/mobile — Android uygulaması

Psikosanal'ın Android APK'sı. Uygulama, web projesindeki **`/uygulama`** bölümünü
(web sitesinden ayrı, alt sekmeli app arayüzü) canlı sunucudan yükleyen bir
[Capacitor](https://capacitorjs.com) kabuğudur.

```
apps/mobile/
├─ capacitor.config.ts   # appId, appName, sunucu adresi (CAP_SERVER_URL'den)
├─ www/index.html        # sunucu adresi yok / çevrimdışı ekranı
├─ resources/            # ikon + splash kaynakları (SVG) → @capacitor/assets üretir
└─ android/              # `npm run add:android` ile üretilir (git'e girmez)
```

## Neden WebView kabuğu?

Web uygulaması Next.js 16 + server actions + veritabanı kullandığı için statik
export edilemez. Bu yüzden APK, arayüzü canlı sunucudan yükler. Native tarafta
uygulama ikonu, splash, durum çubuğu, geri tuşu ve (ileride) push bildirimleri
Capacitor eklentileriyle yönetilir.

## Ön koşullar (tek seferlik)

| Araç | Sürüm |
| --- | --- |
| Node | ≥ 20 (repo kökünde kurulu) |
| JDK | 21 (kurulu) |
| Android Studio | güncel — **veya** yalnızca "Android SDK Command-line Tools" |
| Android SDK | Platform 35 + Build-Tools 35 + Platform-Tools |

Android Studio ile: _Settings → Languages & Frameworks → Android SDK_ üzerinden
SDK 35'i kurun. Ardından `ANDROID_HOME` ortam değişkenini SDK yoluna ayarlayın
(örn. `C:\Users\<siz>\AppData\Local\Android\Sdk`).

## Kurulum

```bash
# repo kökünde
npm install

# mobil bağımlılıkları zaten workspace ile kuruldu; android platformunu ekle:
npm run add:android -w apps/mobile
```

## Canlı adresi ayarla

`apps/mobile/.env` oluştur (`.env.example`'ı kopyala) ve sunucu adresini gir:

```
CAP_SERVER_URL=https://psikosanal.com
CAP_ENV=production
```

Sonra config + native projeyi güncelle:

```bash
# Windows PowerShell
$env:CAP_SERVER_URL="https://psikosanal.com"; npm run sync -w apps/mobile
```

> `.env` dosyasını Capacitor otomatik okumaz; değişkeni komuttan önce verin ya da
> `dotenv-cli` ile sarın:
> `npx dotenv -e .env -- npm run sync`

Adres verilmezse APK yine derlenir ama açılışta `www/index.html` (kurulum ekranı)
gösterilir.

## İkon & splash üret

`resources/*.svg` dosyalarından tüm Android boyutlarını üretir:

```bash
npm run assets -w apps/mobile
```

## APK derle

```bash
# imzasız debug APK (kendi cihazına kurup test için)
npm run apk:debug -w apps/mobile
# -> android/app/build/outputs/apk/debug/app-debug.apk

# imzalı release APK (dağıtım / indirilebilir link için)
npm run apk:release -w apps/mobile
# -> android/app/build/outputs/apk/release/app-release.apk

# Play Store için AAB
npm run bundle:release -w apps/mobile
```

### Release imzalama

`android/app` içinde bir keystore üret ve `android/app/build.gradle` /
`gradle.properties` içine imza yapılandırmasını ekle:

```bash
keytool -genkey -v -keystore psikosanal.keystore -alias psikosanal \
  -keyalg RSA -keysize 2048 -validity 10000
```

`android/gradle.properties`:

```
PSIKOSANAL_STORE_FILE=psikosanal.keystore
PSIKOSANAL_STORE_PASSWORD=****
PSIKOSANAL_KEY_ALIAS=psikosanal
PSIKOSANAL_KEY_PASSWORD=****
```

`android/app/build.gradle` → `android { signingConfigs { release { ... } } buildTypes { release { signingConfig signingConfigs.release } } }`
(Capacitor dokümanı: _Deploying to Google Play_).

## Sürüm yükseltme

`android/app/build.gradle` içindeki `versionCode` (tam sayı, her yayında +1) ve
`versionName` (görünen sürüm) değerlerini artır.

## Geliştirme sırasında canlı yeniden yükleme

Telefon ve bilgisayar aynı ağdayken, bilgisayarın LAN IP'sini kullan:

```
CAP_SERVER_URL=http://192.168.1.25:3000
CAP_ENV=development
```

`npm run dev` (web) + `npm run sync -w apps/mobile` + Android Studio'dan çalıştır.
