let checkAuth = require('../middleware/checkAuth');

let User = require('../models/user').User;
let HttpError = require('../error').HttpError;

module.exports = app => {

  app.get('/', require('./frontpage').get);
  app.get('/login', require('./login').get);
  app.post('/login', require('./login').post);
  app.post('/logout', require('./logout').post);
  app.get('/chat', checkAuth, require('./chat').get);

}



