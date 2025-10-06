FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN mkdir -p /app/data && chown -R node:node /app/data
EXPOSE 3000
USER node
CMD ["node", "server.js"]
