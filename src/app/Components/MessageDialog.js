'use strict';
import '../../stylesheets/message.scss';

import classNames from 'classnames';
import React from 'react';

const MessageControlTrigger = () => (
  <div
    className='message__control message__control--trigger'
    title='More'
    >
    <div className='message__control-icon icon-dots-three-horizontal'></div>
  </div>
);

const MessageControl = ({ title, icon, onClick }) => (
  <div
    className='message__control'
    title={title}
    onClick={onClick}
    >
    <span className={classNames('message__control-icon', `icon-${icon}`)}></span>
  </div>
);

class MessageDialog extends React.Component {
  constructor (props) {
    super(props);

    this.openDialogModal = this.openDialogModal.bind(this);

    this.duplicateMessage = this.duplicateMessage.bind(this);
    this.exportMessage = this.exportMessage.bind(this);
    this.removeMessage = this.removeMessage.bind(this);
    this.editMessage = this.editMessage.bind(this);
  }

  render () {
    const {
      message
    } = this.props;

    return (
      <div
        className='message message--dialog'
        ref={el => { this._message = el; }}
        data-id={message.messageId}
        >
        <div className='message__content'>
          <div className='message__text'>
            Dialog opens
            <span
              className='message__text--link'
              onClick={this.openDialogModal}
              >
              Show
            </span>
          </div>
        </div>
        <div className='message__controls'>
          {!message.creating && (
            <div className='message__controls-group'>
              <div className='message__controls-group-wrap'>
                <div className='message__controls-options'>
                  <MessageControl title='Duplicate' icon='stack-2' onClick={this.duplicateMessage} />
                  <MessageControl title='Export' icon='outbox' onClick={this.exportMessage} />
                  <MessageControl title='Delete' icon='trash' onClick={this.removeMessage} />
                </div>
                <MessageControlTrigger />
              </div>
              <MessageControl title='Edit' icon='pencil' onClick={this.editMessage} />
            </div>
          )}
        </div>
      </div>
    );
  }

  duplicateMessage () {
    this.props.duplicateHandler(this.props.message.messageId);
  }

  exportMessage () {
    this.props.exportHandler(this.props.message.messageId);
  }

  removeMessage () {
    this.props.removeMessage(this.props.message.messageId);
  }

  editMessage () {
    this.props.startEditMessage(this.props.message.messageId);
  }

  openDialogModal () {
    this.props.openDialogModal(this.props.message);
  }
}

export default MessageDialog;
