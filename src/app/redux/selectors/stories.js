import Imm from 'immutable';
import { createSelector } from 'reselect';
import { treeSearch, getMessageAndActionPosition } from '../../utils/message-relations';

import Moment from 'moment';

const storySelector = (state, props) => {
  const story = state.stories[props.params.storyId];
  if (!story) return;
  return Imm.fromJS(story).toJS();
};
const getFlow = state => state.flow.get('flow');
const getPath = state => state.flow.get('path');
const getAttachments = state => Imm.fromJS(state.attachments);
const getDialog = state => state.dialog;  // Already Immutable
const getBuilder = state => Imm.fromJS(state.builder);
const getMessageSettings = state => Imm.fromJS(state.messageSettings);
const getMessageReactions = state => Imm.fromJS(state.messageReactions);
const getMessageTriggerActions = state => state.messageTriggerActions;
const getChatContext = state => Imm.fromJS(state.chatContext);

export const getStory = createSelector(storySelector, story => story);

export const getMessages = createSelector(
  storySelector,
  story => {
    if (!story) return [];
    return Imm.fromJS(story.messages, story.messageList).toJS();
  }
);

export const getTemporaryMessage = createSelector(
  [
    getStory,
    getBuilder,
    getDialog,
    getAttachments,
    getMessageSettings,
    getMessageReactions,
    getMessageTriggerActions,
    getChatContext
  ],
  (story, builder, dialog, attachments, messageSettings, messageReactions, messageTriggerActions, chatContext) => {
    if (!story) return;
    const isEditing = !!story.editingMessageId;
    const isCreatingDialog = builder.get('isDialog');
    const isCreating = attachments.size || isEditing || story.currentMessage;
    if (!isCreating && !isCreatingDialog) return;

    const triggerKey = messageTriggerActions.getIn(['trigger', 'key']);
    const parent = story.messages.find(m => m.messageId === messageTriggerActions.getIn(['trigger', 'messageId']));

    if (isEditing) {
      const editingMessage = story.messages.find(m => m.messageId === story.editingMessageId);
      if (!editingMessage) return;
      const message = Imm.fromJS(editingMessage)
        .update('slack', slack => {
          if (isCreatingDialog) return dialog.toJS();
          return slack
            .set('attachments', attachments.toJS())
            .set('reactions', messageReactions.toJS())
            .set('ephemeral', messageSettings.ephemeral);
        })
        .set('editing', true).toJS();
      return message;
    }
    const isBot = chatContext.get('chatContext') === 'bot';
    if (isCreatingDialog) {
      return Imm.Map({
        bot: true,
        user: chatContext.get('currentUserIdx'),
        creating: true,
        parentName: parent && parent.name,
        messageId: 'temporary-message',
        slack: dialog.toJS(),
        actions: [],
        type: 'dialog'
      }).toJS();
    }
    return Imm.Map({
      bot: isBot,
      user: !isBot && chatContext.get('currentUserIdx'),
      creating: true,
      isCopy: triggerKey === 'replace',
      parentName: parent && parent.name,
      messageId: 'temporary-message',
      slack: {
        text: story.currentMessage ? story.currentMessage.trim() : '',
        time: Moment().format('h:mm A'),
        attachments: attachments.toJS(),
        reactions: messageReactions.toJS(),
        ephemeral: messageSettings.ephemeral
      },
      actions: []
    }).toJS();
  }
);

export const getMessageMap = createSelector(
  getStory,
  story => {
    if (!story) return {};

    return story.messages.reduce((map, message) => {
      map[message.messageId] = message;
      return map;
    }, {});
  }
);

export const getMessageFlow = createSelector(
  [getMessageMap, getFlow, getPath, getStory],
  (messageMap, flow, path, story) => {
    if (!story) return [];

    let messagesInList = [];

    const messagesToRender = path.reduce((result, messageId) => {
      const isDeleteMessage = messageId.indexOf('delete.') === 0;
      const message = story.messages.find(message => message.messageId === messageId);
      if (!message) return result;
      const entries = isDeleteMessage
        ? null
        : flow.get(message.messageId);

      // Not first message, not in the flow yet so we discard it
      if (!entries) return result;
      // It's the first message and it should be replaced because it's in the flow
      // meaning a child should be shown instead

      // Get the messageIds we want to push in effect of the flow
      // so we can push them after the parent to retain order
      const messagesToPush = entries.map(entry => {
        const { messageId, action } = entry.get('target').toJS();

        // Set _replaced or _deleted property on the parent
        // so they won't get rendered but will still be in the path
        if (action === 'replace') message._replaced = true;
        if (action === 'delete') message._deleted = true;
        return messageId;
      });

      const messageAlreadyInList = messagesInList.indexOf(message.messageId) !== -1;
      if (!messageAlreadyInList) {
        result.push(message);
        messagesInList.push(message.messageId);
      }

      if (message._deleted) {
        const deleteItemIndex = path.findIndex(item => item.indexOf(`delete.${message.messageId}`) === 0);
        if (deleteItemIndex >= 0) {
          const deleteMessage = path.get(deleteItemIndex);
          messagesToPush.splice(deleteItemIndex, 0, deleteMessage);
        }
      }

      messagesToPush.forEach(mId => {
        const messageAlreadyInList = messagesInList.indexOf(mId) !== -1;
        const child = messageMap[mId];
        if (mId.indexOf('delete.') === 0) {
          result.push({ messageId: mId, _deleted: true });
          messagesInList.push(mId);
        }
        if (!child) return;

        const isInPath = path.find(pathMessageId => mId === pathMessageId);
        if (!messageAlreadyInList && isInPath) {
          result.push(child);
          messagesInList.push(child.messageId);
        }
      });

      return result;
    }, []);

    return Imm.fromJS(messagesToRender).toJS();
  }
);

export const getMessagesWithChildren = createSelector(
  [storySelector, getTemporaryMessage, getMessageFlow, getMessageTriggerActions],
  (story, temporaryMessage, messageFlow, messageTriggerActions) => {
    if (!story || !story.messages) {
      if (temporaryMessage) return { tree: [ temporaryMessage ] };
      return { tree: [] };
    }
    let idToMsg = Imm.Map();
    story.messages.forEach(message => {
      if (!message) return;

      message.isActionable = message.actions.filter(a => a.type !== 'click').length > 0;
      idToMsg = idToMsg.set(message.messageId, Imm.fromJS(message));
    });
    let messages = Imm.fromJS(story.messages);
    if (!messages.size) {
      if (temporaryMessage) return { tree: [ temporaryMessage ] };
      return { tree: [] };
    }
    if (temporaryMessage) {
      messages = messages.map(m => {
        if (m.get('messageId') === story.editingMessageId) {
          return Imm.fromJS(temporaryMessage).set('isActionable', m.get('isActionable'));
        }
        return m;
      });
    }

    const tree = buildTree(messages).toJS();

    function buildNode (thisMessage) {
      return thisMessage
        .update(
          'actions',
          Imm.List(),
          actions => {
            return actions.map(action => {
              let data = idToMsg.get(action.getIn(['target', 'messageId']));
              if (action.getIn(['target', 'action']) === 'delete') return action;
              if (!data) return action;
              return action.setIn(['target', 'data'], buildNode(data));
            })
            .reduce((actionsMap, action) => {
              const id = `${action.getIn(['source', 'attachment'])}-${action.getIn(['source', 'action'])}`;
              if (!actionsMap.get(id)) {
                return actionsMap
                  .set(id, action)
                  .setIn([id, 'targets'], Imm.List().push(action.get('target')))
                  .deleteIn([id, 'target']);
              }
              return actionsMap.updateIn([id, 'targets'], targets => targets.push(action.get('target')));
            }, Imm.Map())
            .reduce((triggers, action) => {
              return triggers.push(action);
            }, Imm.List());
          }
        );
    }

    function buildTree (messages) {
      const referencedNodes = messages.reduce((refList, message) => {
        if (!message.get('actions')) return refList;
        return refList.concat(message.get('actions').map(a => a.getIn(['target', 'messageId'])).filter(id => !!id));
      }, Imm.List());
      const rootNodes = messages.filter(message => referencedNodes.indexOf(message.get('messageId')) === -1);
      return rootNodes.map(buildNode);
    }

    function addOlderNodes (node, parent) {
      const siblings = getSiblings(node, parent);
      const olderSiblings = getOlderSiblings(node, siblings);
      const prevNode = olderSiblings.length ? olderSiblings.pop() : parent;
      const olderNodes = getOlderNodes(prevNode, parent);

      if (parent && node.action === 'delete') {
        node.olderNodes = olderNodes;
        node.parent = parent.data || parent;
        return;
      }

      if (parent) {
        if (!node.data) {
          // This node was probably deleted previously, remove it from the parents targets
          // NOTE: This shouldn't happen, but it does apparently.
          parent.data.actions = parent.data.actions.map(action => {
            action.targets = action.targets.filter(target => target.messageId !== node.messageId)
            return action;
          });
          return;
        }
        node.data.olderNodes = olderNodes;
        node.data.parent = parent.data || parent;
      } else {
        node.olderNodes = olderNodes;
      }

      const actions = node.data ? node.data.actions : node.actions;

      (actions || []).forEach(action => {
        action.targets.forEach(target => addOlderNodes(target, node));
      });

      function getSiblings (node, parent) {
        if (!parent) return tree;

        const siblings = [];
        const actions = parent.data ? parent.data.actions : parent.actions;

        const myAction = actions.find(a => {
          return a.targets.find(t => t.messageId === node.messageId);
        });
        actions.forEach(action => {
          if (myAction && myAction.type === 'click') {
            const isSameAction = myAction.source.action === action.source.action;
            const isSameAttachment = myAction.source.attachment === action.source.attachment;
            if (!isSameAttachment) return;
            if (isSameAttachment && !isSameAction) return;
          }
          action.targets.forEach(target => siblings.push(target.data || target));
        });
        return siblings;
      }

      function getOlderSiblings (node, siblings) {
        const olderSiblings = [];
        for (var i = 0; i < siblings.length; i++) {
          if (siblings[i] === node || siblings[i] === node.data) break;
          olderSiblings.push(siblings[i]);
        }
        return olderSiblings;
      }

      function getOlderNodes (prevNode) {
        if (!prevNode) return [];

        const prevOlderNodes = prevNode.data ? prevNode.data.olderNodes : prevNode.olderNodes;
        return [].concat(prevOlderNodes, prevNode);
      }
    }

    tree.forEach(topNode => addOlderNodes(topNode));
    if (!temporaryMessage) return { tree, tempMessagePosition: {} };

    const position = getMessageAndActionPosition(messageFlow, tree, story.messages, temporaryMessage.bot);
    const isAddingTrigger = messageTriggerActions.get('isAdding');
    const parentNode = isAddingTrigger ? treeSearch(tree, messageTriggerActions.getIn(['trigger', 'messageId'])) : treeSearch(tree, position.parentId);

    if (parentNode && temporaryMessage.creating) {
      const newTarget = {
        action: temporaryMessage.bot ? 'new-msg' : 'new-user-input',
        messageId: 'creating-message',
        data: temporaryMessage
      };
      if (messageTriggerActions.get('isAdding') && messageTriggerActions.getIn(['trigger', 'type']) === 'click') {
        const attachmentIdx = messageTriggerActions.getIn(['trigger', 'attachmentIdx']);
        const actionIdx = messageTriggerActions.getIn(['trigger', 'actionIdx']);
        const actionSiblings = parentNode.actions && parentNode.actions.find(actions => actions.source.attachment === attachmentIdx && actions.source.action === actionIdx);
        const attachmentHasActions = actionSiblings && actionSiblings.targets.length;

        if (attachmentHasActions) {
          actionSiblings.targets.splice(0, 0, newTarget);
        } else {
          parentNode.isActionable = true;
          parentNode.actions = parentNode.actions || [];
          parentNode.actions.push({
            source: {
              attachment: attachmentIdx,
              action: actionIdx
            },
            targets: [ newTarget ],
            type: 'click'
          });
        }
      } else {
        if (parentNode.actions.length) {
          parentNode.actions[position._actionsPosition].targets.splice(position.actionPosition, 0, newTarget);
        } else {
          parentNode.isActionable = true;
          parentNode.actions = [{
            source: {},
            targets: [ newTarget ],
            type: 'message'
          }];
        }
      }
    } else if (parentNode && temporaryMessage.editing) {
      const thisAction = parentNode.actions[position._actionsPosition];
      if (thisAction) {
        const node = thisAction.targets[position.actionPosition - 1].data;
        if (node) {
          node.editing = true;
        }
      }
    } else if (!temporaryMessage.editing) {
      tree.splice(position.messagePosition, 0, temporaryMessage);
    }
    return { tree, tempMessagePosition: position };
  }
);

export const getCurrentPath = createSelector(
  getMessageFlow,
  messages => messages.map(m => m.messageId)
);
