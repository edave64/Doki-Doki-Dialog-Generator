const request = require('request');
const express = require('express');
const constants = require('./constants');
const { port } = require('./constants');
const { join } = require('path');
const server = express();

server.use('/custom_characters', express.static(constants.characterPath));
server.use('/custom_backgrounds', express.static(constants.backgroundsPath));
server.use(
	'/custom_characters/:folder/index.json',
	require('./simpleContentPack')
);
server.use(express.static(join(__dirname, '../dddgWeb/')));
/*server.all('/*', function(req, res) {
	req
		.pipe(
			request(
				{
					url: 'http://localhost:8080/' + req.params[0],
					qs: req.query,
					method: req.method,
				},
				function(error, response, body) {
					if (error) {
						throw error;
					}
				}
			)
		)
		.pipe(res);
});*/

var serverLoaded;

module.exports = {
	start() {
		server.listen(port, function() {
			server_ready = true;
			serverLoaded();
		});
	},
	isReady: new Promise((resolve, reject) => {
		serverLoaded = resolve;
	}),
};
