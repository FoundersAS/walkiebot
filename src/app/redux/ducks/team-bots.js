'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';

export const initTeamBots = createAction('INIT_TEAM_BOTS');
export const addTeamBot = createAction(
  'ADD_TEAM_BOT',
  (bot) => ({ bot })
);
export const updateTeamBot = createAction(
  'UPDATE_TEAM_BOT',
  (bot) => ({ bot })
);
export const deleteTeamBot = createAction(
  'DELETE_TEAM_BOT',
  (id) => ({ id })
);

export default handleActions({
  INIT_TEAM_BOTS: (state, { payload }) =>
    Imm.fromJS(payload).toJS(),
  ADD_TEAM_BOT: (state, { payload: { bot } }) =>
    Imm.fromJS(state)
      .push(bot)
      .toJS(),
  UPDATE_TEAM_BOT: (state, { payload: { bot } }) =>
    Imm.fromJS(state)
      .map(b => {
        if (b.get('id') !== bot.id) return b;
        return b.merge(bot);
      })
      .toJS(),
  DELETE_TEAM_BOT: (state, { payload: { id } }) =>
    Imm.fromJS(state)
      .filter(b => b.get('id') !== id)
      .toJS()
}, []);
