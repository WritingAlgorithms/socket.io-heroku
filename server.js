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

/**********************Models*************************/

/**** Lobby Model */
function LobbyModel(lobby_identifier) {
    this.lobbyId = lobby_identifier;
    this.userList = [];
    this.msgList = [];
    this.roomList = [];
}

LobbyModel.prototype.addUser = function(new_user) {
    this.userList.push(new_user);
};

LobbyModel.prototype.addMessage = function(new_msg) {
    this.msgList.push(new_msg);
};

LobbyModel.prototype.addRoom = function(new_room) {
    this.roomList.push(new_room);
};

LobbyModel.prototype.removeUser = function(socket_id) {
    let user_index = this.userList.map(m => m.socket.id).indexOf(socket_id);
    let removed_nickname = this.userList[user_index].nickname;
    if (user_index != -1) {
        this.userList.splice(user_index, 1);
    }

    return removed_nickname;
};

LobbyModel.prototype.removeRoom = function(room_name) {
    let room_index = this.roomList.map(m => m.roomId).indexOf(room_name);
    if (room_index != -1) {
        this.roomList.splice(room_index, 1);
    }
};


/********************** */
/**** Lobby User Model */
function LobbyUser(user_identifier, user_socket) {
    this.nickname = user_identifier;
    this.socket = user_socket;
}

/********************** */
/**** Lobby Room Model */
function LobbyRoom(room_identifier, room_hostname) {
    this.roomId = room_identifier;
    this.hostname = room_hostname;
}

LobbyRoom.prototype.toHtml = function() {
    return "<li>" + this.hostname + " | " + this.roomId + "</li>";
};

/********************** */
/**** Lobby Message Model */
function LobbyChatMessage(msg_text, msg_sendername) {
    this.text = msg_text;
    this.sender = msg_sendername;
}

LobbyChatMessage.prototype.toHtml = function() {
    return "<li><b>" + this.sender + "</b>: " + this.text + "</li>";
};

/*****************************************************/
/*****************************************************/
/*****************************************************/

/***** Lobby View ************************************/

/**** Lobby View */
function LobbyView(lobby_model_instance) {
    this.model = lobby_model_instance;
}

LobbyView.prototype.getView = function(lobby_component) {
    var componentView = [];
    if (lobby_component == "msgList") {
        componentView = this.model.msgList.map(x => x.toHtml());
        componentView = componentView.join("");
        return { component: "chat_area", htmlString: componentView };
    }
}

/*****************************************************/
/*****************************************************/
/*****************************************************/

/***** Lobby Controller ************************************/

/**** Lobby Controller */
function LobbyController(io_nsp, lobby_id) {
    this.lobbyModel = new LobbyModel(lobby_id);
    this.view = new LobbyView(this.lobbyModel);
    this.io = io_nsp;
}

LobbyController.prototype.init = function() {
    var vm = this;
    vm.io.on('connection', function(socket) {

        socket.on('incomingRequest', function(requestData) {
            vm.newRequest(requestData, socket);
        });

        socket.on('disconnect', function(data) {
            let removed_nickname = vm.lobbyModel.removeUser(socket.id);
            console.log('Client ' + removed_nickname + ' disconnected...');

            vm.newRequest({
                messageBody: {
                    messageType: "remove_lobby_user",
                    messageText: removed_nickname + " has left the lobby.",
                    senderNickname: "*"
                }
            });
        });


    });
};

LobbyController.prototype.newRequest = function(request_data, client_socket_connection) { //,callback) {
    
    let msg = request_data.messageBody;

    if (msg.messageType == "set_nickname") {
        this.lobbyModel.addUser(new LobbyUser(msg.userNickname, client_socket_connection));
        let new_msg = new LobbyChatMessage(msg.userNickname + " has entered the lobby.", "*");
        this.lobbyModel.addMessage(new_msg);
        this.io.emit('incomingResponse', { messageType: "new_lobby_message", component: 'chat_area', htmlString: new_msg.toHtml() });

    } else if (msg.messageType == "remove_lobby_user") {
        let new_msg = new LobbyChatMessage(msg.messageText, msg.senderNickname);
        this.lobbyModel.addMessage(new_msg);
        this.io.emit('incomingResponse', { messageType: "new_lobby_message", component: 'chat_area', htmlString: new_msg.toHtml() });

    } else if (msg.messageType == "create_lobby_chat_message") {
        let new_msg = new LobbyChatMessage(msg.messageText, msg.senderNickname);
        this.lobbyModel.addMessage(new_msg);
        this.io.emit('incomingResponse', { messageType: "new_lobby_message", component: 'chat_area', htmlString: new_msg.toHtml() });

    }

};


/*****************************************************/
/*****************************************************/
/*****************************************************/




//var clients = {};
var lobby = io.of('/lobby');
console.log('*** Initializing Lobby... ***');
var lobbyController = new LobbyController(lobby, 'lobby_main');
lobbyController.init();


/*lobby.on('connection', function(socket) {
   console.log("a new client has connected to the lobby..." + socket.id);
   
   socket.on('setNickname', function(data) {
        clients[socket.id] = { nickname: data.nickname };
        lobby.emit('welcomeNickname', { message: data.nickname + ' has entered the lobby.' });

   });

});*/

/*setTimeout(function() {
    console.log("---BEGINNING LOBBY MVC TEST---");
    var lby = new LobbyController(lobby, 'lobbyTest1');
    var newreq = {
        messageBody: {
            messageType: "create_lobby_chat_message",
            messageText: "Test the chat message text.",
            senderNickname: "Charles A"
        }
    };

    lby.newRequest(newreq);
    console.log("\n");
    console.log("==========================================");
    console.log("Controller's lobby model...");
    console.log(lby.lobbyModel);
    console.log("View's lobby model...");
    console.log(lby.view.model);
    console.log('\n\n');
    
    setTimeout(function() {
        console.log("---NEXT LOBBY MVC call getView()---");
        var viewmsgs = lby.view.getView('msgList');
        console.log(viewmsgs);
        console.log('\n\n');

    }, 1000);
}, 2000);*/


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