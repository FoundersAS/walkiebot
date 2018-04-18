'use strict';
import '../../../stylesheets/modal.scss';
import '../../../stylesheets/modal-action-confirmation.scss';
import '../../../stylesheets/slack-styles/slack-buttons.scss';

import React from 'react';

class ActionConfirmationModal extends React.Component {
  componentDidMount () {
    window.addEventListener('keyup', this.props.closeOnEscape);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.props.closeOnEscape);
  }

  render () {
    const {
      onClickCancel,
      onClick,
      title,
      text,
      okText,
      dismissText
    } = this.props;

    return (
      <div className='modal-action-confirmation'>
        <div className='modal-action-confirmation__container'>
          <div className='modal-action-confirmation__header'>
            <div className='modal-action-confirmation__title'>{title}</div>
            <div className='modal-action-confirmation__controls'>
              <div
                className='modal-action-confirmation__close'
                onClick={onClickCancel}
                >×</div>
            </div>
          </div>
          <div className='modal-action-confirmation__content'>
            {text}
          </div>
          <div className='modal-action-confirmation__footer'>
            <div
              className='slack-btn'
              onClick={onClickCancel}
              >
              {dismissText}
            </div>
            <div
              className='slack-btn slack-btn--primary'
              onClick={onClick}
              >
              {okText}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ActionConfirmationModal;
