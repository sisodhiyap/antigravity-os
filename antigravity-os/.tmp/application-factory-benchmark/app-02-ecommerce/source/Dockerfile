FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3102
ENV PORT=3102
CMD ["node", "server.js"]
