'use strict';
import '../../stylesheets/alert.scss';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Alert = ({
  title,
  message,
  isGlobal,
  show,
  dismissable,
  type,
  children,
  onClick
}) => (
  <div
    className={classNames('alert', `alert--${type}`, {
      'alert--show': show,
      'alert--dismissable': dismissable,
      'alert--global': isGlobal
    })}
    >
    <div className='alert__inner'>
      <span className='alert__title'>{title}</span>
      <span className='alert__message' dangerouslySetInnerHTML={{ __html: message }} />
      <div className='alert__content'>{children}</div>
    </div>
    <div
      className='alert__close-btn icon-cross'
      onClick={onClick}
      />
  </div>
);

Alert.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  isGlobal: PropTypes.bool,
  show: PropTypes.bool,
  dismissable: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  type: PropTypes.string
};

Alert.defaultProps = {
  title: 'Error',
  message: '',
  isGlobal: false,
  show: false,
  dismissable: true,
  type: 'error',
  onClick: () => {}
};

export default Alert;
