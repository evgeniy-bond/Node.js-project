let log = require('../libs/log')(module);

module.exports = server => {
  let io = require('socket.io').listen(server);
  io.set('origins', 'localhost:*');
  io.set('logger', log);

  io.sockets.on('connection', socket => {

    socket.on('message', (text, cb) => {
      socket.broadcast.emit('message', text);
      cb && cb();
    });
  });
};