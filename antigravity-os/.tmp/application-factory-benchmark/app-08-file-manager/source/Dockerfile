FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3108
ENV PORT=3108
CMD ["node", "server.js"]
