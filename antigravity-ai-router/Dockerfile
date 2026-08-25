FROM node:20-alpine

WORKDIR /app

# Copy files
COPY . .

# Install tsx globally to run TypeScript files directly without separate build step
RUN npm install -g tsx

# Expose port
EXPOSE 8080

# Environment variables defaults
ENV ROUTER_PORT=8080
ENV ROUTER_HOST=0.0.0.0

CMD ["tsx", "src/server.ts"]
