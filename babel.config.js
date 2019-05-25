module.exports = function (api) {
	api.cache(false);
	
	return {
		presets: [
			['@babel/preset-env', {
				loose: true,
				targets: {
					browsers: ['ie 6-8']
				}
			}]
		],
		plugins: [
			'@babel/plugin-transform-property-literals',
			'@babel/plugin-transform-member-expression-literals',
			'@babel/plugin-transform-runtime'
			// '@babel/plugin-transform-modules-commonjs',
		]
	};
};