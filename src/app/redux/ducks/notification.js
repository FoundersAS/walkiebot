'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';

export const triggerNotification = (title, message, type, timeout = 0) => {
  return dispatch => {
    let timeoutId;
    if (timeout) {
      timeoutId = setTimeout(() => dispatch(dismissNotification()), timeout);
    }
    dispatch(_triggerNotification(title, message, type, timeoutId));
  };
};
export const dismissNotification = () => {
  return (dispatch, getState) => {
    const { notification } = getState();
    window.clearTimeout(notification.timeoutId);

    dispatch(_dismissNotification());
  };
};

export const _triggerNotification = createAction(
  'TRIGGER_NOTIFICATION',
  (title, message, type) => ({ title, message, type })
);
export const _dismissNotification = createAction('DISMISS_NOTIFICATION');

const DEFAULT_STATE = Imm.fromJS({
  title: '',
  message: '',
  type: '',
  show: false,
  timeoutId: null
});

// types:
// error
// success
// notification
// warning

export default handleActions({
  TRIGGER_NOTIFICATION: (state, { payload: { title, message, type } }) =>
    Imm.fromJS(state)
      .set('title', title)
      .set('message', message)
      .set('type', type)
      .set('show', true)
      .toJS(),
  DISMISS_NOTIFICATION: (state) => DEFAULT_STATE.toJS()
}, DEFAULT_STATE.toJS());
