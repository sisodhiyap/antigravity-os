FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3111
ENV PORT=3111
CMD ["node", "server.js"]
