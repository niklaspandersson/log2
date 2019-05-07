FROM node:11-alpine as build

COPY ./package.json  /var/app/package.json
COPY ./package-lock.json  /var/app/package-lock.json

WORKDIR /var/app

RUN npm ci

# build
COPY . /var/app
RUN npm run build


# serve
FROM node:11-alpine
COPY --from=build /var/app/dist /var/app/dist
COPY --from=build /var/app/node_modules /var/app/node_modules

USER node
WORKDIR /var/app

EXPOSE $PORT

CMD ["node", "dist/backend/backend/main"]
