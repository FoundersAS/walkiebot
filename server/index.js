'use strict';
require('load-environment');

const Hapi = require('hapi');

const server = new Hapi.Server();
const accessControl = require('./modules/access-control');

const JWT_PUBLIC = process.env.JWT_PUBLIC && process.env.JWT_PUBLIC.replace(/\\n/g, '\n');

if (!JWT_PUBLIC) throw new Error('Missing JWT_PUBLIC environment variable');

server.connection({ port: process.env.PORT || 8000 });

const registerHandlers = require('./handlers')(server);

server.register([
  { register: require('h2o2') },
  { register: require('inert') },
  { register: require('vision') },
  { register: require('hapi-auth-jwt2') },
  { register: require('hapi-heroku-helpers') }
], err => {
  if (err) throw err;

  server.auth.strategy('jwt', 'jwt', {
    key: JWT_PUBLIC,
    headerKey: 'authorization',
    validateFunc: accessControl.validateToken,
    verifyOptions: { algorithms: [ 'RS256' ], ignoreExpiration: false }
  });

  server.auth.default('jwt');
});

server.views({
  engines: {
    ejs: require('ejs')
  },
  relativeTo: __dirname,
  path: 'templates'
});

server.start(err => {
  if (err) throw err;
  const { protocol, address, port } = server.info;
  console.log(`[WALKIE][INIT] walkiebot server @ ${protocol}://${address}:${port}`);
  registerHandlers();
});
