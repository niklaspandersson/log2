FROM node:11-alpine as build

COPY ./package.json  /var/app/package.json
COPY ./package-lock.json  /var/app/package-lock.json

WORKDIR /var/app

RUN npm ci

# build
COPY . /var/app
RUN npm run build:prod


# serve
FROM node:11-alpine
COPY --from=build /var/app/dist /var/app/dist
COPY --from=build /var/app/node_modules /var/app/node_modules
COPY --from=build /var/app/start.sh /var/app/start.sh

RUN chmod +x /var/app/start.sh

USER node
WORKDIR /var/app

ENV NODE_ENV=production PORT=8000

EXPOSE $PORT

CMD ["/bin/sh", "./start.sh"]
