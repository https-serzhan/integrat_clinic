FROM node:20-alpine

WORKDIR /app

COPY src/backend/academy/package*.json ./src/backend/academy/

WORKDIR /app/src/backend/academy
RUN npm ci --omit=dev

WORKDIR /app
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/backend/academy/server.js"]
