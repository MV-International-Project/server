const mysql = require("mysql");
const connector = require("../connection");

const user_repo = require("./user_repository");

function dataToGames(data) {
    return {
        game_id: data.game_id,
        name: data.name,
        image: data.image_link
    };
}

function userIdToUser(data) {
    user_repo.getUserFromId(data.user_id, (err, user) => {
        if (err) {
            return null;
        } else {
            return {
                user_id: data.user_id,
                username: data.username,
                description: data.description,
                last_login: data.last_login
            };
        }
    });
}

async function connectGameToUser(uid, gid, hoursPlayed, rank) {
    let sql = "INSERT into user_games(user_id, game_id, hours_played, `rank`) VALUES(?,?,?,?) ";
    let connection = await connector.createConnection(connector.getDB());
    return new Promise((resolve, reject) => {
        connection.query(sql, [uid, gid, hoursPlayed, rank], (error) => {
            connection.end();
            if (error) {
                reject(error);
            } else {
                resolve(true);
            }
        });
    });
}

async function removeGameFromUser(uid, gid) {
    let sql = "DELETE from user_games where user_id = ? and game_id = ?";
    let connection = await connector.createConnection(connector.getDB());
    return new Promise(((resolve, reject) => {
        connection.query(sql, [uid, gid], (error) => {
            connection.end();
            if (error) {
                reject(error);
            } else {
                resolve(true);
            }
        });
    }));
}

async function getAllGamesFromUser(uid) {
    let sql = `SELECT games.game_id, games.name, games.image_link 
                FROM user_games 
                INNER JOIN games ON user_games.game_id = games.game_id
                WHERE user_id = ?`;
    let connection = await connector.createConnection(connector.getDB());
    return new Promise((resolve, reject) => {
        connection.query(sql, [uid], (error, data) => {
            connection.end();
            if (error) {
                reject(error);
            } else {
                resolve(data.map(dataToGames));
            }
        });
    });
}


async function checkPendingMatches(userId, suggestedUserId) {
    let sql = `SELECT accepted FROM pending_matches WHERE first_user = ? AND second_user = ? AND accepted = 1`;
    let connection = await connector.createConnection(connector.getDB());
    return new Promise((resolve, reject) => {
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
    });
}

async function checkCurrentMatches(userId, suggestedUserId) {
    let sql = `SELECT matched_at FROM matches WHERE first_user = ? AND second_user = ? OR first_user = ? AND second_user = ?`;
    let connection = await connector.createConnection(connector.getDB());
    return new Promise((resolve, reject) => {
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
    });
}


async function acceptMatchSuggestion(userId, suggestedUserId) {
    let sql = "INSERT INTO pending_matches(first_user, second_user, accepted) VALUES(?, ?, 1)";
    let connection = await connector.createConnection(connector.getDB());
    return new Promise((resolve, reject) => {
        connection.query(sql, [userId, suggestedUserId], (err) => {
            connection.end();
            if (err) {
                reject(err);
                return;
            } else {
                resolve(true);
            }
        });
    });
}

async function rejectPendingMatch(userId, suggestedUserId) {
    let sql = "INSERT INTO pending_matches(first_user, second_user, accepted) VALUES(?, ?, 0)";
    let connection = await connector.createConnection(connector.getDB());
    return new Promise((resolve, reject) => {
        connection.query(sql, [userId, suggestedUserId], (err) => {
            connection.end();
            if (err) {
                reject(err);
                return;
            } else {
                resolve(true);
            }
        });
    });
}


async function newMatch(userId, suggestedUserId) {
    let sql = `INSERT INTO matches(first_user, second_user) VALUES(?, ?);`;
    return new Promise((resolve, reject) => {

        let connection = mysql.createConnection(connector.getDB());

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
    acceptMatchSuggestion,
    checkPendingMatches,
    newMatch,
    removeGameFromUser,
    rejectPendingMatch,
    checkCurrentMatches
};