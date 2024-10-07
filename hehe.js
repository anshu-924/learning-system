const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');

const server = express();
server.use(morgan('default'));
mongoose.connect("mongodb+srv://projectgrandeur:projectgrandeur@cluster1.99dwruu.mongodb.net/").catch((error) => console.log(error));
console.log("Connected to database");
server.listen(8080);