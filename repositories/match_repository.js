const mysql = require("mysql");
const config = require("../config");
const { AppError } = require('../errors');

function dataToMatch(data) {
    const match = {
      first_user: data.first_user,
      second_user: data.second_user,
      matched_at: data.matched_at
    };
    return match
}

function matchDataToUser(data) {
    console.log(data);
    let match;
    if(data.first_user != null){
         match = {
            user: data.first_user,
            matched_at: data.matched_at
        };
    }
    else {
         match = {
            user: data.second_user,
            matched_at: data.matched_at
        };
    }
    return match;
}

function getMatch(firstUid, secondUid) {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((err) => {
            if(err){
                reject(err);
            }
            else {
                let sql = "SELECT * from matches where first_user = ? and second_user = ?";
                connection.query(sql, [firstUid, secondUid], (error, data) => {
                    connection.end();
                    if(error){
                        reject(error);
                    }
                    else {
                        resolve(data.map(dataToMatch));
                    }
                })
            }
        })
    });
}

function getAllMatches(uid){
    console.log(uid);
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((err) => {
            if(err){
                reject(err);
            }
            else {
                let sql = "  SELECT second_user, matched_at FROM matches WHERE first_user = ? UNION SELECT" +
                    " first_user, matched_at FROM matches WHERE second_user = ?";
                connection.query(sql, [uid, uid], (error, data) => {
                    connection.end();
                    if(error){
                        reject(error);
                    }
                    else {
                        resolve(data.map(matchDataToUser));
                    }
                });
            }
        })
    })
}

module.exports = {
    getMatch,
    getAllMatches
};