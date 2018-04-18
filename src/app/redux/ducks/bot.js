'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';

import { delBot } from '../../utils/api';
import { errorHandler } from '../../utils/error-handler';

export const DEFAULT_BOT = {
  name: 'Walkie',
  handle: '@walkie',
  emoji: '',
  url: '/static/illustrations/bot-avatar.svg',
  initialized: false
};

export const deleteBot = (id) => (dispatch, getState) => {
  return delBot(id)
    .then(() => {
      const { meta } = getState();
      dispatch(_deleteBot());
    })
    .catch(errorHandler(dispatch));
};
const _deleteBot = createAction('DELETED_BOT');

export const _updateBot = createAction(
  'UPDATE_BOT',
  (name, handle, url, emoji) => ({ name, handle, url, emoji })
);
export const updateBotProperty = createAction(
  'UPDATE_BOT_PROPERTY',
  (key, value) => ({ key, value })
);

export default handleActions({
  UPDATE_BOT: (state, { payload }) => {
    return Imm.fromJS(state)
      .merge(payload)
      .set('initialized', true)
      .toJS();
  },
  UPDATE_BOT_PROPERTY: (state, { payload }) => {
    return Imm.fromJS(state).update(payload.key, () => payload.value).toJS();
  }
}, DEFAULT_BOT);
