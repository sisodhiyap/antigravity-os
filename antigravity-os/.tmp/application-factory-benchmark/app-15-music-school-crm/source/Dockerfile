FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3115
ENV PORT=3115
CMD ["node", "server.js"]
