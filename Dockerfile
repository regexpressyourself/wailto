FROM node:20-alpine

WORKDIR /app


# Install common dependencies (optional)
# RUN apk add --no-cache python3 make g++

# Copy package files by default (override in app Dockerfiles)
COPY package*.json ./

# Install dependencies (override in app Dockerfiles if needed)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi


# Copy app source (override in app Dockerfiles)
COPY . .

EXPOSE 3500

CMD ["node", "wailto.js"]
