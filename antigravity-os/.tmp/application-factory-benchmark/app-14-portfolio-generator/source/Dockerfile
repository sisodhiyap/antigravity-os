FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3114
ENV PORT=3114
CMD ["node", "server.js"]
