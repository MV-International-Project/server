"use strict";

const config = require('../config');

const { AppError } = require('../errors');
const discordRepository = require("../repositories/discord_repository");
const userRepository = require("../repositories/user_repository");
const userGamesRepository = require("../repositories/user_games_repository");
const jwt = require('jsonwebtoken');

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

    let discordName = `${user.username}#${user.discriminator}`;

    // Register user in userRepository
    await userRepository.addUser(uid, username, discordName, 
        description, accessToken, refreshToken);

    // Get a JSON web token and return it to the user
    let userToken = jwt.sign({id: uid}, config.jsonwebtoken.key, { algorithm: 'HS256'});
    return {token: userToken};
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

    let discordName = `${user.username}#${user.discriminator}`;

    // Login user and update his access / refresh tokens
    await userRepository.updateTokens(uid, discordName, accessToken, refreshToken);

    // Get a JSON web token and return it to the user
    let userToken = jwt.sign({id: uid}, config.jsonwebtoken.key, { algorithm: 'HS256'});

    return {token: userToken};
}

async function changeDescription(uid, description){
    if(uid == null || description == null){
        throw new AppError(400, "Bad Request");
    }
    if(description.length > 100){
        throw new AppError(400, "This description is too long.");
    }

    if(await userRepository.getUserFromId(uid) == null){
        throw new AppError(404, "User not found");
    }

    return await userRepository.changeDescription(uid, description);
}

async function connectGameToUser(uid, gid, hoursPlayed, rank){
    if(uid == null || gid == null){
        throw new AppError(400, "Bad request");
    }
    if(hoursPlayed == null){
        hoursPlayed = 0;
    }
    return await userGamesRepository.connectGameToUser(uid, gid, hoursPlayed, rank);
}

module.exports = {
    registerUser,
    loginUser,
    connectGameToUser,
    changeDescription
};

