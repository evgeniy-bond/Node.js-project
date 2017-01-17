let crypto = require('crypto');
let util = require('util');
let async = require('async');

let mongoose = require('../libs/mongoose');
let Schema = mongoose.Schema;

let schema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

schema.methods.encryptPassword = password => {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
    .set(password => {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(() => {
        return this._plainPassword;
    });


schema.methods.checkPassword = password => {
    return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = (username, password, callback) => {
    let User = this;
    async.waterfall([
        callback => {
            User.findOne({ username: username }, callback);
        },
        (user, callback) => {
            if (user) {
                if (user.checkPassword(password)) {
                    callback(null, user);
                } else {
                    callback(new AuthError(403, "Пароль неверен"));
                }
            } else {
                let user = new User({ username: username, password: password });
                user.save(err => {
                    if (err) return callback(err);
                    callback(null, user);
                });
            }
        }
    ], callback);
};

function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);

    this.status = status;
    this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.User = mongoose.model('User', schema);
exports.AuthError = AuthError;