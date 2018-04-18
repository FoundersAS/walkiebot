'use strict';
import '../../../stylesheets/inputs/switch.scss';
import React from 'react';
import classNames from 'classnames';

class Switch extends React.Component {

  render () {
    const {
      checked,
      id
    } = this.props;

    return (
      <div className={classNames('switch', {
        'switch--on': !!checked
      })}>
        <input
          id={id}
          type='checkbox'
          className='switch__input'
          {...this.props}
          />
        <label htmlFor={id} />
      </div>
    );
  }
}

export default Switch;
