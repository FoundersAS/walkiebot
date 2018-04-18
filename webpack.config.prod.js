'use strict';
require('load-environment');

const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = {
  entry: [
    path.join(__dirname, 'src/index.js')
  ],
  output: {
    filename: 'bundle.[hash].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    modules: [
      path.resolve('./'),
      path.resolve('./node_modules')
    ]
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'commons.js',
      minChunks (module, count) {
        var context = module.context;
        return context && context.indexOf('node_modules') >= 0;
      }
    }),
    new UglifyJSPlugin({
      parallel: 8,
      sourceMap: true
    }),
    new AssetsPlugin({ filename: 'server/assets.json' }),
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
      append: '\n//# sourceMappingURL=/dist/[url]'
    }),
    new ExtractTextPlugin({
      filename: '[name].[hash].css'
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: {
        discardComments: {
          removeAll: true
        },
        discardDuplicates: true
      },
      canPrint: false
    })
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
        use: ExtractTextPlugin.extract({
          use: [
            { loader: 'css-loader' },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => {
                  return [autoprefixer];
                }
              }
            },
            { loader: 'sass-loader' }
          ],
          fallback: 'style-loader'
        }),
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
