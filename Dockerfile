FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY index.js autopay.js discovery.js purchase.js ./

# Run the server
CMD ["node", "index.js"]
