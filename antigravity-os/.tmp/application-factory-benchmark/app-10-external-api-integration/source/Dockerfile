FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3110
ENV PORT=3110
CMD ["node", "server.js"]
