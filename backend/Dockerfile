FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM node:20-slim

WORKDIR /app
COPY --from=builder /app .
RUN apt update && apt install -y sqlite3
EXPOSE 3000
CMD ["npm", "start"]