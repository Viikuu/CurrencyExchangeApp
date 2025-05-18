FROM node:22.15.0-alpine AS dev

WORKDIR /app 

COPY . .

RUN npm ci

EXPOSE 8000

CMD ["npm", "run", "start:dev"]


FROM node:22.15.0-alpine AS build

WORKDIR /app

COPY . .

RUN npm ci && \
  npm run lint && \
  npm run build && \
  npm run test

FROM node:22.15.0-alpine AS prod

WORKDIR /app

ENV NODE_ENV=prod
ENV PORT=8000

COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

RUN npm ci --only=production

EXPOSE 8000

CMD ["node", "dist/main.js"]
