import React from 'react';
import classNames from 'classnames';

import emoji from '../../utils/emoji';

class Reaction extends React.Component {
  constructor (props) {
    super(props);

    this.state = {};

    this.onClick = this.onClick.bind(this);
  }

  render () {
    const messageReactionClasses = classNames('message-reaction', {
      'message-reaction--active': this.props.isClicked
    });
    return (
      <div className={messageReactionClasses} onClick={this.onClick}>
        <span className='message-reaction__emoji' dangerouslySetInnerHTML={{ __html: emoji.toImage(this.props.emoji) }} />
        <span className='message-reaction__count'>{this.props.count}</span>
      </div>
    );
  }

  onClick () {
    this.props.onClick(this.props.emoji);
  }
}

class Reactions extends React.Component {
  constructor (props) {
    super(props);

    this.mapReactionsToiew = this.mapReactionsToiew.bind(this);
    this.onReactionClick = this.onReactionClick.bind(this);

    this.state = {};
  }

  render () {
    return (
      <div className='message-reactions'>
        {this.props.reactions.map(this.mapReactionsToiew)}
      </div>
    );
  }

  mapReactionsToiew (reaction, idx) {
    let { emoji, count } = reaction;
    let isClicked = false;
    if (this.state[emoji]) {
      count = parseInt(count, 10) + 1;
      isClicked = true;
    }

    return (
      <Reaction key={reaction.emoji} onClick={this.onReactionClick} emoji={emoji} count={count} isClicked={isClicked} />
    );
  }

  onReactionClick (emoji) {
    if (!this.state[emoji]) this.setState({ [emoji]: 1 });
    delete this.state[emoji];
    this.setState(Object.assign({}, this.state));
  }
}

export default Reactions;
