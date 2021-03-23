const mysql = require("mysql");
const config = require("../config");

function dataToGames(data) {
    const game = {
        game_id: data.game_id,
    };
    // getGameByID(); TODO: Wait for games API to be integrated to get the game info from that API.
}

function connectGameToUser(user_id, game_id, hours_played, rank, cb){
    let connection = mysql.createConnection(config.db);
    connection.connect((err) => {
        if(err){
            cb(err);
        }
        else {
            console.log("Connected to DB");
            let sql = "INSERT into user_games(user_id, game_id, hours_played, rank, blacklist) VALUES(?,?,?,?, false) ";
            connection.query(sql, [user_id, game_id, hours_played, rank], (error) => {
                if(error){
                    cb(err);
                }
                else {
                    cb(err, true);
                }
            })
        }
    });
}

function getAllGamesFromUser(user_id, cb) {
    let connection = mysql.createConnection(config.db);
    connection.connect((err)=> {
        if(err){
            cb(err);
        }
        else {
            console.log("Connected to DB");
            let sql = "SELECT game_id from user_games where user_id = ?";
            connection.query(sql, [user_id], (error, data) => {
                if(error){
                    cb(error);
                }
                else {
                    cb(error, data.map(dataToGames));
                }
            });
        }
    })
}