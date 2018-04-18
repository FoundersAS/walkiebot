'use strict';
const jwt = require('jsonwebtoken');
const Boom = require('boom');
const db = require('../modules/db')();
const error = require('../modules/error-reply');

module.exports = {
  verify: {
    method: 'GET',
    path: '/api/users/me',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { teamDomain, userId } = request.auth.credentials;
      db.teams.getByDomain(teamDomain, (err, team) => {
        if (err) return error(reply, err);
        if (!team) return reply(Boom.notFound('Team not found'));

        db.users.get(userId, team.id, (err, user) => {
          if (err) return error(reply, err);
          if (!user) return reply(Boom.notFound('User not found'));

          db.bots.getByTeamId(team.id, (err, bots = []) => {
            if (err) return error(reply, err);

            return reply({
              ok: true,
              data: {
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  avatar: user.image_192
                },
                team: {
                  id: team.id,
                  avatar: team.image_132,
                  name: team.name,
                  domain: team.domain
                },
                teamBots: bots.filter(b => !b.deleted).map(data => ({
                  id: data.id,
                  emoji: data.bot.emoji,
                  handle: data.bot.handle,
                  name: data.bot.name,
                  url: data.bot.url,
                  teamDomain: teamDomain,
                  teamName: team.name,
                  fork: data.fork,
                  forkedFrom: data.forkedFrom,
                  forkedFromName: data.forkedFromName
                }))
              }
            });
          });
        });
      });
    }
  },

  signin: {
    method: 'GET',
    path: '/api/users/sign-in',
    config: {
      auth: false
    },
    handler: (request, reply) => {
      jwt.sign({
        userId: 'anonymous user',
        teamDomain: 'anon'
      },
      process.env.JWT_SECRET,
      { algorithm: 'RS256' },
      (err, token) => {
        if (err) return error(reply, err);
        return reply({ ok: true, token: token });
      });
    }
  }
};
