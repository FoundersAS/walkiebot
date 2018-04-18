import '../../../stylesheets/inputs/inline-picker.scss';
import React from 'react';
import classNames from 'classnames';

class InlinePicker extends React.Component {
  render () {
    const { match, emojis, selected, onClick, onMouseOver } = this.props;

    return (
      <div className='inline-picker'>
        <div className='inline-picker__header'>
          <div className='inline-picker__header-info'>
            Emoji matching <span className='inline-picker__header--bold'>":{match}"</span>
          </div>
          <div className='inline-picker__header-meta'>
            <div className='inline-picker__header-meta-section'>
              <span className='inline-picker__header--bold'>tab</span> or
              <span className='inline-picker__header--bold'>up/down</span> to navigate
            </div>
            <div className='inline-picker__header-meta-section'>
              <span className='inline-picker__header--bold'>enter</span> to select
            </div>
            <div className='inline-picker__header-meta-section'>
              <span className='inline-picker__header--bold'>esc</span> to dismiss
            </div>
          </div>
        </div>
        <div className='inline-picker__list'>
          {emojis.map((emoji, idx) => (
            <div
              key={idx}
              onMouseOver={onMouseOver}
              data-idx={idx}
              onClick={e => onClick(emoji, e)}
              className={classNames('inline-picker__list-item', {
                'inline-picker__list-item--selected': idx === selected
              })}
              >
              {`${emoji.native}  ${emoji.colons}`}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default InlinePicker;
