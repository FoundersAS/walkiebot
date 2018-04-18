import decode from 'jwt-decode';

const getTokenExpirationDate = (token) => {
  const decoded = decode(token);
  if (!decoded.exp) return null;

  const date = new Date(0);  // The 0 here is the key, which sets the date to the epoch
  date.setUTCSeconds(decoded.exp);
  return date;
};

export const isTokenExpired = (token) => {
  if (!token) return true;

  let date;
  try {
    date = getTokenExpirationDate(token);
  } catch (_) {
    return true;
  }
  const offsetSeconds = 0;
  if (date === null) return false;

  return !(date.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
};
