'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
var bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const LOBBY_INDEX = path.join(__dirname, 'lobby_index.html');

/*const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));*/

var app = express();
app.use(bodyParser.urlencoded({ extended: true })); 
app.get('/', (req, res) => {
  res.sendFile(INDEX);
});

const server = app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(server);

app.get('/lobby', (req, res) => {
  //console.log(req.body.username + ' post request to lobby');
  res.sendFile(LOBBY_INDEX);
});

var lobbyData = {};


io.of('/lobby').on('connection', function(socket) {
  console.log('Client connected');

  lobbyData[socket.id] = { id: socket.id };
  socket.emit('updateLobbyData', lobbyData);


  /*socket.on('setNickname', function(nicknameData) {
    players[socket.id] = {};
    players[socket.id].nickname = nicknameData.nickname;
    console.log(players);
    console.log(nicknameData.nickname + " Joined the Lobby");
    //socket.join('lobby');
    //io.to('lobby').emit('getPlayers', players);
    //io.in('lobby').emit('getPlayers', players);
  });*/

  /*socket.on('sendMsg', function(msgData) {
    let prepmsg = players[socket.id].nickname + ": " + msgData.message;
    console.log(prepmsg);

    //io.to('lobby').emit('newMsg', { message: prepmsg });
    //io.in('lobby').emit('newMsg', { message: prepmsg });
  });*/

  socket.on('disconnect', () => {
     console.log('Client disconnected');
     delete players[socket.id];
     //io.to('lobby').emit('getPlayers', players);
    //io.in('lobby').emit('getPlayers', players);
  });
});


/*nsp_lobby.on('connection', (socket) => {
  console.log('Client connected');
  players[socket.id] = {};

  socket.on('setNickname', function(nicknameData) {
    players[socket.id].nickname = nicknameData.nickname;
    console.log(players);
    socket.broadcast.emit('getPlayers', players);
    socket.emit('getPlayers', players);
  });


  socket.on('disconnect', () => {
     console.log('Client disconnected');
     delete players[socket.id];
  });

});*/