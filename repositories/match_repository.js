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

function dataToPendingMatch(data) {
    console.log(data);
    let match;
    if(data.first_user != null){
         match = {
            user: data.first_user,
            accepted: true
        };
    }
    else {
         match = {
            user: data.second_user,
            accepted: true
        };
    }
    return match;
}

function getMatch(firstUid, secondUid) {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((err) => {
            if(err){
                reject(null);
            }
            else {
                let sql = "SELECT * from matches where first_user = ? and second_user = ?";
                connection.query(sql, [firstUid, secondUid], (error, data) => {
                    connection.end();
                    if(error){
                        reject(null);
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
                reject(null);
            }
            else {
                let sql = "  SELECT second_user FROM pending_matches WHERE first_user = ? AND accepted = TRUE UNION SELECT" +
                    " first_user FROM pending_matches WHERE second_user = ? AND accepted = TRUE";
                connection.query(sql, [uid, uid], (error, data) => {
                    connection.end();
                    if(error){
                        reject(null);
                        return;
                    }
                    else {
                        resolve(data.map(dataToPendingMatch));
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