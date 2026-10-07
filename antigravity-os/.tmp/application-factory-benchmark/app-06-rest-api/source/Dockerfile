FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3106
ENV PORT=3106
CMD ["node", "server.js"]
