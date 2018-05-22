'use strict';
const fs = require('fs');
const path = require('path');
let assets = {
  main: { js: '', css: '' },
  commons: { js: '' }
};

try {
  const file = fs.readFileSync(path.join(__dirname, '../assets.json'));
  if (file) assets = JSON.parse(file.toString());
} catch (e) {
  console.error('Could not find server/assets.json, you may get an error loading Walkie');
}

module.exports = {
  static: {
    method: 'GET',
    path: '/static/{param*}',
    config: { auth: false },
    handler: {
      directory: { path: './dist/static' }
    }
  },

  dist: {
    method: 'GET',
    path: '/dist/{param*}',
    config: { auth: false },
    handler: {
      directory: { path: './dist' }
    }
  },

  emoji: {
    method: 'GET',
    path: '/emoji/{param*}',
    config: { auth: false },
    handler: {
      directory: { path: './node_modules/emoji-datasource-apple/img' }
    }
  },

  robots: {
    method: 'GET',
    path: '/robots.txt',
    config: { auth: false },
    handler: (request, reply) =>
      reply('User-agent: *\nDisallow: /').type('text/plain')
  },

  catchAll: {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);

      let SLACK_LOGIN_REDIRECT_URL = process.env.SLACK_LOGIN_REDIRECT_URL;
      if (process.env.HEROKU_APP_NAME) {
        SLACK_LOGIN_REDIRECT_URL = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/slack/login`;
      }

      return reply.view('app', {
        initialState: {},
        assets: assets,
        SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID || '',
        SLACK_LOGIN_REDIRECT_URL: SLACK_LOGIN_REDIRECT_URL || ''
      });
    }
  }
};
