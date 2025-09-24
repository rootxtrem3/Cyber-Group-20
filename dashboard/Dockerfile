FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM node:20-alpine
RUN apk add --no-cache docker-cli
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY server.js ./
RUN npm install --production
EXPOSE 3000
CMD ["node", "server.js"]
