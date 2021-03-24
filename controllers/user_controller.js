"use strict";

const config = require('../config');

const { AppError } = require('../errors');
const discordRepository = require("../repositories/discord_repository");
const userRepository = require("../repositories/user_repository");
const userGamesController = require("./user_games_controller");
const jwt = require('jsonwebtoken');

async function handleLogin(accessToken, refreshToken) {
    // Get user ID and user using the access token
    let user = await discordRepository.getUser(accessToken);
    let uid = user.id;

    // Check if the user already exists in our database or not
    if(await userRepository.getUserFromId(uid) == null) {
        return await registerUser(user.username, "", accessToken, refreshToken);
    } else {
        return await loginUser(accessToken, refreshToken);
    }
}

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
    await userRepository.addUser(uid, username, getDiscordTag(user), 
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

    // Login user and update his access / refresh tokens
    await userRepository.updateTokens(uid, getDiscordTag(user), accessToken, refreshToken);

    // Get a JSON web token and return it to the user
    let userToken = jwt.sign({id: uid}, config.jsonwebtoken.key, { algorithm: 'HS256'});

    return {token: userToken};
}

async function getUserInformation(userId) {
    const user = await userRepository.getUserFromId(userId);
    
    if(user == null) {
        throw new AppError(404, "Authenticated user not found.");
    }

    const discordTokens = await userRepository.getTokens(userId);
    const discordUser = await discordRepository.getUser(discordTokens.accessToken);

    return mapUserObject(user, discordUser);
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

function getDiscordTag(discordUser) {
    return `${discordUser.username}#${discordUser.discriminator}`;
}

function getAvatarPath(discordUser) {
    return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
}

async function mapUserObject(user, discordUser) {
    return {
        id: user.user_id,
        username: user.username,
        avatar_path: getAvatarPath(discordUser),
        description: user.description,
        games: await userGamesController.getGamesFromUser(user.user_id),
        discord_tag: getDiscordTag(discordUser)
    }
}

module.exports = {
    handleLogin,
    getUserInformation,
    changeDescription
};

