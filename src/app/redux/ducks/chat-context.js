'use strict';
import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

export const botChatContext = createAction('BOT_CHAT_CONTEXT');
export const changeUserContext = createAction(
  'CHANGE_USER_CONTEXT', (userIdx) => ({ userIdx })
);

export default handleActions({
  BOT_CHAT_CONTEXT: (state) => {
    return Immutable.fromJS(state)
      .set('chatContext', 'bot')
      .toJS();
  },
  CHANGE_USER_CONTEXT: (state, { payload: { userIdx } }) => {
    return Immutable.fromJS(state)
      .set('currentUserIdx', userIdx)
      .set('chatContext', 'you')
      .toJS();
  }
}, {
  chatContext: 'you',
  currentUserIdx: 0
});
