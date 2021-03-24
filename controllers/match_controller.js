const config = require('../config');
const userRepository = require('../repositories/user_repository');
const matchRespository = require('../repositories/match_repository');
const discordRepository = require('../repositories/discord_repository');
const userController = require('../controllers/user_controller');
const { AppError } = require('../errors');

async function getInfoOfMatchedUser(uid, matchedId) {
    const currentUser = await userRepository.getUserFromId(uid);
    const matchedUser = await userRepository.getUserFromId(matchedId);

    const discordTokens = await userRepository.getTokens(matchedId);
    const discordUser = await discordRepository.getUser(discordTokens.accessToken);

    if(currentUser == null || matchedUser == null){
        throw new AppError(404, "User not found");
    }
    if(await matchRespository.getMatch(uid, matchedId) == null && await matchRespository.getMatch(matchedId, uid)){
        throw new AppError(404, "No match was found between these users.");
    }


    return userController.mapUserObject(matchedUser, discordUser);
}

module.exports = {
    getInfoOfMatchedUser
};