"use strict";

const config = require('./config');

const {AppError} = require('./errors');
const userController = require("./controllers/user_controller");
const userGamesController = require("./controllers/user_games_controller");

const http = require("http");
const express = require("express");
const jwt = require('jsonwebtoken');
const colors = require("colors");

const app = express();
app.use(express.json());

/*
    Error handler
*/
function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        res.status(err.statusCode)
            .json({error: err.message});
    } else {
        res.status(500)
            .json({error: err});
    }
}

/*
    Authentication middleware
*/
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer TOKEN

        jwt.verify(token, config.jsonwebtoken.key, (err, payload) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user_id = payload.id;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

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

router.post("/users/login", (req, res, next) => {
    let body = req.body;
    let accessToken = body.access_token;
    let refreshToken = body.refresh_token;

    userController.loginUser(accessToken, refreshToken)
        .then(result => res.status(200).json(result))
        .catch(next);
});

router.post("/users/game", authenticateJWT, (req, res, next) => {
    let body = req.body;
    let user_id = req.user_id;
    let game_id = body.game_id;
    let hours_played = body.hours_played;
    let rank = body.rank;
    userGamesController.connectGameToUser(user_id, game_id, hours_played, rank)
        .then(result => res.status(200).json(result))
        .catch(next);
});

router.delete("/users/:game_id", authenticateJWT, (req, res, next) => {
    let userId = req.user_id;
    let gameId = req.params.game_id;
    userGamesController.removeGameFromUser(userId, gameId)
        .then(result => res.status(200).json(result))
        .catch(next);
});

router.patch("/users/description", authenticateJWT, (req, res, next) => {
    let body = req.body;
    let uid = req.user_id;
    let description = body.description;
    userController.changeDescription(uid, description)
        .then(result => res.status(200).json(result))
        .catch(next);
});

router.post("/users/blacklist/:game_id", (req, res, next) => {
    let params = req.params;
    let gameId = params.game_id;
    // TEMP user id
    let userId = 1;

    userGamesController.addGameToBlackList(userId, gameId)
        .then(result => res.status(200).json(result))
        .catch(next);

});

router.delete("/users/blacklist/:game_id", (req, res, next) => {
    let params = req.params;
    let gameId = params.game_id;
    // TEMP user id
    let userId = 1;

    userGamesController.removeGameFromBlackList(userId, gameId)
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