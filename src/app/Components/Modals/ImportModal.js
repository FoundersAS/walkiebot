'use strict';
import '../../../stylesheets/modal.scss';

import classNames from 'classnames';
import React from 'react';
import parseJson from 'parse-json';
import Alert from '../Alert';

import {
  message,
  dialog,
  dialogTextElement,
  dialogTextAreaElement,
  dialogSelectElement
} from '../../utils/validators';

class ImportModal extends React.Component {
  constructor (props) {
    super(props);

    this.onClickSave = this.onClickSave.bind(this);
    this.onContent = this.onContent.bind(this);

    this.state = {
      error: false,
      alert: '',
      json: '',
      type: 'message'
    };
  }

  componentDidMount () {
    window.addEventListener('keyup', this.props.closeOnEscape);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.props.closeOnEscape);
  }

  onContent (event) {
    try {
      if (!event.target.value) {
        return this.setState({ json: '', error: false, alert: '' });
      }
      const json = parseJson(event.target.value);
      if (Array.isArray(json)) throw new Error('Messages cannot be arrays. Walkie does not support importing multiple messages yet.');

      if (json.text || json.attachments) {
        message.validate(json, { stripUnknown: false }, (err, res) => {
          if (err) throw new Error(err.details.map(d => `${d.message} in "${d.path}"`).join('\n'));
          this.setState({ json: res, error: false, alert: '', type: 'message' });
        });
      } else {
        dialog.validate(json, { stripUnknown: false }, (err, res) => {
          if (err) throw new Error(err.details.map(d => `${d.message} in "${d.path}"`).join('\n'));
          const elementsErrors = json.elements.map(element => {
            const validators = {
              text: dialogTextElement,
              textarea: dialogTextAreaElement,
              select: dialogSelectElement
            };
            const validated = validators[element.type].validate(element, { allowUnknown: true, abortEarly: false });
            return validated.error && validated.error.message;
          }).filter(e => !!e);
          if (elementsErrors.length) throw new Error(elementsErrors.join('\n'));
          this.setState({ json: res, error: false, alert: '', type: 'dialog' });
        });
      }
    } catch (e) {
      this.setState({ error: true, alert: e.message });
    }
  }

  render () {
    const { onClick } = this.props;

    return (
      <div className='modal' onClick={onClick}>
        <div
          className='modal__container'
          onClick={(e) => {
            e.stopPropagation();
          }}
          >
          <div className='modal__header'>
            <div className='modal__header-title'>Import from slack's message builder</div>
            <div className='modal__header-controls'>
              <div
                className='btn btn--naked btn--icon icon-cross'
                onClick={onClick}
                />
            </div>
          </div>
          <div className='modal__content'>
            <textarea
              className='area--import'
              placeholder='Paste JSON here'
              onChange={this.onContent}
              onPaste={this.onContent}
              />
            <Alert
              show={this.state.error}
              title='Validation error'
              type='error'
              dismissable={false}
              >
              <pre dangerouslySetInnerHTML={{ __html: this.state.alert.replace(/\\n/, '<br />') }} />
              <strong><pre>If you still have problems, check out the help section in the menu</pre></strong>
            </Alert>
            <div className='modal__content-controls'>
              <div
                className={classNames({
                  'btn': true,
                  'btn--primary': true,
                  'btn--disabled': this.state.error || this.state.json === ''
                })}
                onClick={this.onClickSave}
                >
                Import
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  onClickSave () {
    this.props.onSave(this.state.json, this.state.type);
  }
}

export default ImportModal;
