'use strict';
import '../../stylesheets/message-loading.scss';

import classNames from 'classnames';
import React from 'react';

class MessageLoading extends React.Component {
  render () {
    return (
      <div className={classNames('message-loading', { 'message-loading--no-padding': this.props.noPadding })}>
        <svg className='message-loading-svg' viewBox='0 0 28 12'>
          <g id='message-loading-wrap' stroke='none' fillRule='evenodd'>
            <circle className='dot dot--1' cx='3' cy='9' r='3'></circle>
            <circle className='dot dot--2' cx='14' cy='9' r='3'></circle>
            <circle className='dot dot--3' cx='25' cy='9' r='3'></circle>
          </g>
        </svg>
      </div>
    );
  }
}

export default MessageLoading;
