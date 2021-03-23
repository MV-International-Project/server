"use strict";

const discordRepository = require("../repositories/discord_repository");
const userRepository = require("../repositories/user_repository");

async function registerUser(username, description, accessToken, refreshToken) {
    if(username == null || description == null || accessToken == null || refreshToken == null) {
        throw "Bad request";
    }

    // Get ID using access token and make
    let user = await discordRepository.getUser(accessToken);
    let uid = user.id;

    if(uid == null) {
        throw "User not found";
    }

    // Make sure the user doesn't already exist.
    if(await userRepository.getUserFromId(uid) != null) {
        throw "This user is already registered.";
    }

    // Register user in userRepository
    return await userRepository.addUser(uid, username, description);
}

module.exports = {registerUser};