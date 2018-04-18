const host = process.env.NODE_ENV !== 'production' ? 'http://localhost:8000' : '';
const socket = window.io(host);

socket.on('connect', () => {
  console.log('socket connected');
  window.setInterval(() =>
    socket.emit('ping'), 50 * 1000);
});
socket.on('connect_error', (err) =>
  console.error('socket connection error', err.message));
socket.on('connect_timeout', () =>
  console.log('socket connection timeout'));
socket.on('reconnecting', (attempt) =>
  console.log(`reconnect attempt #${attempt}`));
socket.on('reconnect_failed', () =>
  console.error(`socket could not reconnect within ${socket.reconnectionAttempts} attempts`));

export default socket;
