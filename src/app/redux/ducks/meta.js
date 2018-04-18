'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';
import { initTeamBots } from './team-bots';
import * as api from '../../utils/api';

export const getMe = (token) => {
  return (dispatch, getState) => {
    let hasTokenLocally;
    try {
      hasTokenLocally = window.localStorage.getItem('user_token');
      window.localStorage.setItem('user_token', token);
    } catch (e) {
      console.error('Could not set user_token, your session will not persist');
    }

    return api.getMe(token)
      .then(r => r.data)
      .then(response => {
        if (!response.ok) throw new Error(response.message);

        dispatch(setUser(response.data.user));
        dispatch(setTeam(response.data.team));
        dispatch(initTeamBots(response.data.teamBots));
        dispatch(userSignedIn());
      });
  };
};

export const logOut = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      try {
        window.localStorage.removeItem('user_token');
        dispatch(userSignedOut());
        resolve();
      } catch (e) {
        console.error('Could not remove user_token');
        reject(e);
      }
    });
  };
};

export const initMeta = createAction('INIT_META');
export const stopLoading = createAction('STOP_LOADING');
export const startLoading = createAction('START_LOADING');
export const setUser = createAction('SET_USER');
export const setTeam = createAction('SET_TEAM');

const userSignedIn = createAction('USER_SIGNED_IN');
export const userSignedOut = createAction('USER_SIGNED_OUT');

const DEFAULT_TEAM = {
  id: 'anon',
  name: 'Anonymous Team',
  domain: 'anon',
  avatar: '/static/illustrations/user-team.svg'
};

const DEFAULT_USER = {
  name: 'Anonymous User',
  id: 'anon',
  email: null,
  avatar: null
};

const DEFAULT_STATE = {
  loading: false,
  botId: null,
  user: DEFAULT_USER,
  team: DEFAULT_TEAM,
  signedIn: false,
  message: null,
  isPublicBot: true,
  isTeamBot: false,
  isPrivateTeamBot: false,
  teamDomain: 'anon',
  forkedFrom: null
};

export default handleActions({
  INIT_META: (state, { payload }) => Imm.fromJS(state).merge(payload).toJS(),
  SET_USER: (state, { payload: user }) => Imm.fromJS(state).set('user', user).toJS(),
  SET_TEAM: (state, { payload: team }) => Imm.fromJS(state).set('team', team).toJS(),
  STOP_LOADING: (state, { payload }) => Imm.fromJS(state).set('loading', false).toJS(),
  START_LOADING: (state, { payload }) => Imm.fromJS(state).set('loading', true).toJS(),
  USER_SIGNED_IN: (state) => Imm.fromJS(state).set('signedIn', true).toJS(),
  USER_SIGNED_OUT: (state) =>
    Imm.fromJS(state)
      .set('signedIn', false)
      .set('user', DEFAULT_USER)
      .set('team', DEFAULT_TEAM)
      .toJS()
}, DEFAULT_STATE);
