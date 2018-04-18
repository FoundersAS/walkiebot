'use strict';
import { combineReducers } from 'redux';
import attachments from './ducks/attachments';
import dialog from './ducks/dialog';
import bot from './ducks/bot';
import builder from './ducks/builder';
import chatContext from './ducks/chat-context';
import users from './ducks/users';
import stories from './ducks/stories';
import messageSettings from './ducks/message-settings';
import messageReactions from './ducks/message-reactions';
import meta from './ducks/meta';
import localBots from './ducks/local-bots';
import teamBots from './ducks/team-bots';
import notification from './ducks/notification';
import systemNotifications from './ducks/system-notifications';
import flow from './ducks/flow';
import messageTriggerActions from './ducks/message-trigger-actions';
import messageActions from './ducks/message-actions';

export default combineReducers({
  attachments,
  dialog,
  bot,
  builder,
  chatContext,
  users,
  stories,
  messageSettings,
  messageReactions,
  meta,
  localBots,
  teamBots,
  notification,
  systemNotifications,
  flow,
  messageTriggerActions,
  messageActions
});
