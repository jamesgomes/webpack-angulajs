'use strict';

// Modules
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

/**
 * Env
 * Busca o clico de vida no NPM para identificar o ambiente.
 */
const ENV = process.env.npm_lifecycle_event;
const isTest = ENV === 'test' || ENV === 'test-watch';
const isProd = ENV === 'build';

module.exports = function makeWebpackConfig() {
  /**
   * Config
   * Reference: http://webpack.github.io/docs/configuration.html
   * Este é o objeto em que toda a configuração é definida
   */
  var config = {
    plugins: [new MiniCssExtractPlugin()],
  };

  config.mode = isProd ? 'production' : 'development';

  /**
   * Entry
   * Reference: http://webpack.github.io/docs/configuration.html#entry
   * Deve ser um objeto vazio se estiver gerando uma compilação de teste
   * O Karma definirá isso quando for uma compilação de teste
   */
  config.entry = isTest ? void 0 : {
    app: './src/app/app.js'
  };

  /**
   * Output
   * Reference: http://webpack.github.io/docs/configuration.html#output
   * Deve ser um objeto vazio se estiver gerando uma compilação de teste
   * O Karma cuidará da configuração para você quando for um teste
   */
  config.output = isTest ? {} : {
    // Diretório de saída
    path: __dirname + '/dist',

    // Caminho de saída para visualização da página
    // Usa o webpack-dev-server no desenvolvimento
    publicPath: '/',

    // Nome do aquivo
    // Adiciona hash apenas no modo de produção
    filename: isProd ? '[name].[hash].js' : '[name].bundle.js',
    chunkFilename: isProd ? '[name].[hash].js' : '[name].bundle.js'

  };

  /**
   * Devtool
   * Reference: http://webpack.github.io/docs/configuration.html#devtool
   * Mapeamento de origem
   */
  if (isTest) {
    config.devtool = 'inline-source-map';
  }
  else if (isProd) {
    config.devtool = 'source-map';
  }
  else {
    config.devtool = 'eval-source-map';
  }

  /**
   * Loaders
   * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
   * List: http://webpack.github.io/docs/list-of-loaders.html
   * This handles most of the magic responsible for converting modules
   */

  // Initialize module
  config.module = {
    rules: [{
      // JS LOADER
      // Reference: https://github.com/babel/babel-loader
      // Transpile .js files using babel-loader
      // Compiles ES6 and ES7 into ES5 code
      test: /\.js$/,
      use: [{ loader: 'babel-loader' }],
      exclude: /node_modules/
    }, {
      test: /\.css$/i,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            esModule: true,
          },
        },
        'css-loader',
      ],
    }, {
      // ASSET LOADER
      // Reference: https://github.com/webpack/file-loader
      // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
      // Rename the file using the asset hash
      // Pass along the updated reference to your code
      // You can add here any file extension you want to get copied to your output
      test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
      use: [{ loader: 'file-loader' }]
    }, {
      // HTML LOADER
      // Reference: https://github.com/webpack/raw-loader
      // Allow loading html through js
      test: /\.html$/,
      use: [{ loader: 'raw-loader' }]
    }]
  };

  // ISTANBUL LOADER
  // https://github.com/deepsweet/istanbul-instrumenter-loader
  // Instrument JS files with istanbul-lib-instrument for subsequent code coverage reporting
  // Skips node_modules and files that end with .spec.js
  if (isTest) {
    config.module.rules.push({
      test: /\.js$|\.jsx$/,
      use: {
        loader: 'istanbul-instrumenter-loader',
        options: { esModules: true }
      },
      enforce: 'post',
      exclude: /node_modules|\.spec\.js$/,
    })
  }

  // Skip rendering index.html in test mode
  if (!isTest) {
    // Reference: https://github.com/ampedandwired/html-webpack-plugin
    // Render index.html
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: './src/public/index.html',
        inject: 'body'
      }),
      new MiniCssExtractPlugin({
        filename: 'css/[name].css'
      })
    )
  }

  // Add build specific plugins
  if (isProd) {
    config.plugins.push(
      // new CleanWebpackPlugin(['dist/*']) for < v2 versions of CleanWebpackPlugin
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: 'Production',
      }),
    )
  }

  /**
   * Dev server configuration
   * Reference: http://webpack.github.io/docs/configuration.html#devserver
   * Reference: http://webpack.github.io/docs/webpack-dev-server.html
   */
  config.devServer = {
    // fica escutando as modificações de código
    watchContentBase: true,
    // abre o navegado
    open: true,
    // arquivo onde está os arquivos
    contentBase: './src/public',
    // stats: 'minimal',
    compress: true,
    port: 9000,
  };

  return config;
}();
