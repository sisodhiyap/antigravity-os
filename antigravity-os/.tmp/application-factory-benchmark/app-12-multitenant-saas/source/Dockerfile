FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3112
ENV PORT=3112
CMD ["node", "server.js"]
