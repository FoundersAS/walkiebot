'use strict';
import '../../../stylesheets/attachments/image.scss';

import classNames from 'classnames';
import React from 'react';

class AttachmentImage extends React.Component {
  constructor (props) {
    super(props);

    this.onError = this.onError.bind(this);

    this.state = { loadError: false };
  }

  render () {
    const { url, hidden, caret } = this.props;

    return (
      <div>
        {caret}
        <div
          className={classNames('attachment-image__unfurl-image', {
            'attachment-image__unfurl-image--hidden': hidden,
            'attachment-image__unfurl-image--error': this.state.loadError
          })}
          style={{ backgroundImage: `url(${url})` }}
          >
          <a href={url} target='_blank'>
            <img
              onError={this.onError}
              onLoad={window.onimageload}
              className='message__attachment-image'
              src={!this.state.loadError ? url : 'https://drdaugjsbp9r4.cloudfront.net/apple/64/274c.png'}
              />
          </a>
        </div>
      </div>
    );
  }

  onError () {
    this.setState({ loadError: true });
  }
}

export default AttachmentImage;
