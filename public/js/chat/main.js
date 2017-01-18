$(document).ready(function () {
    var input = $('#room input');
    var ul = $('#room ul');
    var form = $('#room form');
    var socket = io.connect('', {
        reconnect: false
    });
    socket
        .on('message', function (message) {
            printMessage(message);
        })
        .on('connect', function () {
            printStatus("соединение установлено");
            form.on('submit', sendMessage);
            input.prop('disabled', false);
        })
        .on('disconnect', function () {
            printStatus("соединение потеряно");
            form.off('submit', sendMessage);
            input.prop('disabled', true);
            setTimeout(reconnect, 500);
        });
    function sendMessage() {
        var text = input.val();
        socket.emit('message', text, function () {
            printMessage(text);
        });
        input.val('');
        return false;
    }
    function reconnect() {
        socket.once('error', function () {
            setTimeout(reconnect, 500);
        });
        socket.socket.connect();
    }
    function printStatus(status) {
        $('<li>').append($('<i>').text(status)).appendTo(ul);
    }
    function printMessage(text) {
        $('<li>').text(text).appendTo(ul);
    }
});