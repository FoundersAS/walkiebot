import '../../stylesheets/story-card.scss';
import React from 'react';
import classNames from 'classnames';
import AvatarsLoader from './Loaders/Avatars';

class StoryListItem extends React.Component {
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
        className={classNames('story-card-list-item', { 'story-card-list-item--disabled': showLoader })}
        onClick={this.onClick}
        >
        <div
          className={classNames('story-card-list-item__inner', {
            'story-card-list-item__inner--disabled': showLoader
          })}
          >
          <div className='story-card-list-item__title'>{story.name}</div>
          <div className='story-card-list-item__no-messages'>No. of messages {story.messageCount}</div>
        </div>
        <div className='story-card-list-item__tools'>
          <div className='story-card-list-item__tool' onClick={this.duplicateStory}>
            <span className='story-card-list-item__duplicate icon-stack-2' />
          </div>
          <div className='story-card-list-item__tool' onClick={this.deleteStory}>
            <span className='story-card-list-item__delete icon-trash' />
          </div>
        </div>
        <AvatarsLoader show={showLoader} text={loaderText} />
      </div>
    );
  }

  onClick (e) {
    const { story, storyId, onClick } = this.props;
    e.stopPropagation();
    if (story.duplicationInProgress || story.deletionInProgress) return;
    onClick(storyId, e);
  }

  duplicateStory (e) {
    const { story, storyId, duplicateStory } = this.props;
    e.stopPropagation();
    if (story.duplicationInProgress || story.deletionInProgress) return;
    duplicateStory(storyId, e);
  }

  deleteStory (e) {
    const { story, storyId, deleteStory } = this.props;
    e.stopPropagation();
    if (story.duplicationInProgress || story.deletionInProgress) return;
    deleteStory(storyId, e);
  }
}

export class StoryListItemAdd extends React.Component {
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
    const { autoFocus } = this.props;
    return (
      <div
        className='story-card-list-item story-card-list-item--form'
        onClick={this.onClick}
        >
        <div className='input-component'>
          <input
            placeholder='Ex. Invite flow'
            type='text'
            className='input-component__input'
            ref={this.setRef}
            autoFocus={autoFocus}
            onKeyUp={this.onKeyUp}
            />
          <label className='input-component__label'>Story name</label>
        </div>
        <div className='story-card-list-item__form-btn' onClick={this.onCreateStory}>Create Story</div>
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

export default StoryListItem;
