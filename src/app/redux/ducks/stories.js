'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';

import * as api from '../../utils/api';
import { errorHandler } from '../../utils/error-handler';
import { treeSearch, getNodesChildren, getMessageAndActionPosition } from '../../utils/message-relations';
import { startLoading, stopLoading } from './meta';
import { triggerNotification } from './notification';
import { addToFlow, removeFromFlow, findPathToMessage } from './flow';
import { stopAddTrigger } from './message-trigger-actions';

export const loadStories = createAction('LOAD_STORIES');
export const getStory = (storyId) => {
  return (dispatch, getState) => {
    const state = getState();

    dispatch(_startLoadingStories(storyId));

    return api.getBotStory(state.meta.botId, storyId)
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          return dispatch(triggerNotification(
            'Error',
            res.data.message,
            'error',
            10000
          ));
        }
        const story = res.data.data;
        dispatch(_getStory(storyId, story));

        if (story.messages.length) {
          dispatch(findPathToMessage(storyId, story.messages[0].messageId, []));
        }

        dispatch(_stopLoadingStories(storyId));
        return story;
      })
      .catch(e => {
        dispatch(_stopLoadingStories(storyId));
        errorHandler(dispatch)(e);
      });
  };
};
const _getStory = createAction('GET_STORY', (storyId, story) => ({ storyId, story }));
export const addStory = (storyId, name) => {
  return (dispatch, getState) => {
    const state = getState();

    return api.createBotStory(state.meta.botId, storyId, name)
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          const err = new Error(res.data.message);
          err.status = res.status;
          return errorHandler(dispatch)(err);
        }
        dispatch(_addStory(storyId, name));
      })
      .catch(errorHandler(dispatch));
  };
};
const _addStory = createAction('ADD_STORY', (storyId, name) => ({ storyId, name }));
export const updateStoryDescription = (storyId, value) => {
  return (dispatch, getState) => {
    const state = getState();

    return api.updateBotStory(state.meta.botId, storyId, { description: value })
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          const err = new Error(res.data.message);
          err.status = res.status;
          return errorHandler(dispatch)(err);
        }
        dispatch(_updateStoryDescription(storyId, value));
      })
      .catch(errorHandler(dispatch));
  };
};
const _updateStoryDescription = createAction(
  'UPDATE_STORY_DESCRIPTION',
  (storyId, value) => ({ storyId, value })
);

export const addActionToMessage = (storyId, targetMessageId, actionPosition) => {
  return (dispatch, getState) => {
    const { messageTriggerActions, meta } = getState();

    const parentMessageId = messageTriggerActions.getIn(['trigger', 'messageId']);
    const action = {
      type: messageTriggerActions.getIn(['trigger', 'type']),
      source: {
        attachment: messageTriggerActions.getIn(['trigger', 'attachmentIdx']),
        action: messageTriggerActions.getIn(['trigger', 'actionIdx']),
        order: actionPosition
      },
      target: {
        messageId: targetMessageId,
        action: messageTriggerActions.getIn(['trigger', 'key'])
      }
    };

    return api.addActionToMessage(meta.botId, storyId, parentMessageId, action)
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          return dispatch(triggerNotification(
            'Error',
            res.data.message,
            'error',
            10000
          ));
        }
        dispatch(stopLoadingMessage(storyId));
        // dispatch(stopLoadingActionAdding?(storyId));
        dispatch(stopAddTrigger());
        dispatch(_updateMessage(storyId, parentMessageId, res.data.data));
        return res.data.data;
      })
      .catch(error => {
        dispatch(stopLoadingMessage(storyId));
        errorHandler(dispatch)(error);
      });
  };
};

export const removeTargetFromAction = (storyId, messageId, attachmentIndex, actionIndex, targetAction, targetMessageId) => {
  return (dispatch, getState) => {
    const state = getState();
    return api.removeTargetFromAction(state.meta.botId, storyId, messageId, actionIndex, attachmentIndex, targetAction, targetMessageId)
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          return dispatch(triggerNotification(
            'Error',
            res.data.message,
            'error',
            10000
          ));
        }

        dispatch(stopLoadingMessage(storyId));
        dispatch(_updateMessage(storyId, messageId, res.data.message));
        return res.data.message;
      })
      .catch(error => {
        dispatch(stopLoadingMessage(storyId));
        errorHandler(dispatch)(error);
      });
  };
};

export const addMessage = (storyId, message, messagesToRender, messagesWithChildren) => {
  return (dispatch, getState) => {
    const state = getState();

    dispatch(startLoadingMessage(storyId));

    const story = state.stories[storyId];

    let isAddingAction = state.messageTriggerActions.get('isAdding');

    const parentId = state.messageTriggerActions.getIn(['trigger', 'messageId']);
    const parent = state.stories[storyId].messages.find(p => p.messageId === parentId);

    let thisMessagesPosition = story.messages.length + 1;
    let thisMessagesActionPosition = 0;

    if (isAddingAction && parent) {
      // const grandParent = parent.parents[0];
      message.name = `${parent.name}.${(parent.children || []).length}`;
      message.customId = `${parent.customId}.${(parent.children || []).length}`;
    } else {
      const messageAndActionPosition = getMessageAndActionPosition(messagesToRender, messagesWithChildren, story.messages, message.bot, dispatch);
      thisMessagesPosition = messageAndActionPosition.messagePosition;
      thisMessagesActionPosition = messageAndActionPosition.actionPosition;
      isAddingAction = messageAndActionPosition.didDispatch;
    }
    delete message.unfurls;
    delete message.children;

    return api.newMessage(state.meta.botId, storyId, message, thisMessagesPosition)
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          return dispatch(triggerNotification(
            'Error',
            res.data.message,
            'error',
            10000
          ));
        }

        const newMessage = res.data.data;

        dispatch(_addMessage(storyId, res.data.data, thisMessagesPosition));
        if (!isAddingAction) {
          dispatch(stopLoadingMessage(storyId));
          dispatch(addToFlow(storyId, res.data.data.messageId, []));
          return res.data.data;
        }
        dispatch(addActionToMessage(storyId, newMessage.messageId, thisMessagesActionPosition))
          .then(res => {
            const prevSiblingId = messagesToRender[messagesToRender.length - 1].messageId;
            const nodeWithOlderNodes = treeSearch(messagesWithChildren, prevSiblingId);
            const olderNodes = nodeWithOlderNodes.olderNodes.map(m => m.messageId).concat(prevSiblingId);
            dispatch(findPathToMessage(storyId, newMessage.messageId, olderNodes));

            return newMessage;
          })
          .catch(error => {
            dispatch(stopLoadingMessage(storyId));
            errorHandler(dispatch)(error);
          });
      })
      .catch(error => {
        dispatch(stopLoadingMessage(storyId));
        errorHandler(dispatch)(error);
      });
  };
};
const _addMessage = createAction(
  'ADD_MESSAGE',
  (storyId, message, thisMessagesPosition) => ({ storyId, message, thisMessagesPosition })
);
export const removeMessage = (storyId, messageId, messageTree) => {
  return (dispatch, getState) => {
    const state = getState();
    const node = treeSearch(messageTree, messageId);
    const idsToDelete = getNodesChildren(node).map(n => n.messageId);

    dispatch(startRemoveMessages(storyId, messageId, idsToDelete));
    return api.deleteMessage(state.meta.botId, storyId, messageId, idsToDelete)
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          return dispatch(triggerNotification(
            'Error',
            res.data.message,
            'error',
            10000
          ));
        }
        const messageIdsToRemove = res.data.data.idsToDelete;
        const parentMessageToUpdate = res.data.data.parentMessage;

        dispatch(removeFromFlow(messageIdsToRemove));
        if (parentMessageToUpdate) dispatch(_updateMessage(storyId, parentMessageToUpdate.messageId, parentMessageToUpdate));
        dispatch(_removeMessages(storyId, messageIdsToRemove));
      })
      .catch(e => {
        dispatch(stopRemoveMessages(storyId, messageId, idsToDelete));
        throw e;
      })
      .catch(errorHandler(dispatch));
  };
};
const startRemoveMessages = createAction(
  'START_REMOVE_MESSAGES',
  (storyId, messageId, messageIds = []) => ({ storyId, messageId, messageIds })
);
const stopRemoveMessages = createAction(
  'STOP_REMOVE_MESSAGES',
  (storyId, messageId, messageIds = []) => ({ storyId, messageId, messageIds })
);
const _removeMessages = createAction(
  'REMOVE_MESSAGES',
  (storyId, messageIds) => ({ storyId, messageIds })
);
export const removeStory = (storyId) => {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(startRemoveStory(storyId));
    return api.deleteBotStory(state.meta.botId, storyId)
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          const err = new Error(res.data.message);
          err.status = res.status;
          return errorHandler(dispatch)(err);
        }
        dispatch(_removeStory(storyId));
      })
      .catch(e => {
        dispatch(stopRemoveStory(storyId));
        throw e;
      })
      .catch(errorHandler(dispatch));
  };
};
const startRemoveStory = createAction('START_REMOVE_STORY', (storyId) => ({ storyId }));
const stopRemoveStory = createAction('STOP_REMOVE_STORY', (storyId) => ({ storyId }));
const _removeStory = createAction(
  'REMOVE_STORY',
  (storyId) => ({storyId})
);
export const renameStory = (storyId, newName, newId) => {
  return (dispatch, getState) => {
    const state = getState();
    const loadingTimeout = setTimeout(() => {
      dispatch(startLoading());
    }, 500);

    return api.renameBotStory(state.meta.botId, storyId, { newId, newName })
      .then(res => {
        window.clearTimeout(loadingTimeout);
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          const err = new Error(res.data.message);
          err.status = res.status;
          return errorHandler(dispatch)(err);
        }
        dispatch(stopLoading());
        dispatch(_renameStory(storyId, newName, newId));
      })
      .catch(errorHandler(dispatch));
  };
};
export const _renameStory = createAction(
  'RENAME_STORY',
  (storyId, newName, newStoryId) => ({ storyId, newName, newStoryId })
);
export const duplicateStory = (storyId) => {
  return (dispatch, getState) => {
    const state = getState();

    const pattern = new RegExp(`^${storyId}-?\\d?$`);
    const newIdNumber = Object.keys(state.stories).reduce((prev, curr) => {
      if (pattern.test(curr)) prev++;
      return prev;
    }, 0);
    const newId = `${storyId}-${newIdNumber}`;
    const newName = `${state.stories[storyId].name} ${newIdNumber}`;

    dispatch(startDuplicatingStory(storyId));
    return api.duplicateBotStory(state.meta.botId, storyId, { newId, newName })
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          const err = new Error(res.data.message);
          err.status = res.status;
          return errorHandler(dispatch)(err);
        }
        dispatch(_duplicateStory(res.data.data));
        dispatch(stopDuplicatingStory(storyId));
        return newId;
      })
      .catch(e => {
        dispatch(stopDuplicatingStory(storyId));
        throw e;
      })
      .catch(errorHandler(dispatch));
  };
};
const startDuplicatingStory = createAction('START_DUPLICATING_STORY', (storyId) => ({ storyId }));
const stopDuplicatingStory = createAction('STOP_DUPLICATING_STORY', (storyId) => ({ storyId }));
export const _duplicateStory = createAction(
  'DUPLICATE_STORY',
  (newStory) => ({ newStory })
);
export const updateMessage = (storyId, messageId, newMessage, messageTree) => {
  return (dispatch, getState) => {
    const state = getState();

    delete newMessage.unfurls;
    delete newMessage.children;

    const newActions = newMessage.actions.reduce((result, action) => {
      if (action._deleted) {
        const node = treeSearch(messageTree, action.target.messageId);
        const idsToDelete = getNodesChildren(node).map(n => n.messageId);

        result.removeIds.push(...idsToDelete);
      } else {
        result.keepActions.push(action);
      }

      return result;
    }, { keepActions: [], removeIds: [] });

    newMessage.actions = newActions.keepActions;

    return api.updateMessage(state.meta.botId, storyId, newMessage.messageId, newMessage, newActions.removeIds)
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          return dispatch(triggerNotification(
            'Error',
            res.data.message,
            'error',
            10000
          ));
        }
        const { message, idsToDelete } = res.data.data;
        dispatch(_finishEditingAndUpdateMessage(storyId, messageId, message, idsToDelete));
      })
      .catch(errorHandler(dispatch));
  };
};
const _updateMessage = createAction(
  'UPDATE_MESSAGE',
  (storyId, messageId, newMessage) => ({ storyId, messageId, newMessage })
);
const _finishEditingAndUpdateMessage = createAction(
  'FINISH_EDITING_AND_UPDATE_MESSAGE',
  (storyId, messageId, newMessage, idsToDelete) => ({ storyId, messageId, newMessage, idsToDelete })
);
export const moveMessage = (storyId, oldPos, newPos) => {
  return (dispatch, getState) => {
    const state = getState();
    const source = {
      index: oldPos,
      messageId: state.stories[storyId].messageList[oldPos]
    };
    const target = {
      index: newPos,
      messageId: state.stories[storyId].messageList[newPos]
    };

    return api.moveMessage(state.meta.botId, storyId, source, target)
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          return dispatch(triggerNotification(
            'Error',
            res.data.message,
            'error',
            10000
          ));
        }
        dispatch(_moveMessage(storyId, oldPos, newPos));
      })
      .catch(errorHandler(dispatch));
  };
};
const _moveMessage = createAction(
  'MOVE_MESSAGE',
  (storyId, oldPos, newPos) => ({ storyId, oldPos, newPos })
);

export const startLoadingMessage = createAction('START_LOADING_MESSAGE');
export const stopLoadingMessage = createAction('STOP_LOADING_MESSAGE');
export const updateCurrentMessage = createAction(
  'UPDATE_CURRENT_MESSAGE',
  (storyId, value) => ({ storyId, value })
);
export const updateMessageTriggerType = createAction(
  'UPDATE_MESSAGE_TRIGGER_TYPE',
  (storyId, value) => ({ storyId, value })
);
export const changeEditMessageTriggerType = createAction(
  'CHANGE_EDIT_MESSAGE_TRIGGER_TYPE',
  (storyId, value) => ({ storyId, value })
);
export const updateCurrentEditMessage = createAction(
  'UPDATE_CURRENT_EDIT_MESSAGE',
  (storyId, value) => ({ storyId, value })
);
export const updateCurrentEditMessageUser = createAction(
  'UPDATE_CURRENT_EDIT_MESSAGE_USER',
  (storyId, value) => ({ storyId, value })
);
export const changeEditMessage = createAction(
  'CHANGE_EDIT_MESSAGE',
  (storyId) => ({ storyId })
);
export const editMessage = createAction(
  'EDIT_MESSAGE',
  (storyId, messageId) => ({ storyId, messageId })
);
export const cancelEditMessage = createAction(
  'CANCEL_EDIT_MESSAGE',
  (storyId) => ({ storyId })
);
export const resetCurrentMessage = createAction(
  'RESET_CURRENT_MESSAGE',
  (storyId) => ({ storyId })
);

export const DEFAULT_STORY = {
  name: '',
  messages: [],
  messageCount: 0,
  currentMessage: '',
  messageReactions: [],
  messageTriggerType: '',
  editingMessageValue: '',
  editingMessageId: null,
  description: '',
  // currentFrame: -1,
  loading: false,
  currentMessageId: '',
  lastEditedMessage: 0,
  duplicationInProgress: false,
  deletionInProgress: false
};

const _startLoadingStories = createAction('START_LOADING_STORIES', (storyId) => ({ storyId }));
const _stopLoadingStories = createAction('STOP_LOADING_STORIES', (storyId) => ({ storyId }));

export default handleActions({
  START_LOADING_STORIES: (state, { payload: { storyId } }) => Imm.fromJS(state).setIn([storyId, 'storyLoading'], true).toJS(),
  STOP_LOADING_STORIES: (state, { payload: { storyId } }) => Imm.fromJS(state).setIn([storyId, 'storyLoading'], false).toJS(),
  LOAD_STORIES: (state, { payload }) => {
    return Imm.fromJS(state).merge(payload).toJS();
  },
  GET_STORY: (state, { payload: { storyId, story } }) => {
    return Imm.fromJS(state).set(storyId, story).toJS();
  },
  ADD_STORY: (state, { payload: { name, storyId } }) => {
    const newStory = Imm.fromJS(DEFAULT_STORY).set('name', name);
    return Imm.fromJS(state)
      .set(storyId, newStory)
      .toJS();
  },
  UPDATE_STORY_DESCRIPTION: (state, { payload: { storyId, value } }) => {
    return Imm.fromJS(state)
      .setIn([storyId, 'description'], value)
      .toJS();
  },
  CHANGE_EDIT_MESSAGE: (state, { payload: { storyId } }) => {
    return Imm.fromJS(state)
      .setIn([storyId, 'editingMessageChanged'], true)
      .toJS();
  },
  EDIT_MESSAGE: (state, { payload: { storyId, messageId } }) => {
    return Imm.fromJS(state)
      .updateIn([storyId, 'editingMessageId'], () => messageId)
      .updateIn([storyId, 'editingMessageChanged'], () => false)
      .update(storyId, story => {
        const message = story.get('messages').find(m => m.get('messageId') === messageId);
        if (!message.get('bot')) {
          story = story.set('messageTriggerType', story.get('triggerType'));
        }
        return story.update('editingMessageValue', () => {
          return message.getIn(['slack', 'text']);
        }).update('editingMessageUser', () => {
          return message.get('user');
        });
      })
      .toJS();
  },
  UPDATE_CURRENT_EDIT_MESSAGE: (state, { payload: { storyId, value } }) => {
    return Imm.fromJS(state)
      .updateIn([storyId, 'editingMessageValue'], () => value)
      .updateIn([storyId, 'editingMessageChanged'], () => true)
      .toJS();
  },
  UPDATE_CURRENT_EDIT_MESSAGE_USER: (state, { payload: { storyId, value } }) => {
    return Imm.fromJS(state)
      .updateIn([storyId, 'editingMessageUser'], () => value)
      .updateIn([storyId, 'editingMessageChanged'], () => true)
      .toJS();
  },
  CANCEL_EDIT_MESSAGE: (state, { payload: { storyId } }) => {
    return Imm.fromJS(state)
      .update(storyId, story => {
        if (!story) return;
        return story
          .deleteIn(['messages', story.get('editingMessageId'), 'editing'])
          .set('editingMessageId', null)
          .set('editingMessageUser', null)
          .set('editingMessageValue', '')
          .set('messageTriggerType', '')
          .set('editingMessageChanged', false);
      })
      .toJS();
  },
  REMOVE_STORY: (state, { payload }) => {
    return Imm.fromJS(state)
      .delete(payload.storyId)
      .toJS();
  },
  START_REMOVE_STORY: (state, { payload: { storyId } }) =>
    Imm.fromJS(state)
      .setIn([storyId, 'deletionInProgress'], true)
      .toJS(),
  STOP_REMOVE_STORY: (state, { payload: { storyId } }) =>
    Imm.fromJS(state)
      .setIn([storyId, 'deletionInProgress'], false)
      .toJS(),
  ADD_MESSAGE: (state, { payload: { storyId, message, thisMessagesPosition } }) => {
    return Imm.fromJS(state)
      .updateIn([storyId, 'messageCount'], messageCount => messageCount + 1)
      .updateIn([storyId, 'messages'], messages => messages.insert(thisMessagesPosition, message))
      .toJS();
  },
  UPDATE_MESSAGE: (state, { payload: { storyId, messageId, newMessage } }) => {
    return Imm.fromJS(state)
      .updateIn([storyId, 'messages'], messages => messages.map(m => {
        if (m.get('messageId') !== messageId) return m;
        newMessage = Imm.fromJS(newMessage).delete('children');
        return newMessage;
      }))
      .toJS();
  },
  FINISH_EDITING_AND_UPDATE_MESSAGE: (state, { payload: { storyId, messageId, newMessage, idsToDelete } }) => {
    return Imm.fromJS(state)
      .updateIn([storyId, 'messages'], messages => messages.map(m => {
        if (m.get('messageId') !== messageId) return m;
        newMessage = Imm.fromJS(newMessage).delete('children');
        return newMessage;
      }))
      .updateIn([storyId, 'messages'], messages =>
        messages.filter(m => idsToDelete.indexOf(m.get('messageId')) === -1))
      .updateIn([storyId, 'messageCount'], messageCount => messageCount - idsToDelete.length)
      .updateIn([storyId, 'editingMessageId'], () => null)
      .updateIn([storyId, 'editingMessageValue'], () => '')
      .updateIn([storyId, 'messageTriggerType'], () => '')
      .updateIn([storyId, 'editingMessageChanged'], () => false)
      .toJS();
  },
  UPDATE_MESSAGE_TRIGGER_TYPE: (state, { payload: { storyId, value } }) => {
    return Imm.fromJS(state)
      .setIn([storyId, 'messageTriggerType'], value)
      .updateIn([storyId, 'editingMessageChanged'], () => true)
      .toJS();
  },
  START_DUPLICATING_STORY: (state, { payload: { storyId } }) =>
    Imm.fromJS(state)
      .setIn([storyId, 'duplicationInProgress'], true)
      .toJS(),
  STOP_DUPLICATING_STORY: (state, { payload: { storyId } }) =>
    Imm.fromJS(state)
      .setIn([storyId, 'duplicationInProgress'], false)
      .toJS(),
  DUPLICATE_STORY: (state, { payload: { newStory } }) =>
    Imm.fromJS(state)
      .merge(newStory)
      .toJS(),
  RENAME_STORY: (state, { payload: { storyId, newName, newStoryId } }) => {
    const newState = Imm.fromJS(state);
    return newState
      .set(newStoryId, newState.get(storyId).set('name', newName))
      .delete(storyId)
      .toJS();
  },
  START_REMOVE_MESSAGES: (state, { payload: { storyId, messageId, messageIds } }) => {
    return Imm.fromJS(state)
      .updateIn([storyId, 'messages'], messages => {
        return messages.map(message => {
          const thisId = message.get('messageId');
          if (thisId !== messageId && messageIds.indexOf(thisId) === -1) return message;
          return message.set('deletionInProgress', true);
        });
      })
      .toJS();
  },
  STOP_REMOVE_MESSAGES: (state, { payload: { storyId, messageId, messageIds } }) =>
    Imm.fromJS(state)
      .updateIn([storyId, 'messages'], messages =>
        messages.map(message => {
          const thisId = message.get('messageId');
          if (thisId !== messageId && messageIds.indexOf(thisId) === -1) return message;
          return message.set('deletionInProgress', false);
        }))
      .toJS(),
  REMOVE_MESSAGES: (state, { payload: { messageIds, storyId } }) => {
    state = Imm.fromJS(state);

    // Find and remove the messages
    state = state
      .updateIn([storyId, 'messages'], messages => messages.filter(m => messageIds.indexOf(m.get('messageId')) === -1))
      .updateIn([storyId, 'messageCount'], messageCount => messageCount - messageIds.length);

    // Find references to the message, and remove them
    state = state.updateIn([storyId, 'messages'], messages => {
      return messages.map(message => {
        if (message.get('actions', Imm.List()).size === 0) return message;
        return message.update('actions', actions => {
          return actions.filter(action => {
            return messageIds.indexOf(action.getIn(['target', 'messageId'])) === -1;
          });
        });
      });
    });

    return state.toJS();
  },
  UPDATE_CURRENT_MESSAGE: (state, { payload: { storyId, value } }) => {
    return Imm.fromJS(state)
      .setIn([storyId, 'currentMessage'], value)
      .toJS();
  },
  RESET_CURRENT_MESSAGE: (state, { payload: { storyId } }) => {
    return Imm.fromJS(state)
      .setIn([storyId, 'currentMessage'], '')
      .setIn([storyId, 'messageTriggerType'], null)
      .toJS();
  },
  MOVE_MESSAGE: (state, { payload: { storyId, oldPos, newPos } }) => {
    state = Imm.fromJS(state);

    const source = state.getIn([storyId, 'messages', oldPos]);
    const target = state.getIn([storyId, 'messages', newPos]);

    return state
      .setIn([storyId, 'messages', newPos], source)
      .setIn([storyId, 'messages', oldPos], target)
      .setIn([storyId, 'messageList', newPos], source.get('messageId'))
      .setIn([storyId, 'messageList', oldPos], target.get('messageId'))
      .toJS();
  },
  START_LOADING_MESSAGE: (state, { payload: storyId }) => {
    return Imm.fromJS(state)
      .setIn([storyId, 'loading'], true)
      .toJS();
  },
  STOP_LOADING_MESSAGE: (state, { payload: storyId }) => {
    return Imm.fromJS(state)
      .setIn([storyId, 'loading'], false)
      .toJS();
  }
}, {});
