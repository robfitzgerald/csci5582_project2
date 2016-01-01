(function() {

	var express = require('express');
	var app = express();

	global.PROJECT_ROOT = __dirname;

	app.use(express.static('public'))
	app.get('/', function(req, res) {
		console.log('sending project2.html')
		res.sendFile(PROJECT_ROOT + '/public/project2.html');
	});
	console.log('serving site at localhost:80')
	app.listen(80);

})();