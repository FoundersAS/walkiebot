'use strict';
import '../../stylesheets/header.scss';
import '../../stylesheets/select.scss';

import classNames from 'classnames';
import React from 'react';

import InlineInput from './Inputs/InlineInput';

class Header extends React.Component {
  constructor (props) {
    super(props);

    this.toggleHeaderOptions = this.toggleHeaderOptions.bind(this);

    this.state = {
      showUpdateDescriptionInput: false,
      showUpdateNameInput: false,
      showHeaderOptions: false
    };
  }

  updateDescriptionBlurHandler (e) {
    e.which = 13;
    this.props.updateDescriptionHandler(e);
    this.setState({ showUpdateDescriptionInput: false });
  }

  updateNameBlurHandler (e) {
    e.which = 13;
    this.props.updateStoryNameHandler(e);
    this.setState({ showUpdateNameInput: false });
  }

  toggleHeaderOptions () {
    this.setState({ showHeaderOptions: !this.state.showHeaderOptions });
  }

  render () {
    const {
      name,
      description,
      updateStoryNameHandler,
      updateDescriptionHandler,
      deleteHandler,
      importHandler,
      duplicateHandler,
      exportHandler
    } = this.props;
    const updateDescriptionInput = (
      <InlineInput
        onKeyUp={updateDescriptionHandler}
        onBlur={this.updateDescriptionBlurHandler.bind(this)}
        defaultValue={description || ''}
        placeholder='Add description'
        />
    );
    const updateNameInput = (
      <InlineInput
        onKeyUp={updateStoryNameHandler}
        onBlur={this.updateNameBlurHandler.bind(this)}
        defaultValue={name}
        />
    );

    return (
      <div className='header'>
        <div className='header__meta'>
          <div
            className={classNames('header__name', {
              'header__name--edit': this.state.showUpdateNameInput
            })}
            onClick={() => this.setState({ showUpdateNameInput: true })}
            >
            {
              this.state.showUpdateNameInput
              ? updateNameInput
              : name
            }
          </div>
          <div
            className={classNames('header__description', {
              'header__description--edit': this.state.showUpdateDescriptionInput
            })}
            onClick={() => this.setState({ showUpdateDescriptionInput: true })}
            >
            {
              this.state.showUpdateDescriptionInput
              ? updateDescriptionInput
              : description || 'Add description'
            }
          </div>
        </div>

        <div className='header__controls'>
          <div className='select select--right'>
            <div
              className='select__trigger btn btn--small icon-dots-three-horizontal'
              onClick={this.toggleHeaderOptions}
              >
              {this.state.showHeaderOptions && (
                <div className='select__options'>
                  <div className='select__backdrop' />
                  <div
                    className='select__option'
                    onClick={importHandler}
                    >
                    <div className='select__option-icon icon-inbox'></div>
                    Import JSON
                  </div>
                  <div
                    className='select__option'
                    onClick={exportHandler}
                    >
                    <div className='select__option-icon icon-outbox'></div>
                    Export...
                  </div>
                  <div
                    className='select__option'
                    onClick={() => this.setState({ showUpdateNameInput: true })}
                    >
                    <div className='select__option-icon icon-pencil'></div>
                    Rename
                  </div>
                  <div
                    className='select__option'
                    onClick={duplicateHandler}
                    >
                    <div className='select__option-icon icon-stack-2'></div>
                    Duplicate
                  </div>
                  <div
                    className='select__option'
                    onClick={deleteHandler}
                    >
                    <div className='select__option-icon icon-trash'></div>
                    Delete
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Header;
