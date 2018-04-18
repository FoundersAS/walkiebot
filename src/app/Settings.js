'use strict';
import '../stylesheets/settings.scss';
import '../stylesheets/lists.scss';
import '../stylesheets/selector.scss';

import emojiRegex from 'emoji-regex';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import UserSettingsCard from './Components/Cards/UserSettings';

import { saveState, saveLocalBot, updateUsersAndBot } from './redux/actions';
import { updateTeamBot, addTeamBot } from './redux/ducks/team-bots';
import {
  _updateBot,
  updateBotProperty,
  DEFAULT_BOT
} from './redux/ducks/bot';
import {
  _updateUsers,
  updateUser,
  addUser,
  removeUser,
  USER_AVATARS
} from './redux/ducks/users';
import { DEFAULT_STORY, loadStories } from './redux/ducks/stories';
import { initMeta } from './redux/ducks/meta';
import { generateName, getHandle } from './utils/user-name';

const DELETE_USER_COPY = `Are you sure you wish to delete this user?
Changes will not take effect until you press 'save settings'.
`;

class Settings extends React.Component {
  constructor (props) {
    super(props);

    this.setDirty = this.setDirty.bind(this);
    this.unsetDirty = this.unsetDirty.bind(this);

    this.removeUser = this.removeUser.bind(this);
    this.addUser = this.addUser.bind(this);
    this.updateUserOnBlur = this.updateUserOnBlur.bind(this);

    this.state = {
      showAddBotModal: true,
      dirty: false
    };
  }

  setDirty () {
    this.setState({ dirty: true });
  }

  unsetDirty () {
    this.setState({ dirty: false });
  }

  updateBotPicture () {
    const { bot, dispatch } = this.props;
    const value = window.prompt('Please enter the new avatar url or emoji.', bot.url || bot.emoji);
    if (value === null) return;

    if (emojiRegex().test(value)) {
      dispatch(updateBotProperty('emoji', value));
      dispatch(updateBotProperty('url', ''));

      this.setDirty();
      return;
    }
    if (value === '') {
      dispatch(updateBotProperty('emoji', ''));
      dispatch(updateBotProperty('url', DEFAULT_BOT.url));

      this.setDirty();
      return;
    }
    dispatch(updateBotProperty('emoji', ''));
    dispatch(updateBotProperty('url', value));

    this.setDirty();
  }

  updateBotName ({ target: { value } }) {
    const { dispatch } = this.props;

    dispatch(updateBotProperty('name', value));
    dispatch(updateBotProperty('handle', getHandle(value)));

    this.setDirty();
  }

  removeUser (idx) {
    if (this.props.users.length - 1 === 0) {
      window.alert('You cannot delete the last user');
      return;
    }
    const confirm = window.confirm(DELETE_USER_COPY);
    if (confirm) this.props.dispatch(removeUser(idx));
  }

  addUser () {
    const newName = generateName();
    const handle = getHandle(newName);
    const avatar = USER_AVATARS[Math.floor(Math.random() * USER_AVATARS.length)];
    this.props.dispatch(addUser(newName, handle, avatar));
  }

  updateUserOnBlur (idx, user) {
    const { dispatch } = this.props;
    const { name, url } = user;

    dispatch(updateUser(idx, name, getHandle(name), url));
  }

  componentWillUnmount () {
    window.clearTimeout(this.alertTimeout);
    if (this.state.dirty) this.saveSettings(null, false);
  }

  saveSettings (event, shouldSetState = true) {
    console.log('saving settings');
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

    if (checkedBot.initialized) {
      if (meta.signedIn && !meta.isPublicBot) {
        return dispatch(updateUsersAndBot(users, checkedBot))
          .then(() => {
            dispatch(updateTeamBot(localBot));
            if (shouldSetState) this.unsetDirty();
          });
      }

      dispatch(saveLocalBot(localBot))
        .then(() => {
          dispatch(updateUsersAndBot(users, checkedBot))
            .then(() => {
              if (shouldSetState) this.unsetDirty();
            });
        });
      return;
    }

    const payload = {
      fork: false,
      forkedFrom: null,
      created: Date.now(),
      users: checkedUsers,
      bot: checkedBot,
      stories: {
        'my-first-story': Object.assign(
          DEFAULT_STORY,
          { name: 'My first story' }
        )
      }
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
        shouldSetState && this.unsetDirty();

        const { data } = res.data;
        if (!res.data.ok) {
          throw new Error(JSON.stringify(res.data));
        }

        dispatch(_updateUsers(users));
        dispatch(_updateBot(checkedBot.name, checkedBot.handle, checkedBot.url, checkedBot.emoji));
        dispatch(loadStories(payload.stories));
        dispatch(initMeta({ botId: data.id, teamDomain: data.teamDomain, isTeamBot: data.isTeamBot }));

        localBot.id = data.id;
        if (meta.signedIn && !isAddingAnonBot) {
          dispatch(addTeamBot(localBot));
        } else dispatch(saveLocalBot(localBot));
        this.context.router.push(`/${data.teamDomain}/${data.id}/story/my-first-story`);
      })
      .catch(error => {
        shouldSetState && this.setState({
          alert: true,
          alertTitle: 'Oh no! Something went wrong!',
          alertMessage: 'I\'ve logged the error with the developers.',
          alertType: 'error'
        });
        throw error;
      });
  }

  render () {
    const { bot, users } = this.props;

    return (
      <div className='grid grid--settings'>
        <div className='grid-item'>
          <h2>Bot</h2>
          <div className='list'>
            <div className='list__item'>
              <div onClick={this.updateBotPicture.bind(this)}
                className='settings__avatar'
                style={{ backgroundImage: bot.url ? `url(${bot.url})` : '' }}
                >
                {bot.url ? '' : bot.emoji}
                <span className='settings__avatar-mark'><span className='icon-plus' /></span>
              </div>
              <div>
                <input
                  tabIndex={1}
                  value={bot.name}
                  onChange={this.updateBotName.bind(this)}
                  type='text'
                  maxLength='21'
                  className='input input--inline settings__input'
                  placeholder='Botname (Max 21 characters)'
                  />
                <div className='settings__handle'>
                  {bot.handle || '@handle'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='grid-item'>
          <h2>Users</h2>
          <div className='list'>
            {users.map((user, idx) => {
              if (user.deleted) return null;
              return (
                <UserSettingsCard
                  key={`${idx}-${user.name}`}
                  user={user}
                  userIdx={idx}
                  userAvatars={USER_AVATARS}
                  removeUser={this.removeUser}
                  onBlur={this.updateUserOnBlur}
                />
              );
            })}

            <div className='list__item settings__add' onClick={this.addUser}>
              <div className='settings__add-icon icon-plus'></div>
              <div className='settings__add-text'>Add user</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Settings.contextTypes = {
  router: PropTypes.object.isRequired
};

const mapStateToProps = ({ bot, users, meta, localBots, teamBots }) => ({
  bot,
  users,
  meta,
  localBots,
  teamBots
});

export default connect(mapStateToProps)(Settings);
