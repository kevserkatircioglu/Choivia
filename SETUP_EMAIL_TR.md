# Gmail doğrulama kodu – gerçek e-posta kurulumu (EmailJS, ücretsiz)

Uygulama arka sunucusu olmadığı için e-postayı EmailJS üzerinden gönderir. Kurulum yapılmazsa uygulama **demo modunda** çalışır:
kod ekranda sarı kutuda gösterilir (sunum için yeterli, ama gerçek mail gitmez).

1. https://www.emailjs.com adresinde ücretsiz hesap aç.
2. **Email Services → Add New Service → Gmail**: kendi Gmail hesabını bağla. Çıkan **Service ID**'yi not al.
3. **Email Templates → Create New Template** şunları yaz:
   - To Email: `{{to_email}}`
   - Subject: `Your Choivia verification code`
   - Content: `Hi {{to_name}}, your {{app_name}} verification code is {{code}}. It expires in 10 minutes.`
   - Kaydet, **Template ID**'yi not al.
4. **Account → General** içinden **Public Key**'i kopyala.
5. Proje klasörünün (package.json'ın yanına) `.env` adlı dosya oluştur:
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
   ```
6. `npm run dev` çalışıyorsa durdurup yeniden başlat (`.env` ancak o zaman okunur).

Not: Ücretsiz pakette ayda yaklaşık 200 e-posta var. Public key tarayıcıda göründüğü için sunumdan sonra EmailJS panelinden kısıtlayabilir veya yenileyebilirsin.
