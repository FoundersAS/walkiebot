'use strict';
import classNames from 'classnames';
import { connect } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import shuffle from 'array-shuffle';

import BuilderAttachment from './Attachment';
import Accordion from './Accordion';
import Reactions from './Reactions';
import Alert from '../Alert';
import {
  addAttachment,
  duplicateAttachment,
  addField,
  removeField,
  updateField,
  addAction,
  toggleActionSelectedOption,
  addActionSelectUsers,
  addActionSelectChannels,
  addActionSelectConversations,
  addActionSelectPrefilledOption,
  addActionSelectGroups,
  addActionSelectGroupsGroup,
  addActionSelect,
  addActionSelectGroupsGroupOption,
  addActionSelectOption,
  removeActionSelectGroupsGroup,
  removeActionSelectGroupsGroupOption,
  removeActionSelectOption,
  removeAction,
  updateAction,
  removeAttachment,
  updateAttachmentObj,
  moveAttachment,
  moveAction,
  moveActionSelectionOption,
  moveActionSelectGroup,
  moveActionSelectGroupOption,
  moveField
} from '../../redux/ducks/attachments';
import {
  getValidatedAttachments
} from '../../redux/selectors/attachments';
import {
  toggleDelete,
  toggleReplace,
  toggleEphemeral,
  resetMessageSettings
} from '../../redux/ducks/message-settings';
import {
  addReaction,
  removeReaction,
  editReaction,
  moveReaction,
  resetReactions
} from '../../redux/ducks/message-reactions';
import {
  moveActionForButton,
  removeActionForButton,
  moveActionForAttachment,
  removeActionForAttachment
} from '../../redux/ducks/message-actions';
import {
  changeEditMessage
} from '../../redux/ducks/stories';
import {
  message as messageValidator
} from '../../utils/validators';

class Builder extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      showAlert: false
    };
    this.scroll = this.scroll.bind(this);
    this.parseError = this.parseError.bind(this);

    this.toggleDelete = this.toggleDelete.bind(this);
    this.toggleReplace = this.toggleReplace.bind(this);
    this.toggleEphemeral = this.toggleEphemeral.bind(this);

    this.addReaction = this.addReaction.bind(this);
    this.removeReaction = this.removeReaction.bind(this);
    this.editReaction = this.editReaction.bind(this);
    this.moveReaction = this.moveReaction.bind(this);

    this.duplicateAttachment = this.duplicateAttachment.bind(this);
  }

  addReaction (emoji) {
    this.props.dispatch(addReaction(emoji));
  }

  removeReaction (emoji) {
    this.props.dispatch(removeReaction(emoji));
  }

  editReaction (emoji, count) {
    this.props.dispatch(editReaction(emoji, count));
  }

  moveReaction (index, direction) {
    const { dispatch, messageReactions } = this.props;
    const newPos = index + direction;
    if (newPos === -1) return;
    if (newPos > messageReactions.length) return;
    dispatch(moveReaction(index, newPos));
  }

  toggleAlert (e) {
    this.setState({ showAlert: !this.state.showAlert });
  }

  toggleEphemeral (e) {
    const { dispatch } = this.props;
    dispatch(toggleEphemeral());
  }

  toggleReplace (e) {
    const { dispatch } = this.props;
    dispatch(toggleReplace());
  }

  toggleDelete (e) {
    const { dispatch } = this.props;
    dispatch(toggleDelete());
  }

  scroll () {
    setTimeout(() => {
      const attachment = ReactDOM.findDOMNode(this._attachment);
      const node = this._attachmentContainer;
      if (attachment) {
        node.scrollTop = node.scrollHeight - attachment.clientHeight;
      }
    }, 100);
  }

  parseError (error) {
    const errors = error.details
      .map(detail => {
        if (detail.type === 'object.missing') {
          if (detail.path === 'value') {
            return 'Attachment cannot be empty';
          }
        } else if (detail.type === 'object.with') {
          const { key, peer } = detail.context;
          return `Cannot create ${key} without ${peer}`;
        }
        return `Missing value for ${detail.context.key} in\n\`${detail.path}\``;
      });
    return [...new Set(errors)];
  }

  removeAttachment (id) {
    const { dispatch, messageActions } = this.props;
    const attachmentHasActions = messageActions.filter(a => a.getIn(['source', 'attachment']) === id);
    let confirmText = 'Are you sure you want to remove this attachment?';
    if (attachmentHasActions.size) confirmText = `${confirmText}\nIt will also remove the messages that are triggered by the buttons in it`;
    if (!window.confirm(confirmText)) return;
    dispatch(removeActionForAttachment(id));
    dispatch(removeAttachment(id));
    this.scroll();
  }

  save () {
    const { attachments, saveAttachments } = this.props;

    const newAttachments = attachments.map(a => {
      const newA = Object.assign({}, a);
      Object.keys(newA).forEach(key => {
        if (!newA[key] || !newA[key].length) delete newA[key];
      });
      return newA;
    });

    if (!newAttachments.length) return saveAttachments();

    messageValidator.validate({
      attachments: newAttachments
    }, {
      allowUnknown: true
    }, (err, res) => {
      saveAttachments();

      if (err) return console.log(JSON.stringify(err.details, null, 2));
    });
  }

  addAttachment () {
    const { dispatch, attachments, meta } = this.props;
    if (attachments.length >= 20) return console.error('Cannot add more than 20 attachments');
    dispatch(addAttachment());
    this.scroll();
  }

  duplicateAttachment (attachmentId) {
    const { dispatch, meta } = this.props;
    dispatch(duplicateAttachment(attachmentId));
    this.scroll();
  }

  fieldChangeHandler (...args) {
    const { dispatch, isEditing, storyId } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    dispatch(updateField(...args));
  }

  actionChangeHandler (...args) {
    const { dispatch, isEditing, storyId } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    dispatch(updateAction(...args));
  }

  changeHandler (...args) {
    const { dispatch, isEditing, storyId } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    dispatch(updateAttachmentObj(...args));
  }

  addField (attachmentId) {
    const { dispatch, isEditing, storyId, meta } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    dispatch(addField(attachmentId));
  }

  removeField (attachmentId, id) {
    const { dispatch, isEditing, storyId, meta } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    dispatch(removeField(attachmentId, id));
  }

  addAction (attachmentId) {
    const { attachments, dispatch, isEditing, storyId, meta } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    const { actions } = attachments[attachmentId];
    if (actions.length >= 5) return;
    dispatch(addAction(attachmentId));
  }

  toggleActionSelectedOption (attachmentId, actionId, optionPath) {
    const { dispatch, isEditing, storyId } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    dispatch(toggleActionSelectedOption(attachmentId, actionId, optionPath));
  }

  addActionSelectUsers (attachmentId) {
    const { attachments, dispatch, isEditing, storyId, users } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    const { actions } = attachments[attachmentId];
    if (actions.length >= 5 || actions.find(a => a.data_source === 'users')) return;
    dispatch(addActionSelectUsers(attachmentId, users));
  }

  addActionSelectChannels (attachmentId) {
    const { attachments, dispatch, isEditing, storyId, channels } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    const { actions } = attachments[attachmentId];
    if (actions.length >= 5 || actions.find(a => a.data_source === 'channels')) return;
    dispatch(addActionSelectChannels(attachmentId, channels));
  }

  addActionSelectConversations (attachmentId) {
    const { attachments, dispatch, isEditing, storyId, users, channels } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    const { actions } = attachments[attachmentId];
    if (actions.length >= 5 || actions.find(a => a.data_source === 'conversations')) return;
    const options = shuffle([...users, ...channels]);
    dispatch(addActionSelectConversations(attachmentId, options));
  }

  addActionSelectPrefilledOption (attachmentId, actionId) {
    const { attachments, dispatch, isEditing, storyId } = this.props;

    if (isEditing) dispatch(changeEditMessage(storyId));
    const { actions } = attachments[attachmentId];
    if (actions[actionId].options.length >= 100) return;
    dispatch(addActionSelectPrefilledOption(attachmentId, actionId));
  }

  addActionSelectGroups (attachmentId) {
    const { attachments, dispatch, isEditing, storyId, meta } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    const { actions } = attachments[attachmentId];
    if (actions.length >= 5) return;
    dispatch(addActionSelectGroups(attachmentId));
  }

  addActionSelectGroupsGroup (attachmentId, actionId) {
    const { attachments, dispatch, isEditing, storyId } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    const { actions } = attachments[attachmentId];
    const totalOptions = actions[actionId].option_groups.reduce((count, group) => {
      return count + group.options.length;
    }, 0);
    if (totalOptions >= 100) return;
    dispatch(addActionSelectGroupsGroup(attachmentId, actionId));
  }

  addActionSelectGroupsGroupOption (attachmentId, actionId, groupId) {
    const { attachments, dispatch, isEditing, storyId } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    const { actions } = attachments[attachmentId];
    const totalOptions = actions[actionId].option_groups.reduce((count, group) => {
      return count + group.options.length;
    }, 0);
    if (totalOptions >= 100) return;
    dispatch(addActionSelectGroupsGroupOption(attachmentId, actionId, groupId));
  }

  removeActionSelectGroupsGroup (attachmentId, actionId, groupId) {
    const { dispatch, isEditing, storyId } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    dispatch(removeActionSelectGroupsGroup(attachmentId, actionId, groupId));
  }

  removeActionSelectGroupsGroupOption (attachmentId, actionId, groupId, optionId) {
    const { dispatch, isEditing, storyId } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    dispatch(removeActionSelectGroupsGroupOption(attachmentId, actionId, groupId, optionId));
  }

  moveActionSelectGroup (attachmentId, actionId, index, direction) {
    const { attachments, dispatch, isEditing, storyId } = this.props;
    const attachment = attachments[attachmentId];
    if (isEditing) dispatch(changeEditMessage(storyId));
    const newPos = index + direction;
    if (newPos === -1) return;
    if (newPos > attachment.actions[actionId].option_groups.length) return;
    dispatch(moveActionSelectGroup(attachmentId, actionId, index, newPos));
  }

  moveActionSelectGroupOption (attachmentId, actionId, groupId, index, direction) {
    const { attachments, dispatch, isEditing, storyId } = this.props;
    const attachment = attachments[attachmentId];
    if (isEditing) dispatch(changeEditMessage(storyId));
    const newPos = index + direction;
    if (newPos === -1) return;
    if (newPos > attachment.actions[actionId].option_groups[groupId].options.length) return;
    dispatch(moveActionSelectGroupOption(attachmentId, actionId, groupId, index, newPos));
  }

  addActionSelect (attachmentId) {
    const { attachments, dispatch, isEditing, storyId, meta } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    const { actions } = attachments[attachmentId];
    if (actions.length >= 5) return;
    dispatch(addActionSelect(attachmentId));
  }

  addActionSelectOption (attachmentId, actionId) {
    const { attachments, dispatch, isEditing, storyId } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    const { actions } = attachments[attachmentId];
    if (actions[actionId].options.length >= 100) return;
    dispatch(addActionSelectOption(attachmentId, actionId));
  }

  removeActionSelectOption (attachmentId, actionId, optionId) {
    const { dispatch, isEditing, storyId } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    dispatch(removeActionSelectOption(attachmentId, actionId, optionId));
  }

  removeAction (attachmentIndex, actionIndex) {
    const { dispatch, isEditing, storyId, meta, messageActions } = this.props;
    if (isEditing) {
      const actionHasActions = messageActions.filter(a => {
        const isSameAttachment = a.getIn(['source', 'attachment']) === attachmentIndex;
        const isSameButton = a.getIn(['source', 'action']) === actionIndex;
        return isSameAttachment && isSameButton;
      });
      const confirmText = 'Removing an action will also remove the messages that are triggered by it. Are you sure you wish to continue?';
      if (actionHasActions.size && !window.confirm(confirmText)) return;
      dispatch(changeEditMessage(storyId));
      dispatch(removeActionForButton(attachmentIndex, actionIndex));
      dispatch(removeAction(attachmentIndex, actionIndex));
    } else {
      dispatch(removeAction(attachmentIndex, actionIndex));
    }
  }

  moveAttachmentHandler (index, direction) {
    const { attachments, dispatch, isEditing, storyId } = this.props;
    if (isEditing) dispatch(changeEditMessage(storyId));
    const newPos = index + direction;
    if (newPos === -1) return;
    if (newPos > attachments.length) return;
    dispatch(moveActionForAttachment(index, newPos));
    dispatch(moveAttachment(index, newPos));
  }

  moveFieldHandler (attachmentId, index, direction) {
    const { attachments, dispatch, isEditing, storyId } = this.props;
    const attachment = attachments[attachmentId];
    if (isEditing) dispatch(changeEditMessage(storyId));
    const newPos = index + direction;
    if (newPos === -1) return;
    if (newPos > attachment.fields.length) return;
    dispatch(moveField(attachmentId, index, newPos));
  }

  moveActionHandler (attachmentId, index, direction) {
    const { attachments, dispatch, isEditing, storyId } = this.props;
    const attachment = attachments[attachmentId];
    const newPos = index + direction;
    if (newPos === -1) return;
    if (newPos > attachment.actions.length) return;
    if (isEditing) {
      dispatch(changeEditMessage(storyId));
      dispatch(moveActionForButton(attachmentId, index, newPos));
      dispatch(moveAction(attachmentId, index, newPos));
    } else {
      dispatch(moveAction(attachmentId, index, newPos));
    }
  }

  moveActionSelectOptionHandler (attachmentId, actionId, index, direction) {
    const { attachments, dispatch, isEditing, storyId } = this.props;
    const attachment = attachments[attachmentId];
    if (isEditing) dispatch(changeEditMessage(storyId));
    const newPos = index + direction;
    if (newPos === -1) return;
    if (newPos > attachment.actions[actionId].options.length) return;
    dispatch(moveActionSelectionOption(attachmentId, actionId, index, newPos));
  }

  mapAttachmentsToView (attachment, idx) {
    return (
      <BuilderAttachment
        ref={(e) => { this._attachment = e; }}
        key={idx}
        idx={idx + 1}
        attachment={attachment}
        attachmentId={idx}
        duplicateAttachment={this.duplicateAttachment}
        addField={this.addField.bind(this)}
        removeField={this.removeField.bind(this)}
        addAction={this.addAction.bind(this)}
        toggleActionSelectedOption={this.toggleActionSelectedOption.bind(this)}

        addActionSelectUsers={this.addActionSelectUsers.bind(this)}
        addActionSelectChannels={this.addActionSelectChannels.bind(this)}
        addActionSelectConversations={this.addActionSelectConversations.bind(this)}
        addActionSelectPrefilledOption={this.addActionSelectPrefilledOption.bind(this)}

        addActionSelectGroups={this.addActionSelectGroups.bind(this)}
        addActionSelectGroupsGroup={this.addActionSelectGroupsGroup.bind(this)}
        addActionSelectGroupsGroupOption={this.addActionSelectGroupsGroupOption.bind(this)}
        removeActionSelectGroupsGroup={this.removeActionSelectGroupsGroup.bind(this)}
        removeActionSelectGroupsGroupOption={this.removeActionSelectGroupsGroupOption.bind(this)}
        moveActionSelectGroup={this.moveActionSelectGroup.bind(this)}
        moveActionSelectGroupOption={this.moveActionSelectGroupOption.bind(this)}
        addActionSelect={this.addActionSelect.bind(this)}
        addActionSelectOption={this.addActionSelectOption.bind(this)}
        removeActionSelectOption={this.removeActionSelectOption.bind(this)}
        removeAction={this.removeAction.bind(this)}
        changeHandler={this.changeHandler.bind(this)}
        fieldChangeHandler={this.fieldChangeHandler.bind(this)}
        actionChangeHandler={this.actionChangeHandler.bind(this)}
        removeAttachment={this.removeAttachment.bind(this)}

        moveAttachment={this.moveAttachmentHandler.bind(this)}
        moveField={this.moveFieldHandler.bind(this)}
        moveAction={this.moveActionHandler.bind(this)}
        moveActionSelectOption={this.moveActionSelectOptionHandler.bind(this)}
        showUp={idx !== 0}
        showDown={idx !== this.props.attachments.length - 1}
        />
    );
  }

  cancelBuilder (e) {
    this.setState({
      error: false,
      alert: ''
    });
    this.props.dispatch(resetMessageSettings());
    this.props.dispatch(resetReactions());
    return this.props.cancel(e);
  }

  render () {
    const { attachments, messageReactions, messageSettings, isAddingCopy, temporaryMessage } = this.props;
    const emptyState = (
      <div className='builder__message-attachment-empty'>
        <h2 className='builder__message-attachment-empty-headline'>Add attachment</h2>
        <p className='builder__message-attachment-empty-description'>This message does not have any attachments.</p>

        <div className='builder__message-attachment-empty-buttons'>
          <div
            className='btn btn--text-icon icon-paper-clip'
            onClick={this.addAttachment.bind(this)}
            >
            Add attachment
          </div>
        </div>
      </div>
    );

    if (!this.props.isBot) {
      return (
        <div className='builder'>
          <div
            className='builder__message'
            ref={(e) => { this._attachmentContainer = e; }}
            >
            <div className='builder__header'>
              <div className='builder__header-headline'>Message builder</div>
            </div>
            <div className='builder__message-content'>
              <div className='builder__message-settings'>

                <Accordion
                  title='Settings'
                  open={messageSettings.ephemeral}
                  notEmpty={messageSettings.ephemeral}
                  >
                  <div className='input-group input-group--settings'>
                    <label
                      className='input-group__label input-group__label--long'
                      htmlFor='message-settings--ephemeral'
                      >
                      Ephemeral (1)
                    </label>
                    <input
                      id='message-settings--ephemeral'
                      type='checkbox'
                      checked={messageSettings.ephemeral}
                      onChange={this.toggleEphemeral}
                      placeholder='Value'
                      className='input input-group__input'
                      />
                  </div>
                  <div className='input__helptext'>1) Should only be used for slash commands</div>
                </Accordion>

                <Reactions
                  reactions={messageReactions}
                  onAddReaction={this.addReaction}
                  onRemoveReaction={this.removeReaction}
                  onEditReaction={this.editReaction}
                  onMoveReaction={this.moveReaction}
                  accordionOpen
                  notEmpty
                  />
              </div>

            </div>
          </div>
          <div className='builder__controls'>
            <div
              className='btn btn--small'
              onClick={this.cancelBuilder.bind(this)}
              >
              Cancel
            </div>
            <div
              className='btn btn--small btn--primary'
              onClick={this.save.bind(this)}
              >
              Save
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='builder'>
        <div
          className='builder__message'
          ref={(e) => { this._attachmentContainer = e; }}
          >
          <div className='builder__header'>
            <div className='builder__header-headline'>Message builder</div>
            <div className={classNames('builder__header-meta', {
              'builder__header-meta--is-copy': isAddingCopy
            })}>
              {isAddingCopy && temporaryMessage && `Copy of ${temporaryMessage.parentName}`}
            </div>
          </div>
          <div className='builder__message-content'>

            <div className='builder__message-settings'>
              <Accordion
                title='Settings'
                open={messageSettings.ephemeral || messageSettings.delete || messageSettings.replace}
                notEmpty={messageSettings.ephemeral || messageSettings.delete || messageSettings.replace}
                >
                <div className='input-group input-group--settings'>
                  <label
                    className='input-group__label input-group__label--long'
                    htmlFor='message-settings--ephemeral'
                    >
                    Ephemeral (1)
                  </label>
                  <input
                    id='message-settings--ephemeral'
                    type='checkbox'
                    checked={messageSettings.ephemeral}
                    onChange={this.toggleEphemeral}
                    placeholder='Value'
                    className='input input-group__input'
                    />
                </div>

                <div className='input-group input-group--settings'>
                  <label
                    className='input-group__label input-group__label--long'
                    htmlFor='message-settings--replace'
                    >
                    Replace original (2)
                  </label>
                  <input
                    id='message-settings--replace'
                    type='checkbox'
                    checked={messageSettings.replace}
                    onChange={this.toggleReplace}
                    placeholder='Value'
                    className='input input-group__input'
                    />
                </div>

                <div className='input-group input-group--settings'>
                  <label
                    className='input-group__label input-group__label--long'
                    htmlFor='message-settings--delete'
                    >
                    Delete original (2)
                  </label>
                  <input
                    id='message-settings--delete'
                    type='checkbox'
                    checked={messageSettings.delete}
                    onChange={this.toggleDelete}
                    placeholder='Value'
                    className='input input-group__input'
                    />
                </div>
                <div className='input__helptext'>1) Slash commands and action responses ONLY</div>
                <div className='input__helptext'>2) Action responses ONLY</div>
              </Accordion>

              <Reactions
                reactions={messageReactions}
                onAddReaction={this.addReaction}
                onRemoveReaction={this.removeReaction}
                onEditReaction={this.editReaction}
                onMoveReaction={this.moveReaction}
                />
            </div>

            <div className='builder__message-attachments'>
              {
                attachments.length
                ? attachments.map(this.mapAttachmentsToView.bind(this))
                : emptyState
              }
              {attachments.length > 0 && (
                <div
                  className='builder__message-add-attachment icon-plus'
                  onClick={this.addAttachment.bind(this)}
                  />
              )}
            </div>
          </div>
        </div>
        <div className='builder__controls'>
          <Alert
            isGlobal={false}
            show={this.state.showAlert && !!this.props.attachmentErrors.length}
            dismissable
            onClick={this.toggleAlert.bind(this)}
            title='Attachment validation error!'
            type='error'
            >
            <pre>
              {this.props.attachmentErrors && this.props.attachmentErrors.map((attachmentError, i) => (
                <div key={`attach-${i}`}>
                  {
                    attachmentError.errors.map((error, i) => (
                      <div key={`error-${i}`}>{error}</div>
                    ))
                  }
                </div>
              ))}
            </pre>
          </Alert>

          {!!this.props.attachmentErrors.length && (
            <div
              className='btn btn--small icon-alert-triangle btn--naked toggle-alert'
              onClick={this.toggleAlert.bind(this)}
              />
          )}

          <div
            className='btn btn--small'
            onClick={this.cancelBuilder.bind(this)}
            >
            Cancel
          </div>
          <div>

            {this.state.error && (
              <div
                className='btn btn--small builder__alerts toggle-alert icon-alert-triangle'
                onClick={this.toggleAlert.bind(this)}
                />
            )}
            <div
              className='btn btn--small btn--primary'
              onClick={this.save.bind(this)}
              >
              Save
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  let { meta, messageSettings, messageReactions, users, bot, stories } = state;
  const DEFAULT_CHANNELS = [ 'random', 'general', 'development', 'design' ];
  const channelNames = [...DEFAULT_CHANNELS, ...Object.keys(stories)];
  const botHandle = bot.handle.substr(1, bot.handle.length);
  const validatedAttachments = getValidatedAttachments(state);

  bot = { text: botHandle, value: botHandle, active: true, type: 'user', url: bot.url, emoji: bot.emoji };
  users = users.filter(u => !u.deleted).map(user => {
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
  return {
    meta,
    attachments: validatedAttachments.attachments,
    attachmentErrors: validatedAttachments.errors,
    messageActions: state.messageActions,
    messageSettings,
    messageReactions,
    story: stories[ownProps.storyId],
    users: [...users, bot],
    isAddingCopy: state.messageTriggerActions.getIn(['trigger', 'key']) === 'replace',
    channels: channelNames.map(channel => {
      return {
        text: channel,
        value: channel,
        type: 'channel'
      };
    })
  };
};

export default connect(mapStateToProps)(Builder);
