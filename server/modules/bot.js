const asyncEach = require('async.each');
const messageUtil = require('./message-util');
const db = require('./db')();

module.exports = {
  fork: function (payload, callback) {
    db.bots.get(payload.botId, forkBot(payload, callback));

    function forkBot (payload, done) {
      return (err, bot) => {
        if (err) return done(err);
        db.bots.getNextId(saveNewBot(bot, payload, done));
      };
    }

    function saveNewBot (bot, payload, done) {
      return (err, newBotId) => {
        if (err) return done(err);

        let newBot = {
          bot: bot.bot,
          isPublicBot: payload.isPublicBot,
          fork: true,
          forkedFrom: bot.id,
          forkedFromName: bot.bot.name,
          teamDomain: payload.teamDomain,
          userName: payload.user.userName,
          users: bot.users
        };

        if (payload.signedIn && !payload.isPublicBot) {
          newBot = Object.assign(newBot, {
            isTeamBot: true,
            userId: payload.user.id,
            teamId: payload.team.id
          });
        }

        delete newBot.created;

        db.bots.save(newBotId, newBot, createLocalBot(bot.stories, newBot, payload, newBotId, done));
      };
    }

    function createLocalBot (stories, newBot, payload, newBotId, done) {
      return (err, res) => {
        if (err) return done(err);
        const pyld = {
          bots: {
            [newBotId]: {
              id: newBotId,
              name: newBot.bot.name,
              url: payload.url,
              emoji: payload.emoji,
              teamDomain: payload.team.domain,
              teamName: payload.team.name,
              fork: true,
              forkedFromId: payload.botId,
              forkedFromName: payload.name
            }
          }
        };

        db.localBots.save(payload.localBotId, pyld, (err, res) => {
          if (err) return done(err);

          db.stories.getByBotId(payload.botId, (err, stories) => {
            if (err) return done(err);

            const storyColl = stories.map(story => {
              return { story, storyId: story.storyId, newBotId: newBotId };
            });

            asyncEach(storyColl, createStory, (err) => {
              if (err) done(err);
              done(null, newBotId, payload.team.domain);
            });
          });
        });
      };
    }

    function createStory (storyObj, cb) {
      const { story, storyId, newBotId } = storyObj;
      const messageIDs = story.messageList;
      const oldBotId = payload.botId;
      db.messages.getFromMessageList(oldBotId, messageIDs, cloneMessages(newBotId, storyId, story, cb));
    }

    function cloneMessages (newBotId, storyId, story, cb) {
      return (err, messages) => {
        if (err) return cb(err);
        if (messages.length === 0) return cb();

        messages = messageUtil.cloneMessages(messages);

        db.stories.addStoryOfMessages(newBotId, storyId, story, messages, (err) => {
          if (err) return cb(err);
          cb();
        });
      };
    }
  }
};
