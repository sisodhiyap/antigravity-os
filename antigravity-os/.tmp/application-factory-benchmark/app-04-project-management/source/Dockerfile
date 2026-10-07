FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3104
ENV PORT=3104
CMD ["node", "server.js"]
