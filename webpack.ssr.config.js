/*eslint-env node */

const webpack = require('webpack');
const path = require('path');
const { camelCase } = require('lodash');
const nodeExternals = require('webpack-node-externals');
const copyPlugin = require('copy-webpack-plugin');

// process ENV
const env = process.env;
const NODE_ENV = env.NODE_ENV || 'development';

const pkg = require('./package.json');
const brand = pkg.name
    .split('/')
    .pop()
    .split('-')
    .shift();

const alias = require('./webpack.aliases')(brand, 'dist');
const pkgName = camelCase(pkg.name.split('/').pop());

const aem = {
    devtool: 'none',

    entry: {
        main: path.resolve(__dirname, 'dist', 'library', 'js', 'ssr', 'server')
    },

    output: {
        path: path.resolve(
            __dirname,
            'dist',
            'jcr_root',
            'apps',
            'po',
            'postbooking',
            'components',
            'ssr'
        ),
        libraryTarget: 'umd',
        filename: `${pkgName}.js`,
        library: pkgName
    },

    resolve: {
        alias
    },

    plugins: [
        // used to disable css modules
        /*new webpack.NormalModuleReplacementPlugin(
            /\.css$/,
            require.resolve('@carnival-abg/platform/dist/library/js/ssr/nullStyle')
        ),*/

        new webpack.ContextReplacementPlugin(
            /moment[\/\\]locale$/,
            /de|fr|it|en|es|nl/
        ),

        new copyPlugin(
            [
                {
                    from: './library/js/vendor',
                    to: path.resolve(
                        __dirname,
                        'dist',
                        'jcr_root',
                        'apps', 
                        'settings', 
                        'wcm',
                        'designs',                                    
                        brand,
                        'postbooking',
                        'resources',
                        'js',
                        'vendor'
                    ),
                    toType: 'dir',
                    ignore: ['worldpay/**/*']
                }
            ],
            {}
        ),

        // https://webpack.js.org/plugins/define-plugin/
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(NODE_ENV)
            }
        }),

        // disables specific components that don't render in nashorn
        /*new webpack.NormalModuleReplacementPlugin(
            /cruiseDetailOverview/,
            require.resolve('@carnival-abg/platform/dist/library/js/modules/emptyComponent')
        ),*/

        // // https://webpack.js.org/guides/migrating/#uglifyjsplugin-sourcemap
        new webpack.optimize.UglifyJsPlugin({
            screw_ie8: true,
            sourceMap: false
        })
    ]
};

const node = Object.assign({}, aem, {
    target: 'node',

    externals: [nodeExternals()],

    entry: {
        main: path.resolve(__dirname, 'dist', 'components')
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
        filename: `${pkgName}.umd.js`,
        library: pkgName
    },
    plugins: aem.plugins.slice(0, aem.plugins.length - 2)
});

module.exports = [aem, node];
