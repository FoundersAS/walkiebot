'use strict';
let assets = {};

if (process.env.NODE_ENV !== 'development') assets = require('../assets.json');

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
