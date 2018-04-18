'use strict';
import '../../stylesheets/sidebar.scss';

import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import {
  actionToHuman,
  duplicatingToHuman,
  messageActionToHuman
} from '../utils/machine-to-human-maps';

const SideBarMessageListEmpty = () => (
  <div className='sidebar__list sidebar__list--empty' />
);

class SideBarMessageList extends React.PureComponent {
  constructor (props) {
    super(props);

    this.renderMessage = this.renderMessage.bind(this);
    this.generateText = this.generateText.bind(this);
    this.renderAttachmentButtons = this.renderAttachmentButtons.bind(this);
  }

  render () {
    const { messages } = this.props;
    if (!messages.length) return <SideBarMessageListEmpty />;
    return (
      <div className='sidebar__list'>
        {messages.map(n => this.renderMessage(n))}
      </div>
    );
  }

  renderMessage (node, nodeType, parentNode) {
    const { currentPath, onClick, showActionMenu, removeMessageHandler, removeTargetFromAction, allowModifications } = this.props;
    const isInCurrentPath = node && currentPath.indexOf(node.messageId) !== -1;
    const isEphemeral = node.creating || node.editing;
    const nodeOnClick = (e) => {
      if (isEphemeral) return;
      const olderNodes = node.olderNodes && node.olderNodes.map(n => n.messageId);
      if (!olderNodes) return;
      onClick(node.messageId, olderNodes);
    };
    const removeNode = () => {
      if (!allowModifications) return;
      removeMessageHandler(node.messageId);
    };

    const removeDeleteAction = e => {
      const correspondingAction = parentNode.actions.find(action => action.targets.find(target => target.messageId === node.messageId));
      const attachmentIndex = correspondingAction.source.attachment;
      const actionIndex = correspondingAction.source.action;
      const targetAction = node.action;
      const targetMessageId = node.messageId;

      removeTargetFromAction(parentNode.messageId, attachmentIndex, actionIndex, targetAction, targetMessageId);
    };
    const addTrigger = () => {
      const olderNodes = node.olderNodes && node.olderNodes.map(n => n.messageId);
      if (!olderNodes) return;
      showActionMenu(node.messageId, olderNodes);
    };

    if (node.isActionable) {
      const nodesFromTargets = node.actions.filter(a => a.type === 'message').map((action, idx) => {
        return action.targets.map((target, idx) => {
          return this.renderMessage(target.data, target.action, node);
        });
      });

      return (
        <div
          key={node.messageId}
          data-id={node.messageId}
          className={classNames('sidebar__trigger', {
            'sidebar__trigger--in-current-path': isInCurrentPath,
            'sidebar__trigger--ephemeral': isEphemeral
          })}
          >
          <div className='sidebar__trigger-header'>
            <div className='sidebar__trigger-add' onClick={addTrigger}>
              {this.generateAvatar(node)}
            </div>
            <div className='sidebar__trigger-title' onClick={nodeOnClick}>
              {this.generateText(node, nodeType)}
            </div>
            <div className='sidebar__delete-action icon-cross' onClick={removeNode} />
          </div>
          <div className='sidebar__actions'>
            {this.renderAttachmentButtons(node)}
            {/*
              Flatten array because it comes out like [[<div>...</div>]]
            */}
            {[].concat(...nodesFromTargets)}
          </div>
        </div>
      );
    }

    if (node.action === 'delete') {
      return (
        <div
          key={node.messageId}
          data-id={node.messageId}
          className={classNames('sidebar__trigger', {
            'sidebar__trigger--in-current-path': isInCurrentPath,
            'sidebar__trigger--ephemeral': isEphemeral
          })}
        >
          <div className='sidebar__trigger-header sidebar__trigger-delete'>
            <span className='sidebar__trigger-delete-icon icon-trash-full' />
            <div className='sidebar__trigger-title' onClick={nodeOnClick}>
              {this.generateText(node, nodeType, parentNode)}
            </div>
            <div className='sidebar__delete-action icon-cross' onClick={removeDeleteAction} />
          </div>
        </div>
      );
    }

    return (
      <div
        key={node.messageId}
        data-id={node.messageId}
        className={classNames('sidebar__trigger', {
          'sidebar__trigger--in-current-path': isInCurrentPath,
          'sidebar__trigger--ephemeral': isEphemeral
        })}
        >
        <div className='sidebar__trigger-header'>
          <div className='sidebar__trigger-add' onClick={addTrigger}>
            {this.generateAvatar(node)}
          </div>
          <div className='sidebar__trigger-title' onClick={nodeOnClick}>
            {this.generateText(node, nodeType)}
          </div>
          <div className='sidebar__delete-action icon-cross' onClick={removeNode} />
        </div>
        {this.renderAttachmentButtons(node)}
      </div>
    );
  }

  renderAttachmentButtons (node) {
    if (node.type === 'dialog') {
      const addTrigger = () => {
        const olderNodes = node.olderNodes && node.olderNodes.map(n => n.messageId);
        if (!olderNodes) return;
        this.props.showActionMenu(node.messageId, olderNodes, null, null, true);
      };
      const isInCurrentPath = node.actions && node.actions[0] && node.actions[0].targets.find(target => this.props.currentPath.indexOf(target.messageId) !== -1);
      return (
        <div className='sidebar__actions-wrap'>
          <div
            className={classNames('sidebar__trigger', {
              'sidebar__trigger--in-current-path': isInCurrentPath
            })}
            >
            <div className='sidebar__trigger-header'>
              <div className='sidebar__trigger-add' onClick={addTrigger} />
              <div className='sidebar__trigger-title sidebar__trigger-title--non-action'>
                User clicks "Submit"
              </div>
            </div>
          </div>
          {node.actions && node.actions[0] && (
            <div className='sidebar__actions'>
              {node.actions[0].targets.map(target => {
                return this.renderMessage(target.data || target, target.action, node);
              })}
            </div>
          )}
        </div>
      );
    }

    return node.slack.attachments && node.slack.attachments.map((attachment, attachmentIdx) => {
      if (!attachment.actions.length) return;
      return (
        <div className='sidebar__actions-wrap' key={`${node.messageId}-attachment-${attachmentIdx}`}>
          {attachment.actions.map((action, actionIdx) => {
            const thisAction = node.actions.find(action => action.source.attachment === attachmentIdx && action.source.action === actionIdx);
            const addTrigger = () => {
              const olderNodes = node.olderNodes && node.olderNodes.map(n => n.messageId);
              if (!olderNodes) return;
              this.props.showActionMenu(node.messageId, olderNodes, attachmentIdx, actionIdx);
            };

            const isInCurrentPath = thisAction && thisAction.targets.find(target => this.props.currentPath.indexOf(target.messageId) !== -1);

            return (
              <div
                key={`${node.messageId}-attachment-${attachmentIdx}-action-${actionIdx}`}
                className={classNames('sidebar__trigger', {
                  'sidebar__trigger--in-current-path': isInCurrentPath
                })}
                >
                <div className='sidebar__trigger-header'>
                  <div className='sidebar__trigger-add' onClick={addTrigger} />
                  <div className='sidebar__trigger-title sidebar__trigger-title--non-action'>
                    User clicks "{action.text}"
                  </div>
                </div>
                <div className='sidebar__actions'>
                  {thisAction && (
                    thisAction.targets.map(target => {
                      return this.renderMessage(target.data || target, target.action, node);
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  }

  generateAvatar (node) {
    const { bot, users } = this.props;
    const user = users[node.user] || users[0];
    const avatarUrl = node.bot ? bot.url : user.url;
    const Avatar = (
      <span
        className='sidebar__trigger-title-avatar'
        style={{
          backgroundImage: `url(${avatarUrl})`
        }}
        />
    );

    return Avatar;
  }

  generateTitle (node, nodeType, parentNode) {
    if (nodeType === 'delete') return this.generateTitle(parentNode);
    if (!node.bot || node.slack.text) return node.slack.text;
    if (node.type === 'dialog') return node.slack.title;

    const firstAttachmentWithTitle = node.slack.attachments.find(a => !!a.title);
    if (firstAttachmentWithTitle) return firstAttachmentWithTitle.title;

    return node.name;
  }

  generateText (node, nodeType, parentNode) {
    const generateElement = (text) => (
      <span className='sidebar__trigger-title-value'>
        {nodeType === 'replace' && 'Replace with '}
        {nodeType === 'delete' && 'Delete '}
        {node.type === 'dialog' && 'Open dialog '}
        "{text}"
      </span>
    );
    const text = this.generateTitle(node, nodeType, parentNode);
    return generateElement(text);
  }
}

class SideBar extends React.Component {
  constructor (props) {
    super(props);

    this.showActionMenu = this.showActionMenu.bind(this);
    this.cancelActionMenu = this.cancelActionMenu.bind(this);
    this.addTrigger = this.addTrigger.bind(this);

    this.state = {
      showActionMenu: false,
      actionMenu: {
        messageId: undefined,
        attachmentIdx: undefined,
        actionIdx: undefined,
        isAddingTriggerToMessage: undefined,
        isDialog: undefined,
        actionsOnMessage: [],
        actionsOnButton: []
      }
    };
  }

  render () {
    const {
      bot,
      users,
      meta,
      story,
      messagesWithChildren,
      messageMap,
      currentPath,
      onClick,
      removeMessageHandler,
      removeTargetFromAction,
      allowModifications,
      isDuplicating,
      isDepthFirst,
      toggleDepthFirst
    } = this.props;
    const {
      actionMenu: {
        isAddingTriggerToMessage,
        actionsOnButton,
        isDialog
      }
    } = this.state;

    let text = 'Submit';
    const message = messageMap[this.state.actionMenu.messageId];
    if (message && !isAddingTriggerToMessage && !isDialog) {
      const slackAttachment = message.slack.attachments[this.state.actionMenu.attachmentIdx];
      const slackAction = slackAttachment.actions[this.state.actionMenu.actionIdx];
      text = slackAction.text;
    }

    let actions = actionToHuman;
    if (isAddingTriggerToMessage) {
      actions = messageActionToHuman;
    }
    if (isDuplicating) {
      actions = duplicatingToHuman;
    }

    const isMessageDeletedOrReplaced = actionsOnButton.find(key => key === 'delete' || key === 'replace');
    let availableKeys = Object.keys(actions)
      .filter(key => {
        // Delete and Replace are only allowed to be used once, and only one of them
        const isDeleteOrReplace = key === 'replace' || key === 'delete';
        if (isDeleteOrReplace) return !isMessageDeletedOrReplaced;

        return true;
      });
    if (isDialog) {
      availableKeys = ['new-user-input', 'import-json'];
    } else if (isDuplicating) {
      availableKeys = ['replace', 'new-user-input'];
      if (isAddingTriggerToMessage) {
        availableKeys = ['new-user-input'];
      }
    }

    return (
      <div className='sidebar'>
        {this.state.showActionMenu && (
          <div className='sidebar__action-popup-wrap'>
            <div className='sidebar__action-popup-backdrop' onClick={this.cancelActionMenu} />
            <div className='sidebar__action-popup'>
              {!isAddingTriggerToMessage && (
                <div className='sidebar__action-popup-information-wrap'>
                  <div className='sidebar__action-popup-icon icon-lightning' />
                  <div className='sidebar__action-popup-information'>
                    When user clicks <div className='sidebar__action-popup-information-name'>"{text}"</div>
                  </div>
                </div>
              )}
              {availableKeys.map(key => {
                return (
                  <div
                    key={key}
                    className='sidebar__action-popup-action'
                    onClick={() => this.addTrigger(key)}
                    >
                    <div
                      className={classNames('sidebar__action-popup-icon', {
                        'icon-refresh-cw': key === 'replace',
                        'icon-trash': key === 'delete',
                        'icon-speech-bubble': key === 'new-user-input',
                        'icon-textarea': key === 'new-dialog',
                        'icon-inbox': key === 'import-json' || key === 'import-replace'
                      })}
                      />
                    {actions[key]}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className='sidebar__header'>
          <div
            className='sidebar__header-avatar'
            style={{
              backgroundImage: bot.url ? `url(${bot.url})` : ''
            }}
            >{bot.url ? '' : bot.emoji}</div>
          <div className='sidebar__header-meta'>
            <div className='sidebar__header-title' title={bot.name}>{bot.name}</div>
            <div className='sidebar__header-handle' title={bot.handle}>{bot.handle}</div>
          </div>
        </div>

        <div className='sidebar__breadcrumb'>
          <Link className='sidebar__back' to={`/${meta.teamDomain}/${meta.botId}/stories`}>Stories</Link> / {story.name}
        </div>

        <div className='sidebar__settings'>
          <div className='input-group input-group--settings'>
            <label
              htmlFor='sidebar__toggle-depth-first'
              className={classNames('input-group__label', {
                'input-group__label--active': isDepthFirst
              })}
              >
              Show all messages
            </label>
            <input
              className='input'
              type='checkbox'
              id='sidebar__toggle-depth-first'
              checked={isDepthFirst}
              onClick={toggleDepthFirst}
              />
          </div>
        </div>

        <SideBarMessageList
          allowModifications={allowModifications}
          bot={bot}
          users={users}
          label='Messages'
          messageMap={messageMap}
          messages={messagesWithChildren}
          currentPath={currentPath}
          onClick={onClick}
          story={story}
          removeMessageHandler={removeMessageHandler}
          removeTargetFromAction={removeTargetFromAction}
          showActionMenu={this.showActionMenu}
          />
      </div>
    );
  }

  showActionMenu (messageId, parents, attachmentIdx, actionIdx, isDialog) {
    const { messageMap, allowModifications } = this.props;

    if (!allowModifications) return;

    const message = messageMap[messageId];
    const actionsOnMessage = message.actions.filter(a => a.type === 'message').map(a => a.target.action);
    const actionsOnButton = message.actions
      .filter(a => a.type === 'click' && a.source.attachment === attachmentIdx && a.source.action === actionIdx)
      .map(a => a.target.action);

    this.setState({
      showActionMenu: true,
      actionMenu: {
        messageId,
        messageParents: parents,
        attachmentIdx,
        actionIdx,
        isAddingTriggerToMessage: (typeof attachmentIdx !== 'number' && typeof actionIdx !== 'number') && !isDialog,
        isDialog,
        actionsOnMessage,
        actionsOnButton: [...actionsOnButton]
      }
    });
  }

  cancelActionMenu () {
    this.setState({
      showActionMenu: false,
      actionMenu: {
        messageId: undefined,
        attachmentIdx: undefined,
        actionIdx: undefined,
        isAddingTriggerToMessage: undefined,
        actionsOnMessage: [],
        actionsOnButton: []
      }
    });
  }

  addTrigger (key) {
    const { addTriggerClick, addTriggerMessage } = this.props;
    const { actionMenu: { messageId, messageParents, attachmentIdx, actionIdx } } = this.state;
    if (attachmentIdx >= 0 && actionIdx >= 0) {
      addTriggerClick(key, messageId, messageParents, attachmentIdx, actionIdx);
    } else {
      addTriggerMessage(key, messageId, messageParents);
    }
    this.cancelActionMenu();
  }
}

export default SideBar;
