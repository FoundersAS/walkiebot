import { triggerNotification } from '../redux/ducks/notification';
import { logOut, stopLoading } from '../redux/ducks/meta';

export const errorHandler = dispatch => error => {
  dispatch(stopLoading());

  if (!error.response) {
    dispatch(triggerNotification(
      'Error',
      'An error occurred. The devs have been notified',
      'error',
      10000
    ));
    console.error('Hit error trying to load state!');
    throw error;
  }

  if (error.response && error.response.status) {
    const status = error.response.status;
    if (status !== 401 && status !== 403) throw error;

    dispatch(logOut())
      .then(() => {
        dispatch(triggerNotification(
          'Error',
          error.response.data.message,
          'warning',
          10000
        ));
        window.location = `/logout?msg=${error.response.data.message}&type=error`;
      })
      .catch(error => {
        dispatch(triggerNotification(
          'Error',
          'Could not log you out. I have notified the devs of this incident.',
          'error',
          10000
        ));
        console.error('Could not log out');
        throw error;
      });
  }
};
