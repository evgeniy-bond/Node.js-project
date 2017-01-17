let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let http = require('http');
let connect = require('connect')
let config = require('./config');
let log = require('./libs/log')(module);

let mongoose = require('./libs/mongoose');
let errorhandler = require('errorhandler')
let HttpError = require('./error').HttpError;

let app = express();
let index = require('./routes');

// view engine setup
app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, './templates'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));


let session = require('express-session');
let sessionStore = require('./libs/sessionStore');

app.use(session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  saveUninitialized: false,
  resave: false,
  store: sessionStore
}));


app.use(require('./middleware/sendHttpError'));
app.use(require('./middleware/loadUser'));

require('./routes')(app);

app.use(express.static(path.join(__dirname, 'public')));

app.use( (err, req, res, next) => {
  if (typeof err == 'number') {
    err = new HttpError(err);
  }

  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else {
    if (app.get('env') == 'development') {
      app.use(errorhandler()(err, req, res, next))
    } else {
      log.error(err);
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  }
});

let server = http.createServer(app);
server.listen(config.get('port'), () => {
  log.info('Express server listening on port ' + config.get('port'));
});

let io = require('./socket')(server);


module.exports = app;

