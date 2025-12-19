# websocket gateway dockerfile
FROM node:20-alpine

# sets working directory in container
WORKDIR /app

# copies package files for dependencies
COPY ws-gateway/package*.json ./

# installs all dependencies
RUN npm install

# copies rest of application code
COPY ws-gateway/ ./

# exposes websocket port
EXPOSE 3004

# starts the websocket gateway
CMD ["npm", "start"]
