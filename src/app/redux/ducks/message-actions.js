'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';

export const resetActions = createAction('RESET_ACTIONS');
export const loadActions = createAction('LOAD_ACTIONS',
  (actions) => ({ actions: Imm.fromJS(actions) }));
export const moveActionForButton = createAction('MOVE_ACTION_FOR_BUTTON',
  (attachmentPosition, positionA, positionB) => ({ attachmentPosition, positionA, positionB }));
export const removeActionForButton = createAction('REMOVE_ACTION_FOR_BUTTON',
  (attachmentIndex, actionIndex) => ({ attachmentIndex, actionIndex }));
export const moveActionForAttachment = createAction('MOVE_ACTION_FOR_ATTACHMENT',
  (positionA, positionB) => ({ positionA, positionB }));
export const removeActionForAttachment = createAction('REMOVE_ACTION_FOR_ATTACHMENT',
  (attachmentIndex) => ({ attachmentIndex }));

const DEFAULT_STATE = Imm.fromJS([]);

export default handleActions({
  RESET_ACTIONS: (state) => DEFAULT_STATE,
  LOAD_ACTIONS: (state, { payload: { actions } }) => actions,
  MOVE_ACTION_FOR_BUTTON: (state, { payload: { attachmentPosition, positionA, positionB } }) =>
    state.map(action => {
      const isSameAttachment = action.getIn(['source', 'attachment']) === attachmentPosition;
      const isPosA = action.getIn(['source', 'action']) === positionA;
      const isPosB = action.getIn(['source', 'action']) === positionB;
      if (!isSameAttachment) return action;
      if (isPosA) return action.setIn(['source', 'action'], positionB);
      if (isPosB) return action.setIn(['source', 'action'], positionA);
      return action;
    }),
  REMOVE_ACTION_FOR_BUTTON: (state, { payload: { attachmentIndex, actionIndex } }) =>
    state
      .map(action => {
        const isSameAction = action.getIn(['source', 'action']) === actionIndex;
        const isSameAttachment = action.getIn(['source', 'attachment']) === attachmentIndex;
        const isYoungerAction = action.getIn(['source', 'action']) > actionIndex;
        if (isSameAttachment && isSameAction) return action.set('_deleted', true);
        if (!isSameAttachment || !isYoungerAction) return action;
        return action.updateIn(['source', 'action'], action => action - 1);
      }),
  MOVE_ACTION_FOR_ATTACHMENT: (state, { payload: { positionA, positionB } }) =>
    state
      .map(action => {
        const isPosA = action.getIn(['source', 'attachment']) === positionA;
        const isPosB = action.getIn(['source', 'attachment']) === positionB;
        if (isPosA) return action.setIn(['source', 'attachment'], positionB);
        if (isPosB) return action.setIn(['source', 'attachment'], positionA);
        return action;
      }),
  REMOVE_ACTION_FOR_ATTACHMENT: (state, { payload: { attachmentIndex } }) =>
    state
      .map(action => {
        const isSameAttachment = action.getIn(['source', 'attachment']) === attachmentIndex;
        if (isSameAttachment && !isYoungerAction) return action.set('_deleted', true);
        const isYoungerAction = action.getIn(['source', 'attachment']) > attachmentIndex;
        if (!isYoungerAction) return action;
        return action.updateIn(['source', 'attachment'], attachment => attachment - 1);
      })
}, DEFAULT_STATE);
