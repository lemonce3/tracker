const path = require('path');
const baseConfig = require('./webpack.base');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(baseConfig, {
	mode: 'development',
	devtool: 'source-map',
	devServer: {
		proxy: {
			'/api': {
				// target: config.proxy,
				proxyTimeout: 0,
				onProxyReq: (proxyReq, req, res) => req.setTimeout(0)
			}
		},
		host: '0.0.0.0',
		port: 8080,
		hot: false,
		inline: false
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: path.resolve(__dirname, './template/index.html'),
			templateParameters: {
				frameURL: require('./frame-server').rootFrameURL
			},
			inject: 'head'
		})
	]
});