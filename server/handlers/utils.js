'use strict';

module.exports = {
  ping: {
    method: 'GET',
    config: { auth: false },
    path: '/api/utils/ping',
    handler: (request, reply) => reply('PONG')
  }
};
