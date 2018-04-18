'use strict';
import '../../stylesheets/alert.scss';

import React from 'react';
import classNames from 'classnames';

const SystemAlert = ({
  notifications,
  onClick
}) => (
  <div className={classNames('system-alerts', { 'system-alerts--show': notifications.size })}>
    {notifications.map(notification => {
      return (
        <div
          key={notification.get('notificationId')}
          className='system-alert'
          >
          <div className='system-alert__inner'>
            <span className='system-alert__title'>A message from Walkie</span>
            <span className='system-alert__message'>{notification.get('message')}</span>
          </div>
          <div
            className='system-alert__close-btn icon-cross'
            onClick={() => onClick(notification.get('notificationId'))}
            />
        </div>
      );
    })}
  </div>
);

export default SystemAlert;
