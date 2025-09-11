FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# Expose the unified port 3001 instead of 3000
EXPOSE 3001

# Update the start command to use port 3001
CMD ["node", "app.js"]
