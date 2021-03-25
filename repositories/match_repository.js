"use strict";

const mysql = require("mysql");

const config = require("../config");
const connector = require("../connection");

function dataToMatch(data) {
    const match = {
        first_user: data.first_user,
        second_user: data.second_user,
        matched_at: data.matched_at
    };
    return match
}

function matchDataToUser(data) {
    let match;
    if (data.first_user != null) {
        match = {
            user: data.first_user,
            matched_at: data.matched_at
        };
    } else {
        match = {
            user: data.second_user,
            matched_at: data.matched_at
        };
    }
    return match;
}

async function getMatch(firstUid, secondUid) {
    let sql = "SELECT * from matches where first_user = ? and second_user = ?";
    let connection = await connector.createConnection(config.db);
    return new Promise((resolve, reject) => {
        connection.query(sql, [firstUid, secondUid], (error, data) => {
            connection.end();
            if (error) {
                reject(error);
            } else {
                resolve(data.map(dataToMatch));
            }
        });
    });
}

async function getMatchSuggestion(userId, whitelist) {
    let connection = await connector.createConnection(config.db);
    return new Promise((resolve, reject) => {
        /*
            This function will look for people that have the most games in common with you,
            if you already swiped someone or matches someone they will not be suggested to
            you anymore. If a whitelist is supplied only games with those game id's
            will be looked at.
        */

        let sql = `SELECT users.user_id, COUNT(*) AS commongames FROM users
    INNER JOIN user_games ON users.user_id = user_games.user_id
    WHERE users.user_id != ?
    AND NOT EXISTS(SELECT * FROM matches WHERE (first_user = ? AND second_user = users.user_id)
            OR (first_user = users.user_id AND second_user = ?))
    AND NOT EXISTS (SELECT * FROM pending_matches WHERE first_user = ? AND second_user = users.user_id)
    ${whitelist ? `AND user_games.game_id IN (${connection.escape(whitelist)})` : ""}
    AND EXISTS(SELECT game_id FROM user_games ug2 WHERE user_games.game_id = ug2.game_id AND ug2.user_id = ?)
    GROUP BY users.user_id
    ORDER BY commongames DESC
    LIMIT 2;`;
        connection.query(sql, Array(5).fill(userId), (error, data) => {
            if (error) {
                reject(error);
                return;
            }

            if (data.length == 0) {
                resolve(null);
            } else {
                resolve(data.map(matchSuggestion => matchSuggestion.user_id));
            }
        });
    });
}

async function getAllMatches(uid) {
    let sql = "SELECT second_user, matched_at FROM matches WHERE first_user = ? UNION SELECT" +
        " first_user, matched_at FROM matches WHERE second_user = ?";
    let connection = await connector.createConnection(config.db);
    return new Promise((resolve, reject) => {
        connection.query(sql, [uid, uid], (error, data) => {
            connection.end();
            if (error) {
                reject(error);
            } else {
                resolve(data.map(matchDataToUser));
            }
        });
    });
}

module.exports = {
    getMatch,
    getMatchSuggestion,
    getAllMatches
};