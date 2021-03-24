const mysql = require("mysql");
const config = require("../config");
const user_repo = require("./user_repository");

function dataToGames(data) {
    const game = {
        game_id: data.game_id,
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

function connectGameToUser(uid, gid, hoursPlayed, rank) {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((err) => {
            if (err) {
                reject(err);
            } else {
                let sql = "INSERT into user_games(user_id, game_id, hours_played, `rank`, blacklist) VALUES(?,?,?,?, false) ";
                connection.query(sql, [uid, gid, hoursPlayed, rank], (error) => {
                    connection.end();
                    if (error) {
                        reject(error);
                    } else {
                        resolve(true);
                    }
                })
            }
        });
    });
}

function removeGameFromUser(uid, gid) {
    return new Promise(((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((err) =>{
            if (err) {
                reject(err);
            } else {
                let sql = "DELETE from user_games where user_id = ? and game_id = ?";
                connection.query(sql, [uid, gid], (error) =>{
                    connection.end();
                    if(error){
                        reject(error);
                    } else {
                        resolve(true);
                    }
                })
            }
        })
    }))
}

function getAllGamesFromUser(uid) {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((err) => {
            if (err) {
                reject(err);
            } else {
                let sql = "SELECT game_id from user_games where user_id = ?";
                connection.query(sql, [uid], (error, data) => {
                    connection.end();
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data.map(dataToGames));
                    }
                });
            }
        });
    });

}

function getAllUsersFromGame(gid) {
    return new Promise((resolve, reject) =>{
        let connection = mysql.createConnection(config.db);
        connection.connect((err) => {
            if (err) {
                reject(err);
            } else {
                let sql = "SELECT user_id from user_games where game_id = ?";
                connection.query(sql, [gid], (error, data) => {
                    connection.end();
                    if (error) {
                        reject(error);
                    } else {
                        resolve(error, data.map(userIdToUser));
                    }
                });
            }
        });
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
    resetBlacklist,
    removeGameFromUser
};