const mysql = require("mysql");
const userRepository = require("./repositories/user_repository");
const userGamesController = require("./controllers/user_games_controller");

const NAMES = ["Ritchwood", "Bollie", "SeppieDeMidge", "zeko10", "Georgiuss", "Freddy", "Jos",
"Flop", "Nade", "VerdommeMan", "Doyle", "George", "Johnny", "David", "Mickey", "Gwenda", "Tony", "Steve", "Natasha", "Bruce",
"Stephen", "Frank", "Bucky", "James", "Samuel", "Clint", "Wong", "Inst4nt_Rage", "Exentro"];
const GAMES = [248521, 3498, 9894, 9671, 9882, 3939, 50781, 9721, 13247, 415171, 4291, 
    58617, 46301, 10436, 455532, 326292, 292838, 3328, 10142, 356714, 9811, 9810, 46889, 
    10069, 422, 41494];

async function generateUsers() {
    let i = 1;
    for(const name of NAMES) {
        // Add user to the users table and discord table
        await userRepository.addUser(i, name, "", "cw22WM4sSQt0s8iKxm81FINMep8DoE", "RRHZ0IyAFZYj6IOa6a5Pq0dJN4rlJm");

        // Add some games to the user
        const selectedGames = GAMES.sort((a, b) => 0.5 - Math.random()).slice(5);
        selectedGames.forEach(async gameId => {
            await userGamesController.connectGameToUser(i, gameId);
        });

        i++;
    }
}

module.exports = {
    generateUsers
};