"use strict";

const config = require('./config');

const userController = require("./controllers/user_controller");
const user_games_repo = require("./repositories/user_games_repository");

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
const router = express.Router();
app.use('/api', router);

router.post("/users/register", (req, res) => {
    let body = req.body;
    let username = body.username;
    let description = body.description;
    let accessToken = body.access_token;
    let refreshToken = body.refresh_token;

    userController.registerUser(username, description, accessToken, refreshToken)
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err));
});

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

router.post("/test", (req, res) => {
    discordRepository.getUser()
    .then(user => res.status(200).json(user))
    .catch(err => console.log(err));
});

const server = http.createServer(app);
const port = config.port;
server.listen(port);