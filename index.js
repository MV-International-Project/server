"use strict";

const config = require('./config');

const { AppError } = require('./errors');
const userController = require("./controllers/user_controller");

const http = require("http");
const express = require("express");
const colors = require("colors");

const app = express();
app.use(express.json());

/*
    Error handler
*/
function errorHandler(err, req, res, next) {
    if(err instanceof AppError) {
        res.status(err.statusCode)
        .json({error: err.message});
    } else {
        res.status(500)
        .json({error: err});
    }
}

/*
    API requests
*/
const router = express.Router();
app.use('/api', router);

router.post("/users/register", (req, res, next) => {
    let body = req.body;
    let username = body.username;
    let description = body.description;
    let accessToken = body.access_token;
    let refreshToken = body.refresh_token;

    userController.registerUser(username, description, accessToken, refreshToken)
    .then(result => res.status(200).json(result))
    .catch(next);
});

router.post("/users/game", (req, res, next) => {
    let body = req.body;
    let user_id = body.user_id;
    let game_id = body.game_id;
    let hours_played = body.hours_played;
    let rank = body.rank;
    userController.connectGameToUser(user_id, game_id, hours_played, rank)
        .then(result => res.status(200).json(result))
        .catch(next);
});

router.patch("/users/description", (req, res, next) =>{
    let body = req.body;
    //TODO: Get the uid with authentication instead of trough the body.
    let uid = body.user_id;
    let description = body.description;
    userController.changeDescription(uid, description)
        .then(result => res.status(200).json(result))
        .catch(next);
});

router.post("/test", (req, res) => {
    discordRepository.getUser()
    .then(user => res.status(200).json(user))
    .catch(err => console.log(err));
});

app.use(errorHandler);

const server = http.createServer(app);
const port = config.port;
server.listen(port);

console.log(colors.brightBlue(`International Project 06 back-end up and running at port ${port}`));