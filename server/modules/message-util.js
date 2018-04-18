const uuidv4 = require('uuid/v4');

module.exports = {
  cloneMessages: (messageList) => {
    // Cache ids for translation
    messageList = messageList.filter(m => !!m);
    const oldToNew = messageList
      .reduce((m, msg) => {
        m[msg.messageId] = uuidv4();
        return m;
      }, {});

    const messages = messageList.map(message => {
      message.messageId = oldToNew[message.messageId];
      message.createdAt = new Date();
      return message;
    });

    // Convert old parents and action targets with new ids
    messages.forEach(message => {
      const newParents = message.parents.map((parent) => {
        const newIDs = parent.split('.')
          .map(id => oldToNew[id])
          .filter(id => id !== undefined);
        return newIDs.join('.');
      });
      message.actions.forEach(ca => {
        const isDeleteNode = ca.target.messageId.indexOf('delete.') === 0;

        // If it's a delete node, then generate new id
        if (isDeleteNode) {
          const messageIdSplit = ca.target.messageId.split('.');
          const deleteMessageId = messageIdSplit[1];
          const deleteMessageRandomStr = messageIdSplit[2];
          ca.target.messageId = `delete.${oldToNew[deleteMessageId]}.${deleteMessageRandomStr}`;
          return;
        }

        ca.target.messageId = oldToNew[ca.target.messageId];
      });
      message.parents = newParents;
    });

    return messages;
  }
};
