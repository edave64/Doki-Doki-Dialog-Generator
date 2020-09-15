module.exports = {
	publicPath: '.',
	chainWebpack: config => {
		config.plugin('copy').tap(args => {
			const config = args[0][0];
			if (process.env.DDDGElectron) {
				config.ignore.push('**/*.lq.webp');
				config.ignore.push('**/*.png');
			}
			return [[config]];
		});
	},
	css: {
		loaderOptions: {
			sass: {
				prependData: `@import "@/styles/global_mixins.scss";`,
			},
		},
	},
};
