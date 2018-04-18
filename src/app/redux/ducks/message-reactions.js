'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';

const DEFAULT_STATE = Imm.fromJS([]);

export const addReaction = createAction(
  'MESSAGE_REACTIONS_ADD',
  (emoji) => ({ emoji })
);
export const removeReaction = createAction(
  'MESSAGE_REACTIONS_REMOVE',
  (emoji) => ({ emoji })
);
export const editReaction = createAction(
  'MESSAGE_REACTIONS_EDIT',
  (emoji, count) => ({ emoji, count })
);
export const moveReaction = createAction(
  'MESSAGE_REACTIONS_MOVE',
  (newPos, oldPos) => ({ newPos, oldPos })
);
export const loadReactions = createAction(
  'MESSAGE_REACTIONS_LOAD',
  (reactions) => ({ reactions })
);
export const resetReactions = createAction('MESSAGE_REACTIONS_RESET');

export default handleActions({
  MESSAGE_REACTIONS_ADD: (state, { payload: { emoji } }) => {
    state = Imm.fromJS(state);
    const emojiAlreadyAdded = state.find(reaction => reaction.get('emoji') === emoji);
    if (emojiAlreadyAdded) return state.toJS();
    return state.push({ emoji, count: 1 }).toJS();
  },
  MESSAGE_REACTIONS_REMOVE: (state, { payload: { emoji } }) =>
    Imm.fromJS(state)
      .filter(reaction => reaction.get('emoji') !== emoji)
      .toJS(),
  MESSAGE_REACTIONS_EDIT: (state, { payload: { emoji, count } }) =>
    Imm.fromJS(state)
      .map(reaction => {
        if (reaction.get('emoji') !== emoji) return reaction;
        return { emoji, count };
      })
      .toJS(),
  MESSAGE_REACTIONS_MOVE: (state, { payload: { newPos, oldPos } }) => {
    return Imm.fromJS(state)
      .delete(oldPos)
      .insert(newPos, state[oldPos])
      .toJS();
  },
  MESSAGE_REACTIONS_LOAD: (state, { payload: { reactions } }) =>
    Imm.fromJS(reactions).toJS(),
  MESSAGE_REACTIONS_RESET: (state) => DEFAULT_STATE.toJS()
}, DEFAULT_STATE.toJS());
