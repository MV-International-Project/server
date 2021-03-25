"use strict";

const mysql = require("mysql");
const config = require("../config");
const user_repo = require("./user_repository");

function dataToGames(data) {
    const game = {
        game_id: data.game_id,
        name: data.name,
        image: data.image_link
    };
    return game;
}

function userIdToUser(data) {
    user_repo.getUserFromId(data.user_id, (err, user) => {
        if (err) {
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
    let sql = "INSERT into user_games(user_id, game_id, hours_played, `rank`, blacklist) VALUES(?,?,?,?, false) ";
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((err) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, [uid, gid, hoursPlayed, rank], (error) => {
                    connection.end();
                    if (error) {
                        reject(error);
                    } else {
                        resolve(true);
                    }
                });
            }
        });
    });
}

function removeGameFromUser(uid, gid) {
    let sql = "DELETE from user_games where user_id = ? and game_id = ?";
    return new Promise(((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((err) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, [uid, gid], (error) => {
                    connection.end();
                    if (error) {
                        reject(error);
                    } else {
                        resolve(true);
                    }
                });
            }
        })
    }))
}

function getAllGamesFromUser(uid) {
    let sql = `SELECT games.game_id, games.name, games.image_link 
                FROM user_games 
                INNER JOIN games ON user_games.game_id = games.game_id
                WHERE user_id = ?`;
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((err) => {
            if (err) {
                reject(err);
            } else {
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


function addGameToBlackList(userId, gameId) {
    let sql = "UPDATE user_games SET blacklist = 1 WHERE user_id = ? AND game_id = ? AND blacklist = 0";
    return new Promise((resolve, reject) => {

        let connection = mysql.createConnection(config.db);

        connection.connect((error) => {
            if (error) {
                reject(error);
            } else {
                connection.query(sql, [userId, gameId], (err, result) => {
                    connection.end();
                    if (err) {
                        reject(err);
                    } else {
                        if (result.affectedRows == 0) {
                            reject("This game is already on your blacklist!")
                        }
                        resolve(true);
                    }
                });
            }
        });
    });
}


function removeGameFromBlackList(userId, gameId) {
    let sql = "UPDATE user_games SET blacklist = 0 WHERE user_id = ? AND game_id = ? AND blacklist = 1";
    return new Promise((resolve, reject) => {

        let connection = mysql.createConnection(config.db);

        connection.connect((error) => {
            if (error) {
                reject(error);
            } else {
                connection.query(sql, [userId, gameId], (err, result) => {
                    connection.end();
                    if (err) {
                        reject(err);
                    } else {
                        if (result.affectedRows == 0) {
                            reject("This game is not on your blacklist!")
                        }
                        resolve(true);
                    }
                });
            }
        });
    });
}

function resetBlacklist(userId) {
    let sql = "UPDATE user_games SET blacklist = 0 WHERE user_id = ? AND blacklist = 1";
    return new Promise((resolve, reject) => {

        let connection = mysql.createConnection(config.db);

        connection.connect((error) => {
            if (error) {
                reject(error);
            } else {
                connection.query(sql, [userId], (err, result) => {
                    connection.end();
                    if (err) {
                        reject(err);
                    } else {
                        if (result.affectedRows == 0) {
                            reject("There are no games on your blacklist!");
                            return;
                        }
                        resolve(true);
                    }
                });
            }
        });
    });
}


function checkPendingMatches(userId, suggestedUserId) {
    let sql = `SELECT accepted FROM pending_matches WHERE first_user = ? AND second_user = ? AND accepted = 1`;
    return new Promise((resolve, reject) => {

        let connection = mysql.createConnection(config.db);

        connection.connect((error) => {
            if (error) {
                reject(error);
            } else {
                connection.query(sql, [suggestedUserId, userId], (err, result) => {
                    connection.end();
                    if (err) {
                        reject(err);
                    } else {
                        if (result.length > 0) {
                            resolve(true);
                            return;
                        }
                        resolve(false);
                    }
                });
            }
        });
    });
}

function checkCurrentMatches(userId, suggestedUserId) {

    return new Promise((resolve, reject) => {
        let sql = `SELECT matched_at FROM matches WHERE first_user = ? AND second_user = ? OR first_user = ? AND second_user = ?`;
        let connection = mysql.createConnection(config.db);

        connection.connect((error) => {
            if (error) {
                reject(error);
            } else {
                connection.query(sql, [suggestedUserId, userId, userId, suggestedUserId], (err, result) => {
                    connection.end();
                    if (err) {
                        reject(err);
                    } else {
                        if (result.length > 0) {
                            resolve(true);
                            return;
                        }
                        resolve(false);
                    }
                })
            }
        });
    });
}


function acceptMatchSuggestion(userId, suggestedUserId) {
    let sql = "INSERT INTO pending_matches(first_user, second_user, accepted) VALUES(?, ?, 1)";
    return new Promise((resolve, reject) => {

        let connection = mysql.createConnection(config.db);

        connection.connect((error) => {
            if (error) {
                reject(error);
            } else {
                connection.query(sql, [userId, suggestedUserId], (err) => {
                    connection.end();
                    if (err) {
                        reject(err);
                        return;
                    } else {
                        resolve(true);
                    }
                })
            }
        });
    });
}

function rejectPendingMatch(userId, suggestedUserId) {
    let sql = "INSERT INTO pending_matches(first_user, second_user, accepted) VALUES(?, ?, 0)";
    return new Promise((resolve, reject) => {

        let connection = mysql.createConnection(config.db);

        connection.connect((error) => {
            if (error) {
                reject(error);
            } else {

                connection.query(sql, [userId, suggestedUserId], (err) => {
                    connection.end();
                    if (err) {
                        reject(err);
                        return;
                    } else {
                        resolve(true);
                    }
                })
            }
        });
    });
}


function newMatch(userId, suggestedUserId) {
    let sql = `INSERT INTO matches(first_user, second_user) VALUES(?, ?);`;
    return new Promise((resolve, reject) => {

        let connection = mysql.createConnection(config.db);

        connection.beginTransaction(function (error) {

            if (error) {
                reject(error);
                connection.end();
            } else {

                connection.query(sql, [userId, suggestedUserId], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });


                sql = `DELETE FROM pending_matches WHERE first_user = ? AND second_user = ?;`;

                connection.query(sql, [suggestedUserId, userId], (err) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                })

            }

            // Commit transaction if previous queries were succesful
            connection.commit(err => {
                if (err) {
                    connection.rollback(() => {
                        reject(err);
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
    addGameToBlackList,
    removeGameFromBlackList,
    acceptMatchSuggestion,
    checkPendingMatches,
    newMatch,
    resetBlacklist,
    removeGameFromUser,
    rejectPendingMatch,
    checkCurrentMatches
};