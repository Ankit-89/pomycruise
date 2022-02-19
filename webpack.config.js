/*eslint-env node */
/*eslint "camelcase": 0 */

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const path = require('path');
const fs = require('fs');
const pkg = require('./package.json');

const pkgName = pkg.name.split('/').pop();

const pkgPath = pkgName.split('-').join('/');

// process images in assets to this quality
const imageQuality = 85;

// process ENV
const env = process.env;
const NODE_ENV = env.NODE_ENV || 'development';
const SOURCE_MAPS =
    env.SOURCE_MAPS || NODE_ENV === 'development' ? 'eval-source-map' : 'none';

const brand = pkgName.split('-').shift();

const alias = require('./webpack.aliases')(brand);

const functionalArea = pkgName.split('-').pop();
// path where content lives in AEM
const publicPath = `/etc.clientlibs/settings/wcm/designs/${pkgPath}/resources`;
const brandSrcDir = path.resolve(__dirname, 'themes', brand);
const shareModuleAfter = 5;
const maxFileSizeToInline = 8192; // 8.192kb

const isDevelop = NODE_ENV === 'development';
const sourceMaps = SOURCE_MAPS || isDevelop;
const aemPath = path.resolve(
    __dirname,
    'dist',
    'jcr_root',
    'apps',
    'settings',
    'wcm',
    'designs',
    brand,
    functionalArea,
    'resources'
);
const mediatorDir = path.resolve(__dirname, 'library', 'js', 'mediators');
const themeLocation = path.resolve(__dirname, 'themes', brand);
const postcssPlugins = require('./postcss.config').processors(themeLocation);
const extractBundles = bundles =>
    isDevelop
        ? []
        : bundles.map(
              bundle => new webpack.optimize.CommonsChunkPlugin(bundle)
          );
const globalIncludes = [
    path.resolve('library', 'js', 'modules', 'browserPolyfill.js'),
    path.resolve(themeLocation, 'styles', 'global', 'index.css')
];
let entry = {};

// read all mediator (templates)
fs.readdirSync(mediatorDir).forEach(file => {
    const fullPath = path.resolve(mediatorDir, file);

    if (/\.js/.test(file) && !fs.statSync(fullPath).isDirectory()) {
        entry[`js/mediators/${file.replace(/\.js/, '')}`] = [`${fullPath}`];
    }
});

// add in global Includes
entry = Object.entries(entry)
    .map(([key, value]) => [key, [...globalIncludes, ...value]])
    .reduce((a, v) => {
        a[v[0]] = v[1];
        return a;
    }, {});

// add in hot module reloading if in develop mode
if (isDevelop) {
    entry = Object.entries(entry)
        .map(([key, value]) => [
            key,
            [   
                'babel-polyfill',
                'react-hot-loader/patch',
                'webpack-hot-middleware/client',
                ...value
            ]
        ])
        .reduce((a, v) => {
            a[v[0]] = v[1];
            return a;
        }, {});
}

module.exports = {
    devtool: sourceMaps,

    entry,

    output: {
        path: aemPath,
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: 'js/[name].js'
    },

    resolve: {
        alias
    },

    module: {
        rules: [
            {
                test: /\.(eot|ttf|woff|woff2|otf|svg)(\?v=\d+\.\d+\.\d+)?$/,
                include: [path.resolve(brandSrcDir, 'fonts')],
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: maxFileSizeToInline,
                        name: file => file.split(`${brand}${path.sep}`).pop(),
                        publicPath
                    }
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                include: [path.resolve(brandSrcDir, 'images')],
                use: [
                    isDevelop
                        ? null
                        : {
                              loader: 'image-webpack-loader',
                              options: {
                                  mozjpeg: {
                                      progressive: true,
                                      quality: imageQuality
                                  }
                              }
                          },
                    {
                        loader: 'url-loader',
                        options: {
                            limit: maxFileSizeToInline,
                            name: file =>
                                file.split(`${brand}${path.sep}`).pop(),
                            publicPath
                        }
                    }
                ].filter(p => p)
            },
            {
                test: /\.js?$/,
                include: [
                    path.resolve(__dirname, 'components'),
                    path.resolve(__dirname, 'library', 'js')
                ],
                exclude: [path.resolve(__dirname, 'library', 'js', 'vendor')],
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: '.babel-cache'
                        }
                    },
                    isDevelop
                        ? {
                            loader: 'eslint-loader',
                            options: { fix: true, cache: true }
                        }
                       : null
                ].filter(p => p)
            },
            {
                test: /\.css$/,
                include: [
                    path.resolve(themeLocation, 'styles'),
                    path.resolve(__dirname, 'components'),
                    path.dirname(require.resolve('normalize.css'))
                ],
                use: isDevelop
                    ? [
                          'cache-loader',
                          {
                              loader: 'style-loader',
                              options: { sourceMap: true }
                          },
                          {
                              loader: 'css-loader',
                              options: {
                                  modules: false,
                                  importLoaders: 1,
                                  sourceMap: true,
                                  alias
                              }
                          },
                          {
                              loader: 'postcss-loader',
                              options: {
                                  sourceMap: true,
                                  plugins: postcssPlugins
                              }
                          }
                      ]
                    : ExtractTextPlugin.extract({
                          fallback: 'style-loader',
                          use: [
                              {
                                  loader: 'css-loader',
                                  options: {
                                      modules: false,
                                      importLoaders: 1,
                                      alias
                                  }
                              },
                              {
                                  loader: 'postcss-loader',
                                  options: {
                                      sourceMap: false,
                                      plugins: postcssPlugins
                                  }
                              }
                          ]
                      })
            }
        ]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(
            /moment[\/\\]locale$/,
            /de|fr|it|en|es|nl/
        ),

        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(NODE_ENV)
            }
        }),

        isDevelop ? new webpack.HotModuleReplacementPlugin() : null,

        isDevelop ? new webpack.NoEmitOnErrorsPlugin() : null,

        isDevelop ? new webpack.NamedModulesPlugin() : null,

        isDevelop
            ? new StyleLintPlugin({
                  configFile: path.resolve(__dirname, 'stylelint.config.js'),
                  files: [
                      'themes/*/styles/**/*.css',
                      'components/*/styles/**/*.css'
                  ]
              })
            : null,

        ...extractBundles([
            {
                name: 'js/mediators/common',
                minChunks: shareModuleAfter
            }
            //{name: 'js/vendor', minChunks: module => isVendor(module) && !/\.css/.test(module.resource)}
        ]),

        isDevelop ? null : new webpack.optimize.AggressiveMergingPlugin(),

        isDevelop
            ? null
            : new ExtractTextPlugin({
                  allChunks: true,
                  filename(getPath) {
                      return getPath('css/[name]/index.css')
                          .replace('css/js/', 'css/')
                          .replace('mediators', 'pages')
                          .replace('common/index.css', 'global/index.css');
                  }
              }),

        isDevelop
            ? null
            : new OptimizeCssAssetsPlugin({
                  cssProcessor: require('cssnano'),
                  cssProcessorOptions: {
                      discardComments: { removeAll: true },
                      autoprefixer: false,
                      zindex: false
                  },
                  canPrint: true
              }),

        isDevelop
            ? null
            : new webpack.optimize.UglifyJsPlugin({
                  screw_ie8: true
              }),

        isDevelop ? require('nyan-progress-webpack-plugin')() : null
    ].filter(p => p),
    stats: 'minimal'
};
