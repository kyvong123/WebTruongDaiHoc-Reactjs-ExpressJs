const appConfig = require('./package'),
    fs = require('fs'),
    path = require('path');

let preCleanFilesPluginOptions = [], doneCleanFilesPluginOptions = [],
    CleanFilesPlugin = function (entry) {
        preCleanFilesPluginOptions = [];
        doneCleanFilesPluginOptions = [];
        preCleanFilesPluginOptions.push({
            path: path.join(__dirname, 'public'),
            fileName: entry + '.template'
        });
        preCleanFilesPluginOptions.push({
            path: path.join(__dirname, 'public', 'js', entry),
            fileExtension: '.js'
        });
        doneCleanFilesPluginOptions.push({
            path: path.join(__dirname, 'public', 'js', entry),
            fileExtension: '.txt'
        });
    };
CleanFilesPlugin.prototype.apply = compiler => {
    const removeFiles = (option) => {
        fs.existsSync(option.path) && fs.readdirSync(option.path).forEach(filePath => {
            const fullFilePath = option.path + '/' + filePath;
            const state = fs.statSync(fullFilePath);
            if (state.isFile()) {
                if (option.fileName && filePath == option.fileName) {
                    fs.unlinkSync(fullFilePath);
                } else if (filePath.endsWith(option.fileExtension)) {
                    fs.unlinkSync(fullFilePath);
                }
            }
        });
    };
    compiler.hooks.emit.tap('CleanFiles', () => preCleanFilesPluginOptions.forEach(removeFiles));
    compiler.hooks.done.tap('CleanFiles', () => doneCleanFilesPluginOptions.forEach(removeFiles));
};

const getEntry = (entry) => {
    const result = {};
    const [mainEntry, subEntry] = entry.split('.');
    const folder = './view/' + mainEntry, filePath = subEntry ? `./view/${mainEntry}/${mainEntry}.${subEntry}.jsx` : `./view/${mainEntry}/${mainEntry}.jsx`;
    if (fs.lstatSync(folder).isDirectory() && fs.existsSync(filePath)) {
        result[entry] = path.join(__dirname, 'view', mainEntry, subEntry ? `${mainEntry}.${subEntry}.jsx` : `${mainEntry}.jsx`);
    }
    return result;
};

const genHtmlWebpackPlugins = (entry) => {
    let HtmlWebpackPlugin = require(require.resolve('html-webpack-plugin', { paths: [require.main.path] })),
        plugins = [],
        htmlPluginOptions = {
            inject: false,
            hash: true,
            minifyOptions: { removeComments: true, collapseWhitespace: true, conservativeCollapse: true },
            title: appConfig.title,
            keywords: appConfig.keywords,
            version: appConfig.version,
            description: appConfig.description,
        };
    const [mainEntry, subEntry] = entry.split('.');
    const template = subEntry ? `./view/${mainEntry}/${mainEntry}.${subEntry}.pug` : `./view/${mainEntry}/${mainEntry}.pug`;
    if (fs.existsSync(template) && fs.lstatSync(template).isFile()) {
        const options = Object.assign({ template, filename: subEntry ? `${mainEntry}.${subEntry}.template` : `${mainEntry}.template` }, htmlPluginOptions);
        plugins.push(new HtmlWebpackPlugin(options));
    }
    return plugins;
};

module.exports = (env, argv) => ({
    mode: 'production',
    entry: getEntry(argv.entry),
    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '/',
        filename: `js/${argv.entry}/[name].[contenthash].js`,
    },
    plugins: [
        ...genHtmlWebpackPlugins(argv.entry),
        new CleanFilesPlugin(argv.entry)
    ],
    module: {
        rules: [
            { test: /\.pug$/, use: ['pug-loader'] },
            { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
            { test: /\.s[ac]ss$/i, use: ['style-loader', 'css-loader', 'sass-loader'] },
            {
                test: /\.jsx?$/, exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: ['@babel/plugin-syntax-dynamic-import', '@babel/plugin-proposal-class-properties'],
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        cacheDirectory: true,
                        cacheCompression: false,
                    },
                }
            },
            {
                test: /\.(eot|.svg|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: { limit: 10000 },
                },
            },
            {
                test: /\.svg$/,
                use: {
                    loader: 'svg-url-loader',
                    options: { limit: 10000 },
                },
            },
        ]
    },
    resolve: {
        alias: { exceljsFE: path.resolve(__dirname, 'node_modules/exceljs/dist/exceljs.min') },
        modules: [path.resolve(__dirname, './'), 'node_modules'],
        extensions: ['.js', '.jsx', '.json'],
    },
    optimization: { minimize: true },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
});