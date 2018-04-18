'use strict';
import * as api from '../../utils/api';
import { isTokenExpired } from '../../utils/jwt';
import { _updateBot } from '../ducks/bot';
import { _updateUsers } from '../ducks/users';
import { triggerNotification } from '../ducks/notification';
import { loadStories } from '../ducks/stories';
import { findPathToMessage } from '../ducks/flow';
import { getMe, initMeta, startLoading, stopLoading } from '../ducks/meta';
import { initSystemNotificationsForUser } from '../ducks/system-notifications';
import * as localBots from '../ducks/local-bots';
import { errorHandler } from '../../utils/error-handler';

const generateLocalId = () => {
  const baseId = Math.floor(Math.random() * 100000000000000).toString(16);
  const now = Date.now().toString(16);
  return `${baseId}-${now}`;
};

const initializeData = (state, storyId, dispatch) => {
  const { bot, user, users, stories, id, isPublicBot, isTeamBot, isPrivateTeamBot, teamDomain, forkedFrom } = state;
  dispatch(_updateBot(bot.name, bot.handle, bot.url, bot.emoji));
  /*
  ** Backwards compatability:
  ** Ran into a user not having a user in one of his local bots,
  ** so making sure that won't happen
  */
  let actors = [];
  if (user) actors = [user];
  if (users) actors = users;

  dispatch(_updateUsers(actors));
  dispatch(loadStories(stories));
  dispatch(initMeta({ botId: id, isPublicBot, isTeamBot, isPrivateTeamBot, teamDomain, forkedFrom }));

  if (storyId) {
    if (stories[storyId].messages.length) {
      dispatch(findPathToMessage(storyId, stories[storyId].messages[0].messageId, []));
    }
  }

  dispatch(stopLoading());
};

export const migrateBotToTeam = () => {
  return (dispatch, getState) => {
    const { meta } = getState();

    return api.migrateBot(meta.botId)
      .then(() => {
        window.location = `/redirect?title=Success&msg=Migration successful!&type=success&next=/${meta.teamDomain}/${meta.botId}/settings`;
      })
      .catch(errorHandler);
  };
};

export const updateUsersAndBot = (users, bot) => {
  return (dispatch, getState) => {
    const state = getState();
    return api.putBot(state.meta.botId, { users, bot })
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          const err = new Error(res.data.message);
          err.status = res.status;
          return errorHandler(dispatch)(err);
        }
        dispatch(_updateUsers(users));
        dispatch(_updateBot(bot.name, bot.handle, bot.url, bot.emoji));

        dispatch(triggerNotification(
          'Saved!',
          'Nice choice!',
          'success',
          5000
        ));
      })
      .catch(errorHandler(dispatch));
  };
};

export const loadStateAndCheckToken = (id, router) => {
  return (dispatch, getState) => {
    dispatch(startLoading());

    let token = window.localStorage.getItem('user_token');
    if (isTokenExpired(token)) {
      window.localStorage.removeItem('user_token');
      token = null;
    }
    return api.getBot(id, router.params.storyId)
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          const err = new Error(res.data.message);
          err.status = res.status;
          return errorHandler(dispatch)(err);
        }

        const { isTeamBot, isPrivateTeamBot } = res.data.state;
        const { meta } = getState();

        if ((isTeamBot || isPrivateTeamBot || token) && !meta.signedIn) {
          dispatch(getMe(token))
            .then(() => initializeData(res.data.state, router.params.storyId, dispatch))
            .catch(errorHandler(dispatch));
        } else {
          initializeData(res.data.state, router.params.storyId, dispatch);
        }
        return res.data.state;
      }).catch(error => {
        dispatch(stopLoading());

        const err401 = error.response && error.response.status === 401;
        const err403 = error.response && error.response.status === 403;
        const err404 = error.response && error.response.status === 404;

        if (err404) {
          window.localStorage.removeItem('lastUsedBot');
          window.location = '/redirect?msg=I could not find this bot!&type=error&title=Error&next=/';
          return;
        }

        if (err401 || err403) {
          window.localStorage.removeItem('lastUsedBot');
        }

        errorHandler(dispatch)(error);
      });
  };
};

export const saveState = data => dispatch => {
  return api.postBot(data).catch(errorHandler(dispatch));
};

export const forkBot = (botId, payload) => dispatch => {
  return api.forkBot(botId, payload).catch(errorHandler(dispatch));
};

export const loadLocalBots = () => {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      dispatch(startLoading());
      try {
        const localBotId = window.localStorage.getItem('localBotId');
        if (!localBotId) {
          const data = window.localStorage.getItem('walkiebot.co');
          const bots = JSON.parse(data) || [];
          const newId = generateLocalId();

          window.localStorage.setItem('localBotId', newId);

          if (!bots.length) {
            console.log('[WALKIE] no local bots to migrate');
            dispatch(localBots._initLocalBots({ id: newId, bots: [] }));
            dispatch(stopLoading());
            return resolve();
          }
          console.log('[WALKIE] migrating local bots to server');

          dispatch(initSystemNotificationsForUser(newId));
          api.putLocalBots(newId, bots)
            .then(res => {
              if (!res.data.ok) return reject(res.data);

              dispatch(localBots._initLocalBots(res.data.data));
              dispatch(stopLoading());
              return resolve(res.data);
            }).catch(error => {
              dispatch(stopLoading());
              reject(error);
            });
        } else {
          dispatch(initSystemNotificationsForUser(localBotId));
          api.getLocalBots(localBotId)
            .then(res => {
              if (!res.data.ok) return reject(res.data);

              dispatch(localBots._initLocalBots(res.data.data));
              dispatch(stopLoading());
              return resolve(res.data);
            }).catch(error => {
              dispatch(stopLoading());
              reject(error);
            });
        }
      } catch (e) {
        reject(e);
      }
    });
  };
};

export const saveLocalBot = (bot) => {
  return (dispatch, getState) => {
    const { localBots: { id } } = getState();

    if (!id) return Promise.resolve();
    return api.putLocalBots(id, bot)
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          const err = new Error(res.data.message);
          err.status = res.status;
          return errorHandler(dispatch)(err);
        }

        dispatch(localBots._saveLocalBot(bot));
      })
      .catch(errorHandler(dispatch));
  };
};
