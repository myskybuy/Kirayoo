# Kirayo ko VPS par live karna (kirayoo.in)

VPS: Hostinger, `187.127.167.233`, jahan ClearTCareer pehle se chal raha hai.
Kirayo apne alag Docker containers mein chalega (`kirayo-app-1`, `kirayo-db-1`),
isliye ClearTCareer ko kuch nahi hoga.

Data: pehli baar start par `database-backup/kirayo.sql` load hota hai, yani local
jaisa hi data: 120 users, 304 items, 17 bookings, aur `uploads/` +
`private-uploads/` ki saari photos.

---

## 0. DNS (domain provider ke panel mein)

| Type | Name | Value |
|---|---|---|
| A | `@` | `187.127.167.233` |
| A | `www` | `187.127.167.233` |

Check (Windows PowerShell): `nslookup kirayoo.in`, IP `187.127.167.233` aana chahiye.

## 1. Photos VPS par bhejo (apne PC ke PowerShell se)

Code GitHub (`production` branch) se aayega. Photos git mein nahi hain, isliye
`kirayo-uploads.tar.gz` (uploads + private-uploads) alag se bhejni hai:

```powershell
cd C:\Users\dell\Desktop\kirayoo
scp kirayo-uploads.tar.gz root@187.127.167.233:/root/
```

## 2. VPS par login karke check karo

```bash
ssh root@187.127.167.233
docker compose version
ss -ltnp | grep -E ':80 |:443 |:3010 '
nginx -v
```

- `:3010` par kuch nahi hona chahiye. Agar ho, to neeche `.env.production` mein `KIRAYO_PORT` badal do (jaise 3020) aur Nginx config mein bhi wahi port do.
- Port 80/443 par `nginx` hona chahiye, tab step 5 waise hi chalega. Agar wahan koi Docker container (caddy/nginx/traefik) hai, to step 5 se pehle batao.

## 3. Code clone karo, photos nikalo, `.env.production` banao

```bash
git clone -b production https://github.com/myskybuy/Kirayoo.git /opt/kirayo
tar -xzf /root/kirayo-uploads.tar.gz -C /opt/kirayo
cd /opt/kirayo
cp .env.production.example .env.production
sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=\"$(openssl rand -hex 24)\"/" .env.production
sed -i "s/^CRON_SECRET=.*/CRON_SECRET=\"$(openssl rand -hex 32)\"/" .env.production
chmod 600 .env.production
nano .env.production
```

`nano` mein SMTP bharo (asli users ko OTP email se jayega). Gmail ke liye:
`SMTP_HOST="smtp.gmail.com"`, `SMTP_PORT=465`, `SMTP_USER` = Gmail, `SMTP_PASS` = 16 akshar ka App Password,
`MAIL_FROM` = `"Kirayo <wahi-gmail@gmail.com>"`.
SMTP khali chhodoge to sirf `@kirayo.test` demo accounts login kar payenge.

## 4. App + database start karo

```bash
cd /opt/kirayo
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker exec kirayo-db-1 psql -U kirayo -d kirayo -tAc 'select (select count(*) from "User"),(select count(*) from "Item"),(select count(*) from "Booking")'
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3010/
```

Result `120|304|17` aur `200` aana chahiye.

## 5. Nginx + SSL (HTTPS)

```bash
cat > /etc/nginx/sites-available/kirayoo.in <<'EOF'
server {
    listen 80;
    server_name kirayoo.in www.kirayoo.in;
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
ln -sf /etc/nginx/sites-available/kirayoo.in /etc/nginx/sites-enabled/kirayoo.in
nginx -t && systemctl reload nginx

apt-get install -y certbot python3-certbot-nginx   # pehle se ho to skip
certbot --nginx -d kirayoo.in -d www.kirayoo.in --redirect
```

Login cookie `Secure` hai, isliye login sirf **https** par chalega. Certbot zaroori hai.

## 6. Cron job (holds expire, auto-confirm, reminders)

```bash
SECRET=$(grep ^CRON_SECRET /opt/kirayo/.env.production | cut -d'"' -f2)
(crontab -l 2>/dev/null; echo "*/15 * * * * curl -fsS 'http://127.0.0.1:3010/api/cron?secret=$SECRET' >/dev/null") | crontab -
```

## 7. Check

https://kirayoo.in kholo, `riya@kirayo.test` se login karo. OTP screen par
"Demo account — your code is …" dikhega. Bookings mein data dikhna chahiye.

---

## Baad mein update karna (naya code)

PC par commit karke `production` branch push karo, phir VPS par pull karke
rebuild karo. **`down -v` kabhi mat chalana**, usse live database mit jayega.

```bash
cd /opt/kirayo
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build app
```

`database-backup/kirayo.sql` sirf **pehli baar** (khali volume par) load hota hai,
baad ke updates mein live data waisa hi rehta hai.

## Live DB ka backup

```bash
docker exec kirayo-db-1 pg_dump -U kirayo -d kirayo --no-owner > /root/kirayo-$(date +%F).sql
```

## Demo khatam hone par

`.env.production` mein `DEMO_OTP_ON_SCREEN=0` karke:
`docker compose --env-file .env.production -f docker-compose.prod.yml up -d app`
