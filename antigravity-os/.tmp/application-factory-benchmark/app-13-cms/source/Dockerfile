FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3113
ENV PORT=3113
CMD ["node", "server.js"]
