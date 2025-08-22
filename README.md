# TOGG Analytics Docker Setup

Bu proje, TOGG aracı için Docker Compose ile bir örnek yapı sunar.  
Kendi kullanıcı adı, şifre ve şasi numaranızı aşağıdaki alanlara girmeniz gerekiyor.  
Ayrıca araç adı ekranda görünecek şekilde ayarlanabilir.

## Docker Compose Örneği

```yaml
version: '3.8'

services:
  app:
    image: your-app-image:latest
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
