"use strict";

const fetch = require('node-fetch');
const ENDPOINT = "https://api.rawg.io/api";

function searchGames(search="") {
    return new Promise((resolve, reject) => {
        fetch(`${ENDPOINT}/games?ordering=-metacritic&search_precise=true&metacritic=1,100&search=${search}`)
        .then(response => response.json())
        .then(games => {
            resolve(games);
        });
    });
}

module.exports = {
    searchGames
}