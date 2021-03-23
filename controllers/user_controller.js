"use strict";

const { AppError } = require('../errors');
const discordRepository = require("../repositories/discord_repository");
const userRepository = require("../repositories/user_repository");
const userGamesRepository = require("../repositories/user_games_repository");

async function registerUser(username, description, accessToken, refreshToken) {
    if(username == null || description == null || accessToken == null || refreshToken == null) {
        throw new AppError(400, "Bad request");
    }

    // Get ID using access token and make
    let user = await discordRepository.getUser(accessToken);
    let uid = user.id;

    if(uid == null) {
        throw new AppError(404, "User not found");
    }

    // Make sure the user doesn't already exist.
    if(await userRepository.getUserFromId(uid) != null) {
        throw new AppError(400, "This user is already registered.");
    }

    // Register user in userRepository
    return await userRepository.addUser(uid, username, description);
}

async function connectGameToUser(uid, gid, hoursPlayed, rank){
    if(uid == null || gid == null){
        throw new AppError(400, "Bad request");
    }
    if(hoursPlayed == null){
        hoursPlayed = 0;
    }
    return await userGamesRepository.connectGameToUser(uid, gid, hoursPlayed, rank);
}

module.exports = {registerUser, connectGameToUser};