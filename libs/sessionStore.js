let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let mongoose = require('mongoose');

let sessionStore = new MongoStore({mongooseConnection: mongoose.connection});

module.exports = sessionStore;