'use strict';
const uuidv4 = require('uuid/v4');
const flatten = require('flatten-obj')();
const mongojs = require('mongojs');
const asyncEach = require('async.each');
const messageUtil = require('../modules/message-util');
const slug = require('slug');

let that;

module.exports = () => {
  if (that) return that;

  const db = mongojs(process.env.MONGODB_URI, ['bots', 'teams', 'users', 'localBots', 'messages', 'notifications']);
  that = {
    notifications: {},
    bots: {},
    teams: {},
    users: {},
    localBots: {},
    messages: {},
    stories: {},
    db
  };

  // db.bots.createIndex({ id: 1, userName: 1 });
  db.bots.createIndex({ id: 1 });
  db.bots.createIndex({ teamId: 1 });  // To get all bots for one team

  db.teams.createIndex({ id: 1 }, { unique: true });
  db.teams.createIndex({ domain: 1 }, { unique: true });

  db.users.createIndex({ team_id: 1, id: 1 });
  db.users.createIndex({ team_id: 1, email: 1 });

  db.localBots.createIndex({ id: 1 });

  db.messages.createIndex({ botId: 1, messageId: 1 }, { unique: true });
  db.messages.createIndex({ botId: 1 });

  db.stories.createIndex({ botId: 1, storyId: 1 }, { unique: true });

  that.stories.getByBotId = (botId, cb) => {
    db.stories.find({
      botId
    }, { _id: 0 }, cb);
  };
  that.stories.getById = (botId, storyId, cb) => {
    db.stories.findOne({
      botId, storyId
    }, { _id: 0 }, cb);
  };
  that.stories.generate = (botId, name, description, messages, cb) => {
    db.stories.update({
      botId,
      storyId: slug(name).toLowerCase()
    }, {
      $set: {
        name: name,
        description: description,
        messageList: messages.map(message => message.messageId)
      }
    }, {
      upsert: true
    }, (err) => {
      if (err) return cb(err);

      db.messages.insert(messages, cb);
    });
  };
  that.stories.create = (botId, storyId, name, cb) => {
    db.stories.save({
      botId,
      storyId,
      name,
      description: '',
      messageList: [],
      createdAt: new Date()
    }, cb);
  };
  that.stories.delete = (botId, storyId, cb) => {
    db.stories.update({
      botId,
      storyId
    }, {
      $set: {
        deleted: true,
        deletedAt: new Date(),
        storyId: `${storyId}-deleted-${Date.now()}`
      }
    }, cb);
  };
  that.stories.rename = (botId, storyId, newName, cb) => {
    db.stories.update({
      botId,
      storyId
    }, {
      $set: {
        storyId: slug(newName).toLowerCase(),
        name: newName,
        updatedAt: new Date()
      }
    }, cb);
  };
  that.stories.updateDescription = (botId, storyId, description, cb) => {
    db.stories.update({
      botId,
      storyId
    }, {
      $set: {
        description,
        updatedAt: new Date()
      }
    }, cb);
  };
  that.stories.duplicate = (botId, storyId, newStoryId, newStoryName, cb) => {
    db.stories.findOne({
      botId,
      storyId
    }, (err, story) => {
      if (err) return cb(err);
      if (!story) return cb(new Error('Story not found'));

      that.messages.getFromMessageList(botId, story.messageList, (err, messages) => {
        if (err) return cb(err);

        messages = messageUtil.cloneMessages(messages);

        asyncEach(messages, (message, msgCb) => db.messages.insert(message, msgCb), (err) => {
          if (err) return cb(err);

          db.stories.update({
            botId,
            storyId: newStoryId
          }, {
            $set: {
              name: newStoryName,
              description: story.description,
              messageList: messages.map(m => m.messageId),
              createdAt: new Date()
            }
          }, {
            upsert: true
          }, cb);
        });
      });
    });
  };
  that.stories.addToMessageList = (botId, storyId, messageId, messagePosition, cb) => {
    const MAX_INT = 2147483647;
    messagePosition = messagePosition >= 0 ? messagePosition : MAX_INT;
    db.stories.update({
      botId,
      storyId
    }, {
      $push: {
        messageList: {
          $position: messagePosition,
          $each: [ messageId ]
        }
      }
    }, cb);
  };
  that.stories.removeFromMessageList = (botId, storyId, messageIdOrList, cb) => {
    const messageIds = Array.isArray(messageIdOrList) ? messageIdOrList : [messageIdOrList];
    db.stories.update({
      botId,
      storyId
    }, {
      $pullAll: { messageList: messageIds }
    }, cb);
  };
  that.stories.addStoryOfMessages = (botId, storyId, story, messages, cb) => {
    story.messageList = messages.map(m => m.messageId);
    const newStory = Object.assign(story, { botId, storyId });

    db.stories.save(newStory, (err) => {
      if (err) return cb(err);
      messages.forEach(m => { m.botId = botId; });
      const insertMsg = (msg, msgCb) => db.messages.insert(msg, msgCb);
      asyncEach(messages, insertMsg, cb);
    });
  };

  that.messages.add = (botId, storyId, message, messagePosition, cb) => {
    message.messageId = uuidv4();
    db.messages.update({
      botId,
      messageId: message.messageId
    }, {
      $setOnInsert: { createdAt: new Date() },
      $set: flatten(message)
    }, {
      upsert: true
    }, err => {
      if (err) return cb(err);

      that.stories.addToMessageList(botId, storyId, message.messageId, messagePosition, (err, res) => {
        if (err) return cb(err);
        if (res.n === 0) return cb(null, res);

        return cb(null, message);
      });
    });
  };
  that.messages.deleteFromActions = (botId, messageId, cb) => {
    db.messages.findOne({
      botId,
      actions: {
        $elemMatch: { 'target.messageId': messageId }
      }
    }, (err, parentMessage) => {
      if (err) return cb(err);
      if (!parentMessage) return cb();

      const removedMessage = parentMessage.actions.find(action => action.target.messageId === messageId);
      const actions = parentMessage.actions
        .filter(action => action !== removedMessage)
        .map(action => {
          const isSameAttachment = action.source.attachment === removedMessage.source.attachment;
          const isSameAction = action.source.action === removedMessage.source.action;
          const isYoungerSibling = action.source.order > removedMessage.source.order;

          if (!isSameAttachment) return action;
          if (!isSameAction) return action;
          if (isYoungerSibling) action.source.order--;

          return action;
        });

      db.messages.findAndModify({
        query: {
          botId,
          messageId: parentMessage.messageId
        },
        update: {
          $set: { actions }
        },
        new: true,
        fields: {_id: 0}
      }, cb);
    });
  };
  that.messages.delete = (botId, storyId, messageId, cb) =>
    db.messages.findAndModify({
      query: {
        botId, messageId
      },
      update: {
        $set: {
          deleted: true,
          deletedAt: new Date()
        }
      },
      new: true,
      fields: {_id: 0}
    }, cb);
  that.messages.deleteMany = (botId, messageIds, cb) =>
    db.messages.update({
      botId,
      messageId: { $in: messageIds }
    }, {
      $set: {
        deleted: true,
        deletedAt: new Date()
      }
    }, { multi: true }, cb);
  that.messages.addActionAndReturnNewMsg = (botId, messageId, newAction, cb) => {
    db.messages.findOne({botId, messageId}, (err, parentMessage) => {
      if (err) return cb(err);
      if (!parentMessage) return cb(new Error('Parent message does not exist'));

      const actions = parentMessage.actions.map(action => {
        const isSameAttachment = action.source.attachment === newAction.source.attachment;
        const isSameAction = action.source.action === newAction.source.action;
        const isYoungerSibling = action.source.order >= newAction.source.order;

        if (!isSameAttachment) return action;
        if (!isSameAction) return action;
        if (isYoungerSibling) action.source.order++;
        return action;
      });

      actions.push(newAction);

      db.messages.findAndModify({
        query: { botId, messageId },
        update: {
          $setOnInsert: { updatedAt: new Date() },
          $set: { actions }
        },
        new: true,
        fields: {_id: 0}
      }, cb);
    });
  };
  that.messages.update = (botId, messageId, message, cb) => {
    db.messages.update({
      botId, messageId
    }, {
      $setOnInsert: { updatedAt: new Date() },
      $set: flatten(message)
    }, cb);
  };
  that.messages.getOne = (botId, messageId, cb) =>
    db.messages.findOne({ botId, messageId }, { _id: 0 }, cb);
  that.messages.getAll = (botId, cb) =>
    db.messages.find({ botId }, { _id: 0 }, cb);
  that.messages.getFromMessageList = (botId, messageIds, cb) => {
    messageIds = messageIds || [];
    if (messageIds.length === 0) {
      return cb(null, []);
    }
    db.messages.find({ botId, messageId: { $in: messageIds } }, { _id: 0 }, (err, messages) => {
      if (err) return cb(err);

      // Sort by original order
      const messageMap = messages.reduce((mm, msg) => {
        mm[msg.messageId] = msg;
        return mm;
      }, {});
      messages = messageIds.map(id => messageMap[id]);

      return cb(null, messages);
    });
  };

  that.bots.count = cb => db.bots.count(cb);
  that.bots.get = (id, cb) =>
    db.bots.findOne({ id }, { _id: 0 }, cb);
  that.bots.addStory = (botId, storyId, story, cb) => {
    db.bots.update({
      id: botId
    }, {
      $set: {
        [`stories.${storyId}`]: story
      }
    }, cb);
  };
  that.bots.getByTeamId = (teamId, cb) =>
    db.bots.find({ teamId }, { _id: 0 }, cb);
  that.bots.save = (id, bot, cb) =>
    db.bots.update({
      id
    }, {
      $set: flatten(bot),
      $setOnInsert: { created: new Date() }
    }, {
      upsert: true
    }, cb);
  that.bots.update = (id, data, cb) =>
    db.bots.update({ id }, data, cb);
  that.bots.addMessage = (id, storyId, message, cb) =>
    db.bots.update({
      id,
      [`stories.${storyId}`]: { $exists: true }
    }, {
      $push: {
        [`stories.${storyId}.messages`]: flatten(message)
      }
    }, cb);
  that.bots.deleteMessage = (id, storyId, messageId, cb) =>
    db.bots.update({
      id,
      [`stories.${storyId}`]: { $exists: true }
    }, {
      $set: {
        [`stories.${storyId}.messages.${messageId}.deleted`]: true,
        [`stories.${storyId}.messages.${messageId}.deletedAt`]: new Date()
      }
    }, cb);
  that.bots.updateMessage = (id, storyId, messageId, message, cb) =>
    db.bots.update({
      id,
      [`stories.${storyId}`]: { $exists: true }
    }, {
      $set: {
        [`stories.${storyId}.messages.${messageId}`]: flatten(message)
      }
    }, cb);
  that.bots.getNextId = (cb) =>
    db.bots.count({}, (err, count) => {
      if (err) {
        console.error(`[DB][GET_NEXT_ID][ERROR] ${err.message} ${err.stack}`);
        return cb(err);
      }
      const base = (count * 1000).toString(36);
      const randomId = Math.floor(Math.random() * 10000000).toString(36);
      const id = `${base}-${randomId}`;
      cb(null, id);
    });

  that.teams.get = (teamId, cb) =>
    db.teams.findOne({ id: teamId }, { _id: 0 }, cb);
  that.teams.getByDomain = (domain, cb) =>
    db.teams.findOne({ domain }, { _id: 0 }, cb);
  that.teams.save = (teamId, team, cb) =>
    db.teams.update({
      id: teamId
    }, {
      $setOnInsert: { signupDate: new Date() },
      $set: flatten(team)
    }, {
      upsert: true
    }, cb);
  that.teams.update = (teamId, data, cb) =>
    db.teams.update({ id: teamId }, data, cb);
  that.users.get = (id, teamId, cb) =>
    db.users.findOne({ id, team_id: teamId }, { _id: 0 }, cb);
  that.users.save = (id, teamId, user, localBotId, cb) =>
    db.users.update({
      id,
      team_id: teamId
    }, {
      $set: flatten(user),
      $setOnInsert: { created: new Date() },
      $addToSet: { localBotIds: localBotId }
    }, {
      upsert: true
    }, cb);
  that.users.update = (id, teamId, data, cb) =>
    db.users.update({ id, team_id: teamId }, data, cb);

  that.localBots.get = (ids, cb) => db.localBots.find({ id: { $in: ids } }, { _id: 0 }, cb);
  that.localBots.save = (id, localBots, cb) => {
    db.localBots.update({
      id
    }, {
      $set: flatten(localBots)
    }, {
      upsert: true
    }, cb);
  };
  that.localBots.delete = (id, botId, cb) =>
    db.localBots.update({
      id
    }, {
      $unset: {
        [`bots.${botId}`]: 1
      }
    }, {
      upsert: true
    }, cb);
  that.localBots.deleteAllOccurences = (botId, cb) =>
    db.localBots.update({
      [`bots.${botId}`]: { $exists: true }
    }, {
      $unset: {
        [`bots.${botId}`]: 1
      }
    }, { multi: true }, cb);

  that.notifications.getOne = (notificationId, cb) =>
    db.notifications.findOne({ notificationId }, { _id: 0, seenBy: 0 }, cb);

  that.notifications.getAll = (cb) =>
    db.notifications.find({ deleted: false }, { _id: 0 }, cb);

  that.notifications.getNewForUserId = (userId, cb) => {
    const now = new Date();
    db.notifications.find({
      $and: [
        { seenBy: { $nin: [userId] } },
        { startDate: { $lte: now } },
        { endDate: { $gte: now } },
        { deleted: false }
      ]
    }, { _id: 0 }, cb);
  };

  that.notifications.create = (message, severity, startDate, endDate, cb) =>
    db.notifications.save({
      notificationId: uuidv4(),
      seenBy: [],
      createdAt: new Date(),
      deleted: false,
      deletedAt: null,
      message,
      severity,
      startDate,
      endDate
    }, cb);

  that.notifications.remove = (notificationId, cb) =>
    db.notifications.update({
      notificationId
    }, {
      $set: {
        deleted: true,
        deletedAt: new Date()
      }
    }, cb);

  that.notifications.acknowledge = (notificationId, userId, cb) =>
    db.notifications.update({
      notificationId
    }, {
      $push: {
        seenBy: userId
      }
    }, cb);

  return that;
};
