CHOIVIA - GUNCELLEME DOSYALARI

Bu paket, paylastigin mevcut App.jsx ve App.css dosyalarinin guncellenmis hallerini icerir.

DOSYALAR
- src/App.jsx: hesap olusturma/giris, avatar secimi, profil sayfasi, cikis ve kullaniciya ozel ilerleme kaydi eklendi.
- src/App.css: giris/kayit ekrani ve profil/avatar stilleri eklendi.
- public/favicon.svg: Choivia kurbaga uygulama ikonu.
- index.html: sayfa basligi ve favicon baglantisi icin ornek Vite HTML dosyasi.

KURULUM
1. Mevcut projenin bir yedegini al.
2. Paketteki src/App.jsx dosyasini kendi projenin src/App.jsx dosyasiyla degistir.
3. Paketteki src/App.css dosyasini kendi projenin src/App.css dosyasiyla degistir.
4. public klasorundeki favicon.svg dosyasini kendi projenin public klasorune kopyala.
5. index.html dosyasindaki favicon linkini ve title satirini kendi index.html dosyana uygula (mevcut main.jsx/script satirini koru).
6. Projeyi localhost veya HTTPS uzerinde calistir.

ONEMLI NOTLAR
- Bu, sunucu tabanli gercek kimlik dogrulama degil; tarayici icinde calisan demo hesap sistemidir. Hesaplar bu cihaz/tarayicidaki localStorage icinde tutulur. Uretim ortaminda backend, guvenli parola hashleme (Argon2id/bcrypt) ve sunucu oturumu gerekir.
- Her kullanicinin rehber ilerlemesi kendi tarayici kayit anahtarinda saklanir. Eski anonim ilerleme kaydi otomatik olarak ilk hesaba aktarilmaz; eski kayit STORAGE_KEY anahtarinda kalir.
- Paket, yuklenen iki kaynak dosyaya dayanir. Projenin diger sayfalari, utils klasoru, package.json ve main.jsx dosyalari yuklu olmadigindan bunlar pakete dahil degildir; mevcut proje klasorundeki halleri korunmalidir.
