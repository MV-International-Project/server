"use strict";

const { AppError } = require('../errors');
const discordRepository = require("../repositories/discord_repository");
const userRepository = require("../repositories/user_repository");

async function registerUser(username, description, accessToken, refreshToken) {
    if(username == null || description == null || accessToken == null || refreshToken == null) {
        throw new AppError(400, "Bad request");
    }

    // Get user ID using the access token
    let user = await discordRepository.getUser(accessToken);
    let uid = user.id;

    // Make sure the user exists
    if(uid == null) {
        throw new AppError(404, "User not found");
    }

    // Make sure the user doesn't already exist.
    if(await userRepository.getUserFromId(uid) != null) {
        throw new AppError(400, "This user is already registered.");
    }

    // Register user in userRepository
    return await userRepository.addUser(uid, username, description);
}

async function loginUser(accessToken, refreshToken) {
    if(accessToken == null || refreshToken == null) {
        throw new AppError(400, "Bad request");
    }

    let user = await discordRepository.getUser(accessToken);
    let uid = user.id;
    
    // Make sure the user exists
    if(await userRepository.getUserFromId(uid) == null) {
        throw new AppError(404, "User not found.");
    }

    // Login user and update his access / refresh tokens
    await userRepository.updateTokens(uid, accessToken, refreshToken);
    return true;
}

module.exports = {
    registerUser,
    loginUser
};