'use strict';
import '../../stylesheets/input.scss';
import '../../stylesheets/builder.scss';

import classNames from 'classnames';
import { connect } from 'react-redux';
import React from 'react';
import Textarea from 'react-textarea-autosize';
import { emojiIndex, Picker } from 'emoji-mart';

import Builder from './MessageBuilder/Builder';
import BuilderDialog from './MessageBuilder/BuilderDialog';
import InlinePicker from './Inputs/InlinePicker';
import UserSwitcher from './Inputs/UserSwitcher';
import { updateCurrentMessage } from '../redux/ducks/stories';
import { openBuilder } from '../redux/ducks/builder';

class Input extends React.Component {
  constructor (props) {
    super(props);

    this.toggleBuilder = this.toggleBuilder.bind(this);
    this.togglePicker = this.togglePicker.bind(this);
    this.toggleInlinePicker = this.toggleInlinePicker.bind(this);
    this.appendEmoji = this.appendEmoji.bind(this);
    this.replaceWithEmoji = this.replaceWithEmoji.bind(this);

    this.inlinePickerOnMouseOver = this.inlinePickerOnMouseOver.bind(this);
    this.textAreaOnKeyDown = this.textAreaOnKeyDown.bind(this);

    this.handleContextClickBot = this.handleContextClickBot.bind(this);
    this.handleContextClickUser = this.handleContextClickUser.bind(this);

    this.showSwitcher = this.showSwitcher.bind(this);
    this.hideSwitcher = this.hideSwitcher.bind(this);
    this.toggleSwitcher = this.toggleSwitcher.bind(this);
    this.setRefForTextarea = this.setRefForTextarea.bind(this);

    this.state = {
      showPicker: false,
      showInlinePicker: false,
      match: '',
      emojis: [],
      selected: 0,
      showSwitcher: false,
      showTriggerMenu: false
    };
  }

  setRefForTextarea (el) {
    this._textarea = el;
    this.props.setRef(el);
  }

  showSwitcher () {
    this.setState({ showSwitcher: true });
  }

  hideSwitcher () {
    this.setState({ showSwitcher: false });
  }

  toggleSwitcher () {
    if (this.props.builder.open) return;
    this.setState({ showSwitcher: !this.state.showSwitcher });
  }

  textAreaOnKeyDown (e) {
    // 13 = enter
    // 27 = escape
    // 38 = up arrow
    // 40 = down arrow
    // 39 = right arrow
    // 37 = left arrow
    // 9 = tab
    const { selected, showInlinePicker, emojis } = this.state;
    const nextItem = [9, 39, 40];
    const prevItem = [37, 38];
    if (!showInlinePicker && e.keyCode === 13) return this.props.onkeypress(e);
    if (nextItem.includes(e.keyCode)) {
      if (emojis.length - 1 > selected) {
        e.preventDefault();
        this.setState({ selected: selected + 1 });
        return;
      }
    }
    if (prevItem.includes(e.keyCode)) {
      if (selected > 0) {
        e.preventDefault();
        this.setState({ selected: selected - 1 });
        return;
      }
    }
    if (showInlinePicker && e.keyCode === 27) return this.toggleInlinePicker();
    if (e.keyCode === 13 || (e.keyCode === 9 && emojis.length === 1)) {
      e.preventDefault();
      this.replaceWithEmoji(emojis[selected], e);
    }
  }

  inlinePickerOnMouseOver (e) {
    this.setState({
      selected: parseInt(e.target.getAttribute('data-idx'), 10)
    });
  }

  toggleBuilder (event) {
    const { dispatch, chatContext, inputDisabledDueToLoading } = this.props;
    if (inputDisabledDueToLoading) return;
    dispatch(openBuilder(chatContext.chatContext === 'bot'));
  }

  togglePicker (e) {
    this.setState({ showPicker: !this.state.showPicker });
  }

  toggleInlinePicker (e) {
    if (this.state.showInlinePicker) this._textarea.focus();
    this.setState({ showInlinePicker: !this.state.showInlinePicker });
  }

  appendEmoji (emoji, event) {
    const { currentMessage, dispatch, storyId } = this.props;
    this.togglePicker();
    if (currentMessage) {
      dispatch(updateCurrentMessage(storyId, `${currentMessage} ${emoji.colons} `));
    } else {
      dispatch(updateCurrentMessage(storyId, `${emoji.colons} `));
    }
    this._textarea.focus();
  }

  replaceWithEmoji (emoji, event) {
    const { match } = this.state;
    const { currentMessage, dispatch, storyId } = this.props;
    this.toggleInlinePicker();
    dispatch(updateCurrentMessage(storyId, currentMessage.replace(`:${match}`, `${emoji.colons} `)));
    this._textarea.focus();
  }

  textChangeHandler (event) {
    const { dispatch, storyId } = this.props;
    const pattern = /(?::)((?:\w|-[^\s]){1,})$/;
    if (pattern.test(event.target.value)) {
      const match = event.target.value.match(pattern);
      const emojis = emojiIndex.search(match[1]);
      if (emojis.length) {
        this.setState({
          match: match[1],
          emojis: emojis,
          showInlinePicker: true,
          selected: 0
        });
      } else {
        this.setState({
          match: '',
          emojis: [],
          showInlinePicker: false
        });
      }
    } else {
      this.setState({
        match: '',
        emojis: [],
        showInlinePicker: false
      });
    }
    dispatch(updateCurrentMessage(storyId, event.target.value));
  }

  handleContextClickUser (idx) {
    this._textarea.focus();
    this.props.switchUserContext(idx);
    this.hideSwitcher();
  }

  handleContextClickBot () {
    this._textarea.focus();
    this.props.switchToBotContext();
    this.hideSwitcher();
  }

  render () {
    const {
      chatContext,
      bot,
      users,
      isEditing,
      messages,
      temporaryMessage,
      messagesWithChildren,
      inputDisabledDueToLoading,
      isAddingTrigger,
      cancelAddTrigger
    } = this.props;
    const { emojis, match, selected, showInlinePicker, showPicker } = this.state;
    const picker = (
      <Picker
        autoFocus
        title='WalkieMoji'
        emoji='robot_face'
        perLine={9}
        style={{
          position: 'absolute',
          bottom: '53px',
          right: '0px',
          width: '100%',
          boxShadow: '5px 5px 11px rgba(0, 0, 0, 0.5)'
        }}
        onClick={this.appendEmoji}
        />
    );

    const inlinePicker = (
      <InlinePicker
        match={match}
        emojis={emojis}
        onMouseOver={this.inlinePickerOnMouseOver}
        onClick={this.replaceWithEmoji}
        toggle={this.toggleInlinePicker}
        selected={selected}
        />
    );
    const isBot = chatContext.chatContext === 'bot';
    const selectedActor = isBot ? bot : users[chatContext.currentUserIdx];

    return (
      <div className='interaction-wrap'>
        <div className={classNames('chat', {
          'chat--disabled': inputDisabledDueToLoading
        })}>
          {showInlinePicker ? inlinePicker : null}
          <UserSwitcher
            show={this.state.showSwitcher}
            disabled={this.props.builder.open}
            toggleSwitcher={this.toggleSwitcher}
            selectedActor={selectedActor}
            chatContext={chatContext}
            users={users}
            hideBot={false}
            bot={bot}
            handleContextClickBot={this.handleContextClickBot}
            handleContextClickUser={this.handleContextClickUser}
            />
          {chatContext.chatContext !== 'bot' && messages.length === 0 && (
            <div
              className='select select--up'
              style={{ height: '42px', display: 'flex', alignItems: 'center' }}
              >
            </div>
          )}
          <Textarea
            className='chat__input-text'
            placeholder={'New message...'}
            autoFocus
            onKeyDown={this.textAreaOnKeyDown}
            onChange={this.textChangeHandler.bind(this)}
            value={this.props.currentMessage}
            ref={this.setRefForTextarea}
            />
          <div className='chat__meta'>
            <div className='chat__meta-posting-as'>
              Posting as: <b>{selectedActor.handle}</b>
            </div>
            <div className='chat__meta-special-formatting-tips'>
              <b>*bold*</b>&nbsp;
              <i>_italics_</i>&nbsp;
              ~strike~&nbsp;
              <code>`code`</code>&nbsp;
              <code className='preformatted'>```preformatted```</code>&nbsp;
              <span className='quote'>&gt; quote</span>
            </div>
          </div>

          {isAddingTrigger && (
            <div
              className='btn btn--small chat__cancel-trigger'
              onClick={cancelAddTrigger}
              >
               cancel
            </div>
          )}

          <span
            onClick={this.togglePicker}
            className='chat__button chat__button--emoji'
            >
            <span className='icon-emoji-happy' />
          </span>

          {showPicker && picker}
          {showPicker && (
            <div className='chat__picker-underlay' onClick={this.togglePicker} />
          )}

          {isBot && (
            <span
              onClick={this.toggleBuilder}
              className='chat__button chat__button--attach'
              >
              <span className='chat__button-icon icon-paper-clip' />
            </span>
          )}
        </div>

        <div className='attachments'>
          {this.props.builder.isAttachments && (
            <Builder
              messagesWithChildren={messagesWithChildren}
              temporaryMessage={temporaryMessage}
              saveAttachments={this.props.saveAttachments}
              isBot={this.props.builder.isBot}
              cancel={this.props.cancelBuilder}
              isEditing={isEditing}
              storyId={this.props.storyId}
              />
          )}
          {this.props.builder.isDialog && (
            <BuilderDialog
              save={this.props.saveDialog}
              />
          )}
        </div>
      </div>
    );
  }
}

export default connect(({ stories, builder, bot, users, chatContext, messageTriggerActions }, ownProps) => {
  return {
    currentMessage: stories[ownProps.storyId].currentMessage,
    isEditing: !!stories[ownProps.storyId].editingMessageId,
    builder,
    bot,
    users,
    chatContext,
    isAddingTrigger: messageTriggerActions.get('isAdding')
  };
})(Input);
