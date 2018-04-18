'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';

const DEFAULT_STATE = Imm.fromJS({
  delete: false,
  replace: false,
  ephemeral: false
});

export const toggleDelete = createAction('MESSAGE_SETTINGS_TOGGLE_DELETE');
export const toggleReplace = createAction('MESSAGE_SETTINGS_TOGGLE_REPLACE');
export const toggleEphemeral = createAction('MESSAGE_SETTINGS_TOGGLE_EPHEMERAL');
export const setEphemeral = createAction('MESSAGE_SETTINGS_SET_EPHEMERAL');
export const unsetEphemeral = createAction('MESSAGE_SETTINGS_UNSET_EPHEMERAL');
export const resetMessageSettings = createAction('MESSAGE_SETTINGS_RESET');
export const loadMessageSettings = createAction('MESSAGE_SETTINGS_LOAD');

export default handleActions({
  MESSAGE_SETTINGS_TOGGLE_DELETE: (state) =>
    Imm.fromJS(state)
      .set('delete', !state.delete)
      .toJS(),
  MESSAGE_SETTINGS_TOGGLE_REPLACE: (state) =>
    Imm.fromJS(state)
      .set('replace', !state.replace)
      .toJS(),
  MESSAGE_SETTINGS_TOGGLE_EPHEMERAL: (state) =>
    Imm.fromJS(state)
      .set('ephemeral', !state.ephemeral)
      .toJS(),
  MESSAGE_SETTINGS_SET_EPHEMERAL: (state) =>
    Imm.fromJS(state)
      .set('ephemeral', true)
      .toJS(),
  MESSAGE_SETTINGS_UNSET_EPHEMERAL: (state) =>
    Imm.fromJS(state)
      .set('ephemeral', false)
      .toJS(),
  MESSAGE_SETTINGS_RESET: (state) =>
    DEFAULT_STATE.toJS(),
  MESSAGE_SETTINGS_LOAD: (state, { payload }) =>
    Imm.fromJS(state)
      .merge(payload)
      .toJS()
}, DEFAULT_STATE.toJS());
