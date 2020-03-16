
const environment = require('./bootstrap');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const glob = require('glob');
const fs = require("fs");
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

const entryFiles = [
  './src/app/vendor.js',
  './.tmp/environment.js'
]
.concat(glob.sync('./src/app/entities/**/*.state.js'))
.concat([
  './src/app/app.module.js', 
  './src/app/app.constants.js', 
  './src/app/app.state.js', 
  './src/app/config.js',
  './.tmp/templateCache.js',
])
.concat(glob.sync('./src/app/**/*.js'));

var filelist = 'angular.module("atsWeb").run(["$templateCache",function($templateCache){"use strict";';

var files = glob.sync("./src/app/**/*.html", {});

for (var filename of files) {
  if (filename.substr(-4) === 'html') {
    var source = fs.readFileSync(filename);
    source = source.toString();
    source = source.replace(/\r?\n|\r/g, "");
    source = source.replace(/\\/g, "\\\\");
    source = source.replace(/'/g, "\\'");
    source = source.replace(/"/g, "\\\"");
    filename = filename.substring('./src/'.length, filename.length);
    filelist += (`$templateCache.put("${ filename }", "${ source }" ); \n`);
  }
}

filelist += '}]);';

fs.mkdirSync("./.tmp", { recursive: true })

fs.writeFileSync('./.tmp/templateCache.js', filelist);

var constants = 'angular.module("atsWeb.environment", [])';
Object.keys(environment).forEach(key => {
  constants += `\n  .constant("${key}", ${JSON.stringify(environment[key], null, 0)})`;
});
constants += `\n  .constant("systemVersion", ${JSON.stringify(process.env.npm_package_version, null, 0)})`;
constants = `(function () { \n ${constants}; \n})();\n`;

fs.writeFileSync('./.tmp/environment.js', constants);

const plugins = [
  new webpack.ProgressPlugin(),
  new CleanWebpackPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }),
  new HtmlWebpackPlugin({
    minify: false,
    template: path.join(__dirname, 'src/index.html'),
    inject: 'body',
    hash: false,
    chunksSortMode: function (chunk1, chunk2) {
      var orders = ['vendor', 'app'];
      var order1 = orders.indexOf(chunk1.names[0]);
      var order2 = orders.indexOf(chunk2.names[0]);

      return order1 - order2;
    }
  }),
  new CopyPlugin([
    { from: 'src/assets/images', to: 'assets/images' },
    { from: 'src/assets/templatecsv', to: 'assets/templatecsv' },
    { from: 'src/favicon.ico' },
  ]),
  new MomentLocalesPlugin({
    localesToKeep: ['pt-BR'],
  }),
];

if (process.env.NODE_ENV !== 'production') {
  plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );
}

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    })
  );
}

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  cache: true,
  context: __dirname,
  performance: {
    hints: false
  },
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'inline-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, 'build'),
    compress: true,
    inline: true,
    hot: true,
    quiet: false,
    port: 4000,
    historyApiFallback: true,
    stats: {
      chunks: false,
      chunkModules: false
    }
  },
  entry: {
    app: entryFiles.filter((item, index) => entryFiles.indexOf(item) === index),
  },
  output: {
    filename: '[name].bundle-[hash]-[id].js',
    chunkFilename: '[name].chunk-[hash]-[id].js',
    sourceMapFilename: '[name].bundle-[hash]-[id].map',
    path: path.join(__dirname, 'build')
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          enforce: true
        }
      }
    },
    namedModules: process.env.NODE_ENV !== 'production',
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            options: '$'
          },
          {
            loader: 'expose-loader',
            options: 'jQuery'
          }
        ]
      },
      {
        test: require.resolve('moment'),
        use: [
          {
            loader: 'expose-loader',
            options: 'moment'
          },
        ]
      },
      {
        test: require.resolve('lodash'),
        use: [
          {
            loader: 'expose-loader',
            options: '_'
          },
        ]
      },
      {
        test: require.resolve('papaparse'),
        use: [
          {
            loader: 'expose-loader',
            options: 'Papa'
          },
        ]
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                ['@babel/plugin-transform-runtime', { corejs: 2 }],
                ['angularjs-annotate', { explicitOnly: false }],
                'lodash'
              ],
              presets: ['@babel/preset-env']
            }
          },
        ],
        include: [
          path.join(__dirname, 'src')
        ],
        exclude: [/node_modules/]
      },
      {
        test: /\.html$/,
        exclude: /index\.html/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: false,
              collapseWhitespace: false
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: { sourceMap: true }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: { sourceMap: true }
          },
          {
            loader: 'less-loader',
            options: { sourceMap: true }
          },
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          { 
            loader: 'file-loader',
            options: {
              outputPath: 'assets/images',
            } 
          }
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?.*)?$/i,
        use: [
          { 
            loader: 'file-loader',
            options: {
              outputPath: 'assets/fonts',
            } 
          }
        ],
      },
    ]
  },
  node: {
    fs: 'empty',
    global: true,
    crypto: 'empty'
  },
  resolve: {
    modules: ['node_modules'],
    descriptionFiles: ['package.json'],
    extensions: ['.js', '.json', '.html'],
    alias: {
        'jquery': path.join(__dirname, 'node_modules/jquery/dist/jquery'),
    }
  },
  plugins
};
