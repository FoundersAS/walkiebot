'use strict';
import '../../../stylesheets/modal.scss';
import '../../../stylesheets/tabs.scss';

import classNames from 'classnames';
import React from 'react';
import jsStringify from 'javascript-stringify';

class ExportModal extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      content: '',
      isJSON: 0
    };
  }

  toJS () {
    this.setState({
      content: jsStringify(this.props.content, null, 2),
      isJSON: 1
    });
  }

  toJSON () {
    this.setState({
      content: JSON.stringify(this.props.content, null, 2),
      isJSON: 0
    });
  }

  selectAll () {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(this._pre);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  deselectAll () {
    const selection = window.getSelection();
    selection.removeAllRanges();
  }

  componentDidMount () {
    window.addEventListener('keyup', this.props.closeOnEscape);
    this.toJSON();
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.props.closeOnEscape);
  }

  render () {
    const { onClick } = this.props;
    return (
      <div className='modal'>
        <div className='modal__backdrop' onClick={onClick}></div>

        <div className='modal__container'>
          <div className='modal__header'>
            <div className='modal__header-title'>Export</div>
            <div className='modal__header-controls'>
              <div
                className='btn btn--naked btn--icon icon-cross'
                onClick={onClick}
                />
            </div>
          </div>
          <div className='modal__content'>
            <div className='modal__content-controls'>
              <div
                className='btn btn--small'
                onClick={this.selectAll.bind(this)}
                >
                Select all
              </div>
              <div
                className='btn btn--small'
                onClick={this.deselectAll.bind(this)}
                >
                Deselect all
              </div>
            </div>
            <div className='tabs tabs--export'>
              <div className='tabs__selector' data-active-tab={this.state.isJSON}>
                <div className={classNames('tabs__selector-tab', {
                  'tabs__selector-tab--active': this.state.isJSON === 0
                })} onClick={this.toJSON.bind(this)}
                >
                  JSON
                </div>
                <div className={classNames('tabs__selector-tab', {
                  'tabs__selector-tab--active': this.state.isJSON === 1
                })} onClick={this.toJS.bind(this)}
                >
                  JS
                </div>
              </div>
            </div>
            <pre className='area--export' ref={(e) => { this._pre = e; }}>{this.state.content}</pre>
          </div>
        </div>
      </div>
    );
  }
}

export default ExportModal;
