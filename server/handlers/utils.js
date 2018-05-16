'use strict';
const Boom = require('boom');
const db = require('../modules/db')();
const error = require('../modules/error-reply');
const map = require('map-async');

const getOneBot = (botId, isAuthenticated, credentials, cb) => {
  db.bots.get(botId, (err, bot) => {
    if (err) return cb(err);
    if (!bot) return cb(null, null);

    if (bot.isTeamBot || bot.isPrivateTeamBot) {
      if (!isAuthenticated) {
        console.log(`[WALKIE][ACL][server/utils#getOneBot] User is not authenticated`);
        return cb(Boom.unauthorized(`You need to be authenticated to view this bot. Please sign in to the ${bot.teamDomain} team to continue`));
      }

      if (bot.teamId && credentials.teamId !== bot.teamId) {
        console.log(`[WALKIE][ACL][server/utils#getOneBot] Users team (${credentials.teamDomain}) does not match bots team (${bot.teamDomain})`);
        return cb(Boom.forbidden(`You need to be signed in to the ${bot.teamDomain} team to view this bot`));
      }
    }

    delete bot.isTeamBot;
    delete bot.isPrivateTeamBot;
    delete bot.teamId;
    delete bot.teamDomain;
    delete bot.userId;
    delete bot.userName;


    db.stories.getByBotId(botId, (err, stories) => {
      if (err) return cb(err);
      db.messages.getAll(botId, (err, messages) => {
        if (err) return cb(err);
        cb(null, { bot, stories, messages });
      });
    });
  });
};
const getManyBots = (botIds, isAuthenticated, credentials, cb) => {
  let errors = [];
  let results = [];

  getAllBots();
  function getAllBots () {
    const bot = botIds.pop();
    if (!bot) return cb(null, { results, errors });
    getOneBot(bot, isAuthenticated, credentials, (err, result) => {
      if (err) {
        errors.push({ id: bot, message: err.message });
      } else if (!result) {
        errors.push({ id: bot, message: 'bot not found' });
      } else {
        results.push(result);
      }
      getAllBots();
    });
  }
};

const rollback = (botId, err, cb) => {
  const { db: rawDb } = db;
  rawDb.bots.remove({ id: botId });
  rawDb.stories.remove({ botId: botId });
  rawDb.messages.remove({ botId: botId });
  return cb(err);
};
const saveOneBot = (data, cb) => {
  const { db: rawDb } = db;
  const { bot, messages, stories } = data;
  rawDb.bots.findOne({ id: bot.id }, (err, res) => {
    if (err) return cb(err);
    if (res) return cb(new Error(`Bot with id ${bot.id} already exists in database. Import aborted.`));

    rawDb.bots.insert(bot, (err) => {
      if (err) return rollback(bot.id, err, cb);
      rawDb.stories.insert(stories, (err) => {
        if (err) return rollback(bot.id, err, cb);
        rawDb.messages.insert(messages, (err) => {
          if (err) return rollback(bot.id, err, cb);
          return cb(null, bot.id);
        });
      });
    });
  });
};
const saveManyBots = (bots, cb) => {
  let errors = [];
  let results = [];

  saveAllBots();
  function saveAllBots () {
    const bot = bots.pop();
    if (!bot) return cb(null, { results, errors });
    saveOneBot(bot, (err, result) => {
      if (err) {
        if (err.code === 11000) {
          errors.push({ id: bot.bot.id, message: `Duplicate bot (${bot.bot.id}) found in database. Import aborted.` });
        }
        else {
          errors.push({ id: bot.bot.id, message: err.message });
        }
      } else {
        results.push(result);
      }
      saveAllBots();
    });
  }
};

const payloadOptions = {
  payload: {
    maxBytes: Number.MAX_SAFE_INTEGER
  }
};

module.exports = auth => ({
  ping: {
    method: 'GET',
    config: { auth: false },
    path: '/api/utils/ping',
    handler: (request, reply) => reply('PONG')
  },
  export: {
    method: 'POST',
    config: { auth, ...payloadOptions },
    path: '/api/utils/export',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { isAuthenticated, credentials } = request.auth;
      const { botIds } = request.payload;

      return getManyBots(botIds, isAuthenticated, credentials, (err, data) => {
        if (err) return error(reply, err);
        if (!data.results) return reply({ ok: false, message: 'not found' }).code(404);
        return reply({ ok: true, data: data.results, errors: data.errors });
      });
    }
  },
  import: {
    method: 'POST',
    config: { auth, ...payloadOptions },
    path: '/api/utils/import',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { contents, localBotId } = request.payload;
      const localBots = contents.map(data => ({
        id: data.bot.id,
        user: 'anon',
        teamDomain: 'anon',
        name: data.bot.bot.name,
        url: data.bot.bot.url,
        emoji: data.bot.bot.emoji
      }));
      const localBotsForDb = localBots.reduce((prev, curr) =>
        Object.assign(prev, { [curr.id]: curr }),
        {}
      );

      saveManyBots(contents, (err, data) => {
        if (err) error(reply, err);
        if (!localBotId) {
          return reply({ ok: true, data: data.results, errors: data.errors });
        }

        db.localBots.save(localBotId, { bots: localBotsForDb }, (err, res) => {
          if (err) return error(reply, err);
          return reply({
            ok: true,
            data: data.results,
            errors: data.errors,
            localBots: {
              id: localBotId,
              bots: localBots
            }
          });
        });
      });
    }
  }
});
