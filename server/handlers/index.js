'use strict';

module.exports = function (server) {
  const authOptional = {
    mode: 'optional'
  };

  const handlers = {
    bots: require('./bots')(authOptional),
    localBots: require('./local-bots')(authOptional),
    slack: require('./slack'),
    resources: require('./resources'),
    users: require('./users'),
    utils: require('./utils'),
    notifications: require('./notifications')(authOptional, server)
  };

  return () => {
    Object.keys(handlers).forEach(handler => {
      Object.keys(handlers[handler]).forEach(route => {
        const obj = handlers[handler][route];
        console.log(`[WALKIE][REGISTERING][${handler}][${route}] ${obj.path}`);
        server.route(obj);
      });
    });
  };
};
