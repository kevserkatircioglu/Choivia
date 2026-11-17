# Choivia – Adım 1 paketi (nereye ne kaydedilecek)

Bu zip, proje klasörünle **aynı yapıda**. İçindeki dosyaları proje kökündeki (package.json'ın olduğu) `Choivia/` klasörüne kopyala, "değiştir" de.

## Mevcut dosyalar (üzerine yaz, adları aynı)
| Dosya | Ne değişti |
|---|---|
| `src/components/AuthScreen.jsx` | Ad, soyad, Gmail, şifre (min. 4). İsimde rakam/sembol yazılamaz. Sonra 6 haneli kod ekranı. |
| `src/components/ProfileSetup.jsx` | Kullanıcı adı + avatar ekranı, altında "sonra nereden değişir" notu. |
| `src/components/Avatar.jsx` | Avatarlar küçük, yan yana, 2 satır, yana kayan şerit. |
| `src/components/AppBar.jsx` | Profil panelinde kullanıcı adı ve avatar değiştirme. |
| `src/components/WateringOverlay.jsx` | Yeni sulama sahnesi (seramik saksı, bakır kova, damla damla su). Ses mantığı aynı. |
| `src/components/SaplingTransition.jsx` | Fidan kalktı; ince yükleme çizgisi + yumuşak geçiş. |
| `src/pages/Planner.jsx` | Yeni Daily plan (hafta şeridi, ilerleme halkası, "Now" göstergesi). Kayıt formatı aynı, eski planlar bozulmaz. |
| `src/lib/auth.js` | Doğrulama fonksiyonları; http ile telefonda test ederken de çalışır. |
| `public/favicon.svg` | Yeni ajanda simgesi. |

## Yeni dosyalar
| Dosya | Görevi |
|---|---|
| `src/lib/mailer.js` | Doğrulama kodunu Gmail adresine yollar (EmailJS). |
| `src/choivia-v3.css` | Bu adımın tüm stilleri. |
| `public/manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | Telefonda "Ana ekrana ekle" ikonu. |
| `.env.example`, `SETUP_EMAIL_TR.md` | Gerçek e-posta kurulumu (yapmazsan demo modu: kod ekranda görünür). |

## App.jsx'te yapılacak 4 küçük değişiklik
1. `import './choivia-extra.css'` satırının altına ekle: `import './choivia-v3.css'`
2. Profil kurulum koşulunu bul:
   `if (!AVATARS.some((a) => a.id === user.avatar)) return <ProfileSetup ... />`
   şu hale getir:
   ```jsx
   if (!user.username || !AVATARS.some((a) => a.id === user.avatar))
     return <ProfileSetup user={user} onDone={(profile) => updateUserProfile(profile)} />
   ```
3. `<AppBar ... />` satırına `onUpdateUser={updateUserProfile}` ekle.
4. `index.html` `<head>` içine ekle (theme-color'ı da değiştir):
   ```html
   <meta name="theme-color" content="#2f5d45" />
   <link rel="manifest" href="/manifest.webmanifest" />
   <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
   ```

## Test
`npm run dev` → Sign up'ta isme rakam yazmayı dene (yazılmaz), Gmail dışı adres dene (hata verir). Kod ekranında demo modunda kod sarı kutuda görünür.
Not: Yeni sulama ekranını görmek için tarayıcı konsolunda `localStorage` içindeki `choivia:streak:<id>` kaydındaki `watered` alanını sil ve sayfayı yenile.
