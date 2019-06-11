const path = require('path');

module.exports = {
	entry: {
		bundle: [
			path.resolve('src/index.js')
		]
	},
	output: {
		path: path.resolve('dist'),
		filename: '[name].js',
		publicPath: '/'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
			{
				test: /\.js$/,
				include: /@lemonce/,
				use: ['babel-loader'],
			}
		]
	},
	target: 'web',
	node: false,
	devServer: {
		disableHostCheck: true
	}
};