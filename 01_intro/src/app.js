const { json } = require('express');
const express = require('express');
const UserRouter = require('./user/UserRouter');

const app = express();

app.use(json());
app.use(UserRouter);

module.exports = app;
