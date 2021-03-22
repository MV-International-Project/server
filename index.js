"use strict";

const config = require('./config');

const http = require("http");
const express = require("express");

const app = express();
app.use(express.json());
app.use(errorHandler);

/*
    Error handler
*/
function errorHandler(err, req, res, next) {
    console.log(err);
    res.status(500)
    .json({error: err});
}

/*
    API requests
*/
const router = express.Router()
app.use('/api', router)

const server = http.createServer(app);
const port = config.port;
server.listen(port);