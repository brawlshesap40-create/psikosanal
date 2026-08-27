import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Uygulama, web projesinin `/uygulama` bölümünü (app-shell arayüzü) canlı
 * sunucudan yükleyen bir Capacitor kabuğudur.
 *
 * Yükleme adresi `CAP_SERVER_URL` ortam değişkeninden gelir; örnek:
 *   CAP_SERVER_URL=https://psikosanal.com npm run sync -w apps/mobile
 *
 * Değişken tanımlı değilse `www/index.html` (çevrimdışı / kurulum ekranı)
 * gösterilir — bu haliyle de APK derlenebilir, sadece adresi sonra
 * `capacitor.config` üstünden verirsiniz.
 */
const serverUrl = process.env.CAP_SERVER_URL?.trim();
const isDev = process.env.CAP_ENV === "development";

const config: CapacitorConfig = {
  appId: "com.psikosanal.app",
  appName: "Psikosanal",
  webDir: "www",
  backgroundColor: "#0b7c86",
  android: {
    // LAN üstünden `next dev` test ederken http adrese izin vermek için.
    allowMixedContent: isDev,
  },
  server: serverUrl
    ? {
        url: serverUrl.replace(/\/$/, "") + "/uygulama",
        cleartext: isDev,
        androidScheme: serverUrl.startsWith("http://") ? "http" : "https",
      }
    : undefined,
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      backgroundColor: "#0b7c86",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
