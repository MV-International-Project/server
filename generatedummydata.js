const mysql = require("mysql");
const userRepository = require("./repositories/user_repository");
const userGamesController = require("./controllers/user_games_controller");

const NAMES = ["Ritchwood", "Bollie", "SeppieDeMidge", "zeko10", "Georgiuss", "Freddy", "Jos",
"Flop", "Nade", "VerdommeMan", "Doyle", "George", "Johnny", "David", "Mickey", "Gwenda", "Tony", "Steve", "Natasha", "Bruce",
"Stephen", "Frank", "Bucky", "James", "Samuel", "Clint", "Wong", "Inst4nt_Rage", "Exentro"];
const GAMES = []

function generateUsers() {
    let i = 1;
    for(const name of NAMES) {
        // Add user to the users table and discord table
        userRepository.addUser(i, name, "", "cw22WM4sSQt0s8iKxm81FINMep8DoE", "RRHZ0IyAFZYj6IOa6a5Pq0dJN4rlJm");

        // Add some games to the user
        userGamesController.connectGameToUser(i, gameId);

        i++;
    }
}

module.exports = {
    generateUsers
};