module.exports = (req) => {
	require('require-all')({
		dirname: __dirname + '/intents',
		resolve: (clz) => {
			return clz(req)
		}
	});
}