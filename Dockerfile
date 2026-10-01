FROM node:22-slim
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
VOLUME ["/app/data", "/app/storage"]
CMD ["sh", "-c", "npx prisma db push && npx tsx prisma/seed.ts && npm start"]
