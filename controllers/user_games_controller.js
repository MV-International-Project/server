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

async function respondToPendingMatch(userId, suggestedUserId, accepted) {
    if(userId == null || suggestedUserId == null || accepted == null) {
        throw new AppError(400, "Bad request");
    }

    // Make sure the user exists
    if(await userRepository.getUserFromId(userId) == null || userRepository.getUserFromId(suggestedUserId) == null) {
        throw new AppError(404, "User not found.");
    }

    // Accept match
    if (accepted == "true") {
        await userGamesRepository.acceptPendingMatch(userId, suggestedUserId);
    } else {
        //await userGamesRepository.rejectPendingMatch(userId, suggestedUserId);
    }
    return true;
}

module.exports = {
    addGameToBlackList,
    removeGameFromBlackList
};