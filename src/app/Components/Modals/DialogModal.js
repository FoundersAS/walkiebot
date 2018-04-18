'use strict';
import '../../../stylesheets/slack-styles/slack-dialog.scss';
import '../../../stylesheets/slack-styles/slack-buttons.scss';
import '../../../stylesheets/slack-styles/slack-forms.scss';

import React from 'react';
import classNames from 'classnames';

class DialogSelect extends React.Component {
  constructor (props) {
    super(props);

    this.toggleSelect = this.toggleSelect.bind(this);
    this.openSelect = this.openSelect.bind(this);
    this.closeSelect = this.closeSelect.bind(this);
    this.cancelSelect = this.cancelSelect.bind(this);

    this.search = this.search.bind(this);

    this.state = {
      open: false,
      selected: 'Choose an option...',
      search: ''
    };
  }

  render () {
    const { element } = this.props;
    const { open, selected, search } = this.state;

    if (!open) {
      return (
        <label className='dialog__label'>
          <div className='dialog__label-content'>{element.label}</div>
          <div className='slack__select-container'>
            <div
              className={classNames('slack__select', {
                'slack__select--with-hint': !!element.hint
              })}
              onClick={this.toggleSelect}
              >
              {selected}
            </div>
          </div>
          {element.hint && (
            <div className='slack__hint'>{element.hint}</div>
          )}
        </label>
      );
    }

    const options = element.options.filter(o => o.label.indexOf(search) >= 0);

    return (
      <label className='dialog__label'>
        <div className='dialog__label-content'>{element.label}</div>
        <div className='slack__select-container'>
          <input
            type='text'
            className={classNames('slack__select slack__select--text slack__input', {
              'slack__select--with-hint': !!element.hint
            })}
            value={search}
            placeholder='Choose an option...'
            onChange={this.search}
            />
        </div>
        <div className='slack__options'>
          <div className='slack__options-wrapper'>
            {!search && (
              <div
                className={classNames('slack__option', {
                  'slack__option--selected': selected === 'Choose an option...'
                })}
                title='Choose an option...'
                onClick={this.closeSelect}
                >
                Choose an option...
              </div>
            )}
            {options.map((option, idx) => (
              <div
                key={idx}
                className={classNames('slack__option', {
                  'slack__option--selected': selected === option.label
                })}
                title={option.label}
                onClick={this.closeSelect}
                >
                {option.label}
              </div>
            ))}
            {!options.length && (
              <div className='slack__option slack__option--empty-state'>
                No items matched <span>{search}</span>
              </div>
            )}
          </div>
        </div>
        {element.hint && (
          <div className='slack__hint'>{element.hint}</div>
        )}
      </label>
    );
  }

  search (e) {
    this.setState({ search: e.target.value });
  }

  toggleSelect () {
    this.setState({ open: !this.state.open });
  }

  openSelect () {
    this.setState({ open: true });
  }

  closeSelect (e) {
    this.setState({ open: false, search: '', selected: e.target.title });
  }

  cancelSelect () {
    this.setState({ open: false, search: '' });
  }
}

const DialogText = ({ element }) => (
  <label className='dialog__label'>
    <div className='dialog__label-content'>{element.label}</div>
    <input
      className={classNames('slack__input', {
        'slack__input--with-hint': !!element.hint
      })}
      required={!element.optional}
      maxLength={element.max_length}
      minLength={element.min_length}
      type={element.subtype}
      placeholder={element.placeholder}
      defaultValue={element.value}
      />
    {element.hint && (
      <div className='slack__hint'>{element.hint}</div>
    )}
  </label>
);

const DialogTextarea = ({ element }) => (
  <label className='dialog__label'>
    <div className='dialog__label-content'>{element.label}</div>
    <textarea
      className={classNames('slack__textarea', {
        'slack__textarea--with-hint': !!element.hint
      })}
      required={!element.optional}
      maxLength={element.max_length}
      minLength={element.min_length}
      type={element.subtype}
      placeholder={element.placeholder}
      defaultValue={element.value}
      />
    {element.hint && (
      <div className='slack__hint'>{element.hint}</div>
    )}
  </label>
);

class DialogModal extends React.PureComponent {
  componentDidMount () {
    window.addEventListener('keyup', this.props.closeOnEscape);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.props.closeOnEscape);
  }

  render () {
    const {
      dialog,
      bot,
      onClick,
      onClickCancel
    } = this.props;

    return (
      <div className='dialog'>
        <div className='dialog__backdrop' onClick={onClickCancel}></div>
        <div className='dialog__container'>
          <div className='dialog__header'>
            <div className='dialog__header-title'>
              <img className='dialog__header-title-icon' src={bot.url} />
              <div className='dialog__header-title-text'>
                {dialog.title}
              </div>
            </div>
            <div className='dialog__header-controls'>
              <div
                className='dialog__close-btn icon-cross'
                onClick={onClickCancel}
                />
            </div>
          </div>
          <div className='dialog__body'>
            <form onSubmit={this.noop}>
              {dialog.elements.map(this.mapElementsToView)}
            </form>
          </div>
          <div className='dialog__footer'>
            <div
              className='slack-btn'
              onClick={onClickCancel}
              >
              {'Cancel'}
            </div>
            <div
              className='slack-btn slack-btn--primary'
              onClick={onClick}
              >
              {dialog.submit_label}
            </div>
          </div>
        </div>
      </div>
    );
  }

  mapElementsToView (element, idx) {
    if (element.type === 'select') {
      return <DialogSelect key={idx} element={element} />;
    }
    if (element.type === 'text') {
      return <DialogText key={idx} element={element} />;
    }
    if (element.type === 'textarea') {
      return <DialogTextarea key={idx} element={element} />;
    }
    return <div>Not implemented! {JSON.stringify(element)}}</div>;
  }

  noop (e) {
    e.preventDefault();
  }
}

export default DialogModal;
