'use strict';
import '../../../stylesheets/modal.scss';

import React from 'react';
import classNames from 'classnames';

class Modal extends React.Component {
  componentDidMount () {
    if (!this.props.closeOnEscape) return;
    window.addEventListener('keyup', this.props.closeOnEscape);
  }

  componentWillUnmount () {
    if (!this.props.closeOnEscape) return;
    window.removeEventListener('keyup', this.props.closeOnEscape);
  }

  onClick = () => {
    if (!this.props.onClick) return;
    this.props.onClick();
  }

  render () {
    const {
      children,
      onClick,
      title,
      noHeader,
      fullWidth
    } = this.props;

    return (
      <div
        className={classNames('modal', {
          'modal--clean': noHeader
        })}
        onClick={onClick}
        >
        <div className={classNames('modal__container', { 'modal__container--full-width': fullWidth })}
          onClick={(e) => {
            e.stopPropagation();
          }}>
          {!noHeader && (
            <div className='modal__header'>
              <div className={classNames('modal__header-title', { 'modal__header-title--bigger': fullWidth })}>{title}</div>
              <div className='modal__header-controls'>
                <div
                  className='btn btn--naked btn--icon icon-cross'
                  onClick={onClick}
                  />
              </div>
            </div>
          )}
          <div className='modal__content'>
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
