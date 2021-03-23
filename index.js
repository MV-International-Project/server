"use strict";

const config = require('./config');

const { AppError } = require('./errors');
const userController = require("./controllers/user_controller");
const userGamesController = require("./controllers/user_games_controller");


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

router.post("/users/login", (req, res, next) => {
    let body = req.body;
    let accessToken = body.access_token;
    let refreshToken = body.refresh_token;

    userController.loginUser(accessToken, refreshToken)
    .then(result => res.status(200).json(result))
    .catch(next);
})

router.post("/users/game", (req, res) => {
    let body = req.body;
    let user_id = body.user_id;
    let game_id = body.game_id;
    let hours_played = body.hours_played;
    let rank = body.rank;
    user_games_repo.connectGameToUser(user_id, game_id, hours_played, rank, (err) => {
        if (err) {
            errorHandler(err);
            res.end("failed");
        } else {
            res.end("succeeded");
        }
    });

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

router.delete("/users/blacklist", (req, res, next) => {
    // TEMP user id
    let userId = 1;

    userGamesController.resetBlacklist(userId)
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