"use strict";

const { AppError } = require('../errors');
const userRepository = require("../repositories/user_repository");
const userGamesRepository = require("../repositories/user_games_repository");
const gameRepository = require("../repositories/game_repository");

async function getGamesFromUser(userId) {
    let gameIds = await userGamesRepository.getAllGamesFromUser(userId);
    gameIds = gameIds.map(obj => obj.game_id);
    let games = await Promise.all(gameIds.map(async id => gameRepository.getGame(id)));
    return games;
}

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
    if(await gameRepository.getGame(gid) == null) {
        // When the game doesn't exist in our database, try to add it
        await gameRepository.addGame(gid);
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
    getGamesFromUser,
    connectGameToUser,
    removeGameFromUser
};