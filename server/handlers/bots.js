'use strict';
const joi = require('joi');
const Boom = require('boom');
const db = require('../modules/db')();
const unfurl = require('../modules/unfurl');
const messages = require('../modules/messages');
const accessControl = require('../modules/access-control');
const error = require('../modules/error-reply');
const botUtils = require('../modules/bot');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const exampleStoryTemplate = fs.readFileSync(path.join(__dirname, 'example-story.ejs')).toString();
const storySchema = joi.object({
  name: joi.string(),
  description: joi.string().allow(''),
  messages: joi.array().items(joi.object(), joi.any().strip()),
  messageList: joi.array().items(joi.string())
});

function sortMessage (message) {
  if (!message) return;
  message.actions.sort((a, b) => {
    const aAttachmentIdx = a.source.attachment;
    const bAttachmentIdx = b.source.attachment;
    const aActionIdx = a.source.action;
    const bActionIdx = b.source.action;
    const aOrder = a.source.order;
    const bOrder = b.source.order;

    if (aAttachmentIdx !== bAttachmentIdx) return aAttachmentIdx - bAttachmentIdx;
    if (aActionIdx !== bActionIdx) return aActionIdx - bActionIdx;
    return aOrder - bOrder;
  });

  return message;
}

module.exports = auth => ({
  'get-bot': {
    method: 'GET',
    config: { auth },
    path: '/api/bot/{botId}',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { isAuthenticated, credentials } = request.auth;
      const { botId } = request.params;
      const { storyId } = request.query;

      db.bots.get(botId, (err, res) => {
        if (err) return error(reply, err);
        if (!res) return reply({ ok: false, message: 'not found' }).code(404);
        if (res.deleted) {
          db.localBots.deleteAllOccurences(botId, (err, res) => {
            if (err) return error(reply, err);

            reply({ ok: false, message: 'not found' }).code(404);
          });
          return;
        }
        if (res.isTeamBot || res.isPrivateTeamBot) {
          if (!isAuthenticated) {
            console.log(`[WALKIE][ACL][${request.method}][${request.url.path}] User is not authenticated`);
            return reply(Boom.unauthorized(`You need to be authenticated to view this bot. Please sign in to the ${res.teamDomain} team to continue`));
          }

          if (credentials.teamId !== res.teamId) {
            console.log(`[WALKIE][ACL][${request.method}][${request.url.path}] Users team (${credentials.teamDomain}) does not match bots team (${res.teamDomain})`);
            return reply(Boom.forbidden(`You need to be signed in to the ${res.teamDomain} team to view this bot`));
          }
        }

        res.teamDomain = res.teamDomain || 'anon';
        res.bot.teamDomain = res.teamDomain;
        res.isPublicBot = !res.isTeamBot;

        db.stories.getByBotId(botId, (err, stories) => {
          if (err) return error(reply, err);

          res.stories = stories.reduce((prev, curr) => {
            prev[curr.storyId] = curr;
            return prev;
          }, {});

          let messageList = [];
          if (storyId) {
            if (res.stories[storyId]) {
              messageList = res.stories[storyId].messageList;
            }
          }

          Object.keys(res.stories).forEach(s => {
            if (res.stories[s].deleted) {
              delete res.stories[s];
              return;
            }
            res.stories[s].messages = [];
            res.stories[s].messageList = res.stories[s].messageList || [];
            res.stories[s].messageCount = res.stories[s].messageList.length;
            delete res.stories[s].messageList;
          });

          if (!storyId) return reply({ ok: true, state: res });
          if (!res.stories[storyId]) return reply({ ok: true, state: res });

          messages.getFromListAndUnfurlWithChildren(botId, messageList, (err, result) => {
            if (err) return error(reply, err);

            const messages = result.original.map(sortMessage);

            res.stories[storyId].messages = messages;
            delete res.stories[storyId].messageList;

            reply({ ok: true, state: res });
          });
        });
      });
    }
  },
  'migrate-local-bot-to-team-bot': {
    method: 'PUT',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/migrate',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { isAuthenticated, credentials } = request.auth;
      const { botId } = request.params;

      if (!isAuthenticated) {
        return reply(Boom.unauthorized('You need to be authenticated to perform this action.'));
      }
      db.teams.getByDomain(credentials.teamDomain, (err, team) => {
        if (err) return error(reply, err);
        if (!team) return reply(Boom.notFound('Team not found'));

        db.users.get(credentials.userId, team.id, (err, user) => {
          if (err) return error(reply, err);
          if (!user) return reply(Boom.notFound('User not found'));

          const teamInfo = {
            isTeamBot: true,
            userName: user.name,
            userId: user.id,
            teamDomain: team.domain,
            teamId: team.id
          };
          db.bots.save(botId, teamInfo, (err, res) => {
            if (err) return error(reply, err);

            db.localBots.deleteAllOccurences(botId, (err, res) => {
              if (err) return error(reply, err);

              return reply({ ok: true });
            });
          });
        });
      });
    }
  },
  'fork-bot': {
    method: 'POST',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/fork',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      botUtils.fork(request.payload, (err, botId, teamDomain) => {
        if (err) return error(reply, err);
        reply({ ok: true, botId, teamDomain }).code(200);
      });
    }
  },
  'update-bot': {
    method: 'PUT',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId } = request.params;

      if (!request.payload.stories) return ondone();
      let keys = Object.keys(request.payload.stories);

      next();
      function next (err, res) {
        const key = keys.pop();
        if (err) return error(reply, err);
        if (!key) return ondone();

        storySchema.validate(request.payload.stories[key], {
          stripUnknown: true
        }, (err, validated) => {
          if (err) return next(err);
          request.payload.stories[key] = validated;
          next();
        });
      }

      function ondone () {
        if (!request.payload) {
          console.error(`[WALKIE][${request.method}][${request.url.path}][ERROR][NO_PAYLOAD]`);
          return reply({ ok: false }).code(400);
        }
        const payload = Object.assign(request.payload, { updated: new Date() });
        db.bots.save(botId, payload, (err, res) => {
          if (err) return error(reply, err);
          reply({ ok: true }).code(200);
        });
      }
    }
  },
  'delete-bot': {
    method: 'DELETE',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId } = request.params;

      db.bots.update(botId, {
        $set: { deleted: true, deletedAt: new Date() }
      }, (err, res) => {
        if (err) return error(reply, err);
        if (!res) return reply({ ok: false, message: 'not found' }).code(404);

        db.localBots.deleteAllOccurences(botId, (err, res) => {
          if (err) return error(reply, err);

          reply({ ok: true });
        });
      });
    }
  },
  'new-bot': {
    method: 'POST',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);

      db.bots.getNextId((err, botId) => {
        if (err) return error(reply, err);
        if (!request.payload.stories) return ondone();
        let keys = Object.keys(request.payload.stories);

        next();
        function next (err, res) {
          const key = keys.pop();
          if (err) return error(reply, err);
          if (!key) return ondone();

          storySchema.validate(request.payload.stories[key], {
            stripUnknown: true
          }, (err, validated) => {
            if (err) return next(err);
            request.payload.stories[key] = validated;
            next();
          });
        }

        function ondone () {
          if (!request.payload) {
            console.error(`[WALKIE][${request.method}][${request.url.path}][ERROR][NO_PAYLOAD]`);
            return reply({ ok: false }).code(400);
          }
          db.bots.save(botId, request.payload, (err, res) => {
            if (err) return error(reply, err);

            // Generate Giphy example story
            const exampleStoryRendered = ejs.render(exampleStoryTemplate, {
              botId: botId,
              messageIds: [uuid.v4(), uuid.v4(), uuid.v4(), uuid.v4()]
            });
            const exampleStoryMessages = JSON.parse(exampleStoryRendered);

            db.stories.generate(botId, 'Giphy example', 'An example of how /giphy looks like in Walkie', exampleStoryMessages, err => {
              if (err) return error(reply, err);

              reply({
                ok: true,
                data: {
                  id: botId,
                  teamDomain: request.payload.teamDomain || 'anon',
                  isTeamBot: request.payload.isTeamBot || false
                }
              }).code(201);
            });
          });
        }
      });
    }
  },

  'add-message': {
    method: 'POST',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/stories/{storyId}/message',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId, storyId } = request.params;
      const { message, messagePosition } = request.payload;

      if (!message) return reply({ ok: false, message: 'An error occurred, please try to refresh walkie' });

      message.botId = botId;

      db.messages.add(botId, storyId, message, messagePosition, (err, res) => {
        if (err) return error(reply, err);
        if (res.n === 0) {
          return reply({
            ok: false,
            message: 'Story not found - Maybe someone deleted it or renamed it? Try reloading Walkie'
          });
        }

        if (message.type === 'dialog') return reply({ ok: true, data: message });

        message.messageId = res.messageId;
        let urls = [];
        if (message.slack.text) {
          urls = message.slack.text.match(unfurl.urlPattern) || urls;
        }
        if (message.slack.attachments) {
          const imageUrls = message.slack.attachments.filter(a => !!a.image_url).map(a => a.image_url) || [];
          urls = urls.concat(imageUrls);
        }

        if (!urls) return reply({ ok: true, data: message });

        unfurl.getUnfurlsForUrls(urls, (err, unfurls) => {
          if (err) return reply({ ok: true, data: message });

          message.unfurls = (unfurls || {}).reduce((prev, curr) => {
            if (!curr.image) return prev;
            prev[curr.url] = curr;
            return prev;
          }, {});

          return reply({ ok: true, data: message });
        });
      });
    }
  },
  'add-action-to-message': {
    method: 'POST',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/stories/{storyId}/message/{messageId}/actions',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId, messageId } = request.params;
      const { action } = request.payload;
      db.messages.addActionAndReturnNewMsg(botId, messageId, action, (err, message) => {
        if (err) return error(reply, err);
        if (!message) {
          return reply({
            ok: false,
            message: 'Message not found - Maybe someone deleted it or renamed it? Try reloading Walkie'
          });
        }

        message = sortMessage(message);

        let urls = [];
        if (message.slack.text) {
          urls = message.slack.text.match(unfurl.urlPattern) || urls;
        }
        if (message.slack.attachments) {
          const imageUrls = message.slack.attachments.filter(a => !!a.image_url).map(a => a.image_url) || [];
          urls = urls.concat(imageUrls);
        }

        if (!urls) return reply({ ok: true, data: message });

        unfurl.getUnfurlsForUrls(urls, (err, unfurls) => {
          if (err) return reply({ ok: true, data: message });

          message.unfurls = (unfurls || {}).reduce((prev, curr) => {
            if (!curr.image) return prev;
            prev[curr.url] = curr;
            return prev;
          }, {});

          return reply({ ok: true, data: message });
        });
      });
    }
  },
  'remove-target-from-action': {
    method: 'POST',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/stories/{storyId}/message/{messageId}/targets/delete',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId } = request.params;
      const { targetMessageId } = request.payload;

      db.messages.deleteFromActions(botId, targetMessageId, (err, updatedMessage) => {
        if (err) return error(reply, err);

        reply({ok: true, message: sortMessage(updatedMessage)});
      });
    }
  },
  'update-message': {
    method: 'PUT',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/stories/{storyId}/message/{messageId}',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId, messageId, storyId } = request.params;
      const { message, idsToDelete } = request.payload;

      if (!message) return reply({ ok: false, message: 'An error occurred, please try to refresh walkie' });

      db.stories.removeFromMessageList(botId, storyId, idsToDelete, (err, res) => {
        if (err) return error(reply, err);
        if (res.n === 0 && idsToDelete.length > 0) {
          return reply({
            ok: false,
            message: 'Story not found - Maybe someone deleted it or renamed it? Try reloading Walkie'
          });
        }
        db.messages.deleteMany(botId, idsToDelete, (err, res) => {
          if (err) return error(reply, err);
          if (res.n === 0 && idsToDelete.length > 0) {
            return reply({
              ok: false,
              message: 'Story not found - Maybe someone deleted it or renamed it? Try reloading Walkie'
            });
          }

          db.messages.update(botId, messageId, message, (err, res) => {
            if (err) return error(reply, err);
            if (res.n === 0) {
              return reply({
                ok: false,
                message: 'Story not found - Maybe someone deleted it or renamed it? Try reloading Walkie'
              });
            }


            let urls = [];
            if (message.slack.text) {
              urls = message.slack.text.match(unfurl.urlPattern) || urls;
            }
            if (message.slack.attachments) {
              const imageUrls = message.slack.attachments.filter(a => !!a.image_url).map(a => a.image_url) || [];
              urls = urls.concat(imageUrls);
            }

            if (!urls) return reply({ ok: true, data: { message, idsToDelete: [] } });

            unfurl.getUnfurlsForUrls(urls, (err, unfurls) => {
              if (err) return reply({ ok: true, data: { message, idsToDelete: [] } });

              message.unfurls = (unfurls || {}).reduce((prev, curr) => {
                if (!curr.image) return prev;
                prev[curr.url] = curr;
                return prev;
              }, {});

              return reply({ ok: true, data: { message, idsToDelete } });
            });
          });
        });
      });
    }
  },
  'delete-message': {
    method: 'DELETE',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/stories/{storyId}/message/{messageId}',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId, messageId, storyId } = request.params;
      const children = request.query.children.split(',');
      const messageIds = children.concat(messageId);

      if (!messageId || messageId === 'undefined') {
        return reply({
          ok: false,
          message: 'Incorrect messageId'
        });
      }
      db.stories.removeFromMessageList(botId, storyId, messageIds, (err, res) => {
        if (err) return error(reply, err);
        if (res.n === 0) {
          return reply({
            ok: false,
            message: 'Story not found - Maybe someone deleted it or renamed it? Try reloading Walkie'
          });
        }
        db.messages.deleteMany(botId, messageIds, (err, res) => {
          if (err) return error(reply, err);
          if (res.n === 0) {
            return reply({
              ok: false,
              message: 'Story not found - Maybe someone deleted it or renamed it? Try reloading Walkie'
            });
          }
          db.messages.deleteFromActions(botId, messageId, (err, updatedParentMessage) => {
            if (err) return error(reply, err);
            if (updatedParentMessage) updatedParentMessage = sortMessage(updatedParentMessage);
            return reply({
              ok: true,
              data: {
                idsToDelete: children,
                parentMessage: updatedParentMessage
              }
            });
          });
        });
      });
    }
  },
  'move-message': {
    method: 'POST',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/stories/{storyId}/message/move',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId, storyId } = request.params;
      const { source, target } = request.payload;

      if (target.index < 0) {
        return reply({
          ok: false,
          message: 'Invalid index for message'
        }).code(400);
      }
      db.bots.moveMessage(botId, storyId, source, target, (err, res) => {
        if (err) return error(reply, err);
        if (res.n === 0) {
          return reply({
            ok: false,
            message: 'Story not found - Maybe someone deleted it or renamed it? Try reloading Walkie'
          });
        }

        return reply({ ok: true });
      });
    }
  },

  'create-story': {
    method: 'POST',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/stories',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId } = request.params;
      const { storyId, storyName } = request.payload;

      db.stories.create(botId, storyId, storyName, (err, res) => {
        if (err) return error(reply, err);
        return reply({ ok: true });
      });
    }
  },
  'get-story': {
    method: 'GET',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/stories/{storyId}',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId, storyId } = request.params;

      db.stories.getById(botId, storyId, (err, res) => {
        if (err) return error(reply, err);
        if (!res) return reply({ ok: false, message: `Story not found with name '${storyId}'` });

        const story = res;
        story.messageList = story.messageList || [];

        messages.getFromListAndUnfurlWithChildren(botId, story.messageList, (err, result) => {
          if (err) return error(reply, err);

          story.messages = result.original.map(sortMessage);
          story.messageCount = story.messageList.length;
          delete story.messageList;

          reply({ ok: true, data: story });
        });
      });
    }
  },
  'delete-story': {
    method: 'DELETE',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/stories/{storyId}',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId, storyId } = request.params;

      db.stories.delete(botId, storyId, (err, res) => {
        if (err) return error(reply, err);
        if (!res) return reply({ ok: false, message: 'not found' }).code(404);

        reply({ ok: true });
      });
    }
  },
  'update-story': {
    method: 'PUT',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/stories/{storyId}',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId, storyId } = request.params;
      const { description } = request.payload;

      db.stories.updateDescription(botId, storyId, description, (err, res) => {
        if (err) return error(reply, err);

        reply({ ok: true });
      });
    }
  },
  'rename-story': {
    method: 'PUT',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/stories/{storyId}/rename',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId, storyId } = request.params;
      const { newName } = request.payload;

      db.stories.rename(botId, storyId, newName, (err, res) => {
        if (err) return error(reply, err);

        reply({ ok: true });
      });
    }
  },
  'duplicate-story': {
    method: 'PUT',
    config: {
      auth,
      pre: [ accessControl.userHasAccess ]
    },
    path: '/api/bot/{botId}/stories/{storyId}/duplicate',
    handler: (request, reply) => {
      console.log(`[WALKIE][${request.method}][${request.url.path}]`);
      const { botId, storyId } = request.params;
      const { newId, newName } = request.payload;

      db.stories.duplicate(botId, storyId, newId, newName, (err, res) => {
        if (err) return error(reply, err);
        if (res.n === 0) {
          return reply({
            ok: false,
            message: 'Story or bot not found - Maybe someone deleted it or renamed it? Try reloading Walkie'
          });
        }

        db.stories.getById(botId, newId, (err, res) => {
          if (err) return error(reply, err);
          if (!res) return reply({ ok: false, message: `Story not found with name '${storyId}-1'` });
          const story = res;
          story.messageList = story.messageList || [];
          story.messageCount = story.messageList.length;
          story.messages = [];
          delete story.messageList;

          return reply({ ok: true, data: { [newId]: story } });
        });
      });
    }
  }
});
