FROM  mhart/alpine-node:11

WORKDIR /var/app

COPY . /var/app

RUN npm i --production

EXPOSE 8000

ENV NODE_ENV=production

CMD ["node", "dist/backend/backend/main"]

