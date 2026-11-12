# Kirayo app image. Runs the app the same way as on the dev machine
# (`next dev` on port 3001: OTP shown on screen, demo payment screen).
FROM node:22-bookworm-slim

# Prisma needs OpenSSL
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (cached layer). postinstall runs `prisma generate`,
# so the schema must be present.
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3001
CMD ["npm", "run", "dev"]
