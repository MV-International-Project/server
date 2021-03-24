const config = require('../config');
const userRepository = require('../repositories/user_repository');
const matchRepository = require('../repositories/match_repository');
const discordRepository = require('../repositories/discord_repository');
const userController = require('../controllers/user_controller');
const userGamesController = require("../controllers/user_games_controller");
const { AppError } = require('../errors');

async function getMatchSuggestion(uid, whitelist) {
    const potentialMatchId = await matchRepository.getMatchSuggestion(uid, whitelist);

    if(potentialMatchId === null) {
        throw new AppError(404, "No potential matches found.");
    }

    const potentialMatch = await userRepository.getUserFromId(potentialMatchId);
    const potentialMatchDiscord = await userController.getDiscordUser(potentialMatchId);

    return await mapMatchObject(potentialMatch, potentialMatchDiscord);
}

async function getInfoOfMatchedUser(uid, matchedId) {
    if(uid == null || matchedId || null){
        throw new AppError(400, "Bad Request");
    }
    const currentUser = await userRepository.getUserFromId(uid);
    const matchedUser = await userRepository.getUserFromId(matchedId);

    //TODO: Test with multiple users that are actually linked to discord.
    const discordUser = userController.getDiscordUser(uid);

    if(currentUser == null || matchedUser == null){
        throw new AppError(404, "User not found");
    }
    if(await matchRepository.getMatch(uid, matchedId) == null && await matchRepository.getMatch(matchedId, uid)){
        throw new AppError(404, "No match was found between these users.");
    }

    return userController.mapUserObject(matchedUser, discordUser);
}

async function getAllMatches(uid) {
    if (uid == null) {
        throw new AppError(400, "Bad Request");
    }
    const user = await userRepository.getUserFromId(uid);
    if (user == null) {
        throw new AppError(404, "User not found");
    }
    const matches = await matchRepository.getAllMatches(uid);
    if (matches == null) {
        throw new AppError(404, "No matches found for this user.")
    }
    
    let users = await Promise.all(matches.map(await matchToUser));
    return users;
}

async function mapMatchObject(user, discordUser) {
    return {
        id: user.user_id,
        username: user.username,
        avatar_path: userController.getAvatarPath(discordUser),
        description: user.description,
        games: await userGamesController.getGamesFromUser(user.user_id),
    };
}

async function matchToUser(match){
    let user = await userRepository.getUserFromId(match.user);
    const discordTokens = await userRepository.getTokens(user.user_id);
    const discordUser = await discordRepository.getUser(discordTokens.accessToken);
    let date = match.matched_at.toLocaleDateString().toString().split("/");
    let year = date[2];
    let month = date[1];
    if(month.length === 1){
        month = "0" + month
    }
    let day = date[0];
    if(day.length === 1){
        day = "0"+ day;
    }
    let time = match.matched_at.toTimeString().toString().split(" ")[0];

    let matched_at = "" + year + "-" + month + "-" + day + " " + time;
    return {
        id: user.user_id,
        username: user.username,
        avatar_path: userController.getAvatarPath(discordUser),
        description: user.description,
        games: await userGamesController.getGamesFromUser(user.user_id),
        discord_tag: userController.getDiscordTag(discordUser),
        matched_at: matched_at
    };    
}

module.exports = {
    getMatchSuggestion,
    getInfoOfMatchedUser,
    getAllMatches
};