const mysql = require("mysql");
const config = require("../config");
const {AppError} = require('../errors');


function dataToUser(data) {
    const user = {
        user_id: data.user_id,
        username: data.username,
        description: data.description,
        last_login: data.last_login
    };
    return user;
}

function addUser(userId, username, discordName, description, accessToken, refreshToken) {
    let connection = mysql.createConnection(config.db);
    return new Promise((resolve, reject) => {
        // Transaction to add user and his discord information
        connection.beginTransaction(function (err) {

            // Add user to the users table
            let sql = "INSERT into users(user_id ,username, description) VALUES(?,?,?)";
            connection.query(sql, [userId, username, description], (err) => {
                if (err) {
                    reject(err);
                    connection.end();
                    return;
                } else {
                    resolve(true);
                }
            });

            // Add the users discord information
            sql = `INSERT INTO discord(user_id, discord_id, access_token, refresh_token)
            VALUES(?, ?, ?, ?);`;
            connection.query(sql, [userId, discordName, accessToken, refreshToken], (err) => {
                connection.end();
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });

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

function getUserFromId(userId) {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((error) => {
            if (error) {
                reject(error);
            } else {
                let sql = "SELECT * from users where user_id = ?";
                connection.query(sql, [userId], (err, data) => {
                    connection.end();
                    if (err) {
                        reject(err);
                    }
                    else {
                        if(data.length == 0) {
                          resolve(null);
                          return;
                        }
                        resolve(dataToUser(data[0]));
                    }
                })
            }
        });
    });
}

function getTokens(userId) {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((error) => {
            if (error) {
                reject(error);
            } else {
                let sql = "SELECT * from discord where user_id = ?";
                connection.query(sql, [userId], (err, data) => {
                    connection.end();
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            accessToken: data[0].access_token,
                            refreshToken: data[0].refresh_token
                        });
                    }
                })
            }
        });
    });
}

function changeDescription(uid, description) {
    return new Promise(((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((error) => {
            if (error) {
                reject(error);
            } else {
                let sql = "UPDATE users SET description = ? where user_id = ?";
                connection.query(sql, [description, uid], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            }
        })
    }))
}

function updateTokens(userId, discordName, accessToken, refreshToken) {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((error) => {
            if (error) {
                reject(error);
            } else {
                let sql = `UPDATE discord 
                    SET discord_id = ?,
                    access_token = ?, 
                    refresh_token = ?
                    WHERE user_id = ?`;
                connection.query(sql, [discordName, accessToken, refreshToken, userId], (err) => {
                    connection.end();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            }
        });
    });
}

module.exports = {
    addUser,
    getUserFromId,
    changeDescription,
    getTokens,
    updateTokens
};
