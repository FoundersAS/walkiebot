'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';

export const startAddTrigger = createAction(
  'START_ADD_MESSAGE_TRIGGER',
  (key, type, messageId, attachmentIdx = null, actionIdx = null ) => {
    return { key, type, messageId, attachmentIdx, actionIdx };
  }
);
export const stopAddTrigger = createAction('STOP_ADD_MESSAGE_TRIGGER');

const DEFAULT_STATE = Imm.fromJS({
  isAdding: false,
  trigger: {
    key: null,
    type: null,
    messageId: null,
    attachmentIdx: null,
    actionIdx: null
  }
});

export default handleActions({
  START_ADD_MESSAGE_TRIGGER: (state, { payload }) =>
    state
      .set('isAdding', true)
      .update('trigger', trigger => trigger.merge(payload)),
  STOP_ADD_MESSAGE_TRIGGER: (state) => DEFAULT_STATE
}, DEFAULT_STATE);
