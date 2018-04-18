'use strict';
const Boom = require('boom');
const db = require('./db')();
const error = require('./error-reply');

module.exports = {
  userHasAccess: (request, reply) => {
    const { isAuthenticated, credentials } = request.auth;

    db.bots.get(request.params.id, (err, res) => {
      if (err) return error(reply, err);
      if (!res || res.deleted) return reply({ ok: false, message: 'not found' }).code(404);
      if (res.isTeamBot || res.isPrivateTeamBot) {
        if (!isAuthenticated) {
          console.log(`[WALKIE][ACL][${request.method}][${request.url.path}] User is not authenticated`);
          return reply(Boom.unauthorized(`You need to be authenticated to view this bot. Please sign in to the ${res.teamDomain} team to continue`));
        }
        // if (credentials.teamDomain !== res.teamDomain) {
        if (credentials.teamId !== res.teamId) {
          console.log(`[WALKIE][ACL][${request.method}][${request.url.path}] Users team (${credentials.teamDomain}) does not match bots team (${res.teamDomain})`);
          return reply(Boom.forbidden(`You need to be signed in to the ${res.teamDomain} team to view this bot`));
        }
      }
      reply();
    });
  },

  validateToken: (decoded, request, cb) => {
    const date = new Date(0);  // The 0 here is the key, which sets the date to the epoch
    date.setUTCSeconds(decoded.exp);
    const offsetSeconds = 0;
    const isTokenExpired = !(date.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
    if (isTokenExpired) return cb(new Error('Token has expired'));

    db.teams.getByDomain(decoded.teamDomain, (err, team) => {
      if (err) return cb(err);
      if (!team) return cb(new Error(`Team not found: ${decoded.teamDomain}`));

      db.users.get(decoded.userId, team.id, (err, user) => {
        if (err) return cb(err);
        if (!user) return cb(new Error(`User not found: (team - ${decoded.teamDomain}) ${decoded.userId}`));

        request.auth.user = user;
        request.auth.team = team;

        cb(null, true);
      });
    });
  }
};
