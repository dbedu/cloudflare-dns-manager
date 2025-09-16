# Use the official Node.js 18 image
FROM node:18-alpine

# Create and change to the app directory.
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Start the server
CMD ["node", "src/server.js"]
