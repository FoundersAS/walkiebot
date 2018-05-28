'use strict';
const axios = require('axios');
const Boom = require('boom');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const db = require('../modules/db')();
const error = require('../modules/error-reply');

const JWT_SECRET = process.env.JWT_SECRET && process.env.JWT_SECRET.replace(/\\n/g, '\n');

const doOauthRequest = (redirectUri, code, state) => {
  return axios.get('https://slack.com/api/oauth.access', {
    params: {
      code: code,
      redirect_uri: redirectUri,
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET
    }
  }).then(res => res.data);
};

module.exports = {
  add: {
    method: 'GET',
    path: '/slack/add',
    config: {
      validate: {
        params: {
          state: Joi.string(),
          code: Joi.string()
        }
      }
    },
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      doOauthRequest('https://${process.env.NGROK_SUBDOMAIN}/slack/add', request.query.code)
        .then(data => {
          if (!data.ok) throw new Error(data.error);

          db.teams.update(data.team_id, {
            $set: { bot: data.bot }
          }, (err, res) => {
            if (err) return error(reply, err);
            db.users.update(data.user_id, data.team_id, {
              $set: { scope: data.scope.split(',') }
            }, (err, res) => {
              if (err) return error(reply, err);
              return reply({ ok: true });
            });
          });
        })
        .catch(err => {
          console.error(`[WALKIE][${request.method}][${request.url.path}][ERROR] ${err.message} ${err.stack}`);
          return reply({ ok: false, error: err.message }).code(500);
        });
    }
  },

  login: {
    method: 'GET',
    path: '/slack/login',
    config: {
      validate: {
        params: {
          state: Joi.string(),
          code: Joi.string()
        }
      },
      auth: false
    },
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      let { APP_HOST, SLACK_LOGIN_REDIRECT_URL, HEROKU_APP_NAME } = process.env;
      if (!APP_HOST) APP_HOST = '';
      if (HEROKU_APP_NAME) {
        SLACK_LOGIN_REDIRECT_URL = `https://${HEROKU_APP_NAME}.herokuapp.com/slack/login`;
        APP_HOST = `https://${HEROKU_APP_NAME}.herokuapp.com`;
      }

      if (request.query.error) {
        const msg = `An error occurred while trying to sign you in. All we know from slack is this: ${request.query.error} - Maybe try and contact your slack team administrator.`;
        return reply.redirect(`${APP_HOST}/app/logout?msg=${msg}&type=error`);
      }

      doOauthRequest(SLACK_LOGIN_REDIRECT_URL, request.query.code)
        .then(data => {
          if (!data.ok) {
            const msg = `An error occurred while trying to sign you in. All we know from slack is this: ${data.error} - Maybe try and contact your slack team administrator.`;
            reply.redirect(`${APP_HOST}/app/logout?msg=${msg}&type=error`);
            throw new Error(data.error);
          }
          const [ next, localBotId ] = request.query.state.split('||');

          const user = Object.assign(
            data.user,
            {
              access_token: data.access_token,
              scope: data.scope ? data.scope.split(',') : [],
              lastLogin: new Date()
            }
          );
          const team = data.team;

          db.teams.save(team.id, team, (err, res) => {
            if (err) return error(reply, err);
            db.users.save(user.id, team.id, user, localBotId, (err, res) => {
              if (err) return error(reply, err);

              jwt.sign({
                userId: user.id,
                teamId: team.id,
                teamDomain: team.domain
              },
              JWT_SECRET,
              { algorithm: 'RS256', expiresIn: '30d', issuer: 'walkiebot' },
              (err, token) => {
                if (err) return reply(Boom.badImplementation(err));

                const redirectUrl = `${APP_HOST}/app/login?token=${token}&next=${next}`;
                if (!res.upserted) return reply.redirect(redirectUrl);

                return reply.redirect(`${redirectUrl}&signup=1`);
              });
            });
          });
        })
        .catch(err => {
          console.error(`[WALKIE][${request.method}][${request.url.path}][ERROR] ${err.message} ${err.stack}`);
          return reply({ ok: false, error: err.message }).code(500);
        });
    }
  }
};
