'use strict';
import '../../../stylesheets/attachments/image-caret.scss';

import React from 'react';
import classNames from 'classnames';
import filesize from '../../utils/filesize';

class ImageCaret extends React.PureComponent {
  render () {
    const { size, open, onClick, block } = this.props;
    return (
      <span className={classNames('attachment__image-caret', { 'attachment__image-caret--block': block })}>
        ({filesize(size)})
        <span
          className={classNames('attachment__image-caret-icon icon-caret', {
            'attachment__image-caret-icon--closed': !open
          })}
          onClick={onClick}
          />
      </span>
    );
  }
}

export default ImageCaret;
