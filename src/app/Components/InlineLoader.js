'use strict';
import '../../stylesheets/inline-loader.scss';
import React from 'react';

class InlineLoader extends React.Component {
  render () {
    const { rows } = this.props;

    return (
      <div className={`loader loader--rows-${rows}`}>
        <div className='loader__dots'>
          {[0, 1, 2, 3, 0, 1, 2, 3].map((number, idx) => (
            <img
              key={idx}
              className='loader__dot'
              src={`/static/illustrations/user-avatar--${number}.svg`}
              />
          ))}
        </div>
      </div>
    );
  }
}

InlineLoader.defaultProps = {
  rows: 3
};

export default InlineLoader;
