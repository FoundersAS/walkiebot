import '../../../stylesheets/builder/reactions.scss';
import React from 'react';
import { Picker } from 'emoji-mart';
import classNames from 'classnames';

import Accordion from './Accordion';
import BuilderInput from '../Inputs/Input';
import emoji from '../../utils/emoji';

class Reactions extends React.Component {
  constructor (props) {
    super(props);

    this.togglePicker = this.togglePicker.bind(this);
    this.closePicker = this.closePicker.bind(this);
    this.onPickerClick = this.onPickerClick.bind(this);
    this.mapReactionsToView = this.mapReactionsToView.bind(this);

    this.state = {
      pickerOpen: false
    };
  }

  render () {
    const {
      accordionOpen,
      reactions,
      notEmpty
    } = this.props;

    return (
      <Accordion
        title='Reactions'
        open={accordionOpen || reactions.length > 0}
        notEmpty={reactions.length > 0}
        >
        <div className='input-group input-group--reactions'>
          {reactions.map(this.mapReactionsToView)}
        </div>

        <div className='builder__message-input--control'>
          <div
            className='btn btn--small btn--text-icon icon-plus'
            onClick={this.togglePicker}
            >Add reaction</div>
        </div>

        {this.state.pickerOpen && (
          <div className='builder-reaction__picker'>
            <Picker
              autoFocus
              onClick={this.onPickerClick}
              />
          </div>
        )}
      </Accordion>
    );
  }

  togglePicker () {
    this.setState({ pickerOpen: !this.state.pickerOpen });
  }

  closePicker () {
    this.setState({ pickerOpen: false });
  }

  onPickerClick (emoji, event) {
    this.closePicker();
    this.props.onAddReaction(emoji.colons);
  }

  mapReactionsToView (reaction, idx) {
    const showUp = idx !== 0;
    const showDown = idx !== this.props.reactions.length - 1;

    const moveUp = () => showUp && this.props.onMoveReaction(idx, -1);
    const moveDown = () => showDown && this.props.onMoveReaction(idx, 1);
    const removeHandler = () => this.props.onRemoveReaction(reaction.emoji);
    const changeHandler = (event) => this.props.onEditReaction(reaction.emoji, event.target.value);

    return (
      <div key={reaction.emoji}
        className='builder-reaction'>
        <div
          className='builder-reaction__image'
          dangerouslySetInnerHTML={{ __html: emoji.toImage(reaction.emoji) }}
          title={reaction.emoji}
          />
        <div
          className='builder-reaction__emoji'
          title={reaction.emoji}
          >
          <input value={reaction.emoji} />
        </div>

        <BuilderInput
          id={`reactions-${reaction.emoji}`}
          type='number'
          min={1}
          onChange={changeHandler}
          value={reaction.count}
        />

        <div className='builder-reaction__controls'>
          <div
            className={classNames('btn btn--small icon-arrow-up', {
              'btn--disabled': !showUp
            })}
            onClick={moveUp}
            />

          <div
            className={classNames('btn btn--small icon-arrow-down', {
              'btn--disabled': !showDown
            })}
            onClick={moveDown}
            />
          <div className='btn btn--small icon-trash' onClick={removeHandler} />
        </div>
      </div>
    );
  }
}

export default Reactions;
