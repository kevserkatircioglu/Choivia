# Choivia e-posta doğrulama kurulumu

Choivia, kayıt sırasında 6 haneli doğrulama kodu göndermek için EmailJS kullanır.

## EmailJS kurulumu

1. https://www.emailjs.com adresinden hesap oluştur.
2. Email Services bölümünden bir e-posta servisi bağla.
3. Email Templates bölümünde yeni bir şablon oluştur.
4. Şablon alanlarını şu şekilde ayarla:

To Email: {{to_email}}

Subject: Your Choivia verification code

Body: Hi {{to_name}}, your Choivia verification code is {{code}}. It expires in 10 minutes.

5. Service ID, Template ID ve Public Key değerlerini al.
6. Proje kökünde .env dosyası oluştur ve şu değişkenleri ekle:

VITE_EMAILJS_SERVICE_ID=service_xxxxx

VITE_EMAILJS_TEMPLATE_ID=template_xxxxx

VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx

7. Vite geliştirme sunucusunu durdurup yeniden başlat.

## Demo modu

EmailJS bilgileri tanımlı değilse gerçek e-posta gönderilmez.
Doğrulama kodu ekranda gösterilir. Bu mod yerel test ve sunum içindir.

## Güvenlik notu

Bu sürüm frontend demo akışıdır. Hesaplar tarayıcıdaki localStorage üzerinde tutulur ve doğrulama kodu istemci tarafında kontrol edilir. Üretim ortamında hesap ve kod doğrulama işlemleri sunucu tarafında yapılmalıdır.
