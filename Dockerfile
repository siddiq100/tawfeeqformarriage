FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy server
COPY server ./server

# Copy client
COPY client ./client

# Install root dependencies
RUN npm install

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Install client dependencies
WORKDIR /app/client
RUN npm install

# Build client
RUN npm run build

# Return to app root
WORKDIR /app

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server/server.js"]
