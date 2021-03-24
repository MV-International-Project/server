const config = require('../config');
const userRepository = require('../repositories/user_repository');
const matchRespository = require('../repositories/match_repository');
const { AppError } = require('../errors');

async function getInfoOfMatchedUser(uid, matchedId) {
    const currentUser = await userRepository.getUserFromId(uid);
    const matchedUser = await userRepository.getUserFromId(matchedId);
    if(currentUser == null || matchedUser == null){
        throw new AppError(404, "User not found");
    }
    if(await matchRespository.getMatch(uid, matchedId) == null && await matchRespository.getMatch(matchedId, uid)){
        throw new AppError(404, "No match was found between these users.");
    }
    return userRepository.getUserFromId(matchedId);
}

module.exports = {
    getInfoOfMatchedUser
};