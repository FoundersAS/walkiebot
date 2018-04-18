'use strict';
const db = require('../modules/db')();
const error = require('../modules/error-reply');

module.exports = auth => ({
  get: {
    method: 'GET',
    config: { auth },
    path: '/api/local-bots/{id}',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);

      let usersBotIds = [];
      if (request.auth.user) {
        usersBotIds = request.auth.user.localBotIds || [];
      }
      let ids = [request.params.id, ...usersBotIds];

      db.localBots.get(ids, (err, res) => {
        if (err) return error(reply, err);
        if (!res) return reply({ ok: true, data: { id: request.params.id, bots: [] } });

        const bots = res.reduce((listOfBots, curr) => {
          const mappedBots = Object.keys(curr.bots).map(k => {
            const bot = curr.bots[k];
            bot.teamDomain = bot.user || 'anon';
            bot.teamName = 'Anonymous Team';
            return bot;
          });
          return [...listOfBots, ...mappedBots];
        }, []);

        reply({
          ok: true,
          data: {
            id: request.params.id,
            bots
          }
        });
      });
    }
  },

  add: {
    method: 'POST',
    config: { auth },
    path: '/api/local-bots/{id}',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const payload = {
        bots: {
          [request.payload.id]: request.payload
        }
      };
      db.localBots.save(request.params.id, payload, (err, res) => {
        if (err) return error(reply, err);
        db.localBots.get(request.params.id, (err, res) => {
          if (err) return error(reply, err);
          reply({
            ok: true,
            data: {
              id: res.id,
              bots: Object.keys(res.bots).map(k => {
                const bot = res.bots[k];
                bot.teamDomain = bot.user || 'anon';
                bot.teamName = 'Anonymous Team';
                return bot;
              })
            }
          });
        });
      });
    }
  },

  update: {
    method: 'PUT',
    config: { auth },
    path: '/api/local-bots/{id}',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const payload = {
        bots: {
          [request.payload.id]: request.payload
        }
      };
      db.localBots.save(request.params.id, payload, (err, res) => {
        if (err) return error(reply, err);
        reply({ ok: true, data: { id: request.params.id, bots: request.payload } });
      });
    }
  },

  delete: {
    method: 'DELETE',
    config: { auth },
    path: '/api/local-bots/{id}/{botId}',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      db.localBots.delete(request.params.id, request.params.botId, (err, res) => {
        if (err) return error(reply, err);
        reply({ ok: true });
      });
    }
  }
});
