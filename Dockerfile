# Frontend Dockerfile (Expo React Native)
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++ bash

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Expo CLI globally
RUN npm install -g expo-cli@latest

# Copy app files (excluding backend folder)
COPY . .

# Create a startup script for Expo
RUN echo '#!/bin/sh\n\
echo "Starting Expo development server..."\n\
expo start --tunnel' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 8081 19000 19001 19002

CMD ["npm", "run", "start"]