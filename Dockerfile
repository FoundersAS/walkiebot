# source: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:carbon

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY yarn.lock ./

RUN yarn --ignore-scripts && npm rebuild node-sass --force
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

RUN yarn build-prod

EXPOSE 8080
CMD [ "npm", "start" ]
