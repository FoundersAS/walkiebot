export const actionOrder = [
  'replace-prev',
  'replace',
  'delete',
  'delete-prev',
  'new-msg',
  'new-user-input'
];

export const sortActions = (a, b) => {
  const aAction = a.getIn(['target', 'action']);
  const bAction = b.getIn(['target', 'action']);
  const aPosition = actionOrder.indexOf(aAction);
  const bPosition = actionOrder.indexOf(bAction);
  return aPosition - bPosition;
};

export const duplicatingToHuman = {
  'replace': 'Replace with message here',
  'new-user-input': 'Add here'
};

export const actionToHuman = {
  'replace': 'Replace this message',
  'import-replace': 'Replace this message from JSON',
  'delete': 'Delete this message',
  'new-user-input': 'Add new message',
  'new-dialog': 'Add dialog',
  'import-json': 'Add from JSON'
};

export const messageActionToHuman = {
  'new-user-input': 'Add triggered message',
  'new-dialog': 'Add dialog',
  'import-json': 'Add from JSON'
};

export const actionTypeToHuman = {
  'click': 'Click',
  'message': 'Message'
};

export const triggersToHuman = {
  'slash-replace': 'Slash command (replace)',
  'slash-public': 'Slash command (in channel)',
  'mention-bot': 'Mention bot',
  'user-input': 'User input'
};

export const triggersToHumanDynamic = (bot, key) => {
  if (key === 'mention-bot') return `${triggersToHuman[key]} (${bot.handle}...)`;
  return triggersToHuman[key];
};
