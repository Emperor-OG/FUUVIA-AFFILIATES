FROM node:22 AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run build

FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY server ./server
COPY --from=frontend-build /app/dist ./dist
COPY --from=frontend-build /app/public ./public

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server/server.js"]
