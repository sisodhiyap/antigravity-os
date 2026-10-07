FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3103
ENV PORT=3103
CMD ["node", "server.js"]
