import './stylesheets/main.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import ReduxThunk from 'redux-thunk';

import socket from './socket';
import Root from './Root';
import routes from './routes';
import rootReducer from './app/redux';
import { triggerSystemNotification } from './app/redux/ducks/system-notifications';

const isProd = process.env.NODE_ENV === 'production';
let store;

if (isProd) {
  store = createStore(
    rootReducer,
    window.__INITIAL_STATE__,
    applyMiddleware(ReduxThunk)
  );
} else {
  const middlewares = (
    window.devToolsExtension
    ? compose(applyMiddleware(ReduxThunk), window.devToolsExtension())
    : applyMiddleware(ReduxThunk)
  );
  store = createStore(rootReducer, window.__INITIAL_STATE__, middlewares);
  // debugging purposes
  window.store = store;
}

socket.on('broadcast_notification', notification => {
  store.dispatch(triggerSystemNotification(notification));
  console.log('SOCKET: broadcast_notification', notification);
});

const render = routes => {
  return ReactDOM.render(
    <Provider store={store}>
      <AppContainer>
        <Root routes={routes(store)} />
      </AppContainer>
    </Provider>,
    document.getElementById('app')
  );
};

render(routes);

if (module.hot) {
  module.hot.accept('./routes.js', () => {
    const nextRoutes = require('./routes').default;
    render(nextRoutes);
  });
}

window.onunfurlclick = function (event) {
  event.target.classList.toggle('closed');
  event.target.classList.toggle('open');
  event.target.nextSibling.classList.toggle('message__unfurl-image--hidden');
};

window.onunfurlerror = function (imgTag) {
  imgTag.parentElement.parentElement.classList.add('message__unfurl-image--error');
  imgTag.onerror = '';
  imgTag.src = 'https://drdaugjsbp9r4.cloudfront.net/apple/64/274c.png';
  return true;
};

window.onimageload = function (event) {
  const messageList = document.querySelector('.message-list');
  if (!messageList) return;
  messageList.scrollTop = messageList.scrollHeight;
};
