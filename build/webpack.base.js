const path = require('path');

global.config = require(path.resolve(process.cwd(), 'config.json'));

module.exports = {
	entry: {
		bundle: [
			path.resolve(__dirname, '../index.js')
		]
	},
	output: {
		path: path.resolve(__dirname, '../dist'),
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
	target: 'web'
};