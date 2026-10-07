FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3105
ENV PORT=3105
CMD ["node", "server.js"]
