FROM node:12-alpine as backend

# BUILD backend
WORKDIR /app/backend
COPY backend/package*.json ./

RUN npm ci

COPY ["backend/.", "."]
COPY ["common/.",  "/app/common/"]

RUN npm run build

# BUILD frontend
FROM node:12-alpine as frontend

WORKDIR /app/frontend
COPY frontend/package*.json ./

RUN npm ci 

COPY ["frontend/.", "."]
COPY ["common/.", "/app/common/"]

RUN npm run build

# RUN
FROM node:12-alpine

COPY --from=backend /app/backend/node_modules /opt/app/node_modules
COPY --from=backend /app/backend/dist /opt/app/dist
COPY --from=frontend /app/frontend/build /opt/public_html

WORKDIR /opt/app
RUN chown -R node:node .
USER node

ENV NODE_ENV production

CMD ["node", "dist/backend/src/index.js"]
