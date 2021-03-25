const userRepository = require('../repositories/user_repository');
const matchRepository = require('../repositories/match_repository');
const discordRepository = require('../repositories/discord_repository');

const userController = require('../controllers/user_controller');
const userGamesController = require("../controllers/user_games_controller");

const {AppError} = require('../errors');

async function getMatchSuggestion(uid, whitelist) {
    const matchSuggestions = [];
    const potentialMatchIds = await matchRepository.getMatchSuggestion(uid, whitelist);

    if (potentialMatchIds === null) {
        throw new AppError(404, "No potential matches found.");
    }

    for (const matchSuggestion of potentialMatchIds) {
        const potentialMatch = await userRepository.getUserFromId(matchSuggestion);
        const potentialMatchDiscord = await userController.getDiscordUser(matchSuggestion);

        matchSuggestions.push(await mapMatchObject(potentialMatch, potentialMatchDiscord));
    }
    return matchSuggestions;
}

async function getInfoOfMatchedUser(uid, matchedId) {
    if (uid == null || matchedId || null) {
        throw new AppError(400, "Bad Request");
    }
    const currentUser = await userRepository.getUserFromId(uid);
    const matchedUser = await userRepository.getUserFromId(matchedId);

    const discordUser = await userController.getDiscordUser(uid);

    if (currentUser == null || matchedUser == null) {
        throw new AppError(404, "User not found");
    }
    if (await matchRepository.getMatch(uid, matchedId) == null && await matchRepository.getMatch(matchedId, uid)) {
        throw new AppError(404, "No match was found between these users.");
    }

    return await userController.mapUserObject(matchedUser, discordUser);
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

    return await Promise.all(matches.map(await matchToUser));
}

async function mapMatchObject(user, discordUser) {
    return {
        id: user.user_id,
        username: user.username,
        avatar_path: await userController.getAvatarPath(discordUser),
        description: user.description,
        games: await userGamesController.getGamesFromUser(user.user_id),
    };
}

async function matchToUser(match) {
    let user = await userRepository.getUserFromId(match.user);
    const discordTokens = await userRepository.getTokens(user.user_id);
    const discordUser = await discordRepository.getUser(discordTokens.accessToken);
    let matched_at = await getDateTime(match.matched_at);
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

async function getDateTime(dateTimeString) {
    let date = dateTimeString.toLocaleDateString().toString().split("/");
    let year = date[2];
    let month = date[1];
    if (month.length === 1) {
        month = "0" + month
    }
    let day = date[0];
    if (day.length === 1) {
        day = "0" + day;
    }
    let time = dateTimeString.toTimeString().toString().split(" ")[0];

    return "" + year + "-" + month + "-" + day + " " + time;
}

module.exports = {
    getMatchSuggestion,
    getInfoOfMatchedUser,
    getAllMatches
};