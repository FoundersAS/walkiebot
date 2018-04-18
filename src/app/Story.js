'use strict';
import '../stylesheets/app.scss';

import classNames from 'classnames';
import React from 'react';
import Moment from 'moment';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Imm from 'immutable';
import slug from 'slug';
import shuffle from 'array-shuffle';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import SideBar from './Components/SideBar';
import MessageLoading from './Components/MessageLoading';
import ActionConfirmationModal from './Components/Modals/ActionConfirmationModal';
import DialogModal from './Components/Modals/DialogModal';
import Header from './Components/Header';
import Input from './Components/Input';
import MessageList from './Components/MessageList';
import ExportModal from './Components/Modals/ExportModal';
import ImportModal from './Components/Modals/ImportModal';
import SelectModal from './Components/Modals/SelectModal';
import {
  loadActions,
  resetActions
} from './redux/ducks/message-actions';
import {
  DEFAULT_ACTION,
  DEFAULT_ACTION_CONFIRM,
  DEFAULT_FIELD,
  DEFAULT_ATTACHMENT,
  loadAttachments,
  resetAttachments
} from './redux/ducks/attachments';
import {
  loadMessageSettings,
  resetMessageSettings
} from './redux/ducks/message-settings';
import {
  loadReactions,
  resetReactions
} from './redux/ducks/message-reactions';
import {
  editMessage,
  cancelEditMessage,
  addMessage,
  duplicateStory,
  removeStory,
  renameStory,
  updateStoryDescription,
  removeMessage,
  updateCurrentMessage,
  updateCurrentEditMessage,
  updateCurrentEditMessageUser,
  resetCurrentMessage,
  updateMessage,
  getStory,
  updateMessageTriggerType,
  addActionToMessage,
  removeTargetFromAction
} from './redux/ducks/stories';
import { resetFlow, removeFromFlow, findPathToMessage } from './redux/ducks/flow';
import * as storySelectors from './redux/selectors/stories';
import {
  botChatContext,
  changeUserContext
} from './redux/ducks/chat-context';
import { openBuilder, openBuilderDialog, closeBuilder } from './redux/ducks/builder';
import { resetDialog, loadDialog } from './redux/ducks/dialog';
import { startAddTrigger, stopAddTrigger } from './redux/ducks/message-trigger-actions';
import { slackExporter } from './utils/slack-exporter';
import { treeSearch, getNodesChildren } from './utils/message-relations';
import { isNumber } from './utils/validators';

class Story extends React.Component {
  constructor (props) {
    super(props);

    this._saveMessage = this._saveMessage.bind(this);
    this.closeBuilder = this.closeBuilder.bind(this);
    this.switchToBotContext = this.switchToBotContext.bind(this);
    this.switchUserContext = this.switchUserContext.bind(this);

    this.toggleMessageMenu = this.toggleMessageMenu.bind(this);
    this.cancelMessageMenu = this.cancelMessageMenu.bind(this);

    this.handleTriggers = this.handleTriggers.bind(this);

    this.cancelAddTrigger = this.cancelAddTrigger.bind(this);
    this.addTriggerClick = this.addTriggerClick.bind(this);
    this.addTriggerMessage = this.addTriggerMessage.bind(this);
    this.removeMessageHandler = this.removeMessageHandler.bind(this);
    this.removeTargetFromAction = this.removeTargetFromAction.bind(this);

    this.saveDialog = this.saveDialog.bind(this);

    this.cancelDialogModal = this.cancelDialogModal.bind(this);
    this.closeDialogModal = this.closeDialogModal.bind(this);
    this.openDialogModal = this.openDialogModal.bind(this);

    this.closeModalOnEscape = this.closeModalOnEscape.bind(this);

    this.startDuplicatingMessage = this.startDuplicatingMessage.bind(this);
    this.cancelDuplicatingMessage = this.cancelDuplicatingMessage.bind(this);
    this.insertNodeBelow = this.insertNodeBelow.bind(this);
    this.goToMessageFromSidebar = this.goToMessageFromSidebar.bind(this);

    this.setRefForTextareaOnInput = this.setRefForTextareaOnInput.bind(this);

    this.toggleDepthFirst = this.toggleDepthFirst.bind(this);

    this.state = {
      showImportModal: false,
      modalContent: '',
      modalContentIsJSON: true,
      showActionModal: false,
      showExportModal: false,
      isDuplicating: false,
      duplicateMessageId: null,
      actionModal: {},
      showDialogModal: false,
      dialogModal: {},
      messageMenu: {
        messageIdx: null,
        attachmentIdx: null,
        menuIdx: null,
        openUpwards: false
      },
      showAllMessagesDepthFirst: false
    };
  }

  componentDidMount () {
    const { dispatch, params, meta } = this.props;
    if (!params.storyId) return;
    if (!meta.botId) return;
    dispatch(getStory(params.storyId));
  }

  componentWillUnmount () {
    const { dispatch } = this.props;
    dispatch(resetFlow());
    this.cancelBuilder();
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.storyId === this.props.params.storyId) return;
    if (!this.props.meta.botId) return;
    this.props.dispatch(getStory(nextProps.params.storyId));
  }

  onenter (event, attachments) {
    if (event.keyCode === 13 && event.shiftKey) return;
    if (event.keyCode === 13) {
      event.preventDefault();
      if (event.target.value === '') return;

      const flipContext = event.metaKey || event.ctrlKey;

      let isBot = this.props.chatContext === 'bot';
      if (flipContext) isBot = !isBot;
      this._saveMessage(isBot, event.target.value);
      event.target.value = '';
    }
  }

  closeBuilder () {
    const { dispatch } = this.props;
    dispatch(closeBuilder());
    dispatch(resetDialog());
    dispatch(resetMessageSettings());
    dispatch(resetReactions());
    dispatch(resetAttachments());
    dispatch(resetActions());
  }

  saveMessage (text, attachments) {
    const isBot = this.props.chatContext === 'bot';
    this._saveMessage(isBot, text, attachments);
  }

  _saveMessage (isBot, text, attachments = []) {
    const { dispatch, story, messagesWithChildren, messagesToRender, params, currentUserIdx, messageSettings, messageReactions } = this.props;
    if (story.loading) return;
    if (!text && !attachments.length) return;
    let message = {
      name: `Message #${messagesWithChildren.length}`,
      customId: `message-${messagesWithChildren.length}`,

      parents: [],

      type: 'message',

      bot: isBot,
      user: currentUserIdx,

      actions: [],

      slack: {
        text: text ? text.trim() : null,
        time: Moment().format('h:mm A'),
        attachments: attachments,
        reactions: messageReactions
      }
    };
    if (isBot) message.slack = Object.assign({}, message.slack, messageSettings);

    this.closeBuilder();
    dispatch(resetCurrentMessage(params.storyId));
    dispatch(addMessage(params.storyId, message, messagesToRender, messagesWithChildren))
      .then(newMessage => {
        dispatch(stopAddTrigger());
        this._messageList.scroll();
      });
  }

  saveDialog () {
    const { dispatch, dialog, currentUserIdx, params, messagesWithChildren, messagesToRender, story } = this.props;
    const { messages, editingMessageId } = story;

    if (editingMessageId) {
      const originalMessage = messages.find(m => m.messageId === story.editingMessageId);
      const newMessage = Object.assign({}, originalMessage, { editing: false, creating: false });
      const slack = Object.assign(
        {},
        originalMessage.slack,
        dialog.toJS()
      );
      newMessage.slack = slack;

      dispatch(updateMessage(params.storyId, story.editingMessageId, newMessage));
      this.closeBuilder();
      return;
    }

    let message = {
      name: `Dialog #${messagesWithChildren.length}`,
      customId: `dialog-${messagesWithChildren.length}`,

      parents: [],

      type: 'dialog',

      bot: true,
      user: currentUserIdx,

      actions: [],

      slack: dialog.toJS()
    };

    this.closeBuilder();
    dispatch(addMessage(params.storyId, message, messagesToRender, messagesWithChildren))
      .then(newMessage => {
        dispatch(stopAddTrigger());
      });
  }

  switchToBotContext () {
    this.props.dispatch(botChatContext());
  }

  switchUserContext (userIdx) {
    this.props.dispatch(changeUserContext(userIdx));
  }

  removeStoryHandler (event) {
    const { params, meta, router } = this.props;
    const storyId = params.storyId;
    const stories = Object.keys(this.props.stories)
      .sort((a, b) => a.localeCompare(b))
      .filter(story => story !== storyId);

    if (event.shiftKey) {
      this.props.dispatch(removeStory(storyId));
      if (stories.length) {
        router.replace(`/${meta.team.domain}/${meta.botId}/story/${stories[0]}`);
        return;
      }
      router.replace(`/${meta.team.domain}/${meta.botId}/settings`);
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${storyId}?`)) {
      this.props.dispatch(removeStory(storyId));
      if (stories.length) {
        router.replace(`/${meta.team.domain}/${meta.botId}/story/${stories[0]}`);
        return;
      }
      router.replace(`/${meta.team.domain}/${meta.botId}/settings`);
    }
  }

  showImportModal (event) {
    this.setState({
      showImportModal: true
    });
  }

  importMessageHandler (json, type) {
    const { dispatch, params, meta, stories, story, users, messagesToRender, messagesWithChildren } = this.props;
    let slack = {};

    if (type === 'message') {
      slack = {
        text: json.text ? json.text.trim() : null,
        time: Moment().format('h:mm A'),
        attachments: (json.attachments || []).map(attachment => {
          const newA = Object.assign({}, DEFAULT_ATTACHMENT, attachment);
          if (attachment.actions) {
            newA.actions = attachment.actions.map(action => {
              const newAction = Object.assign({}, DEFAULT_ACTION, action);
              if (action.confirm) {
                newAction.confirm = Object.assign({}, DEFAULT_ACTION_CONFIRM, action.confirm);
              }
              if (action.selected_options) {
                const selectedOption = action.selected_options[0];
                if (action.options) {
                  newAction._selectedOption = action.options.reduce((optionPath, option, optionIdx) => {
                    if (option.value !== selectedOption.value) return optionPath;
                    return optionIdx;
                  }, null);
                }
                if (action.option_groups) {
                  newAction._selectedOption = action.option_groups.reduce((optionPath, group, groupId) => {
                    group.options.forEach((option, optionId) => {
                      if (option.value !== selectedOption.value) return;
                      optionPath = [groupId, optionId];
                    });
                    return optionPath;
                  }, []);
                }
              }
              const DEFAULT_CHANNELS = [ 'random', 'general', 'development', 'design' ];
              const channelNames = [...DEFAULT_CHANNELS, ...Object.keys(stories)];
              const channelOptions = channelNames.map(channel => {
                return {
                  text: channel,
                  value: channel,
                  type: 'channel'
                };
              });
              const userOptions = users.filter(u => !u.deleted).map(user => {
                const handle = user.handle.substr(1, user.handle.length);
                return {
                  text: handle,
                  value: handle,
                  active: true,
                  type: 'user',
                  url: user.url,
                  emoji: user.emoji
                };
              });
              if (action.data_source === 'users') {
                newAction.options = userOptions;
              }
              if (action.data_source === 'channels') {
                newAction.options = channelOptions;
              }
              if (action.data_source === 'conversations') {
                newAction.options = shuffle([...userOptions, ...channelOptions]);
              }
              if (!action.data_source) newAction.data_source = 'static';
              newAction.options = newAction.options || [];
              return newAction;
            });
          }
          if (attachment.fields) {
            newA.fields = attachment.fields.map(f => Object.assign({}, DEFAULT_FIELD, f));
          }
          return newA;
        })
      };
    }
    if (type === 'dialog') {
      slack = json;
      const lastMessage = messagesToRender[messagesToRender.length - 1];
      if (lastMessage) dispatch(startAddTrigger('new-dialog', 'message', lastMessage.messageId));
    }

    const message = {
      name: `Message #${story.messages.length}`,
      customId: `message-${story.messages.length}`,
      parents: [],
      bot: true,
      actions: [],
      type,
      slack
    };

    dispatch(addMessage(params.storyId, message, messagesToRender, messagesWithChildren))
      .then(() => {
        this._messageList.scroll();
        dispatch(stopAddTrigger());
      });
    this.setState({ showImportModal: false });
  }

  duplicateStoryHandler (event) {
    const { dispatch, router, params, meta } = this.props;
    dispatch(duplicateStory(params.storyId))
      .then(newStoryId => {
        router.push(`/${meta.teamDomain}/${meta.botId}/story/${newStoryId}`);
      });
  }

  renameStoryHandler (event) {
    if (event.which === 27) return event.target.blur();
    if (event.which === 13) {
      const { dispatch, router, stories, params, meta } = this.props;
      const { storyId } = params;

      const newName = event.target.value;
      const newStoryId = slug(newName).toLowerCase();
      if (Object.keys(stories).indexOf(newStoryId) !== -1) {
        return window.alert('Sorry! This name is already taken');
      }

      dispatch(renameStory(storyId, newName, newStoryId))
        .then(() => {
          router.replace(`/${meta.teamDomain}/${meta.botId}/story/${newStoryId}`);
        });
      event.target.blur();
    }
  }

  updateStoryDescriptionHandler (event) {
    if (event.which === 27) return event.target.blur();
    if (event.which === 13) {
      const { dispatch, params } = this.props;
      const { storyId } = params;
      dispatch(updateStoryDescription(storyId, event.target.value));
      event.target.blur();
    }
  }

  exportBotHandler (event) {
    const { messages, meta } = this.props;
    this.setState({
      modalContent: messages.map(m => slackExporter(m)),
      showExportModal: true
    });
  }

  exportMessage (messageId) {
    const { story, meta } = this.props;
    const message = story.messages.find(m => m.messageId === messageId);
    const payload = slackExporter(message);
    this.setState({
      modalContent: payload,
      showExportModal: true
    });
  }

  removeMessageHandler (messageId) {
    if (window.confirm('Are you sure you want to delete this message?\nWarning: This will also remove any actions and children connected to this message.')) {
      const { dispatch, params, builder, story, messagesWithChildren } = this.props;
      if (story.editingMessageId) dispatch(cancelEditMessage(params.storyId));
      if (builder) this.closeBuilder();
      dispatch(removeMessage(params.storyId, messageId, messagesWithChildren));
    }
  }

  startEditMessage (messageId) {
    const { dispatch, messages, params } = this.props;

    const message = messages.find(m => m.messageId === messageId);

    if (!message) return console.error(`Could not find messages[${messageId}] in stories - Cannot edit!`);

    dispatch(editMessage(params.storyId, messageId));

    dispatch(loadMessageSettings({
      ephemeral: message.slack.ephemeral,
      delete: message.slack.delete,
      replace: message.slack.replace
    }));
    if (message.actions) dispatch(loadActions(message.actions));
    if (message.slack.reactions) dispatch(loadReactions(message.slack.reactions));

    if (message.type === 'dialog') {
      dispatch(loadDialog(message.slack));
      dispatch(openBuilderDialog());
      return;
    }

    if (!message.bot) {
      if (message.reactions) dispatch(loadReactions(message.slack.reactions));
      dispatch(loadMessageSettings({ ephemeral: message.slack.ephemeral }));
      dispatch(openBuilder(message.bot));
      return;
    }

    dispatch(loadAttachments(message.slack.attachments));
    dispatch(openBuilder());
  }

  updateEditMessage (element) {
    const { dispatch, params } = this.props;
    dispatch(updateCurrentEditMessage(params.storyId, element.target.value));
  }

  updateEditMessageUser (userIndex) {
    const { dispatch, params } = this.props;
    dispatch(updateCurrentEditMessageUser(params.storyId, userIndex));
  }

  editMessageOnKeyDownHandler (event) {
    if (event.which === 13 && event.shiftKey) return;
    if (event.which === 27) return this.cancelBuilder();
    if (event.which === 13) {
      const { story, messages } = this.props;
      const message = messages.find(m => m.messageId === story.editingMessageId);
      if (story.editingMessageValue === '' && message.slack.attachments.length === 0) {
        return this.removeMessageHandler(story.editingMessageId);
      }
      event.preventDefault();
      this.saveAttachments();
    }
  }

  cancelBuilder () {
    const { dispatch, params, story } = this.props;
    if (story && story.editingMessageId) {
      const confirmMessage = 'You have unsaved changes\nDo you want to discard them?';
      if (story.editingMessageChanged && !window.confirm(confirmMessage)) return;
      dispatch(cancelEditMessage(params.storyId));
    }

    dispatch(updateMessageTriggerType(params.storyId, null));
    dispatch(resetCurrentMessage(params.storyId));
    dispatch(stopAddTrigger());
    this.closeBuilder();
  }

  saveAttachments () {
    const { attachments, messagesWithChildren, messageActions, messageSettings, messageReactions, dispatch, story, messages, params } = this.props;

    if (story.loading) return;
    if (!story.editingMessageId) {
      return this.saveMessage(story.currentMessage, attachments);
    }
    const originalMessage = messages.find(m => m.messageId === story.editingMessageId);
    const newMessage = Object.assign({}, originalMessage, { editing: false, creating: false });
    const slack = Object.assign(
      {},
      originalMessage.slack,
      {
        text: story.editingMessageValue ? story.editingMessageValue.trim() : null,
        attachments: attachments.map(a => Object.assign({}, a)),
        reactions: messageReactions
      },
      messageSettings
    );
    newMessage.slack = slack;
    newMessage.actions = messageActions.toJS();
    newMessage.user = story.editingMessageUser;

    if (!newMessage.bot) delete newMessage.attachments;
    dispatch(updateMessage(params.storyId, story.editingMessageId, newMessage, messagesWithChildren));
    this.closeBuilder();
  }

  closeModalOnEscape (e) {
    if (e.which === 27) {
      if (this.state.showDialogModal) {
        this.cancelDialogModal();
      }
      this.setState({
        showExportModal: false,
        showImportModal: false,
        modalContent: ''
      });
    }
  }

  cancelDialogModal (e) {
    const { dialogModal } = this.state;
    const { dispatch, messagesWithChildren } = this.props;
    this.setState({
      showDialogModal: false,
      dialogModal: {}
    });
    const node = treeSearch(messagesWithChildren, dialogModal._messageId);
    const idsToRemoveFromFlow = getNodesChildren(node).map(m => m.messageId).filter(mId => mId !== node.messageId);
    dispatch(removeFromFlow(idsToRemoveFromFlow));
  }

  closeDialogModal (e) {
    const { dialogModal } = this.state;
    if (dialogModal._triggers.length) {
      this.handleTriggers(dialogModal._messageId, dialogModal._triggers, e);
    }
    this.setState({
      showDialogModal: false,
      dialogModal: {}
    });
  }

  openDialogModal (message) {
    this.setState({
      showDialogModal: true,
      dialogModal: {
        dialog: message.slack,
        _messageId: message.messageId,
        _triggers: message.actions
      }
    });
  }

  cancelActionModal () {
    this.setState({
      showActionModal: false,
      actionModal: {}
    });
  }

  closeActionModal (e) {
    const { actionModal } = this.state;
    if (actionModal._triggers.length) {
      this.handleTriggers(actionModal._messageId, actionModal._triggers, e);
    }
    this.setState({
      showActionModal: false,
      actionModal: {}
    });
  }

  openActionModal (confirm, messageId, triggers) {
    this.setState({
      showActionModal: true,
      actionModal: {
        title: confirm.title,
        text: confirm.text,
        okText: confirm.ok_text,
        dismissText: confirm.dismiss_text,
        _triggers: triggers || [],
        _messageId: messageId
      }
    });
  }

  cancelMessageMenu (e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      messageMenu: {
        messageIdx: null,
        attachmentIdx: null,
        menuIdx: null,
        openUpwards: false
      }
    });
  }

  toggleMessageMenu (messageId, attachmentIdx, menuIdx, openUpwards, confirm, triggers, event) {
    const messageIdx = this.props.story.messages.findIndex(m => m.messageId === messageId);
    const isMessageMenuOpen = isNumber(this.state.messageMenu.messageIdx) &&
                              isNumber(this.state.messageMenu.menuIdx) &&
                              isNumber(this.state.messageMenu.attachmentIdx);
    if (isMessageMenuOpen) {
      if (confirm) this.openActionModal(confirm, messageId, triggers);
      this.setState({
        messageMenu: {
          messageIdx: null,
          attachmentIdx: null,
          menuIdx: null,
          openUpwards: false
        }
      });
      if (triggers.length && !confirm) this.handleTriggers(messageId, triggers, event);
    } else {
      this.setState({
        messageMenu: {
          messageIdx,
          attachmentIdx,
          menuIdx,
          openUpwards
        }
      });
    }
  }

  moveMessageHandler (messageId, direction) {
    return;
    // const { dispatch, params, story, messages } = this.props;
    // const { storyId } = params;

    // const oldPos = story.messages.findIndex(m => m.messageId === messageId);
    // const newPos = oldPos + direction;

    // if (newPos === -1) return;
    // if (newPos > messages.length) return;
    // dispatch(moveMessage(storyId, oldPos, newPos));
  }

  render () {
    const {
      meta,
      bot,
      users,
      messageSettings,
      messageTriggerActions,
      attachments,
      story,
      messagesWithChildren,
      messagesToRender,
      messageMap,
      temporaryMessage,
      currentPath,
      flow,
      builder
    } = this.props;
    if (!attachments || !story || story.storyLoading) {
      return (
        <div className='story-loader'>
          <h3>Loading story</h3>
          <p>Data is the breakfast of champions. Walkie will be ready soon.</p>
          <MessageLoading noPadding />
        </div>
      );
    }

    const isEditing = !!story.editingMessageId;
    const canOpenBuilder = isEditing ? story.messages.find(m => m.messageId === story.editingMessageId).bot : true;
    let messages = [].concat(messagesToRender);

    const triggerKey = messageTriggerActions.getIn(['trigger', 'key']);
    if (attachments.length || isEditing || story.currentMessage) {
      if (isEditing) {
        messages = Imm.fromJS(messages)
          .map(message => {
            if (message.get('messageId') !== story.editingMessageId) return message;
            return temporaryMessage;
          })
          .toJS();
      } else {
        const isAddingReplaceTrigger = triggerKey === 'replace';
        if (!isAddingReplaceTrigger) {
          messages.push(temporaryMessage);
        } else {
          const parentId = messageTriggerActions.getIn(['trigger', 'messageId']);
          messages = messages.map((message, idx) => {
            if (message.messageId !== parentId) return message;
            return temporaryMessage;
          });
        }
      }
    }

    if (this.state.showAllMessagesDepthFirst) {
      messages = [].concat(...messagesWithChildren.map(getNodesChildren));
    }

    const actionModal = (
      <ActionConfirmationModal
        onClickCancel={this.cancelActionModal.bind(this)}
        onClick={this.closeActionModal.bind(this)}
        title={this.state.actionModal.title}
        text={this.state.actionModal.text}
        okText={this.state.actionModal.okText}
        dismissText={this.state.actionModal.dismissText}
        />
    );

    return (
      <div className='app__content'>
        <SideBar
          isDuplicating={this.state.isDuplicating}
          allowModifications={!builder.open}
          bot={bot}
          users={users}
          meta={meta}
          story={story}
          addTriggerClick={this.addTriggerClick}
          addTriggerMessage={this.addTriggerMessage}
          removeMessageHandler={this.removeMessageHandler}
          messagesWithChildren={messagesWithChildren}
          messageMap={messageMap}
          currentPath={currentPath}
          onClick={this.goToMessageFromSidebar}
          removeTargetFromAction={this.removeTargetFromAction}
          toggleDepthFirst={this.toggleDepthFirst}
          isDepthFirst={this.state.showAllMessagesDepthFirst}
          />
        <div className={classNames('app__story-area', { 'show-attachments': this.props.builder.open })}>
          <CSSTransitionGroup
            transitionName='app__story-overlay-transition'
            transitionAppear
            transitionAppearTimeout={300}
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}
            >
            {this.state.isDuplicating && (
              <div className='app__story-overlay'>
                <div className='app__story-overlay-content'>
                  <h3 className='app__story-overlay-header'>Duplicating message</h3>
                  <p className='app__story-overlay-text'>Click on the element you want the message to be under</p>
                  <div className='btn' onClick={this.cancelDuplicatingMessage}>Cancel</div>
                </div>
              </div>
            )}
          </CSSTransitionGroup>
          <Header
            name={this.props.story.name}
            description={this.props.story.description}
            updateDescriptionHandler={this.updateStoryDescriptionHandler.bind(this)}
            updateStoryNameHandler={this.renameStoryHandler.bind(this)}
            importHandler={this.showImportModal.bind(this)}
            deleteHandler={this.removeStoryHandler.bind(this)}
            duplicateHandler={this.duplicateStoryHandler.bind(this)}
            exportHandler={this.exportBotHandler.bind(this)}
            />
          <MessageList
            isEditing={isEditing}

            flow={flow}
            messages={messages}
            removeMessage={this.removeMessageHandler}
            duplicateMessage={this.startDuplicatingMessage}

            handleTriggers={this.handleTriggers}
            openDialogModal={this.openDialogModal}
            messageTriggerActions={messageTriggerActions}

            bot={this.props.bot}
            users={this.props.users}
            channels={this.props.channels}

            ephemeral={messageSettings.ephemeral}

            openMenuMessageIdx={this.state.messageMenu.messageIdx}
            openMenuAttachmentIdx={this.state.messageMenu.attachmentIdx}
            openMenuIdx={this.state.messageMenu.menuIdx}
            openMenuUpwards={this.state.messageMenu.openUpwards}
            toggleMessageMenu={this.toggleMessageMenu}
            cancelMessageMenu={this.cancelMessageMenu}

            openActionModal={this.openActionModal.bind(this)}
            exportHandler={this.exportMessage.bind(this)}
            updateEditMessage={this.updateEditMessage.bind(this)}
            updateEditMessageUser={this.updateEditMessageUser.bind(this)}
            startEditMessage={this.startEditMessage.bind(this)}
            editMessageOnKeyDown={this.editMessageOnKeyDownHandler.bind(this)}
            moveMessage={this.moveMessageHandler.bind(this)}

            editingMessageUser={story.editingMessageUser}

            scrollOnUpdate={!this.props.story.editingMessageId}
            editingMessageId={this.props.story.editingMessageId}

            messageIsLoading={story.loading}

            lastEditedMessage={this.props.story.lastEditedMessage}
            lastOpenedBuilder={this.props.builder.lastOpened}

            ref={el => {
              this._messageList = el;
            }}
            />
          {this.state.showActionModal && actionModal}
          <Input
            ref={el => { this._input = el; }}
            storyId={this.props.params.storyId}
            switchToBotContext={this.switchToBotContext}
            switchUserContext={this.switchUserContext}
            chatContext={this.props.chatContext}
            onkeypress={this.onenter.bind(this)}
            cancelBuilder={this.cancelBuilder.bind(this)}
            cancelAddTrigger={this.cancelAddTrigger}
            saveMessage={this.saveMessage.bind(this)}
            saveAttachments={this.saveAttachments.bind(this)}
            saveDialog={this.saveDialog}
            isEditing={isEditing}
            temporaryMessage={temporaryMessage}
            canOpenBuilder={canOpenBuilder}
            messages={messages}
            messagesWithChildren={messagesWithChildren}
            setRef={this.setRefForTextareaOnInput}
            inputDisabledDueToLoading={story.loading}
            />
          {this.state.showExportModal && (
            <ExportModal
              content={this.state.modalContent}
              onClick={() => this.setState({
                showExportModal: false,
                modalContent: ''
              })}
              closeOnEscape={this.closeModalOnEscape}
              />
          )}
          {this.state.showImportModal && (
            <ImportModal
              onClick={() => this.setState({ showImportModal: false })}
              closeOnEscape={this.closeModalOnEscape}
              onSave={this.importMessageHandler.bind(this)}
              />
          )}
          {this.state.showDialogModal && (
            <DialogModal
              onClick={this.closeDialogModal}
              onClickCancel={this.cancelDialogModal}
              closeOnEscape={this.closeModalOnEscape}
              dialog={this.state.dialogModal.dialog}
              bot={bot}
              />
          )}
        </div>
      </div>
    );
  }

  toggleDepthFirst () {
    this.setState({ showAllMessagesDepthFirst: !this.state.showAllMessagesDepthFirst });
  }

  removeTargetFromAction (messageId, attachmentIndex, actionIndex, targetType, targetMessageId) {
    const { dispatch, params } = this.props;
    const confirmRemove = window.confirm('Are you sure you want to delete this action');
    if (confirmRemove) {
      dispatch(removeTargetFromAction(params.storyId, messageId, attachmentIndex, actionIndex, targetType, targetMessageId));
    }
  }

  addTriggerClick (key, messageId, parents, attachmentIdx, actionIdx, e) {
    const { dispatch, params, story, meta } = this.props;
    const theKey = key === 'import-replace' ? 'replace' : key;
    dispatch(startAddTrigger(theKey, 'click', messageId, attachmentIdx, actionIdx));
    dispatch(findPathToMessage(params.storyId, messageId, parents));

    if (this.state.isDuplicating) return this.insertNodeBelow();

    switch (key) {
      case 'new-msg':
        this.switchToBotContext();
        dispatch(openBuilder());
        this._inputTextarea && this._inputTextarea.focus();
        break;
      case 'new-dialog':
        this.switchToBotContext();
        dispatch(openBuilderDialog());
        break;
      case 'new-user-input':
        this.switchToBotContext();
        dispatch(updateMessageTriggerType(params.storyId, 'user-input'));
        this._inputTextarea && this._inputTextarea.focus();
        break;
      case 'replace':
        this.switchToBotContext();
        const message = story.messages.find(m => m.messageId === messageId);
        if (!message) return;
        dispatch(updateCurrentMessage(params.storyId, message.slack.text || ''));
        dispatch(loadMessageSettings({
          ephemeral: message.slack.ephemeral,
          delete: message.slack.delete,
          replace: message.slack.replace
        }));
        dispatch(loadAttachments(message.slack.attachments));
        dispatch(openBuilder());
        this._inputTextarea && this._inputTextarea.focus();
        break;
      case 'delete':
        // Add some randomness so that different delete actions
        // on the same message will look different.
        // Order it as the last action in the list of actions
        const randomStr = Math.random().toString().substr(2, 8);
        const parentNode = treeSearch(this.props.messagesWithChildren, messageId);
        const parentActions = parentNode.actions[actionIdx];
        const order = parentActions ? parentActions.targets.length : 0;
        dispatch(addActionToMessage(params.storyId, `delete.${messageId}.${randomStr}`, order));
        break;
      case 'import-json':
        this.showImportModal();
        break;
      case 'import-replace':
        this.showImportModal();
        break;
    }
  }

  addTriggerMessage (key, messageId, parents, e) {
    const { meta, dispatch, params } = this.props;
    dispatch(startAddTrigger(key, 'message', messageId));
    dispatch(findPathToMessage(params.storyId, messageId, parents));

    if (this.state.isDuplicating) return this.insertNodeBelow();

    switch (key) {
      case 'new-msg':
        this.switchToBotContext();
        dispatch(openBuilder());
        this._inputTextarea && this._inputTextarea.focus();
        break;
      case 'new-dialog':
        this.switchToBotContext();
        dispatch(openBuilderDialog());
        break;
      case 'new-user-input':
        this.switchToBotContext();
        dispatch(updateMessageTriggerType(params.storyId, 'user-input'));
        this._inputTextarea && this._inputTextarea.focus();
        break;
      case 'import-json':
        this.showImportModal();
        break;
    }
  }

  cancelAddTrigger (e) {
    const { dispatch, params, meta } = this.props;
    const reallyStop = window.confirm('Are you sure you wish to cancel adding a new trigger?\nYour message and/or attachments will be lost.');
    if (!reallyStop) return;
    dispatch(stopAddTrigger());
    dispatch(updateMessageTriggerType(params.storyId, null));
    dispatch(resetCurrentMessage(params.storyId));
    this.closeBuilder();
  }

  startDuplicatingMessage (messageId) {
    this.setState({ isDuplicating: true, duplicateMessageId: messageId });
  }

  cancelDuplicatingMessage () {
    const { dispatch } = this.props;
    this.setState({
      isDuplicating: false,
      duplicateMessageId: ''
    });
    dispatch(stopAddTrigger());
  }

  insertNodeBelow () {
    const { meta, messagesWithChildren, params, messagesToRender, dispatch } = this.props;
    const message = treeSearch(messagesWithChildren, this.state.duplicateMessageId);
    if (message.type !== 'dialog') {
      this._saveMessage(message.bot, message.slack.text, message.slack.attachments);
    } else {
      if (!message) {
        console.error('Could not find original message to duplicate');
        this.setState({
          isDuplicating: false,
          duplicateMessageId: ''
        });
        dispatch(stopAddTrigger());
        return;
      }

      let newMessage = {
        name: `Dialog #${messagesWithChildren.length}`,
        customId: `dialog-${messagesWithChildren.length}`,

        parents: [],

        type: 'dialog',

        bot: true,
        user: message.user,

        actions: [],

        slack: message.slack
      };
      dispatch(addMessage(params.storyId, newMessage, messagesToRender, messagesWithChildren))
        .then(newMessage => {
          dispatch(stopAddTrigger());
        });
    }
    this.setState({
      isDuplicating: false,
      duplicateMessageId: ''
    });
  }

  goToMessageFromSidebar (messageId, parents) {
    const { dispatch, params, messageTriggerActions } = this.props;
    if (this.state.isDuplicating) return;
    if (messageTriggerActions.get('isAdding')) return;
    dispatch(findPathToMessage(params.storyId, messageId, parents));
  }

  handleTriggers (messageId, triggers, e) {
    const { dispatch, params, messagesWithChildren, messageTriggerActions } = this.props;
    if (messageTriggerActions.get('isAdding')) return;
    const lastNode = triggers.pop();
    if (!lastNode.target) return;
    const node = treeSearch(messagesWithChildren, lastNode.target.messageId);
    dispatch(findPathToMessage(params.storyId, node.messageId, node.olderNodes.map(m => m.messageId)));
  }

  setRefForTextareaOnInput (el) {
    this._inputTextarea = el;
  }
}

const mapStateToProps = (state, props) => {
  const messageTree = storySelectors.getMessagesWithChildren(state, props);
  const messagesToRender = storySelectors.getMessageFlow(state, props);
  return {
    bot: state.bot,
    storyLoading: state.stories.loading,
    story: storySelectors.getStory(state, props),
    messages: storySelectors.getMessages(state, props),
    messagesWithChildren: messageTree.tree,
    messagesToRender: messagesToRender,
    messageMap: storySelectors.getMessageMap(state, props),
    temporaryMessage: storySelectors.getTemporaryMessage(state, props),
    currentPath: state.flow.get('path').toJS(),
    chatContext: state.chatContext.chatContext,
    currentUserIdx: state.chatContext.currentUserIdx,
    builder: state.builder,
    users: state.users,
    channels: Object.keys(state.stories),
    stories: state.stories,
    attachments: state.attachments,
    dialog: state.dialog,
    meta: state.meta,
    messageActions: state.messageActions,
    messageSettings: state.messageSettings,
    messageReactions: state.messageReactions,
    messageTriggerActions: state.messageTriggerActions,
    flow: state.flow.get('flow')
  };
};

export default connect(mapStateToProps)(withRouter(Story));
