
<img width="1289" height="770" alt="Screenshot 2025-08-22 at 19 34 34-min" src="https://github.com/user-attachments/assets/21b3c57e-59b3-4d11-8b1d-faf9140f112b" />
<img width="1342" height="906" alt="Screenshot 2025-08-22 at 19 34 56-min" src="https://github.com/user-attachments/assets/75f604c7-7a05-4ba1-adaf-5f92ff9d5793" />

# TOGG Analytics Docker Setup

Bu proje, TOGG aracı için Docker Compose ile bir örnek yapı sunar.  
Kendi kullanıcı adı, şifre ve şasi numaranızı aşağıdaki alanlara girmeniz gerekiyor.  
Ayrıca araç adı ekranda görünecek şekilde ayarlanabilir.

## Docker Compose'da Yapılacak Değişiklikler

```yaml
 be:
    build:
      context: ./togg-analytics-be
      dockerfile: dockerfile
    depends_on:
      - postgres
    environment:
      Username: <KULLANICI_ADINIZ>
      Password: <PAROLANIZ>
      Vin: <SASI_NO>
      CarName: "<ARABA_ADI>"

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "15342:80"
```
> **Not:** nginx servisi için portu 10000-20000 aralığından seçebilirsiniz; `15342` sadece bir örnektir.  
> Bu şekilde port tahmin edilmesi zor olur.

## Kullanım

1. Docker ve Docker Compose kurulu olmalı.
2. `docker-compose.yml` dosyasındaki `<KULLANICI_ADINIZ>`, `<PAROLANIZ>`, `<SASI_NO>` ve `<ARABA_ADI>` alanlarını doldurun.
3. Terminalden proje dizininde aşağıdaki komutu çalıştırın:

```bash
docker compose up -d
```
