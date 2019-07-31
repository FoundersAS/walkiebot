# source: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:10-buster

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN yarn --ignore-scripts \
  && npm rebuild node-sass --force \
  && npm install --only=production \
  && yarn build-prod

EXPOSE 8000

CMD [ "npm", "start" ]
