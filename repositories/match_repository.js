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
                    if(error){
                        reject(error);
                    }
                    else {
                        resolve(error, data.map(dataToMatch));
                    }
                })
            }
        })
    });
}

function getMatchSuggestion(userId) {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((err) => {
            if(err){
                reject(err);
            }
            else {
                let sql = `SELECT users.user_id, COUNT(*) AS commongames FROM users
                INNER JOIN user_games ON users.user_id = user_games.user_id
                WHERE users.user_id != ?
                AND NOT EXISTS(SELECT * FROM matches WHERE (first_user = ? AND second_user = users.user_id)
                        OR (first_user = users.user_id AND second_user = ?))
                AND NOT EXISTS (SELECT * FROM pending_matches WHERE first_user = ? AND second_user = users.user_id)
                AND EXISTS(SELECT game_id FROM user_games ug2 WHERE user_games.game_id = ug2.game_id AND ug2.user_id = ?)
                GROUP BY users.user_id
                ORDER BY commongames DESC`;
                connection.query(sql, Array(5).fill(userId), (error, data) => {
                    if(error){
                        reject(error);
                    }
                    else {
                        if(data.length == 0) {
                            resolve(null);
                        } else {
                            resolve(data[0].user_id);
                        }
                    }
                })
            }
        })
    });    
}

module.exports = {
    getMatch,
    getMatchSuggestion
};