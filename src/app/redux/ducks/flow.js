'use strict';
import Imm from 'immutable';
import { createAction, handleActions } from 'redux-actions';

export const addToFlow = (storyId, messageId, triggers) => {
  return (dispatch, getState) => {
    const { flow } = getState();

    return new Promise((resolve, reject) => {
      if (flow.get(messageId)) return resolve();

      dispatch(_addToFlow(messageId, triggers));

      return resolve();
    });
  };
};
export const findPathToMessage = (storyId, messageId, olderNodes) => {
  return (dispatch, getState) => {
    const state = getState();

    return new Promise((resolve, reject) => {
      if (state.flow.get(messageId)) {
        dispatch(removeFromFlow(messageId));
        return resolve();
      }

      const { messages } = state.stories[storyId];
      const path = olderNodes.concat(messageId);
      const messagesInPath = messages.filter(m => path.indexOf(m.messageId) !== -1);
      const newTriggers = messagesInPath
        .reduce((triggers, m) => {
          // Find the action that was requested
          const childAction = m.actions.find(a => {
            return path.indexOf(a.target.messageId) !== -1;
          });

          // If no childAction is found, set the id of the message with an empty map
          // so the message will still get picked up when it is requested
          if (!childAction) return triggers.set(m.messageId, Imm.List());

          // Get all actions in the current path on the button
          const allActionsInPathForButton = m.actions.filter(a => {
            const isUndefined = childAction.source.action === undefined &&
              a.source.action === undefined &&
              childAction.source.attachment === undefined &&
              a.source.attachment === undefined;
            if (isUndefined) return;

            const isSameAction = childAction.source.action === a.source.action;
            const isSameAttachment = childAction.source.attachment === a.source.attachment;
            const isActionInPath = path.find(pId => pId === a.target.messageId);
            return isSameAction && isSameAttachment && isActionInPath;
          });

          return triggers.set(
            m.messageId,
            Imm.fromJS(allActionsInPathForButton)
          );
        }, Imm.Map());
      dispatch(_setFlow(newTriggers, Imm.fromJS(path)));
      return resolve();
    });
  };
};
export const removeFromFlow = createAction('REMOVE_FROM_FLOW', messageIds => ({
  messageIds: typeof messageIds === 'string' ? [messageIds] : messageIds
}));
export const resetFlow = createAction('RESET_FLOW');

const _setFlow = createAction('SET_FLOW', (entries, path) => ({ entries, path }));
const _addToFlow = createAction('ADD_TO_FLOW', (messageId, triggers) => ({ messageId, triggers }));

const DEFAULT_STATE = Imm.fromJS({
  flow: {},
  path: []
});

export default handleActions({
  RESET_FLOW: (state) => DEFAULT_STATE,
  SET_FLOW: (state, { payload: { entries, path } }) => {
    return DEFAULT_STATE.set('flow', entries).set('path', path);
  },
  ADD_TO_FLOW: (state, { payload: { messageId, triggers } }) => {
    return state.updateIn(['flow', messageId], flowEntry => Imm.fromJS(triggers)).update('path', path => path.push(messageId));
  },
  REMOVE_FROM_FLOW: (state, { payload: { messageIds } }) => {
    return state
      .update('flow', flow => flow.filter((_, mId) => messageIds.indexOf(mId === -1)))
      .update('path', path => path.filter(mId => messageIds.indexOf(mId) === -1));
  }
}, DEFAULT_STATE);
