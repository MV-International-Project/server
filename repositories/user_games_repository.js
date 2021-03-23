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

function connectGameToUser(uid, gid, hoursPlayed, rank) {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((err) => {
            if (err) {
                reject(err);
            } else {
                console.log("Connected to DB");
                let sql = "INSERT into user_games(user_id, game_id, hours_played, `rank`, blacklist) VALUES(?,?,?,?, false) ";
                connection.query(sql, [uid, gid, hoursPlayed, rank], (error) => {
                    connection.end();
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
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
                console.log("Connected to DB");
                let sql = "DELETE from user_games where user_id = ? and game_id = ?";
                connection.query(sql, [uid, gid], (error) =>{
                    connection.end();
                    if(error){
                        reject(error);
                    } else {
                        resolve();
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
                console.log("Connected to DB");
                let sql = "SELECT game_id from user_games where user_id = ?";
                connection.query(sql, [uid], (error, data) => {
                    connection.end();
                    if (error) {
                        reject(error);
                    } else {
                        resolve(error, data.map(dataToGames));
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
                console.log("Connected to DB");
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


function checkPendingMatches(userId, suggestedUserId) {
  return new Promise((resolve, reject) => {

    let connection = mysql.createConnection(config.db);

    connection.connect((error)=>{
            if(error){
                reject(error);
            }
            else {
                let sql = `SELECT accepted FROM pending_matches WHERE first_user = ? AND second_user = ? AND accepted = 1`;

                connection.query(sql, [suggestedUserId, userId], (err, result) => {
                    connection.end();
                    if(err){
                        reject(err);
                    }
                    else {
                        if (result.length > 0) {
                            resolve(true);
                        }
                        resolve(false);
                    }
                })
            }
        });
  });
}



function acceptMatchSuggestion(userId, suggestedUserId) {
  return new Promise((resolve, reject) => {

    let connection = mysql.createConnection(config.db);

    connection.connect((error)=>{
            if(error){
                reject(error);
            }
            else {
                let sql = "INSERT INTO pending_matches(first_user, second_user, accepted) VALUES(?, ?, 1)";

                connection.query(sql, [userId, suggestedUserId], (err, result) => {
                    connection.end();
                    if(err){
                        reject(err);
                    }
                    else {
                        resolve(true);
                    }
                })
            }
        });
  });
}


function newMatch(userId, suggestedUserId) {
  return new Promise((resolve, reject) => {

    let connection = mysql.createConnection(config.db);

     connection.beginTransaction(function(error) {

            if(error){
                reject(error);
                connection.end();
            }
            else {
                let sql = `INSERT INTO matches(first_user, second_user) VALUES(?, ?);`;

                connection.query(sql, [userId, suggestedUserId], (err, result) => {
                    
                    if(err){
                        reject(err);
                    }
                    else {
                        resolve(true);
                    }
                });


                sql = `DELETE FROM pending_matches WHERE first_user = ? AND second_user = ?;`;

                connection.query(sql, [suggestedUserId, userId], (err, result) => {
                    
                    if(err){
                        reject(err);
                    }
                    else {
                        resolve(true);
                    }
                })

            }

            
            // Commit transaction if previous queries were succesful
            connection.commit(error => {
                if(error) {
                    connection.rollback(() => {
                        reject(error);
                        connection.end();  
                        return;
                    });
                }

                resolve(true);
            });
        });



  });
}

module.exports = {
    connectGameToUser,
    getAllGamesFromUser,
    getAllUsersFromGame,
    addGameToBlackList,
    removeGameFromBlackList,
    acceptMatchSuggestion,
    removeGameFromUser,
    checkPendingMatches,
    newMatch
};