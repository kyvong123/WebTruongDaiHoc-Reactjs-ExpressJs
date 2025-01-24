const appConfig = require('./package'),
    fs = require('fs'),
    path = require('path');

const entry = {};
fs.readdirSync('./view').forEach(folder => {
    if (fs.lstatSync('./view/' + folder).isDirectory() && fs.existsSync('./view/' + folder + '/' + folder + '.jsx')) {
        entry[folder] = path.join(__dirname, 'view', folder, folder + '.jsx');
    }
});
const genHtmlWebpackPlugins = (isProductionMode) => {
    let HtmlWebpackPlugin = isProductionMode ? require(require.resolve('html-webpack-plugin', { paths: [require.main.path] })) : require('html-webpack-plugin'),
        plugins = [],
        htmlPluginOptions = {
            inject: false,
            hash: true,
            minifyOptions: { removeComments: true, collapseWhitespace: true, conservativeCollapse: true },
            title: appConfig.title,
            keywords: appConfig.keywords,
            version: appConfig.version,
            description: appConfig.description
        };
    fs.readdirSync('./view').forEach(filename => {
        const template = `./view/${filename}/${filename}.pug`;
        if (filename != '.DS_Store' && fs.existsSync(template) && fs.lstatSync(template).isFile()) {
            const options = Object.assign({ template, filename: filename + '.template' }, htmlPluginOptions);
            plugins.push(new HtmlWebpackPlugin(options));
        }
    });
    return plugins;
};

module.exports = (env, argv) => ({
    entry,
    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '/',
        filename: 'js/[name].[contenthash].js',
    },
    plugins: [
        ...genHtmlWebpackPlugins(argv.mode === 'production')
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
    devServer: {
        port: appConfig.port + 1,
        compress: true,
        historyApiFallback: true,
        open: true,
        hot: true,
        static: {
            watch: false,
        }
    },
    resolve: {
        alias: { exceljsFE: path.resolve(__dirname, 'node_modules/exceljs/dist/exceljs.min') },
        modules: [path.resolve(__dirname, './'), 'node_modules'],
        extensions: ['.js', '.jsx', '.json'],
    },
    optimization: { minimize: true },
});