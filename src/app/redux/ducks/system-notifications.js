'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';
import * as api from '../../utils/api';
import { errorHandler } from '../../utils/error-handler';
import { triggerNotification } from './notification';

export const initSystemNotificationsForUser = (userId) => {
  return (dispatch, getState) => {
    api.getSystemNotifications(userId)
      .then(res => {
        if (!res.data.ok) {
          console.error('Error getting system notifications', JSON.stringify(res.data));
        }
        dispatch(_initSystemNotifications(res.data.data));
      })
      .catch(errorHandler(dispatch));
  };
};

export const dismissSystemNotification = (id) => {
  return (dispatch, getState) => {
    const { localBots } = getState();

    dispatch(_dismissSystemNotification(id));

    api.ackSystemNotification(id, localBots.id)
      .then(res => {
        if (!res.data.ok) {
          console.error('Something went wrong', JSON.stringify(res.data));
          return dispatch(triggerNotification(
            'Error',
            res.data.message,
            'error',
            10000
          ));
        }
      })
      .catch(errorHandler(dispatch));
  };
};

export const triggerSystemNotification = createAction(
  'TRIGGER_SYSTEM_NOTIFICATION',
  (notification) => ({ notification })
);
const _dismissSystemNotification = createAction('DISMISS_SYSTEM_NOTIFICATION', (id) => ({ id }));
const _initSystemNotifications = createAction('INIT_SYSTEM_NOTIFICATIONS', (notifications) => ({ notifications }));

const DEFAULT_STATE = Imm.fromJS([]);

export default handleActions({
  INIT_SYSTEM_NOTIFICATIONS: (state, { payload: { notifications } }) =>
    Imm.fromJS(notifications),
  TRIGGER_SYSTEM_NOTIFICATION: (state, { payload: { notification } }) =>
    state.push(Imm.fromJS(notification)),
  DISMISS_SYSTEM_NOTIFICATION: (state, { payload: { id } }) =>
    state.filter(n => n.get('notificationId') !== id)
}, DEFAULT_STATE);
