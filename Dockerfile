# DockerFile => Docker client => Docker server => Docker image
 # Docker build -t node:gallium-alpine .
FROM node:gallium-alpine as builder

ENV NODE_ENV=production

ENV port=8080

WORKDIR /usr/app

COPY ./ ./

RUN yarn

EXPOSE 8080

CMD ["yarn", "start"]