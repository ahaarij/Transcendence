FROM node:20-alpine

WORKDIR /app/game

# copy package files from parent
COPY ../package*.json ./
RUN npm ci

# copy game service files
COPY . .

CMD ["npm", "start"]
