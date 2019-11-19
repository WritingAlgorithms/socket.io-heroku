var user_nickname;
var socket = io('/lobby');

setTimeout(function() {
    user_nickname = prompt("Enter a nickname:");
    if (user_nickname != null) {
        socket.emit('incomingRequest', { messageBody: { messageType: 'set_nickname', userNickname: user_nickname } });
    }
}, 1000);
    
socket.on('incomingResponse', function(responseData) {
    if (responseData.messageType == "new_lobby_message") {
        console.log(responseData);
        var chatarea = document.getElementById(responseData.component);
        var newline = document.createElement('li');
        newline.innerHTML = responseData.htmlString;
        chatarea.appendChild(newline);
    }
});


function sendChatMessage() {
    socket.emit('incomingRequest', {
        messageBody: {
            messageType: 'create_lobby_chat_message',
            messageText: document.getElementById('msgbox').value,
            senderNickname: user_nickname
        }
    });

    document.getElementById('msgbox').value = "";
}

