'use strict';
import '../../stylesheets/message-list.scss';

import React from 'react';

import Message from './Message';
import MessageEmpty from './MessageEmpty';
import MessageDialog from './MessageDialog';
import MessageLoading from './MessageLoading';

class MessageList extends React.Component {
  constructor (props) {
    super(props);

    this.scroll = this.scroll.bind(this);
    this.scrollDelta = this.scrollDelta.bind(this);

    this.mapMessagesToView = this.mapMessagesToView.bind(this);
    this.setRefMessageList = this.setRefMessageList.bind(this);
    this.setRefMessageListInner = this.setRefMessageListInner.bind(this);
  }

  componentDidMount () {
    if (!this.props.messages.length) return;

    setTimeout(this.scroll, 200);
  }

  componentDidUpdate () {
    if (this._shouldScroll) this.scroll();
  }

  componentWillReceiveProps (nextProps) {
    this._shouldScroll = false;
    if (nextProps.messages.length !== this.props.messages.length) this._shouldScroll = true;
  }

  render () {
    const {
      messages,
      bot,
      messageIsLoading
    } = this.props;
    const isEmpty = messages.length === 0;

    return (
      <div className='message-list' ref={this.setRefMessageList}>
        <div className='message-list__inner' ref={this.setRefMessageListInner}>
          {!isEmpty ? messages.map(this.mapMessagesToView) : <MessageEmpty bot={bot} />}
          {messageIsLoading && <MessageLoading />}
        </div>
      </div>
    );
  }

  setRefMessageList (el) {
    this._messageList = el;
  }

  setRefMessageListInner (el) {
    this._messageListInner = el;
  }

  scroll () {
    if (!this._messageList || this.props.isEditing) return;
    this._messageList.scrollTop = this._messageList.scrollHeight;
  }

  scrollDelta ({ x, y }) {
    this._messageList.scrollTop += y;
    this._messageList.scrollLeft += x;
  }

  mapMessagesToView (message, idx) {
    const {
      messages,

      removeMessage,
      exportHandler,
      duplicateMessage,

      handleTriggers,
      messageTriggerActions,

      openMenuMessageIdx,
      openMenuAttachmentIdx,
      openMenuIdx,
      openMenuUpwards,
      toggleMessageMenu,
      cancelMessageMenu,

      ephemeral,

      bot,
      users,

      openActionModal,
      openDialogModal,
      updateEditMessage,
      updateEditMessageUser,
      startEditMessage,
      editMessageOnKeyDown,
      moveMessage,

      editingMessageUser
    } = this.props;
    if (!message || message._replaced || message._deleted) return;
    /*
    ** Backwards compatability:
    ** In the old days a message would not contain a user field,
    ** it would just be bot: true/false, so we'll default to index 0 here
    */
    let user = users[message.user] || users[0];
    if (this.props.editingMessageId === message.messageId) {
      user = users[editingMessageUser];
    }
    const actor = message.bot ? bot : user;

    if (message.type === 'dialog') {
      return (
        <MessageDialog
          key={message.messageId}
          message={message}

          removeMessage={removeMessage}
          exportHandler={exportHandler}
          duplicateHandler={duplicateMessage}
          openDialogModal={openDialogModal}
          startEditMessage={startEditMessage}
          />
      );
    }

    return (
      <Message
        key={message.messageId}

        message={message}
        messageId={message.messageId}
        messageIdx={idx}

        removeMessage={removeMessage}
        exportHandler={exportHandler}
        duplicateHandler={duplicateMessage}

        handleTriggers={handleTriggers}
        messageTriggerActions={messageTriggerActions}

        ephemeral={ephemeral}

        users={users}
        bot={bot}

        actor={actor}

        openMenuMessageIdx={openMenuMessageIdx}
        openMenuAttachmentIdx={openMenuAttachmentIdx}
        openMenuIdx={openMenuIdx}
        openMenuUpwards={openMenuUpwards}
        toggleMessageMenu={toggleMessageMenu}
        cancelMessageMenu={cancelMessageMenu}

        openActionModal={openActionModal}
        updateEditMessage={updateEditMessage}
        updateEditMessageUser={updateEditMessageUser}
        editingMessageUser={editingMessageUser}
        startEditMessage={startEditMessage}
        onKeyDown={editMessageOnKeyDown}

        moveMessage={moveMessage}
        showUp={idx !== 0}
        showDown={idx !== messages.length - 1}
        editingMessageId={this.props.editingMessageId}
        lastOpenedBuilder={this.props.lastOpenedBuilder}
        scrollMessageListDelta={this.scrollDelta}
        />
    );
  }
}

export default MessageList;
