"use strict";

const mysql = require("mysql");
const fetch = require('node-fetch');
const { AppError } = require("../errors");
const config = require("../config");
const ENDPOINT = "https://api.rawg.io/api";

async function addGame(gameId) {
    // Get game data
    let game = await fetch(`${ENDPOINT}/games/${gameId}`)
    .then(res => res.json())
    .then(gameObject => {
        return {
            name: gameObject.name,
            img: gameObject.background_image
        };
    });

    if(game === null) {
        throw new AppError(404, "Game not found.");
    }

    // Add game to the database
    let sql = "INSERT into games(game_id, name, image_link) VALUES(?,?,?)";
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.query(sql, [gameId, game.name, game.img], (err) =>{
            connection.end();
            if(err){
                reject(err);
                return;
            }

            resolve(true);
        });
    });
}

module.exports = {
    addGame
}