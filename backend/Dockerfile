FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/data


FROM node:20-alpine

WORKDIR /app
RUN apk update && apk add --no-cache sqlite
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .
EXPOSE 3000
CMD ["npm", "start"]
