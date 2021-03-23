"use strict";

const config = require('./config');

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

router.post("/users/game", (req, res) => {
    let body = req.body;
    let user_id = body.user_id;
    let game_id = body.game_id;
    let hours_played = body.hours_played;
    let rank = body.rank;
    user_games_repo.connectGameToUser(user_id, game_id, hours_played, rank, (err, result) =>{

        if(err){
            errorHandler(err);
        }
        else {
            res.end("succeeded");
        }
    });

});

const server = http.createServer(app);
const port = config.port;
server.listen(port);