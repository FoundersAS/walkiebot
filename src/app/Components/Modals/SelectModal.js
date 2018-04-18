'use strict';
import '../../../stylesheets/modal.scss';
import '../../../stylesheets/modal-select.scss';

import React from 'react';

class SelectModal extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      selected: this.props.selectedId
    };
  }

  componentDidMount () {
    window.addEventListener('keyup', this.props.closeOnEscape);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.props.closeOnEscape);
  }

  render () {
    const {
      onClick,
      onCancel,
      stories
    } = this.props;

    return (
      <div className='modal modal--select'>
        <div className='modal__backdrop' onClick={onCancel}></div>

        <div className='modal__container'>
          <div className='modal__content'>
            Choose which story to duplicate the message to:
            <select
              value={this.state.selected}
              onChange={(e) => this.setState({ selected: e.target.value })}
              >
              {Object.keys(stories).map((story, idx) => (
                <option
                  key={idx}
                  value={story}
                  >
                  {stories[story].name}
                </option>
              ))}
            </select>
          </div>
          <div className='modal__footer'>
            <div
              className='btn btn--naked btn--default'
              onClick={onCancel}
              >
              cancel
            </div>
            <div
              className='btn btn--naked btn--primary'
              onClick={() => onClick(this.state.selected)}
              >
              ok
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SelectModal;
