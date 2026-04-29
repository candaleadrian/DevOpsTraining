FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm install -g expo

COPY . .

ARG EXPO_PUBLIC_API_BASE_URL
ENV EXPO_PUBLIC_API_BASE_URL=$EXPO_PUBLIC_API_BASE_URL

EXPOSE 8081

CMD ["expo", "start", "--web", "--port", "8081", "--host", "lan"]
