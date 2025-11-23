FROM node:20-alpine

WORKDIR /app

# Build tools for native deps (node-sass)
RUN apk add --no-cache python3 make g++

# Install server dependencies
COPY package*.json ./
RUN npm ci

# Install frontend dependencies separately to leverage layer caching
COPY front/package*.json front/
RUN cd front && npm ci

# Copy application code
COPY . .

# Build the frontend so the server can serve /front/build
RUN cd front && npm run build

EXPOSE 3000

CMD ["node", "wailto.js"]
