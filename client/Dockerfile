FROM node:18-alpine

WORKDIR /app

COPY package*.json package-lock.json ./

RUN npm install

COPY . .

# Client typically runs on port 3000
EXPOSE 3000

CMD ["npm", "start"]
