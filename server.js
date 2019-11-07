'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);
//const nsp_lobby = io.of('lobby');

var players = {};


io.on('connection', function(socket) {
  console.log('Client connected');

  socket.on('setNickname', function(nicknameData) {
    players[socket.id] = {};
    players[socket.id].nickname = nicknameData.nickname;
    console.log(players);
    console.log(nicknameData.nickname + " Joined the Lobby");
    socket.join('lobby');
    io.to('lobby').emit('getPlayers', players);
    //io.in('lobby').emit('getPlayers', players);
  });

  socket.on('sendMsg', function(msgData) {
    let prepmsg = players[socket.id].nickname + ": " + msgData.message;
    console.log(prepmsg);

    io.to('lobby').emit('newMsg', { message: prepmsg });
    //io.in('lobby').emit('newMsg', { message: prepmsg });
  });

  socket.on('disconnect', () => {
     console.log('Client disconnected');
     delete players[socket.id];
     io.to('lobby').emit('getPlayers', players);
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