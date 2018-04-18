export function treeSearch (tree, messageId) {
  function nodeSearch (node) {
    if (node.messageId === messageId) return node;
    if (!node.actions || !node.actions.length) return;

    for (var i = node.actions.length - 1; i >= 0; i--) {
      const action = node.actions[i];
      for (var j = action.targets.length - 1; j >= 0; j--) {
        const target = action.targets[j];
        const data = target.data || target;
        const foundNode = nodeSearch(data);
        if (foundNode) return foundNode;
      }
    }
  }

  for (var i = tree.length - 1; i >= 0; i--) {
    const rootNode = tree[i];
    const foundNode = nodeSearch(rootNode);
    if (foundNode) return foundNode;
  }
}

export const getNodesChildren = (node) => {
  const nodes = [node];
  getAllNodes(node);
  return nodes;

  function getAllNodes (node) {
    if (node.action === 'delete') return;
    node.actions.forEach(action => {
      action.targets.forEach(target => {
        if (target.action === 'delete') return;
        nodes.push(target.data);
        getAllNodes(target.data);
      });
    });
  }
};

export const getNodesChildrenForAction = (node, actionIndex, attachmentIndex) => {
  const nodes = [];
  const actions = node.actions.filter(action => {
    return action.source.action === actionIndex &&
           action.source.attachment === attachmentIndex;
  });
  getNodesForAction(actions);
  return nodes;

  function getNodesForAction (actions) {
    actions.forEach(action => {
      action.targets.forEach(target => {
        if (target.action === 'delete') return;
        nodes.push(target.data);
        getNodesForAction(target.data.actions);
      });
    });
  }
};

export const getMessageAndActionPosition = (messagesToRender, messageTree, allMessages, isBot, dispatch) => {
  const result = {
    parentId: null,
    messagePosition: 0,
    actionPosition: 0,
    _actionsPosition: 0,
    didDispatch: false
  };
  messagesToRender = [].concat(messagesToRender);
  const lastMessage = messagesToRender[messagesToRender.length - 1];
  if (!lastMessage) return result;

  const contextMessageId = lastMessage.messageId;
  if (!contextMessageId) return result;

  const positionInTree = messageTree.findIndex(cm => cm.messageId === contextMessageId);
  result.messagePosition = positionInTree !== -1 ? positionInTree + 1 : messageTree.length;

  const contextMessage = treeSearch(messageTree, contextMessageId);

  if (!contextMessage.parent) return result;
  result.parentId = contextMessage.parent.messageId;
  const contextMessagesActionIndex = contextMessage.parent.actions.findIndex(a => {
    return a.targets.find(t => t.messageId === contextMessageId);
  });
  const contextMessagesAction = contextMessage.parent.actions[contextMessagesActionIndex];
  result._actionsPosition = contextMessagesActionIndex;
  const contextMessagesTargetIndex = contextMessagesAction.targets.findIndex(target => target.messageId === contextMessageId);
  result.actionPosition = contextMessagesTargetIndex + 1;
  const key = isBot ? 'new-msg' : 'new-user-input';
  if (!dispatch) return result;
  if (contextMessagesAction.type === 'click') {
    dispatch({
      type: 'START_ADD_MESSAGE_TRIGGER',
      payload: {
        key,
        type: 'click',
        messageId: contextMessage.parent.messageId,
        attachmentIdx: contextMessagesAction.source.attachment,
        actionIdx: contextMessagesAction.source.action
      }
    });
    result.didDispatch = true;
  } else {
    dispatch({
      type: 'START_ADD_MESSAGE_TRIGGER',
      payload: {
        key,
        type: 'message',
        messageId: contextMessage.parent.messageId
      }
    });
    result.didDispatch = true;
  }
  return result;
};
