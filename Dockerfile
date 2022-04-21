FROM node:17-alpine
WORKDIR /app
COPY ./server.js .
COPY ./token-circulation.js .
ENTRYPOINT ["node", "server.js"]