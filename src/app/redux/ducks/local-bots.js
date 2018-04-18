'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';

export const _initLocalBots = createAction('INIT_LOCAL_BOTS');
export const _saveLocalBot = createAction(
  'SAVE_LOCAL_BOT',
  (bot) => ({ bot })
);
export const _deleteLocalBot = createAction(
  'DELETE_LOCAL_BOT',
  (id) => ({ id })
);

export default handleActions({
  INIT_LOCAL_BOTS: (state, { payload }) =>
    Imm.fromJS(state)
      .set('id', payload.id)
      .set('bots', payload.bots)
      .toJS(),
  SAVE_LOCAL_BOT: (state, { payload: { bot } }) =>
    Imm.fromJS(state)
      .update('bots', bots => {
        const existingBot = bots.find(b => b.get('id') === bot.id);
        if (existingBot) {
          return bots.map(b => {
            if (b.get('id') !== bot.id) return b;
            return b.merge(bot);
          });
        }
        return bots.push(bot);
      })
      .toJS(),
  DELETE_LOCAL_BOT: (state, { payload: { id } }) =>
    Imm.fromJS(state)
      .update('bots', bots =>
        bots.filter(b => b.get('id') !== id))
      .toJS()
}, {
  id: null,
  bots: []
});
