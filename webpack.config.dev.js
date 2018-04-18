'use strict';
require('load-environment');

const path = require('path');
const webpack = require('webpack');
const WebpackNotifierPlugin = require('webpack-notifier');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:8005',
    'webpack/hot/only-dev-server',
    'react-hot-loader/patch',
    path.join(__dirname, 'src/index.js')
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.[hash].js',
    publicPath: '/'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
    new WebpackNotifierPlugin(),
    new HtmlWebpackPlugin({
      template: './dev-index.ejs',
      SLACK_CLIENT_ID: JSON.stringify(process.env.SLACK_CLIENT_ID || ''),
      SLACK_LOGIN_REDIRECT_URL: JSON.stringify(process.env.SLACK_LOGIN_REDIRECT_URL || '')
    }),
    new webpack.NamedModulesPlugin()
  ],
  module: {
    rules: [
      {
        test: /joi-browser/,
        exclude: [
          path.join(__dirname, 'node_modules')
        ],
        use: []
      },
      {
        test: /\.jsx?$/,
        use: [
          { loader: 'babel-loader' }
        ],
        include: [
          path.join(__dirname, 'src')
        ]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ],
        include: [
          path.join(__dirname, 'src')
        ]
      },
      {
        test: /fonts(.*?)\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'static/fonts/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /illustrations(.*?)\.(gif|svg|png|jpg|jpeg|mp4)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'static/illustrations/[name].[ext]'
            }
          }
        ]
      }
    ]
  }
};
