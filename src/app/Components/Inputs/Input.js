'use strict';
import React from 'react';
import Textarea from 'react-textarea-autosize';
import classNames from 'classnames';

class Input extends React.Component {
  render () {
    const {
      label,
      value,
      type,
      id,
      helptext,
      onChange,
      onBlur,
      autoFocus
    } = this.props;

    return (
      <div
        className={classNames('input-component', {
          'input-component--helptext': !!helptext
        })}>
        {type !== 'textarea' && (
          <input
            id={id}
            autoFocus={autoFocus}
            type={type || 'text'}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={classNames('input-component__input', {
              'input-component__input--has-value': !!value
            })}
            />
        )}

        {type === 'textarea' && (
          <Textarea
            id={id}
            autoFocus={autoFocus}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={classNames('input-component__input', {
              'input-component__input--has-value': !!value
            })}
            />
        )}

        {label && (
          <label
            className='input-component__label'
            htmlFor={id}
            >
            {label}
          </label>
        )}

        {helptext && (
          <span
            className='input-component__helptext'
            >
            {helptext}
          </span>
        )}
      </div>
    );
  }
}

Input.defaultProps = {
  onChange: () => {},
  onBlur: () => {},
  autoFocus: true
};

export default Input;
