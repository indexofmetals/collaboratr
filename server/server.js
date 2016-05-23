var express = require('express');
var shortid = require('shortid');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var users = {};
const PORT = 8080;

app.use('/:id', express.static('site'));
app.get('/', function(req, res){
	res.statusCode = 302;
  	res.setHeader('Location', '/' + shortid.generate());
  	res.end();
})

io.on('connection', function(socket){

	socket.on('CodeMirror', function(data){
		socket.broadcast.emit('CodeMirror#' + data.collabId, data.value);
	});

	socket.on('join', function(data) {
		if(!users.hasOwnProperty(data.collabId)){
			users[data.collabId] = [];
		};
		var currentUsers = users[data.collabId];
		data.value.hasWritePermission = (currentUsers.length === 0);
		currentUsers.push(data.value);
		io.sockets.emit('refresh-users#' + data.collabId, currentUsers);
	});
	
	socket.on('update-users', function (data) {
		if(!users.hasOwnProperty(data.collabId)){
			console.log('Something is very wrong...');
		}
		users[data.collabId] = data.value;
		io.sockets.emit('refresh-users#' + data.collabId, data.value);
	});
});

http.listen(PORT, function(){
	console.log('listening on ' + PORT);
});