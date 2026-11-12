# Kirayo — naye computer par setup

## Tarika 1: Docker (sabse aasaan, ek command)

Sirf Docker Desktop install hona chahiye (Node bhi nahi chahiye).

    docker compose up -d --build

- App: http://localhost:3001
- Pehli baar start par `database-backup/kirayo.sql` apne aap load hota hai
  (120 users, 304 items, 17 bookings — poora data).
- Database host par port 5438 par bhi khula hai.
- Band karna: `docker compose down`   (data safe rehta hai)
- Database ko backup se dobara fresh load karna: `docker compose down -v` phir `up` again.

## Tarika 2: Bina Docker-compose (manual)

1. Node 20.9+ install karo, project folder me `npm install`
2. Postgres:
   docker run --name kirayo-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kirayo -p 5438:5432 --restart unless-stopped -d postgres:16
3. Data restore:
   docker exec -i kirayo-db psql -U postgres -d kirayo < database-backup/kirayo.sql
   (PowerShell:  Get-Content database-backup\kirayo.sql -Raw | docker exec -i kirayo-db psql -U postgres -d kirayo )
   Docker na ho to: apne local Postgres me `kirayo` database banao aur
   `psql -U postgres -d kirayo -f database-backup/kirayo.sql`, phir .env me DATABASE_URL badlo.
4. `npm run dev` → http://localhost:3001

Note: `npm run setup` / `db:seed` mat chalana — woh data reset kar dega.
Logins `LOGINS.md` me hain.
