'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';
import { generateName, getHandle } from '../../utils/user-name';
import * as api from '../../utils/api';
import { errorHandler } from '../../utils/error-handler';

export const USER_AVATARS = [
  '/static/illustrations/user-avatar--0.svg',
  '/static/illustrations/user-avatar--1.svg',
  '/static/illustrations/user-avatar--2.svg',
  '/static/illustrations/user-avatar--3.svg'
];

const name = generateName();

export const DEFAULT_USER = Imm.fromJS({
  name: name,
  handle: getHandle(name),
  emoji: '',
  url: '/static/illustrations/user-avatar.svg',
  deleted: false
});

const DEFAULT_USERS = [DEFAULT_USER.toJS()];

export const _updateUsers = createAction(
  'UPDATE_USERS',
  (users) => ({ users })
);

export const updateUserProperty = (idx, key, value) => {
  return (dispatch, getState) => {
    const { users, meta } = getState();
    const newUsers = Imm.fromJS(users).updateIn([idx, key], () => value).toJS();

    return api.putBot(meta.botId, { users: newUsers })
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          const err = new Error(res.data.message);
          err.status = res.status;
          return errorHandler(dispatch)(err);
        }
        dispatch(_updateUsers(newUsers));
      })
      .catch(errorHandler(dispatch));
  };
};
export const removeUser = (idx) => {
  return (dispatch, getState) => {
    const { users, meta } = getState();
    const newUsers = Imm.fromJS(users).update(idx, user => user.set('deleted', true)).toJS();

    return api.putBot(meta.botId, { users: newUsers })
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          const err = new Error(res.data.message);
          err.status = res.status;
          return errorHandler(dispatch)(err);
        }
        dispatch(_updateUsers(newUsers));
      })
      .catch(errorHandler(dispatch));
  };
};
export const addUser = (name, handle, avatar) => {
  return (dispatch, getState) => {
    const { users, meta } = getState();
    const newUser = DEFAULT_USER.merge({ name, handle, url: avatar });
    const newUsers = [...users, newUser.toJS()];

    return api.putBot(meta.botId, { users: newUsers })
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          const err = new Error(res.data.message);
          err.status = res.status;
          return errorHandler(dispatch)(err);
        }
        dispatch(_updateUsers(newUsers));
      })
      .catch(errorHandler(dispatch));
  };
};
export const updateUser = (userIdx, name, handle, avatar) => {
  return (dispatch, getState) => {
    const { users, meta } = getState();
    console.log('avatar', avatar);
    const newUsers = Imm.fromJS(users).update(userIdx, user => {
      return user
        .set('name', name)
        .set('handle', handle)
        .set('url', avatar);
    }).toJS();

    return api.putBot(meta.botId, { users: newUsers })
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          const err = new Error(res.data.message);
          err.status = res.status;
          return errorHandler(dispatch)(err);
        }
        dispatch(_updateUsers(newUsers));
      })
      .catch(errorHandler(dispatch));
  };
};

export const updateUserPropertyOffline = createAction('UPDATE_USER_PROPERTY', (idx, key, value) => ({ idx, key, value }));
export const addUserOffline = createAction('ADD_USER', (name, handle, avatar) => ({ name, handle, avatar }));
export const removeUserOffline = createAction('REMOVE_USER', (idx) => ({ idx }));

export default handleActions({
  UPDATE_USERS: (state, { payload: { users } }) => {
    return Imm.fromJS(users).toJS();
  },
  UPDATE_USER_PROPERTY: (state, { payload: { idx, key, value } }) => {
    return Imm.fromJS(state).updateIn([idx, key], () => value).toJS();
  },
  ADD_USER: (state, { payload: { name, handle, avatar } }) => {
    const newUser = Imm.fromJS(DEFAULT_USER)
      .set('name', name)
      .set('handle', handle)
      .set('url', avatar);

    return Imm.fromJS(state)
      .push(newUser)
      .toJS();
  },
  REMOVE_USER: (state, { payload: { idx } }) => {
    return Imm.fromJS(state).update(idx, user => user.set('deleted', true)).toJS();
  }
}, DEFAULT_USERS);
