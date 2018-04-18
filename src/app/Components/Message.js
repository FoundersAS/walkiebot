'use strict';
import '../../stylesheets/message.scss';

import React from 'react';
import Textarea from 'react-textarea-autosize';
import omitEmpty from 'omit-empty';
import classNames from 'classnames';

import Attachment from './MessageAttachments/Attachment';
import Reactions from './MessageAttachments/Reactions';

import SlackFormat from '../utils/slack-formatter';
import emoji from '../utils/emoji';
import { triggersToHuman } from '../utils/machine-to-human-maps';
import InlineUserSwitcher from './InlineUserSwitcher';

class Message extends React.Component {
  constructor (props) {
    super(props);

    this.handleTriggers = this.handleTriggers.bind(this);
    this.openDialogModal = this.openDialogModal.bind(this);

    this.state = {
      fallback: false,
      showSwitcher: false
    };
  }

  render () {
    const {
      message,
      messageId,
      messageIdx,
      removeMessage,
      exportHandler,
      duplicateHandler,

      ephemeral,

      actor,

      openMenuMessageIdx,
      openMenuAttachmentIdx,
      openMenuIdx,
      openMenuUpwards,

      openActionModal,
      updateEditMessage,
      updateEditMessageUser,
      startEditMessage,
      onKeyDown,

      editingMessageUser
    } = this.props;
    const editElement = (
      <div className='message__inline-controls'>
        <Textarea
          autoFocus
          className='message__inline-input'
          onChange={updateEditMessage}
          placeholder='Message text'
          defaultValue={message.slack.text}
          onKeyDown={onKeyDown}
          />
      </div>
    );

    const text = message.slack.text && (
      <div
        className={classNames('message__text', { 'message__text--ephemeral': message.slack.ephemeral })}
        dangerouslySetInnerHTML={{
          __html: emoji.unicodeToImage(SlackFormat(emoji.toUnicode(message.slack.text), message.bot, message.unfurls))
        }}
        />
    );
    const isEphemeral = (message.slack.ephemeral && !message.editing) || (message.editing && ephemeral) || (message.creating && ephemeral);
    const mostRecentlyEditedAttachment = message.slack.attachments &&
      message.slack.attachments.reduce((a, b) => a.lastUpdated > b.lastUpdated ? a : b, {});
    const mostRecentlyEditedAttachmentId = message.slack.attachments &&
      message.slack.attachments.indexOf(mostRecentlyEditedAttachment);

    const avatar = (
      <span
        className='message__avatar'
        style={{
          backgroundImage: actor.url ? `url(${actor.url})` : ''
        }}
        >
        {actor.url ? '' : actor.emoji}
      </span>
    );
    const userSwitcher = (
      <InlineUserSwitcher
        user={actor}
        currentUserIndex={editingMessageUser}
        users={this.props.users}
        onClick={updateEditMessageUser}
        />
    );

    const showUserSwitcherWhenEditing = (
      message.editing &&
      !message.bot &&
      this.props.users.filter(u => !u.deleted).length > 1
    );

    return (
      <div
        className={classNames('message', {
          'message--open': openMenuMessageIdx === messageId,
          'message--deleting': message.deletionInProgress
        })}
        ref={el => { this._message = el; }}
        data-id={message.messageId}
        >

        {showUserSwitcherWhenEditing ? userSwitcher : avatar}

        <div className='message__content'>
          <div className='message__meta'>
            <span className='message__name'>{actor.name}</span>
            {message.bot && (
              <span className='message__type'>APP</span>
            )}
            {message.type === 'dialog' && (
              <span className='message__type'>DIALOG</span>
            )}
            {message.creating && (
              <span className='message__type'>CREATING</span>
            )}
            {message.editing && (
              <span className='message__type'>EDITING</span>
            )}
            <span className='message__time'>{message.slack.time}</span>
            {isEphemeral && (
              <span className='message__ephemeral'>Only visible to you</span>
            )}
          </div>
          {message.type === 'dialog' && (
            <div className='message__text message__text--ephemeral message__text--dialog-text' onClick={this.openDialogModal}>
              Open dialog
            </div>
          )}
          {message.editing ? editElement : text}
          {this.state.fallback && message.slack.attachments && !!message.slack.attachments.length && message.slack.attachments.map((a, idx) => (
            <div key={idx} className='message__attachment'>{a.fallback}</div>
          ))}
          {!this.state.fallback && message.slack.attachments && !!message.slack.attachments.length && (
            <div className='message__attachment-group'>
              {message.slack.attachments && message.slack.attachments.map((attachment, idx) => {
                const blacklist = [
                  'attachment_type',
                  'fallback',
                  'callback_id',
                  'color',
                  'id',
                  'mrkdwn_in',
                  'storyId',
                  'pretext'
                ];
                const attachmentCopy = Object.assign({}, attachment);
                const showAttachment = Object.keys(omitEmpty(attachmentCopy))
                  .filter(k => blacklist.indexOf(k) === -1).length > 0;
                const triggers = message.actions.filter(action => action.source.attachment === idx);

                return (
                  <Attachment
                    key={idx}
                    messageIdx={messageIdx}
                    attachmentId={idx}
                    ephemeral={isEphemeral}
                    attachment={attachment}
                    messageId={messageId}

                    triggers={triggers}
                    handleTriggers={this.handleTriggers}

                    unfurls={message.unfurls}

                    openMenuAttachmentIdx={openMenuAttachmentIdx}
                    openMenuMessageIdx={openMenuMessageIdx}
                    openMenuIdx={openMenuIdx}
                    openMenuUpwards={openMenuUpwards}
                    toggleMessageMenu={this.props.toggleMessageMenu}
                    cancelMessageMenu={this.props.cancelMessageMenu}

                    openActionModal={openActionModal}
                    parser={text => emoji.unicodeToImage(SlackFormat(emoji.toUnicode(text), true))}
                    showAttachment={showAttachment}
                    editingMessageId={this.props.editingMessageId}
                    mostRecentlyEditedAttachmentId={mostRecentlyEditedAttachmentId}
                    lastOpenedBuilder={this.props.lastOpenedBuilder}
                    scrollMessageListDelta={this.props.scrollMessageListDelta}
                    />
                );
              })}
            </div>
          )}
          {message.slack.reactions && message.slack.reactions.length > 0 && (
            <Reactions reactions={message.slack.reactions} />
          )}
        </div>
        <div className='message__controls'>
          {!message.creating && (
            <div className='message__controls-group'>
              <div className='message__controls-group-wrap'>
                <div className='message__controls-options'>
                  <div
                    className='message__control'
                    title='Duplicate'
                    onClick={() => duplicateHandler(messageId)}
                    >
                    <div className='message__control-icon icon-stack-2'></div>
                  </div>
                  <div
                    className='message__control'
                    onClick={() => this.setState({ fallback: !this.state.fallback })}
                    title={
                      this.state.fallback
                      ? 'Show rich'
                      : 'Show fallback'
                    }
                    >
                    <span className='message__control-icon icon-umbrella'></span>
                  </div>
                  <div
                    className='message__control'
                    onClick={() => exportHandler(messageId)}
                    title='Export'
                    >
                    <span className='message__control-icon icon-outbox'></span>
                  </div>
                  <div
                    className='message__control'
                    onClick={() => removeMessage(messageId)}
                    title='Delete'
                    >
                    <span className='message__control-icon icon-trash'></span>
                  </div>
                </div>
                <div
                  className='message__control message__control--trigger'
                  title='More'
                  >
                  <div className='message__control-icon icon-dots-three-horizontal'></div>
                </div>
              </div>
              <div
                className='message__control'
                title='Edit'
                onClick={() => startEditMessage(messageId)}
                >
                <span className='message__control-icon icon-pencil'></span>
              </div>
            </div>
          )}

          {message.creating && (
            <div
              className={classNames('message__controls-group', {
                'message__controls-group--is-copy': message.isCopy,
                'message__controls-group--actions': !message.isCopy
              })}>
              <div className='message__controls-actions-meta'>
                {message.bot && message.name}
                {!message.bot && (triggersToHuman[message.triggerType] || message.name)}
                {message.isCopy && `Copy of ${message.parentName}`}
                {!message.isCopy && message.creating && 'New message'}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  handleTriggers (triggers, e) {
    const { handleTriggers, messageId } = this.props;
    handleTriggers(messageId, triggers, e);
  }

  openDialogModal () {
    this.props.openDialogModal(this.props.message);
  }
}

export default Message;
