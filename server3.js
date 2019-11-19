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

io.on('connection', function(socket) {
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



    socket.on('enterGameRoom', function(newPlayer) {
        socket.join(newPlayer.roomName);
        gamerooms[newPlayer.roomName].players[socket.id] = newPlayer.position;
        socket.emit('getMySocketId', { playerId: socket.id});
        socket.emit('showRoomData', gamerooms[newPlayer.roomName].players);
        io.to(newPlayer.roomName).emit('showNewPlayer', { playerId: socket.id, player: gamerooms[newPlayer.roomName].players[socket.id] });
    });


    /****************************************/
    socket.on('joinGameRoom', function(gameroom) {
        console.log(socket.id + " joining game room...");
        socket.join(gameroom.gameroom);
        console.log(gameroom);
        socket.emit('getRoomData', gamerooms[gameroom.gameroom]);

        gamerooms[gameroom.gameroom].players[socket.id] = {};

        io.to(gameroom.gameroom).emit('sendToGameRoom', {
            message: socket.id + ' joined...',
            newPlayerId: socket.id
        });
    });


    socket.on('newPosition', function(positionData) {
       var new_pos = Object.assign({}, positionData);
       new_pos.playerId = socket.id;
       gamerooms[positionData.roomName].players[socket.id] = new_pos;
       io.to(positionData.roomName).emit('updatePosition', new_pos);
    });
    /****************************************/





    socket.on('disconnect', () => {
        console.log('Client disconnected');
        io.to('lobby').emit('lobbyRemoveConnection', { message: socket.id + ' has disconnected.' });
        socket.leave('lobby');
        delete sockets[socket.id];
    });
});