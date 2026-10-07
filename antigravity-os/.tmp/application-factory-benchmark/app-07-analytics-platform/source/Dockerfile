FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3107
ENV PORT=3107
CMD ["node", "server.js"]
