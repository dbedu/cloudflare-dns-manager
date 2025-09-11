FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Client typically runs on port 3000
EXPOSE 3000

CMD ["npm", "start"]