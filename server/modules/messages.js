const db = require('../modules/db')();
const unfurl = require('../modules/unfurl');

const ensureOptions = (message) => {
  if (!message) return null;
  if (!message.slack) return message;
  if (!message.slack.attachments) return message;
  if (!message.slack.attachments.length) return message;

  message.slack.attachments = message.slack.attachments.map(attachment => {
    if (!attachment.actions) return attachment;
    if (!attachment.actions.length) return attachment;

    attachment.actions = attachment.actions.map(action => {
      if (!action.type === 'select') return action;
      if (action.options) return action;

      action.options = [];
      return action;
    });
    return attachment;
  });
  return message;
}

module.exports = {
  getFromListAndUnfurlWithChildren: (botId, messageList, cb) => {
    db.messages.getFromMessageList(botId, messageList, (err, messages) => {
      if (err) return cb(err);

      unfurl.getUnfurlsForMessages(messages, (err, messages) => {
        if (err) return cb(err);

        const sortMessages = (a, b) => {
          return messageList.indexOf(a.messageId) > messageList.indexOf(b.messageId) ? 1 : -1;
        };

        const original = messages.sort(sortMessages).map(ensureOptions).filter(m => !!m);

        return cb(null, { withChildren: [], original });
      });
    });
  }
};
