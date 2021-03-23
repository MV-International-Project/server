const mysql = require("mysql");
const config = require("../config");
const user_repo = require("./user_repository");

function dataToGames(data) {
    const game = {
        game_id: data.game_id,
        //TODO: remove name & image link after game API integrates.
        name: "Testgame",
        image_link: "Fakelink"
    };
    return game;
    // getGameByID(); TODO: Wait for games API to be integrated to get the game info from that API.

}

function userIdToUser(data) {
    user_repo.getUserFromId(data.user_id, (err, user) => {
        if (err) {
            console.log(err);
            return null;
        } else {
            const user = {
                user_id: data.user_id,
                username: data.username,
                description: data.description,
                last_login: data.last_login
            };
            return user;
        }
    });
}

function connectGameToUser(user_id, game_id, hours_played, rank, cb) {
    let connection = mysql.createConnection(config.db);
    connection.connect((err) => {
        if (err) {
            cb(err);
        } else {
            console.log("Connected to DB");
            let sql = "INSERT into user_games(user_id, game_id, hours_played, `rank`, blacklist) VALUES(?,?,?,?, false) ";
            connection.query(sql, [user_id, game_id, hours_played, rank], (error) => {

                connection.end();
                if (error) {
                    cb(error);
                    console.log(error);
                } else {
                    cb(error);
                }
            })
        }
    });
}

function getAllGamesFromUser(user_id, cb) {
    let connection = mysql.createConnection(config.db);
    connection.connect((err) => {
        if (err) {
            cb(err);
        } else {
            console.log("Connected to DB");
            let sql = "SELECT game_id from user_games where user_id = ?";
            connection.query(sql, [user_id], (error, data) => {
                connection.end();
                if (error) {
                    cb(error);
                    console.log(error);
                } else {
                    cb(error, data.map(dataToGames));
                }
            });
        }
    });
}

function getAllUsersFromGame(game_id, cb) {
    let connection = mysql.createConnection(config.db);
    connection.connect((err) => {
        if (err) {
            cb(err);
        } else {
            console.log("Connected to DB");
            let sql = "SELECT user_id from user_games where game_id = ?";
            connection.query(sql, [game_id], (error, data) => {
                connection.end();
                if (error) {
                    cb(error);
                } else {
                    cb(error, data.map(userIdToUser));
                }
            });
        }
    });
}


function addGameToBlackList(userId, gameId) {
  return new Promise((resolve, reject) => {

    let connection = mysql.createConnection(config.db);

    connection.connect((error)=>{
            if(error){
                reject(error);
            }
            else {
                let sql = "UPDATE user_games SET blacklist = 1 WHERE user_id = ? AND game_id = ? AND blacklist = 0";

                connection.query(sql, [userId, gameId], (err, result) => {
                    connection.end();
                    if(err){
                        reject(err);
                    }
                    else {
                      if (result.affectedRows == 0) {
                          reject("This game is already on your blacklist!")
                      }
                        resolve(true);
                    }
                })
            }
        });
  });
}


function removeGameFromBlackList(userId, gameId) {
  return new Promise((resolve, reject) => {

    let connection = mysql.createConnection(config.db);

    connection.connect((error)=>{
            if(error){
                reject(error);
            }
            else {
                let sql = "UPDATE user_games SET blacklist = 0 WHERE user_id = ? AND game_id = ? AND blacklist = 1";

                connection.query(sql, [userId, gameId], (err, result) => {
                    connection.end();
                    if(err){
                        reject(err);
                    }
                    else {
                      if (result.affectedRows == 0) {
                          reject("This game is not on your blacklist!")
                      }
                        resolve(true);
                    }
                })
            }
        });
  });
}


function resetBlacklist(userId) {
  return new Promise((resolve, reject) => {

    let connection = mysql.createConnection(config.db);

    connection.connect((error)=>{
            if(error){
                reject(error);
            }
            else {
                let sql = "UPDATE user_games SET blacklist = 0 WHERE user_id = ? AND blacklist = 1";

                connection.query(sql, [userId], (err, result) => {
                    connection.end();
                    if(err){
                        reject(err);
                    }
                    else {
                      if (result.affectedRows == 0) {
                          reject("There are no games on your blacklist!")
                      }
                        resolve(true);
                    }
                })
            }
        });
  });
}


module.exports = {
    connectGameToUser,
    getAllGamesFromUser,
    getAllUsersFromGame,
    addGameToBlackList,
    removeGameFromBlackList,
    resetBlacklist
};