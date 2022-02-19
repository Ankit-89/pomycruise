/*eslint-env node */

const DEFAULT_PORT = 3033;
const PORT = process.env.PORT || DEFAULT_PORT;

const express = require('express');
const babel = require('babel-core');
const moduleAlias = require('module-alias');
const engines = require('consolidate');
const ejs = require('ejs');
const webpack = require('webpack');
const wpMiddleware = require('webpack-dev-middleware');
const wpHotMiddleware = require('webpack-hot-middleware');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const clearRequire = require('clear-require');
const proxy = require('express-http-proxy');
const http = require('http');
const debug = require('debug')('app');
const HttpStatus = require('http-status-codes');
const url = require('url');

const wpConfig = require('./webpack.config');
const extractComponentData = require('./extract-component-data');

const app = express();
const wpCompiler = webpack(wpConfig);

const pkg = require('./package.json');
const pkgName = pkg.name.split('/').pop();
const pkgPath = pkgName.split('-').join('/');
const brand = pkgName.split('-').shift();

// path where content lives in AEM
const publicPath = `/etc.clientlibs/settings/wcm/designs/${pkgPath}/resources`;
const themeLocation = path.resolve(__dirname, 'themes', brand);

// important alias
moduleAlias.addAlias(
    'postbooking-theme',
    path.resolve(__dirname, 'themes', brand)
);
require('ignore-styles').default(['.css']);

app.use(
    wpMiddleware(wpCompiler, {
        serverSideRender: true,
        noInfo: true
    })
);

app.use(wpHotMiddleware(wpCompiler));
app.use(publicPath, express.static(themeLocation, { fallthrough: true }));
app.use(publicPath, express.static(path.resolve(__dirname, 'dist')));

//horrible vendor
app.use(
    '/etc/designs/carnival/po/postbooking/library/js/vendor',
    express.static(path.resolve(__dirname, 'library', 'js', 'vendor'))
);

// we should migrate this away to use /proxy
app.use('/services', express.static(path.resolve(__dirname, 'services')));

const normalizeAssets = assets => (Array.isArray(assets) ? assets : [assets]);

// Create an array of mediators for use in the default route
const mediatorLocation = path.resolve('library', 'js', 'mediators');
const mediators = fs.readdirSync(mediatorLocation).reduce((m, file) => {
    if (
        !fs.lstatSync(`${mediatorLocation}${path.sep}${file}`).isDirectory() &&
        /\.js$/.test(file)
    ) {
        m.push(file);
    }

    return m;
}, []);

app.locals.templateAnalytics = require('./views/includes/analytics');
app.locals.templateConfig = require('./views/includes/config');

engines.requires.ejs = ejs;

// setup templates
app.engine('ejs', engines.ejs);
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

app.locals.brand = brand;

app.get('/template/:templateName', (req, res) => {
    const assetsByChunkName = res.locals.webpackStats.toJson()
        .assetsByChunkName;

    const { templateName } = req.params;

    try {
        const componentData = JSON.stringify(
            extractComponentData(templateName, app.locals.brand)
        );
        debug('.-----.', assetsByChunkName);
        const scripts = Object.entries(assetsByChunkName)
            .map(([k, p]) => [k, normalizeAssets(p)])
            .filter(
                ([k, p]) =>
                    k &&
                    p.indexOf(`js/mediators/${req.params.templateName}.js`) + 1
            )
            .map(([k, p]) =>
                p
                    .map(
                        p1 =>
                            `<script data-webkit-id="${k}" src="/${p1}"></script>`
                    )
                    .join('\n')
            )
            .join('');

        const title = templateName
            .split(/[\s_\b]|(?=[A-Z])/)
            .join(' ')
            .toUpperCase();

        res.render('template', {
            templateName,
            title,
            componentData,
            scripts
        });
    } catch (e) {
        res.status(HttpStatus.NOT_FOUND).end();
        debug(`${HttpStatus.NOT_FOUND} /template/${templateName}`, e);
    }

    debug(`${HttpStatus.OK} /template/${templateName}`);
});

app.use(
    '/proxy',
    proxy('aem-dev.po.com', {
        https: true,
        proxyReqPathResolver(req) {
            return url.parse(req.url).path;
        }
    })
);

app.use(
    '/content/dam',
    express.static(path.resolve(__dirname, 'dam'), { fallthrough: true })
);
app.use(
    '/content',
    express.static(path.resolve(__dirname, 'content'), { fallthrough: true })
);
app.use(
    '/content',
    proxy('aem-qa.pocruise.com', {
        https: true,
        proxyReqPathResolver(req) {
            return `/content/${require('url').parse(req.url).path}`;
        }
    })
);

app.get('/', (req, res) => {
    // Default route creating an index page with all of the mediators.
    const indexList = mediators.map(file => {
        const fileName = file.split('.js')[0];
        return [
            fileName,
            fileName
                .split(/[\s_\b]|(?=[A-Z])/)
                .join(' ')
                .toUpperCase()
        ];
    });
    res.render('index', {
        indexList
    });
});

const server = http.createServer(app);

server.listen(PORT);

// Setup babel transform on components for use with SSR
chokidar
    .watch(['components/**/*.js', 'library/js/**/*.js'], {
        ignored: [
            'components/**/test',
            'library/js/mediators',
            'library/js/vendor'
        ]
    })
    .on('all', (event, filePath) => {
        const code = babel.transformFileSync(filePath).code;
        const outputPath = path.resolve(__dirname, 'dist', filePath);

        mkdirp.sync(path.dirname(outputPath));

        fs.writeFile(outputPath, code, err => {
            if (err) throw err;
            clearRequire(outputPath.replace(/\.js$/, ''));
        });
    });

// copy json and css to output
chokidar
    .watch(['components/**/*.json', 'components/**/styles'])
    .on('all', (event, filePath) => {
        const outputPath = path.resolve(__dirname, 'dist', filePath);
        debug("outputPath",outputPath);
        mkdirp.sync(path.dirname(outputPath));

        fs.copySync(filePath, outputPath);

        if (!/\.css$/.test(filePath)) {
            clearRequire(outputPath.replace(/\.json$/, ''));
        }
    });
