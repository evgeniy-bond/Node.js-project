let mongoose = require('./libs/mongoose');
mongoose.set('debug', true);

let async = require('async');

async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers
], (err, results) => {
    mongoose.disconnect();
    console.log(arguments);
})

function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    let db = mongoose.connection.db;
    db.dropDatabase(callback);
}

function requireModels(callback) {
    require('./models/user');

    async.each(Object.keys(mongoose.models), (modelName, callback) => {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback)
}

function createUsers(callback) {

    let users = [
        { username: 'Vasya', password: 'supervasya' },
        { username: 'Petya', password: 'superpetya' },
        { username: 'admin', password: 'superadmin' }
    ]

    async.each(users, function (userData, callback) {
        let user = mongoose.models.User(userData);
        user.save(callback);
    }, callback);
}



