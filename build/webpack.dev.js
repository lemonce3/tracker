const path = require('path');
const baseConfig = require('./webpack.base');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(baseConfig, {
	mode: 'development',
	devtool: 'source-map',
	devServer: {
		proxy: {
			'api': config.proxy
		},
		host: '0.0.0.0',
		port: config.port,
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