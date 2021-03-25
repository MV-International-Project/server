"use strict";

const {AppError} = require('../errors');

const gameRepository = require("../repositories/game_repository");
const userRepository = require("../repositories/user_repository");
const userGamesRepository = require("../repositories/user_games_repository");

const gameController = require("../controllers/game_controller");


async function getGamesFromUser(userId) {
    return await userGamesRepository.getAllGamesFromUser(userId);
}


async function respondToMatchSuggestion(userId, suggestedUserId, accepted) {
    if (userId == null || suggestedUserId == null || accepted == null) {
        throw new AppError(400, "Bad request");
    }

    // Make sure the user exists
    if (await userRepository.getUserFromId(userId) == null || await userRepository.getUserFromId(suggestedUserId) == null) {
        throw new AppError(404, "User not found.");
    }

    // Make sure the user doesnt match themself
    if (userId == suggestedUserId) {
        throw new AppError(409, "You cannot match with yourself!");
    }

    if (await userGamesRepository.checkCurrentMatches(userId, suggestedUserId)) {
        throw new AppError(409, "You are already matched with this person!");
    }

    // Accept match
    if (accepted) {
        if (await userGamesRepository.checkPendingMatches(userId, suggestedUserId)) {
            await userGamesRepository.newMatch(userId, suggestedUserId);
        } else {
            await userGamesRepository.acceptMatchSuggestion(userId, suggestedUserId);
        }
    } else {
        await userGamesRepository.rejectPendingMatch(userId, suggestedUserId);
    }
    return true;
}


async function hasGame(uid, gid) {
    let userGames = await userGamesRepository.getAllGamesFromUser(uid);
    userGames = userGames.map(game => game.game_id);
    return userGames.includes(parseInt(gid));
}

async function connectGameToUser(uid, gid, hoursPlayed = 0, rank = null) {
    if (uid == null || gid == null) {
        throw new AppError(400, "Bad request");
    }
    if (await userRepository.getUserFromId(uid) == null) {
        throw new AppError(404, "User not found.");
    }
    if (await gameRepository.getGame(gid) == null) {
        // When the game doesn't exist in our database, try to add it
        await gameRepository.addGame(gid);
    }

    if (await hasGame(uid, gid)) {
        throw new AppError(400, "You already have this game.");
    }

    return await userGamesRepository.connectGameToUser(uid, gid, hoursPlayed, rank);
}

async function removeGameFromUser(uid, gid) {
    if (uid == null || gid == null) {
        throw new AppError(400, "Bad request");
    }
    if (await userRepository.getUserFromId(uid) == null) {
        throw new AppError(404, "User not found.");
    }

    if (!await hasGame(uid, gid)) {
        throw new AppError(400, "You don't have this game");
    }

    return await userGamesRepository.removeGameFromUser(uid, gid);

}

module.exports = {
    getGamesFromUser,
    connectGameToUser,
    removeGameFromUser,
    respondToMatchSuggestion
};