"use strict";

const { AppError } = require('../errors');
const discordRepository = require("../repositories/discord_repository");
const userRepository = require("../repositories/user_repository");
const userGamesRepository = require("../repositories/user_games_repository");



async function addGameToBlackList(userId, gameId) {
    if(userId == null || gameId == null) {
        throw new AppError(400, "Bad request");
    }

    // Make sure the user exists
    if(await userRepository.getUserFromId(userId) == null) {
        throw new AppError(404, "User not found.");
    }

    // Add game to blacklist
    await userGamesRepository.addGameToBlackList(userId, gameId);
    return true;
}


async function removeGameFromBlackList(userId, gameId) {
    if(userId == null || gameId == null) {
        throw new AppError(400, "Bad request");
    }

    // Make sure the user exists
    if(await userRepository.getUserFromId(userId) == null) {
        throw new AppError(404, "User not found.");
    }

    // Add game to blacklist
    await userGamesRepository.removeGameFromBlackList(userId, gameId);
    return true;
}

async function resetBlacklist(userId) {
    if(userId == null) {
        throw new AppError(400, "Bad request");
    }

    // Make sure the user exists
    if(await userRepository.getUserFromId(userId) == null) {
        throw new AppError(404, "User not found.");
    }

    // Reset blacklist
    await userGamesRepository.resetBlacklist(userId);
    return true;
}



async function connectGameToUser(uid, gid, hoursPlayed=0, rank=null){
    if(uid == null || gid == null){
        throw new AppError(400, "Bad request");
    }
    if(await userRepository.getUserFromId(uid) == null) {
        throw new AppError(404, "User not found.");
    }
    return await userGamesRepository.connectGameToUser(uid, gid, hoursPlayed, rank);
}

async function removeGameFromUser(uid, gid){
    if(uid == null || gid == null){
        throw new AppError(400, "Bad request");
    }
    if(await userRepository.getUserFromId(uid) == null) {
        throw new AppError(404, "User not found.");
    }
    return await userGamesRepository.removeGameFromUser(uid, gid);
}

module.exports = {
    addGameToBlackList,
    removeGameFromBlackList,
    resetBlacklist,
    connectGameToUser,
    removeGameFromUser
};