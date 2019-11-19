'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
var bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;
//const INDEX = path.join(__dirname, 'lobby.html');
//const GAME_ROOM_HTML = path.join(__dirname, 'room.html');
var sockets = {};
var gamerooms = {};
//const LOBBY_INDEX = path.join(__dirname, 'lobby.html');

/*const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));*/

var app = express();
//app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static(__dirname + '/public'));
console.log(__dirname + '/public');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/lobby.html');
});

app.get('/room', function (req, res) {
    res.sendFile(__dirname + '/public/room.html');
});

const server = app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(server);

var clients = {};
var lobby = io.of('/lobby');
lobby.on('connection', function(socket) {
   console.log("a new client has connected to the lobby..." + socket.id);
   
   socket.on('setNickname', function(data) {
        clients[socket.id] = { nickname: data.nickname };
        lobby.emit('welcomeNickname', { message: data.nickname + ' has entered the lobby.' });

   });
});


/*io.on('connection', function(socket) {
    console.log('Client connected');
    sockets[socket.id] = { id: socket.id };
    socket.join('lobby');
    io.to('lobby').emit('lobbyNewConnection', { message: 'New connection ' + socket.id });
    socket.emit('getAllRooms', gamerooms);


    socket.on('lobbyRecvMessage', function(msg) {
        console.log("Recv lobby message from client " + socket.id);
        io.to('lobby').emit('lobbySendMessage', { message: socket.id + ': ' + msg.message });
    });

    socket.on('createNewGameRoom', function(gameroom) {
        console.log('created new gameroom ' + gameroom.name);
        gamerooms[gameroom.name] = { host: socket.id, name: gameroom.name, players: {} };
        
        io.to('lobby').emit('showNewGameRoom', { host: socket.id, name: gameroom.name });
    });

    socket.on('enterGameRoom', function(enterData) {
       socket.join(enterData.roomName);
       console.log(socket.id + " entering " + enterData.roomName);
       gamerooms[enterData.roomName].players[socket.id] = { x: enterData.x, y: enterData.y, rotation: enterData.rotation };

       io.to(enterData.roomName).emit('getPlayers', { playerId: socket.id, players: gamerooms[enterData.roomName].players });
    });

    socket.on('newPosition', function(posData) {
        gamerooms[posData.roomName].players[socket.id] = { x: posData.x, y: posData.y, rotation: posData.rotation };
        io.to(posData.roomName).emit('updatePosition', { playerId: socket.id, players: gamerooms[posData.roomName].players });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        io.to('lobby').emit('lobbyRemoveConnection', { message: socket.id + ' has disconnected.' });
        socket.leave('lobby');
        delete sockets[socket.id];
    });
});*/