'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
var bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'lobby.html');
var sockets = {};
//const LOBBY_INDEX = path.join(__dirname, 'lobby.html');

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

io.on('connection', function(socket) {
    console.log('Client connected');
    sockets[socket.id] = { id: socket.id };
    socket.join('lobby');
    io.to('lobby').emit('lobbyNewConnection', { message: 'New connection ' + socket.id });


    socket.on('lobbyRecvMessage', function(msg) {
        console.log("Recv lobby message from client " + socket.id);
        io.to('lobby').emit('lobbySendMessage', { message: socket.id + ': ' + msg.message });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        io.to('lobby').emit('lobbyRemoveConnection', { message: socket.id + ' has disconnected.' });
        socket.leave('lobby');
        delete sockets[socket.id];
    });
});