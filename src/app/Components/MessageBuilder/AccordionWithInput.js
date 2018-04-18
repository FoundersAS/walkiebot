'use strict';
import '../../../stylesheets/attachments/accordion-with-input.scss';

import classNames from 'classnames';
import React from 'react';

class AccordionWithInput extends React.Component {
  constructor (props) {
    super(props);

    this.toggleAccordion = this.toggleAccordion.bind(this);

    this.state = {
      open: this.props.openOnMount || false
    };
  }

  componentDidMount () {
    this._input.select();
  }

  render () {
    const {
      children,
      attachmentType,
      attachmentOption,
      attachmentPlaceholder,
      showUp,
      showDown,
      onClickUp,
      onClickDown,
      onClickRemove,
      value,
      onChange,
      onBlur,
      type,
      userState,
      hideDropdown
    } = this.props;

    const isMessageMenu = ['message-menu', 'conversations', 'channels', 'users', 'groups', 'normal', 'external'].indexOf(attachmentType) >= 0;
    return (
      <div className={
        classNames('accordion-with-input', {
          'accordion-with-input--open': this.state.open,
          'accordion-with-input--option': attachmentOption
        })}>

        <div className={classNames('accordion-with-input__header', {
          'no-icon': !attachmentType
        })}>

          <div
            className='accordion-with-input__toggle'
            onClick={this.toggleAccordion}
          />

          <input
            ref={el => { this._input = el; }}
            className='accordion-with-input__input'
            placeholder={attachmentPlaceholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            autoFocus
            />
          <span className='accordion-with-input__type'>{attachmentType}</span>

          <div
            className='accordion-with-input__controls'>
              <div
                className={classNames('btn btn--small icon-arrow-up',{
                  'btn--disabled': !showUp
                })}
                onClick={onClickUp}
              />

              <div
                className={classNames('btn btn--small icon-arrow-down',{
                  'btn--disabled': !showDown
                })}
                onClick={onClickDown}
                />
            <div
              onClick={onClickRemove}
              className='btn btn--small icon-trash' />
          </div>
        </div>

        <div className='accordion-with-input__wrap'>
          <div className='accordion-with-input__inner'>
            {children}
          </div>
        </div>
      </div>
    );
  }

  toggleAccordion () {
    this.setState({ open: !this.state.open });
  }
}

AccordionWithInput.defaultProps = {
  onBlur: () => {}
};

export default AccordionWithInput;
