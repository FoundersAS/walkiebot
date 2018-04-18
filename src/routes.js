import React from 'react';
import {
  Route,
  Redirect,
  IndexRoute
} from 'react-router';

import { getMe, logOut } from './app/redux/ducks/meta';
import { triggerNotification } from './app/redux/ducks/notification';
import { isTokenExpired } from './app/utils/jwt';

import App from './app/App';
import Stories from './app/Stories';
import Story from './app/Story';
import Settings from './app/Settings';
import Login from './app/Login';
import Logout from './app/Logout';

const loginUser = (store) => (nextState, replace, cb) => {
  const { query } = nextState.location;
  store.dispatch(getMe(query.token))
    .then(() => {
      const { next } = query;
      if (next) replace(next);
      else replace('/');
      cb();
    })
    .catch(error => {
      store.dispatch(triggerNotification(
        'Error',
        'I could not log you in. I have notified the devs of this incident.',
        'error',
        10000
      ));
      throw error;
    });
};

const logoutUser = (store) => (nextState, replace, cb) => {
  store.dispatch(logOut())
    .then(() => {
      const { next, msg, type } = nextState.location.query;
      try {
        window.localStorage.removeItem('lastUsedBot');
      } catch (e) {
        console.error('Cannot get localStorage');
      }

      if (next) replace(next);
      else replace('/');
      if (msg) {
        store.dispatch(triggerNotification(
          type || 'Error',
          msg,
          type || 'error',
          10000
        ));
      } else {
        store.dispatch(triggerNotification(
          '👋🏼🤖',
          'You have been logged out',
          'notification',
          5000
        ));
      }
      cb();
    });
};

const notifyOnRedirect = (store) => (nextState, replace, cb) => {
  const { next, title, msg, type } = nextState.location.query;
  if (next) replace(next);
  else replace('/');
  store.dispatch(triggerNotification(title || type, msg, type, 10000));
  cb();
};

const checkTokenExpiry = (store) => (nextState, replace, cb) => {
  let token;
  try {
    token = window.localStorage.getItem('user_token');
  } catch (e) {
    console.error('Cannot get localStorage');
  }
  const { meta } = store.getState();

  if (!token && (!meta.signedIn || !meta.isTeamBot)) return cb();
  if (!isTokenExpired(token)) return cb();

  store.dispatch(logOut())
    .then(() => {
      let logoutMessage = 'You have been logged out. Your token has expired.';
      if (meta.isPublicBot) {
        logoutMessage = `${logoutMessage} But that's okay, this is a public bot! Carry on!`;

        store.dispatch(triggerNotification(
          'Error',
          logoutMessage,
          'warning',
          10000
        ));
        return cb();
      }

      window.location = `/logout?msg=${logoutMessage}&type=warning`;
    });
};

const routes = store => {
  const wrappedCheckTokenExpiry = checkTokenExpiry(store);
  const wrappedLoginUser = loginUser(store);
  const wrappedLogoutUser = logoutUser(store);
  const wrappedNotifyOnRedirect = notifyOnRedirect(store);

  return () => (
    <Route path='/' component={App} onEnter={wrappedCheckTokenExpiry}>
      <Redirect from='app*' to='*' />,
      <Redirect from='help' to='/stories' />,
      <Redirect from=':teamDomain/:bot/help' to='/stories' />,
      <Redirect from='settings' to='/stories' />,
      <Redirect from=':teamDomain/:bot/settings' to=':teamDomain/:bot/stories' />,

      <Route path='login' component={Login} onEnter={wrappedLoginUser} />,
      <Route path='logout' component={Logout} onEnter={wrappedLogoutUser} />,
      <Route path='redirect' component={Logout} onEnter={wrappedNotifyOnRedirect} />,

      <IndexRoute component={Settings} onEnter={wrappedCheckTokenExpiry} />

      <Route path='stories' component={Stories} onEnter={wrappedCheckTokenExpiry} />

      <Route path=':teamDomain/:bot' component={Settings} onEnter={wrappedCheckTokenExpiry} />
      <Route path=':teamDomain/:bot/stories' component={Stories} onEnter={wrappedCheckTokenExpiry} />
      <Route path=':teamDomain/:bot/story/:storyId' component={Story} onEnter={wrappedCheckTokenExpiry} />
    </Route>
  );
};

export default routes;
