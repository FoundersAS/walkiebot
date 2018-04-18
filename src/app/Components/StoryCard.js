import '../../stylesheets/story-card.scss';
import React from 'react';
import classNames from 'classnames';
import AvatarsLoader from './Loaders/Avatars';

require('../../static/illustrations/storycard-illustration-1.png');

class StoryCard extends React.Component {
  constructor (props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.duplicateStory = this.duplicateStory.bind(this);
    this.deleteStory = this.deleteStory.bind(this);
  }

  render () {
    const { story } = this.props;
    const showLoader = story.deletionInProgress || story.duplicationInProgress;
    const loaderText = story.deletionInProgress ? 'Deleting' : 'Duplicating';

    return (
      <div
        className='story-card story-card--card'
        onClick={this.onClick}
        >
        <div
          className={classNames('story-card__inner', {
            'story-card__inner--disabled': showLoader
          })}
          >
          <div className='story-card__image story-card__image--1'
            style={{
              backgroundImage: 'url(../../static/illustrations/storycard-illustration-1.png)'
            }}
            />
          <div className='story-card__title'>{story.name}</div>
          <div className='story-card__no-messages'>No. of messages {story.messageCount}</div>
          <div className='story-card__tools'>
            <span className='story-card__duplicate icon-stack-2' onClick={this.duplicateStory} />
            <span className='story-card__delete icon-trash' onClick={this.deleteStory} />
          </div>
        </div>
        <AvatarsLoader show={showLoader} text={loaderText} />
      </div>
    );
  }

  onClick (e) {
    e.stopPropagation();
    const { story, storyId, onClick } = this.props;
    if (story.duplicationInProgress || story.deletionInProgress) return;
    onClick(storyId, e);
  }

  duplicateStory (e) {
    e.stopPropagation();
    const { story, storyId, duplicateStory } = this.props;
    if (story.duplicationInProgress || story.deletionInProgress) return;
    duplicateStory(storyId, e);
  }

  deleteStory (e) {
    e.stopPropagation();
    const { story, storyId, deleteStory } = this.props;
    if (story.duplicationInProgress || story.deletionInProgress) return;
    deleteStory(storyId, e);
  }
}

export class StoryCardAdd extends React.Component {
  constructor (props) {
    super(props);

    this.onKeyUp = this.onKeyUp.bind(this);
    this.onCreateStory = this.onCreateStory.bind(this);

    this.onClick = this.onClick.bind(this);
    this.setRef = this.setRef.bind(this);

    this.state = {
      storyName: ''
    };
  }

  render () {
    const { autoFocus, isCard } = this.props;
    return (
      <div
        className={classNames('story-card story-card--form', {
          'story-card--list-item': !isCard
        })}
        onClick={this.onClick}
        >
        <div className='story-card__form-inner'>
          <label className='story-card__form-label'>Story name</label>
          <input
            placeholder='Ex. Invite flow'
            type='text'
            className='story-card__form-input'
            ref={this.setRef}
            autoFocus={autoFocus}
            onKeyUp={this.onKeyUp}
            />
        </div>
        <div className='btn btn--small btn--primary' onClick={this.onCreateStory}>Create Story</div>
      </div>
    );
  }

  onKeyUp (event) {
    if (event.which === 13) {
      if (event.target.value === '') return;
      event.target.blur();
      this.props.addStory(event);
      return;
    }
    this.setState({ storyName: event.target.value });
  }

  onCreateStory () {
    if (this.state.storyName === '') return;
    this.props.addStoryClick(this.state.storyName);
    this.setState({ storyName: '' });
  }

  onClick () {
    if (!this._input) return;
    this._input.focus();
  }

  setRef (el) {
    this._input = el;
  }
}

export default StoryCard;
