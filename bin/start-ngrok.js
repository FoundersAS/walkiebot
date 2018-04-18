require('load-environment');
const ngrok = require('ngrok');

let URL;

if (!process.env.NGROK_SUBDOMAIN) throw new Error('NGROK_SUBDOMAIN not defined in environment');

ngrok.connect({
  addr: 8000,
  subdomain: process.env.NGROK_SUBDOMAIN
}, function (err, url) {
  URL = url;
  if (err) {
    console.error(`[NGROK][ERROR] Could not start ngrok: ${JSON.stringify(err)}`);
  } else {
    console.log(`[NGROK] Started on ${url} - inspect here (http://127.0.0.1:4040)`);
  }
});

process.once('SIGUSR2', function () {
  // otherwise ngrok won't reconnect on nodemon reload because of hanging connection
  ngrok.disconnect(URL);
  ngrok.kill();
  process.kill(process.pid, 'SIGUSR2');
});
