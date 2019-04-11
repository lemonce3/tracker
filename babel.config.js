module.exports = function (api) {
	api.cache(false);
	
	return {
		presets: [
			[
				'@babel/env', {
					modules: false,
					loose: true,
					targets: {
						browsers: ['ie 8-11']
					}
				}
			]
		],
		plugins: [
			'@babel/plugin-transform-property-literals',
			'@babel/plugin-transform-member-expression-literals'
		]
	};
};