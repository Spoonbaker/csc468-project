const mongoose = require('mongoose');

// Nice, memorable username & password
const MONGO_USERNAME = 'username';
const MONGO_PASSWORD = 'password';
const MONGO_HOSTNAME = 'mongo';
const MONGO_PORT = '27017';
const MONGO_DB = 'sharkinfo';

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

mongoose.connect(url, {useNewUrlParser: true});
