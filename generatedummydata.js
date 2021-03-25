const config = require("./config");
const mysql = require("mysql");
const userRepository = require("./repositories/user_repository");

const NAMES = ["Ritchwood", "Bollie", "SeppieDeMidge", "zeko10", "Georgiuss", "Freddy", "Jos",
"Flop", "Nade", "VerdommeMan", "Doyle", "George", "Johnny", "David", "Mickey", "Gwenda", "Tony", "Steve", "Natasha", "Bruce",
"Stephen", "Frank", "Bucky", "James", "Samuel", "Clint", "Wong", "Inst4nt_Rage", "Exentro"];
const GAMES = []

function generateUsers(names, games) {
    let i = 1;
    for(const name of NAMES) {
        // Add user to the users table and discord table
        userRepository.addUser(i, name, "", accessToken, refreshToken);

        // Add some games to the user

        i++;
    }
}
