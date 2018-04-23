'use strict';
import '../stylesheets/stories.scss';

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import classNames from 'classnames';
import slug from 'slug';

import { generateName, getHandle } from './utils/user-name';

import MessageLoading from './Components/MessageLoading';
import StoryCard, { StoryCardAdd } from './Components/StoryCard';
import StoryListItem, { StoryListItemAdd } from './Components/StoryListItem';
import Modal from './Components/Modals/Modal';
import Settings from './Settings';
import AvatarsLoader from './Components/Loaders/Avatars';

import {
  addStory,
  duplicateStory,
  removeStory
} from './redux/ducks/stories';
import { triggerNotification } from './redux/ducks/notification';
import {
  updateUserPropertyOffline,
  addUserOffline,
  removeUserOffline,
  USER_AVATARS
} from './redux/ducks/users';
import {
  deleteBot,
  updateBotProperty,
  DEFAULT_BOT
} from './redux/ducks/bot';
import {
  saveState,
  forkBot,
  migrateBotToTeam,
  saveLocalBot
} from './redux/actions';

class Stories extends React.Component {
  constructor (props) {
    super(props);

    // Functions related to stories
    this.addStory = this.addStory.bind(this);
    this.addStoryClick = this.addStoryClick.bind(this);
    this.duplicateStory = this.duplicateStory.bind(this);
    this.deleteStory = this.deleteStory.bind(this);
    this.onStoryClick = this.onStoryClick.bind(this);

    this.onSearchKeyDown = this.onSearchKeyDown.bind(this);
    this.searchStories = this.searchStories.bind(this);
    this.filterStories = this.filterStories.bind(this);
    this.sortStories = this.sortStories.bind(this);
    this.mapStories = this.mapStories.bind(this);

    this.toggleListView = this.toggleListView.bind(this);
    this.toggleCardsView = this.toggleCardsView.bind(this);

    // Functions related to users and the bot
    this.addUserOffline = this.addUserOffline.bind(this);
    this.removeUserOffline = this.removeUserOffline.bind(this);
    this.cancelSetUserAvatarUrl = this.cancelSetUserAvatarUrl.bind(this);
    this.startSetUserAvatarUrl = this.startSetUserAvatarUrl.bind(this);
    this.setUserAvatarUrlOffline = this.setUserAvatarUrlOffline.bind(this);
    this.updateBotPicture = this.updateBotPicture.bind(this);
    this.updateBotName = this.updateBotName.bind(this);
    this.saveNewBot = this.saveNewBot.bind(this);
    this.saveLocalBot = this.saveLocalBot.bind(this);

    this.migrateToTeamBot = this.migrateToTeamBot.bind(this);
    this.forkBot = this.forkBot.bind(this);
    this.deleteBot = this.deleteBot.bind(this);

    this.closeModalOnEscape = this.closeModalOnEscape.bind(this);

    this.toggleHeaderOptions = this.toggleHeaderOptions.bind(this);

    this.state = {
      showAddBotModal: true,
      showSettingsModal: false,
      canDeleteBot: false,
      showDeleteModal: false,
      showForkModal: false,
      showShareModal: false,
      addAvatarUrl: false,
      addAvatarUrlForIdx: null,
      showHeaderOptions: false,
      isForking: false,
      storySearch: '',
      storiesViewType: 'cards'
    };
  }

  toggleHeaderOptions () {
    this.setState({ showHeaderOptions: !this.state.showHeaderOptions });
  }

  componentDidMount () {
    try {
      const storiesViewType = window.localStorage.getItem('stories-view');
      this.setState({ storiesViewType: storiesViewType || 'cards' });
    } catch (e) {
      console.error('Could not get stories-view from localStorage', e);
    }
    if (!this.props.params.storyId) return;
    if (!this.props.meta.botId) return;
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.storyId === this.props.params.storyId) return;
    if (!this.props.meta.botId) return;
  }

  forkBot () {
    const { dispatch, bot, meta } = this.props;
    const localBotId = { localBotId: window.localStorage.getItem('localBotId') };
    const payload = Object.assign({}, localBotId, bot, meta);
    this.setState({ isForking: true });
    dispatch(forkBot(meta.botId, payload))
      .then(res => {
        const { botId, teamDomain } = res.data;
        window.location = `/redirect?title=It's a bot!&msg=Fork successful!&type=success&next=/${teamDomain}/${botId}`;
      });
  }

  onDeleteInputKeyDown (e) {
    if (e.which === 13) return this.deleteBot();
  }

  deleteBot () {
    if (!this.state.canDeleteBot) return;
    const { meta, dispatch, localBots, teamBots } = this.props;
    dispatch(deleteBot(meta.botId))
      .then(() => {
        if (meta.signedIn && !meta.isPublicBot) {
          const filteredBots = teamBots.filter(b => b.id !== meta.botId);
          if (filteredBots.length) {
            window.location.replace(`/${filteredBots[0].teamDomain}/${filteredBots[0].id}/settings`);
            return;
          }
          window.location.replace('/');
        } else {
          const filteredBots = localBots.bots.filter(b => b.id !== meta.botId);
          if (filteredBots.length) {
            window.location.replace(`/${filteredBots[0].teamDomain}/${filteredBots[0].id}/settings`);
            return;
          }
          window.location.replace('/');
        }
      })
      .catch(err => {
        dispatch(triggerNotification(
          'Uh oh! Error!',
          'Seems I had a problem deleting myself! I\'ve logged this with my people.',
          'error',
          10000
        ));
        throw err;
      });
  }

  closeModalOnEscape (e) {
    if (e.which === 27) {
      window.sessionStorage.removeItem('isAddingBot');
      this.setState({
        showAddBotModal: false,
        showSettingsModal: false,
        showDeleteModal: false,
        showShareModal: false,
        showForkModal: false
      });
    }
  }

  onDeleteInputChange (e) {
    const { bot } = this.props;
    const { value } = e.target;
    this.setState({ canDeleteBot: value === bot.name });
  }

  render () {
    const {
      stories,
      bot,
      users,
      meta,
      teamBots,
      localBots
    } = this.props;

    const shouldShowTeamWarning = meta.signedIn && !meta.botId && !window.sessionStorage.getItem('addingAnonBot');
    const addBotModal = (
      <Modal noHeader>
        <div className='modal__custom'>
          <div className='modal__custom-left'>

            {shouldShowTeamWarning && (
              <div className='modal__custom-header'>
                <div className='modal__custom-title'>Add new team bot</div>
                <div className='modal__custom-subtitle'>Bot will be avalible on the <strong>{meta.team.name}</strong> team.</div>
              </div>
            )}

            {!shouldShowTeamWarning && (
              <div className='modal__custom-header'>
                <div className='modal__custom-title'>Add new local bot</div>
                <div className='modal__custom-subtitle'>Bot will be avalible on your local machine.</div>
              </div>
            )}

            <button
              tabIndex={2}
              onClick={this.saveNewBot}
              className='btn btn--primary-light btn--large'
              >
              Let's go walkie
            </button>
          </div>
          <div className='modal__custom-right'>
            <div className='modal__custom-right-title'>Setup</div>
            <div className='modal__custom-right-desctiption'>Customize to fit your needs. Add more users, change names and avatars. Can also be changed via the settings anytime.</div>

            <div className='modal__custom-right-subtitle'>Bot</div>
            <div className='modal__custom-list'>
              <div className='modal__custom-list-item'>
                <div onClick={this.updateBotPicture}
                  className='settings__avatar'
                  style={{ backgroundImage: bot.url ? `url(${bot.url})` : '' }}
                  >
                  {bot.url ? '' : bot.emoji}
                  <span className='settings__avatar-mark'><span className='icon-plus' /></span>
                </div>
                <div className='list__content'>
                  <input
                    tabIndex={1}
                    value={bot.name}
                    onChange={this.updateBotName}
                    type='text'
                    maxLength='21'
                    className='input input--inline settings__input'
                    placeholder='Botname (Max 21 characters)'
                    />
                  <div className='settings__handle'>{bot.handle || '@handle'}</div>
                </div>
              </div>
            </div>

            <div className='modal__custom-right-subtitle'>Users</div>
            <div className='modal__custom-list'>
              {users.map((user, idx) => {
                if (user.deleted) return null;
                const userAvatarIdx = USER_AVATARS.indexOf(user.url);
                const { addAvatarUrl, addAvatarUrlForIdx } = this.state;
                return (
                  <div
                    className={classNames('modal__custom-list-item', {
                      open: addAvatarUrl && addAvatarUrlForIdx === idx
                    })}
                    key={idx}
                    >
                    <div className='selector__item-url-input'>
                      <input
                        autoFocus
                        type='url'
                        onKeyDown={(e) => this.setUserAvatarUrlOffline(e, idx)}
                        onBlur={this.cancelSetUserAvatarUrl}
                        className='input input--inline settings__input'
                        placeholder='Add url or emoji'
                        />
                      <span className='input-feedback' />
                    </div>
                    <div
                      className='settings__avatar settings__avatar--user selector__parent'
                      style={{ backgroundImage: user.url ? `url(${user.url})` : '' }}
                      >
                      {user.url ? '' : user.emoji}
                      <div className='selector selector--avatar'>
                        <div className={`selector__inner selector__inner--${userAvatarIdx}`}>
                          {USER_AVATARS.map((avatarUrl, avatarUrlIdx) => {
                            return (
                              <div
                                key={avatarUrlIdx}
                                onClick={() => this.setUserPictureOffline(idx, avatarUrl)}
                                className='selector__item'
                                >
                                <div
                                  className='settings__avatar'
                                  style={{ backgroundImage: `url('${avatarUrl}')` }}
                                  />
                              </div>
                            );
                          })}
                          <div
                            onClick={() => this.startSetUserAvatarUrl(idx)}
                            className='selector__item selector__item--url'
                            >
                            <span className='settings__avatar--icon icon-plus' />
                            <div
                              className='settings__avatar settings__avatar--add'
                              style={{ backgroundImage: `url('${userAvatarIdx === -1 ? user.url : undefined}')` }}
                              />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='list__content'>
                      <input
                        tabIndex={4 + idx}
                        value={user.name}
                        maxLength='21'
                        onChange={(e) => this.setUserNameOffline(idx, e)}
                        type='text'
                        className='input input--inline settings__input'
                        placeholder='Username (Max 21 characters)'
                        />
                      <div className='settings__handle'>
                        {user.handle || '@handle'}
                      </div>
                    </div>
                    <div
                      className='btn btn--naked btn--small list__action icon-cross'
                      onClick={() => this.removeUserOffline(idx)}
                      />
                  </div>
                );
              })}
              <div className='modal__custom-list-add-item' onClick={this.addUserOffline}>
                <div className='modal__custom-list-add-icon icon-plus'></div>
                <div className='modal__custom-list-add-text'>Add user</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );

    const settingsModal = (
      <Modal
        title='Bot settings'
        onClick={() => this.setState({ showSettingsModal: false })}
        closeOnEscape={this.closeModalOnEscape}
        >
        <Settings />
      </Modal>
    );

    const shareModal = (
      <Modal
        title='Share bot'
        onClick={() => this.setState({ showShareModal: false })}
        closeOnEscape={this.closeModalOnEscape}
        >
        <h3>Share with others</h3>
        <p>Everyone with the link can see all the stories. They will also be able to fork the bot and add, edit and delete stories.</p>
        <div className='input-group'>
          <label className='input-group__label' htmlFor='link'>Link</label>
          <input
            id='link'
            className='input input-group__input'
            type='text'
            defaultValue={`${window.location.origin}/${meta.teamDomain}/${meta.botId}`}
            />
        </div>
      </Modal>
    );

    const forkModal = (
      <Modal
        title='Fork bot'
        onClick={() => this.setState({ showForkModal: false })}
        closeOnEscape={this.closeModalOnEscape}
        >
        <h3>Let's make a bot</h3>
        <p>By forking a new bot is created with all current stories added. You will get a new url.</p>
        <button className='btn btn--primary' onClick={this.forkBot}>Fork this bot</button>
      </Modal>
    );

    const deleteModal = (
      <Modal
        title='DANGERZONE'
        onClick={() => this.setState({ showDeleteModal: false })}
        closeOnEscape={this.closeModalOnEscape}
        >
        <p>Enter the name of your bot (<strong>{bot.name}</strong>) to remove it.</p>
        <p><strong>WARNING:</strong> This cannot be undone!</p>
        <div className='input-group'>
          <input
            onChange={this.onDeleteInputChange.bind(this)}
            onKeyDown={this.onDeleteInputKeyDown.bind(this)}
            autoFocus
            type='text'
            className='input input-group__input'
            />
        </div>
        <div className='input-group'>
          <button
            onClick={this.deleteBot}
            className={classNames('btn', 'btn--danger', {
              'btn--disabled': !this.state.canDeleteBot
            })}
            >
            I mean it! Delete it!
          </button>
        </div>
      </Modal>
    );

    if (!stories) {
      return (
        <div className='story-loader'>
          <h3>Loading stories</h3>
          <p>Data is the breakfast of champions. Walkie will be ready soon.</p>
          <MessageLoading noPadding />
        </div>
      );
    }

    const isNewBot = !bot.initialized && this.state.showAddBotModal;
    const userHasBotLocally = localBots.bots.find(l => l.id === meta.botId);
    const teamHasBot = teamBots.find(t => t.id === meta.botId);
    const showMigrateBot = !teamHasBot && userHasBotLocally && meta.signedIn;
    const showSaveLocalBot = !userHasBotLocally && bot.initialized && !teamHasBot;
    return (
      <div className='stories__wrap'>

        <AvatarsLoader show={this.state.isForking} text={'Forking!'} overlay />

        {isNewBot && addBotModal}
        {this.state.showSettingsModal && settingsModal}
        {this.state.showDeleteModal && deleteModal}
        {this.state.showForkModal && forkModal}
        {this.state.showShareModal && shareModal}

        <div className='header header--overview'>
          <div className='bot-info__wrap'>
            <div className='bot-info'>
              <div className='bot-info__label'>Bot</div>

              <div className='bot-info__bot'>
                <div className='bot-info__name'>{bot.name}</div>
                <div
                  className='bot-info__avatar'
                  style={{
                    backgroundImage: `url(${bot.url})`
                  }}>
                  {meta.forkedFrom && <span className='bot-info__fork-indicator icon-fork' />}
                </div>
                <div className='bot-info__meta'>
                  <div className='bot-info__title' title={bot.name}>{bot.name}</div>
                  <div className='bot-info__handle' title={bot.handle}>{bot.handle}</div>
                </div>
              </div>
            </div>

            <div className='bot-info bot-info--users'>
              <div className='bot-info__label'>Users</div>
              {users.map((user, idx) => {
                if (user.deleted) return null;
                return (
                  <div
                    key={idx}
                    className='bot-info__user'>
                    <div className='bot-info__name'>{user.name}</div>
                    <div
                      className='bot-info__avatar bot-info__avatar--user'
                      style={{ backgroundImage: `url(${user.url})` }}
                      />
                  </div>
                );
              })}
            </div>
          </div>
          <div className='header__controls'>
            <div className='select select--right' title='More'>
              <div
                className='select__trigger btn btn--small icon-dots-three-horizontal'
                onClick={this.toggleHeaderOptions}
                >
                {this.state.showHeaderOptions && (
                  <div className='select__options'>
                    <div className='select__options'>
                      <div className='select__backdrop' />
                      <div
                        className='select__option'
                        onClick={() => this.setState({ showSettingsModal: true })}
                        >
                        <div className='select__option-icon icon-cog'></div>
                        Bot settings
                      </div>

                      {(meta.team.domain && meta.botId) && (
                        <div
                          className='select__option'
                          onClick={() => this.setState({ showForkModal: true })}
                          >
                          <div className='select__option-icon icon-fork'></div>
                          Fork bot
                        </div>
                      )}

                      {(!meta.isTeamBot && meta.botId) && (
                        <div
                          className='select__option'
                          onClick={() => this.setState({ showShareModal: true })}
                          >
                          <div className='select__option-icon icon-share'></div>
                          Share bot
                        </div>
                      )}

                      {showMigrateBot && (
                        <div
                          className='select__option'
                          onClick={this.migrateToTeamBot}
                          >
                          <div className='select__option-icon icon-outbox'></div>
                          Migrate to team bots
                        </div>
                      )}

                      {showSaveLocalBot && (
                        <div
                          className='select__option'
                          onClick={this.saveLocalBot}
                          >
                          <div className='select__option-icon icon-marquee-plus'></div>
                          Add to my bots
                        </div>
                      )}

                      <div
                        className='select__option select__option--danger'
                        onClick={() => this.setState({ showDeleteModal: true })}
                        >
                        <div className='select__option-icon icon-trash'></div>
                        Delete bot
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='stories__tools'>
          <input
            autoFocus
            placeholder='Search stories...'
            type='text'
            className='stories__search-input'
            onKeyDown={this.onSearchKeyDown}
            onChange={this.searchStories}
            value={this.state.storySearch}
            />

          <div
            className={classNames('stories__toggle icon-tiles', {
              'stories__toggle--active': this.state.storiesViewType === 'cards'
            })}
            onClick={this.toggleCardsView}
            />

          <div
            className={classNames('stories__toggle icon-menu', {
              'stories__toggle--active': this.state.storiesViewType === 'list'
            })}
            onClick={this.toggleListView}
            />
        </div>

        <div
          className={classNames('stories__list', {
            'stories__list--cards': this.state.storiesViewType === 'cards',
            'stories__list--list': this.state.storiesViewType === 'list'
          })}
          >
          {this.state.storiesViewType === 'cards' && (
            <StoryCardAdd
              addStory={this.addStory}
              addStoryClick={this.addStoryClick}
              isCard={this.state.storiesViewType === 'cards'}
              />
          )}
          {this.state.storiesViewType === 'list' && (
            <StoryListItemAdd
              addStory={this.addStory}
              addStoryClick={this.addStoryClick}
              isCard={this.state.storiesViewType === 'cards'}
              />
          )}
          {
            Object.keys(stories)
              .filter(this.filterStories)
              .sort(this.sortStories)
              .map(this.mapStories)
          }
        </div>
      </div>
    );
  }

  toggleListView () {
    this.setState({ storiesViewType: 'list' });
    try {
      window.localStorage.setItem('stories-view', 'list');
    } catch (e) {
      console.error('Could not set stories-view', e);
    }
  }

  toggleCardsView () {
    this.setState({ storiesViewType: 'cards' });
    try {
      window.localStorage.setItem('stories-view', 'cards');
    } catch (e) {
      console.error('Could not set stories-view', e);
    }
  }

  onSearchKeyDown (e) {
    const isEnter = e.which === 13;
    if (!isEnter) return;

    const { stories } = this.props;
    const searchedStories = Object.keys(stories).filter(this.filterStories);
    if (searchedStories.length === 1) {
      this.onStoryClick(searchedStories[0]);
    }
  }

  searchStories (e) {
    this.setState({ storySearch: e.target.value });
  }

  filterStories (storyId) {
    const { stories } = this.props;
    const story = stories[storyId];
    if (!story) return;
    const storyName = story.name;
    if (!storyName) return;
    return storyName.toLowerCase().indexOf(this.state.storySearch.toLowerCase()) !== -1;
  }

  sortStories (a, b) {
    return a.localeCompare(b);
  }

  mapStories (storyId) {
    const { stories } = this.props;
    if (this.state.storiesViewType === 'cards') {
      return (
        <StoryCard
          key={storyId}
          storyId={storyId}
          story={stories[storyId]}
          onClick={this.onStoryClick}
          duplicateStory={this.duplicateStory}
          deleteStory={this.deleteStory}
          />
      );
    }
    return (
      <StoryListItem
        key={storyId}
        storyId={storyId}
        story={stories[storyId]}
        onClick={this.onStoryClick}
        duplicateStory={this.duplicateStory}
        deleteStory={this.deleteStory}
        />
    );
  }

  onStoryClick (storyId) {
    const { router, meta } = this.props;
    router.push(`/${meta.teamDomain}/${meta.botId}/story/${storyId}`);
  }

  duplicateStory (storyId) {
    const { dispatch } = this.props;
    dispatch(duplicateStory(storyId));
  }

  deleteStory (storyId) {
    const { dispatch, stories } = this.props;
    if (!(storyId in stories)) return console.error('Story doesn\'t exist');
    const story = stories[storyId];

    if (window.confirm(`Are you sure you want to remove ${story.name}?`)) {
      dispatch(removeStory(storyId));
    }
  }

  addStory (event, value) {
    if (event.which === 27) return event.target.blur();
    if (event.which === 13) {
      if (event.target.value === '') return;
      const { dispatch, router, meta, stories } = this.props;
      const storyId = slug(event.target.value).toLowerCase();

      if (Object.keys(stories).find(s => s.toLowerCase() === storyId)) {
        dispatch(triggerNotification(
          'Error',
          'A story already exists with that name!',
          'error',
          10000
        ));
        return;
      }

      dispatch(addStory(storyId, event.target.value))
        .then(() => {
          router.push(`/${meta.team.domain}/${meta.botId}/story/${storyId}`);
        });
      event.target.blur();
    }
  }

  addStoryClick (value) {
    const { dispatch, router, meta, stories } = this.props;
    const storyId = slug(value).toLowerCase();

    if (Object.keys(stories).find(s => s.toLowerCase() === storyId)) {
      dispatch(triggerNotification(
        'Error',
        'A story already exists with that name!',
        'error',
        10000
      ));
      return;
    }

    dispatch(addStory(storyId, value))
      .then(() => {
        router.push(`/${meta.team.domain}/${meta.botId}/story/${storyId}`);
      });
  }

  cancelSetUserAvatarUrl () {
    this.setState({ addAvatarUrl: false, addAvatarUrlForIdx: null });
  }

  startSetUserAvatarUrl (idx) {
    this.setState({ addAvatarUrl: false, addAvatarUrlForIdx: idx });
  }

  setUserAvatarUrlOffline (e, idx) {
    const { dispatch } = this.props;

    if (!e.target.value) return;
    if (e.which === 27) return this.cancelSetUserAvatarUrl();
    if (e.which === 13) {
      if (!e.target.validity.valid) return;

      dispatch(updateUserPropertyOffline(idx, 'emoji', ''));
      dispatch(updateUserPropertyOffline(idx, 'url', e.target.value));
      this.cancelSetUserAvatarUrl();
    }
  }

  setUserPictureOffline (idx, value) {
    const { dispatch } = this.props;

    dispatch(updateUserPropertyOffline(idx, 'url', value));
  }

  setUserNameOffline (idx, e) {
    const { dispatch } = this.props;

    dispatch(updateUserPropertyOffline(idx, 'name', e.target.value));
    dispatch(updateUserPropertyOffline(idx, 'handle', getHandle(e.target.value)));
  }

  addUserOffline () {
    const { dispatch } = this.props;

    const name = generateName();
    const handle = getHandle(name);
    const avatar = USER_AVATARS[Math.floor(Math.random() * USER_AVATARS.length)];

    dispatch(addUserOffline(name, handle, avatar));
  }

  removeUserOffline (idx) {
    const { dispatch } = this.props;

    dispatch(removeUserOffline(idx));
  }

  updateBotPicture () {
    const { bot, dispatch } = this.props;
    const value = window.prompt('Please enter the new avatar url or emoji.', bot.url || bot.emoji);
    if (value === null) return;
    if (value === '') {
      dispatch(updateBotProperty('emoji', ''));
      dispatch(updateBotProperty('url', DEFAULT_BOT.url));
      return;
    }
    dispatch(updateBotProperty('emoji', ''));
    dispatch(updateBotProperty('url', value));
  }

  updateBotName (e) {
    const { dispatch } = this.props;

    dispatch(updateBotProperty('name', e.target.value));
    dispatch(updateBotProperty('handle', getHandle(e.target.value)));
  }

  saveNewBot (event) {
    const { dispatch, bot, users, meta } = this.props;

    window.sessionStorage.removeItem('isAddingBot');

    const checkedUsers = users.map((user, idx) => {
      const newName = generateName();
      user.name = user.name || newName;
      user.handle = user.handle || getHandle(newName);
      return user;
    });

    const checkedBot = Object.assign(bot, {
      name: bot.name || DEFAULT_BOT.name,
      handle: bot.handle || DEFAULT_BOT.handle
    });
    const localBot = {
      id: meta.botId,
      name: bot.name,
      url: bot.url,
      emoji: bot.emoji,
      fork: bot.fork,
      teamDomain: meta.teamDomain,
      teamName: meta.team.name
    };

    const payload = {
      fork: false,
      forkedFrom: null,
      users: checkedUsers,
      bot: checkedBot
    };

    const isAddingAnonBot = window.sessionStorage.getItem('addingAnonBot');
    if (meta.signedIn && !isAddingAnonBot) {
      payload.isTeamBot = true;
      payload.userName = meta.user.name;
      payload.userId = meta.user.id;
      payload.teamDomain = meta.team.domain;
      payload.teamId = meta.team.id;
    }
    window.sessionStorage.removeItem('addingAnonBot');

    dispatch(saveState(payload))
      .then(res => {
        const { data } = res.data;
        localBot.id = data.id;

        if (!isAddingAnonBot) window.location = `/${data.teamDomain}/${data.id}`;

        dispatch(saveLocalBot(localBot))
          .then(() => {
            window.location = `/${data.teamDomain}/${data.id}`;
          });
      })
      .catch(error => {
        dispatch(triggerNotification(
          'Oh no! Something went wrong!',
          'I\'ve logged the error with the developers.',
          'error',
          10000
        ));
        throw error;
      });
  }

  migrateToTeamBot () {
    const { dispatch, bot } = this.props;
    if (!window.confirm(`Are you sure you want to migrate ${bot.name}? *This action cannot be undone!*`)) return;

    dispatch(migrateBotToTeam());
  }

  saveLocalBot (event) {
    const { dispatch, meta, bot } = this.props;

    const localBot = {
      id: meta.botId,
      name: bot.name,
      url: bot.url,
      emoji: bot.emoji,
      fork: bot.fork,
      teamDomain: meta.teamDomain,
      teamName: meta.team.name
    };

    dispatch(saveLocalBot(localBot))
      .then(() => {
        window.location = `/${meta.teamDomain}/${meta.botId}`;
      });
  }
}

const mapStateToProps = ({
  stories,
  meta,
  bot,
  teamBots,
  localBots,
  users
}) => {
  return {
    stories,
    meta,
    bot,
    teamBots,
    localBots,
    users
  };
};

export default connect(mapStateToProps)(withRouter(Stories));
