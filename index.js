"use strict";

const config = require('./config');

const http = require("http");
const express = require("express");

const app = express();
app.use(express.json());
app.use(errorHandler);

const discordRepository = require("./repositories/discord_repository");

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

router.post("/test", (req, res) => {
    discordRepository.getUser()
    .then(user => res.status(200).json(user))
    .catch(err => console.log(err));
});

const server = http.createServer(app);
const port = config.port;
server.listen(port);