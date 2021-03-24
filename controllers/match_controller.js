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

async function mapMatchObject(user, discordUser) {
    return {
        id: user.user_id,
        username: user.username,
        avatar_path: userController.getAvatarPath(discordUser),
        description: user.description,
        games: await userGamesController.getGamesFromUser(user.user_id),
    };    
}

module.exports = {
    getMatchSuggestion,
    getInfoOfMatchedUser
};