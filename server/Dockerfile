FROM node:18-alpine

WORKDIR /app

COPY package*.json package-lock.json ./
COPY . .

RUN npm install

RUN mkdir -p src/config

# Expose the unified port 3001 instead of 3000
EXPOSE 3001

CMD ["sh", "-c", "node tools/init-key.js && npm start"]