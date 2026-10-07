FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3101
ENV PORT=3101
CMD ["node", "server.js"]
