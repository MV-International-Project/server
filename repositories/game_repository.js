"use strict";

const mysql = require("mysql");
const fetch = require('node-fetch');

const { AppError } = require("../errors");
const config = require("../config");
const connector = require("../connection");

const ENDPOINT = "https://api.rawg.io/api";

function mapRowToGame(row) {
    return {
        name: row.name,
        image: row.image_link
    }
}

async function getGame(gameId) {
    let sql = "SELECT name, image_link FROM games WHERE game_id = ?";
    let connection = await connector.createConnection(config.db);
    return new Promise((resolve, reject) => {
        connection.query(sql, [gameId], (err,  result) =>{
            connection.end();
            if(err){
                reject(err);
                return;
            }

            if(result.length == 0) {
                resolve(null);
            } else {
                resolve(mapRowToGame(result[0]));
            }
        });
    });
}

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
    let connection = await connector.createConnection(config.db);
    return new Promise((resolve, reject) => {
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
    getGame,
    addGame
};