"use strict";

const config = require('./config');
var cors = require('cors')

const {AppError} = require('./errors');
const userController = require("./controllers/user_controller");
const userGamesController = require("./controllers/user_games_controller");
const gameController = require("./controllers/game_controller");
const matchController = require("./controllers/match_controller");

const userFactory = require("./generatedummydata");

const http = require("http");
const express = require("express");
const jwt = require('jsonwebtoken');
const colors = require("colors");

const app = express();
app.use(express.json());
app.use(cors())

/*
    Error handler
*/
function errorHandler(err, req, res, next) {
    console.log(err);
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

        jwt.verify(token, config.jsonwebtoken.key, async (err, payload) => {
            if (err || await userController.isTokenBlocked(token)) {
                return res.sendStatus(403);
            }
            req.user_id = payload.id;
            req.token = token;
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

router.get("/user", authenticateJWT, (req, res, next) => {
    const userId = req.user_id;
    userController.getUserInformation(userId).then(user => {
        res.status(200).json(user);
    }).catch(next);
});

router.get("/users/authenticated", authenticateJWT, (req, res) => {
    res.status(200).json(true);
});


router.get("/users/login", (req, res, next) => {
    let code = req.query.code;

    userController.handleLogin(code)
        .then(result => {
            res.status(200)
            .cookie("authToken", result, {httpOnly: true, maxAge: 604800000})
            .redirect(config.clientPath);
        }).catch(next);
});

router.post("/users/logout", authenticateJWT, (req, res, next) => {
    userController.logoutUser(req.user_id, req.token)
    .then(result => {
        res.status(200)
        .clearCookie("authToken")
        .json(result);
    }).catch(next);
});

router.delete("/users/games/:game_id", authenticateJWT, (req, res, next) => {
    let userId = req.user_id;
    let gameId = req.params.game_id;
    userGamesController.removeGameFromUser(userId, gameId)
        .then(result => res.status(200).json(result))
        .catch(next);
});

router.post("/users/games/:game_id", authenticateJWT, (req, res, next) => {
    let body = req.body;
    let user_id = req.user_id;
    let game_id = req.params.game_id;
    let hours_played = body.hours_played;
    let rank = body.rank;
    userGamesController.connectGameToUser(user_id, game_id, hours_played, rank)
        .then(result => res.status(200).json(result))
        .catch(next);
});

router.patch("/users/description", (req, res, next) => {
    let body = req.body;
    //TODO: Get the uid with authentication instead of trough the body.
    let uid = body.user_id;
    let description = body.description;
    userController.changeDescription(uid, description)
        .then(result => res.status(200).json(result))
        .catch(next);
});

router.post("/users/blacklist/:game_id", authenticateJWT, (req, res, next) => {
    let params = req.params;
    let gameId = params.game_id;
    let userId = req.user_id;

    userGamesController.addGameToBlackList(userId, gameId)
        .then(result => res.status(200).json(result))
        .catch(next);

});

router.delete("/users/blacklist/:game_id", authenticateJWT, (req, res, next) => {
    let params = req.params;
    let gameId = params.game_id;
    let userId = req.user_id;


    userGamesController.removeGameFromBlackList(userId, gameId)
        .then(result => res.status(200).json(result))
        .catch(next);
});

router.delete("/users/blacklist", authenticateJWT, (req, res, next) => {
    let userId = req.user_id;

    userGamesController.resetBlacklist(userId)
    .then(result => res.status(200).json(result))
    .catch(next);
});

router.get("/users/matches", authenticateJWT, (req,res, next) => {
    let userId = req.user_id;
    matchController.getAllMatches(userId)
        .then(result => res.status(200).json(result))
        .catch(next);
});

router.get("/games/:game_id", (req, res, next) => {
    let gameId = req.params.game_id;
    gameController.getGameById(gameId).then(result => res.status(200).json(result))
    .catch(next);
});

router.get("/users/matchSuggestion", authenticateJWT, (req, res, next) => {
    const whitelist = req.query.games;

    matchController.getMatchSuggestion(req.user_id, whitelist)
    .then(potentialMatch => res.status(200).json(potentialMatch))
    .catch(next);
});

router.patch("/users/matchSuggestion/:suggested_user_id", authenticateJWT, (req, res, next) => {
    let suggestedUserId = req.params.suggested_user_id;
    let body = req.body;
    let accepted = body.accept;
    let userId = req.user_id;

    userGamesController.respondToMatchSuggestion(userId, suggestedUserId, accepted)
        .then(result => res.status(200).json(result))
        .catch(next);

});

router.get("/users/matches/:user_id", authenticateJWT , (req, res , next) => {
    let currentUserId = req.user_id;
    let matchedUserId = req.params.user_id;
    matchController.getInfoOfMatchedUser(currentUserId, matchedUserId)
        .then(result => res.status(200).json(result))
        .catch(next);
});

router.post("/test", (req, res) => {
    userFactory.generateUsers();
    res.status(200).end();
});

app.use(errorHandler);

const server = http.createServer(app);
const port = config.port;
server.listen(port);

console.log(colors.brightBlue(`International Project 06 back-end up and running at port ${port}`));