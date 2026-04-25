FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
RUN mkdir -p logs && chown node:node logs
EXPOSE 5000
USER node
CMD ["node", "server.js"]
