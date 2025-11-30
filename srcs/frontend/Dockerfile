FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3

COPY . .

EXPOSE 8080

CMD ["python3", "-m", "http.server", "8080"]
