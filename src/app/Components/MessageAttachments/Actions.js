'use strict';
import '../../../stylesheets/attachments/actions.scss';

import classNames from 'classnames';
import React from 'react';
import slug from 'slug';

import emoji from '../../utils/emoji';

class ActionButtonWithConfirm extends React.Component {
  constructor (props) {
    super(props);

    this.state = { showModal: false };
  }

  toggleModal () {
    this.setState({ showModal: !this.state.showModal });
  }

  render () {
    const {
      text,
      style,
      confirm,
      openActionModal,

      messageId,
      triggers
    } = this.props;
    const emojiText = emoji.toImage(text);

    return (
      <div
        onClick={e => openActionModal(confirm, messageId, triggers, e)}
        className={classNames({
          'action__button': true,
          'action__button--default': style !== 'danger' || style !== 'primary',
          'action__button--primary': style === 'primary',
          'action__button--danger': style === 'danger'
        })}
        >
        <span
          className='action__button-text'
          dangerouslySetInnerHTML={{ __html: emojiText }}
          />
      </div>
    );
  }
}

class ActionButton extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = {};
    this.onClick = this.onClick.bind(this);
  }

  render () {
    const {
      text,
      style
    } = this.props;
    const emojiText = emoji.toImage(text);

    return (
      <div
        className={classNames('action__button', {
          'action__button--default': style !== 'danger' || style !== 'primary',
          'action__button--primary': style === 'primary',
          'action__button--danger': style === 'danger'
        })}
        onClick={this.onClick}
        >
        <span
          className='action__button-text'
          dangerouslySetInnerHTML={{ __html: emojiText }}
          />
      </div>
    );
  }

  onClick (e) {
    if (!this.props.triggers.length) return;
    this.props.handleTriggers(this.props.triggers, e);
  }
}

class ActionSelectList extends React.Component {
  constructor (props) {
    super(props);

    this.filterOptions = this.filterOptions.bind(this);
    this.closeOnEscapeOrEnter = this.closeOnEscapeOrEnter.bind(this);
    this.renderOptions = this.renderOptions.bind(this);
    this.renderOptionGroups = this.renderOptionGroups.bind(this);
    this.renderUsersOptions = this.renderUsersOptions.bind(this);
    this.renderChannelsOptions = this.renderChannelsOptions.bind(this);
    this.renderConversationsOptions = this.renderConversationsOptions.bind(this);
    this.onClick = this.onClick.bind(this);

    this.state = { filter: '' };
  }

  componentDidMount () {
    window.addEventListener('keyup', this.closeOnEscapeOrEnter);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.closeOnEscapeOrEnter);
  }

  render () {
    const { options, optionGroups, dataSource } = this.props;
    const { filter } = this.state;
    let optionElements;
    if (options && (dataSource === 'static' || !dataSource)) {
      optionElements = this.renderOptions(options);
    }
    // Option groups supersedes options
    if (optionGroups && dataSource === 'static') {
      optionElements = this.renderOptionGroups(optionGroups);
    }

    if (dataSource === 'users') {
      optionElements = this.renderUsersOptions(options);
    }

    if (dataSource === 'channels') {
      optionElements = this.renderChannelsOptions(options);
    }

    if (dataSource === 'conversations') {
      optionElements = this.renderConversationsOptions(options);
    }

    if (dataSource === 'external') {
      optionElements = [];
    }

    return (
      <div className='action__select-list-container'>
        <div className='action__select-list-filter'>
          <input
            autoFocus
            onClick={e => e.stopPropagation()}
            onChange={this.filterOptions}
            onKeyUp={this.closeOnEscapeOrEnter}
            className='action__select-list-filter-input'
            placeholder='Filter list'
            />
        </div>
        <div className='action__select-list'>
          {optionElements}
          {!optionElements.length && (
            <div className='action__select-list-empty'>
              <div>No items matched <span className='action__select-list-filter-text'>{filter}</span></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  renderOptionGroups (optionGroups) {
    return optionGroups
      .map((optionGroup, idx) => {
        const options = this.renderOptions(optionGroup.options);
        const element = (
          <div
            key={idx}
            className='action__select-list-group'
            >
            <div
              className='action__select-list-group-text'
              dangerouslySetInnerHTML={{ __html: emoji.toImage(optionGroup.text) }}
              />
            {options}
          </div>
        );
        return options.length ? element : null;
      });
  }

  renderOptions (options) {
    return options
      .filter(opt => opt.text.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1)
      .map((option, idx) => {
        return (
          <div key={idx} className='action__select-list-item' data-value={option.text} onClick={this.onClick}>
            <div
              className='action__select-list-item-text'
              dangerouslySetInnerHTML={{ __html: emoji.toImage(option.text) }}
              />
            {option.description && (
              <div
                className='action__select-list-item-text action__select-list-item-text--description'
                dangerouslySetInnerHTML={{ __html: emoji.toImage(option.description) }}
                />
            )}
          </div>
        );
      });
  }

  renderUsersOptions (options) {
    return options
      .filter(opt => opt.text.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1)
      .map((option, idx) => {
        return (
          <div
            key={idx}
            className={classNames('action__select-list-item action__select-list-item--user', {
              'action__select-list-item--offline': !option.active
            })}
            onClick={this.onClick}
            data-value={`@${option.text}`}
            >
            <div className='action__select-list-item-avatar'
              style={{
                backgroundImage: option.url ? `url(${option.url})` : ''
              }}
              >
              {option.emoji}
            </div>
            <div className='action__select-list-item-text'>
              {option.text}
            </div>
            <div className='action__select-list-item-presence' />
          </div>
        );
      });
  }

  renderChannelsOptions (options) {
    return options
      .filter(opt => opt.text.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1)
      .map((option, idx) => {
        const text = slug(option.text).toLowerCase();
        return (
          <div key={idx} className='action__select-list-item' onClick={this.onClick} data-value={`#${text}`}>
            <div className='action__select-list-item-channel-icon'>#</div>
            <div className='action__select-list-item-text'>
              {text}
            </div>
          </div>
        );
      });
  }

  renderConversationsOptions (options) {
    return options
      .filter(opt => opt.text.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1)
      .map((option, idx) => {
        const text = slug(option.text).toLowerCase();
        if (option.type === 'channel') {
          return (
            <div key={idx} className='action__select-list-item' onClick={this.onClick} data-value={`#${text}`}>
              <div className='action__select-list-item-channel-icon'>#</div>
              <div className='action__select-list-item-text'>
                {text}
              </div>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className={classNames('action__select-list-item', {
              'action__select-list-item--offline': !option.active
            })}
            onClick={this.onClick}
            data-value={`@${text}`}
            >
            <div className='action__select-list-item-presence' />
            <div className='action__select-list-item-text'>
              {slug(option.text).toLowerCase()}
            </div>
          </div>
        );
      });
  }

  onClick (e) {
    if (!this.props.triggers.length) return;
    if (this.props.confirm) return;
    this.props.handleTriggers(this.props.triggers, e);
  }

  closeOnEscapeOrEnter (e) {
    if (e.which === 27 || e.which === 13) return this.props.close();
  }

  filterOptions (e) {
    this.setState({ filter: e.target.value });
  }
}

class ActionSelectStatic extends React.Component {
  constructor (props) {
    super(props);
    this.handleWheelEvent = this.handleWheelEvent.bind(this);
  }

  componentDidUpdate () {
    if (!this._backdrop) return;
    this._backdrop.addEventListener('wheel', this.handleWheelEvent);
  }

  componentWillUnmount () {
    if (!this._backdrop) return;
    this._backdrop.removeEventListener('wheel', this.handleWheelEvent);
  }

  handleWheelEvent (e) {
    this.props.scrollMessageListDelta && this.props.scrollMessageListDelta({ x: e.deltaX, y: e.deltaY });
  }

  render () {
    const {
      openUpwards,
      open,
      menuId,
      onClick,
      cancelMessageMenu,
      text,
      options,
      optionGroups,
      selectedOption,
      dataSource,
      confirm,
      triggers,
      handleTriggers
    } = this.props;

    const wrappedOnClick = e => onClick(menuId, confirm, triggers, e);

    return (
      <div
        className={classNames('action__select', {
          'action__select--show': open,
          'action__select--open-up': openUpwards  // Open down is default
        })}
        onClick={wrappedOnClick}
        >
        {open && (
          <div
            className='action__select-backdrop'
            onClick={cancelMessageMenu}
            ref={el => { this._backdrop = el; }}
            />
        )}
        <span className='action__select-text'>{selectedOption && selectedOption.text || text}</span>
        <span className='action__select-trigger icon-caret' />
        {open && (
          <ActionSelectList
            dataSource={dataSource}
            options={options}
            optionGroups={optionGroups}
            close={wrappedOnClick}
            handleTriggers={handleTriggers}
            triggers={triggers}
            confirm={confirm}
            />
        )}
      </div>
    );
  }
}

class ActionSelect extends React.PureComponent {
  render () {
    const {
      action,
      menuId,
      open,
      openUpwards,
      onClick,
      cancelMessageMenu,
      triggers,
      handleTriggers,
      actionIdx
    } = this.props;

    const { _selectedOption } = action;
    const hasOptions = !!action.options;
    const hasGroups = !!action.option_groups;
    let selectedOption = null;

    if (!Array.isArray(_selectedOption) && !_selectedOption !== null && _selectedOption >= 0 && hasOptions) {
      selectedOption = action.options[_selectedOption];
    }
    if (Array.isArray(_selectedOption) && hasGroups) {
      const [ groupId, optionId ] = _selectedOption;
      selectedOption = action.option_groups[groupId].options[optionId];
    }

    return (
      <ActionSelectStatic
        text={action.text}
        dataSource={action.data_source}
        options={action.options}
        optionGroups={action.option_groups}
        confirm={action.confirm}
        selectedOption={selectedOption}
        open={open}
        openUpwards={openUpwards}
        onClick={onClick}
        cancelMessageMenu={cancelMessageMenu}
        menuId={menuId}
        scrollMessageListDelta={this.props.scrollMessageListDelta}

        triggers={triggers}
        handleTriggers={handleTriggers}
        actionIdx={actionIdx}
        />
    );
  }
}

class Actions extends React.Component {
  constructor (props) {
    super(props);

    this.toggleMessageMenu = this.toggleMessageMenu.bind(this);

    this.addTrigger = this.addTrigger.bind(this);
  }

  render () {
    const {
      openMenuAttachmentIdx,
      openMenuMessageIdx,
      openMenuIdx,
      openMenuUpwards,
      attachmentIdx,
      messageIdx,
      messageId,

      triggers,
      handleTriggers,

      openActionModal,
      actions,
      cancelMessageMenu
    } = this.props;

    return (
      <div className='actions' ref={el => { this._actions = el; }}>
        {actions.map((action, idx) => {
          const actionTriggers = triggers.filter(t => t.source.action === idx);

          action = Object.assign({}, action);
          if (action.type === 'select') {
            const open = openMenuMessageIdx === messageIdx &&
                         openMenuAttachmentIdx === attachmentIdx &&
                         openMenuIdx === idx;

            return (
              <ActionSelect
                key={idx}

                triggers={actionTriggers}
                handleTriggers={handleTriggers}

                menuId={idx}
                open={open}
                openUpwards={openMenuUpwards}
                onClick={this.toggleMessageMenu}
                cancelMessageMenu={cancelMessageMenu}
                action={action}
                />
            );
          }
          if (action.confirm) {
            return (
              <ActionButtonWithConfirm
                key={idx}

                messageId={messageId}
                triggers={actionTriggers}

                openActionModal={openActionModal}
                {...action}
                />
            );
          }

          return (
            <ActionButton
              key={idx}

              triggers={actionTriggers}
              handleTriggers={handleTriggers}
              {...action}
              />
          );
        })}
      </div>
    );
  }

  toggleMessageMenu (menuId, confirm, triggers, e) {
    const openUpwards = (this._actions.getBoundingClientRect().top - 200) > 200;
    this.props.toggleMessageMenu(this.props.messageId, this.props.attachmentIdx, menuId, openUpwards, confirm, triggers, e);
  }

  addTrigger (key, actionIdx, e) {
    this.props.addTrigger(key, actionIdx, e);
  }
}

export default Actions;
