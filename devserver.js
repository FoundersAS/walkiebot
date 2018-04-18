const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config.dev');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      secure: false
    },
    '/socket.io/socket.io.js': {
      target: 'http://localhost:8000',
      secure: false
    },
    '/emoji': {
      target: 'http://localhost:8000',
      secure: false
    }
  }
}).listen(8005, '0.0.0.0', function (err, result) {
  if (err) throw err;
  console.log('webpack-dev-server listening on port 8005 🚀');
});
