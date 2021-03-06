const {AppError} = require('../errors');

const discordRepository = require("../repositories/discord_repository");
const userRepository = require("../repositories/user_repository");
const userGamesController = require("./user_games_controller");

const jwt = require('jsonwebtoken');

async function handleLogin(code) {
    const tokens = await discordRepository.getAccessToken(code);
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    // Get user ID and user using the access token
    let user = await discordRepository.getUser(accessToken);
    let uid = user.id;
    // Check if the user already exists in our database or not
    if (await userRepository.getUserFromId(uid) == null) {
        return await registerUser(user.username, "", accessToken, refreshToken);
    } else {
        return await loginUser(accessToken, refreshToken);
    }
}

async function registerUser(username, description, accessToken, refreshToken) {
    if (username == null || description == null || accessToken == null || refreshToken == null) {
        throw new AppError(400, "Bad request");
    }

    // Get user ID using the access token
    let user = await discordRepository.getUser(accessToken);
    let uid = user.id;

    // Make sure the user exists
    if (uid == null) {
        throw new AppError(404, "User not found");
    }

    // Make sure the user doesn't already exist.
    if (await userRepository.getUserFromId(uid) != null) {
        throw new AppError(400, "This user is already registered.");
    }

    // Register user in userRepository
    await userRepository.addUser(uid, username, description, accessToken, refreshToken);

    // Get a JSON web token and return it to the user
    let userToken = jwt.sign({id: uid}, process.env.JSON_WEBTOKEN, {algorithm: 'HS256'});

    console.log(`User ${uid} has been registered.`);
    return userToken;
}

async function loginUser(accessToken, refreshToken) {
    if (accessToken == null || refreshToken == null) {
        throw new AppError(400, "Bad request");
    }

    let user = await discordRepository.getUser(accessToken);
    let uid = user.id;

    // Refresh the user's discord access token (so we get a new full expiry time)
    let newToken = await discordRepository.refreshAccessToken(refreshToken);
    accessToken = newToken.access_token;
    refreshToken = newToken.refresh_token;

    // Login user and update his access / refresh tokens
    await userRepository.updateDiscordTokens(uid, accessToken, refreshToken);

    // Update user login status
    await userRepository.updateUserLogin(uid);


    // Get a JSON web token and return it to the user
    let userToken = jwt.sign({id: uid}, process.env.JSON_WEBTOKEN, {
        algorithm: 'HS256',
        expiresIn: '3d'
    });

    console.log(`User ${uid} has logged in.`);
    return userToken;
}

async function logoutUser(userId, token) {
    try {
        // Revoke the user's discord tokens
        const discordTokens = await userRepository.getTokens(userId);
        await userRepository.revokeDiscordTokens(userId);
        await discordRepository.revokeToken(discordTokens.accessToken, "access_token");
        await discordRepository.revokeToken(discordTokens.refreshToken, "refresh_token");

        // Block the user's JSON token
        await userRepository.addBlockedToken(token);

        console.log(`User ${userId} has logged out.`);
        return true;
    } catch (err) {
        throw err;
    }
}

async function isTokenBlocked(token) {
    return await userRepository.isTokenBlocked(token);
}

async function getUserInformation(userId) {
    const user = await userRepository.getUserFromId(userId);

    if (user == null) {
        throw new AppError(404, "Authenticated user not found.");
    }

    return mapUserObject(user, await getDiscordUser(userId));
}

async function changeSettings(uid, description, username){
    if(uid == null ||( description == null && username == null)){
        throw new AppError(400, "Bad Request");
    }

    if(await userRepository.getUserFromId(uid) == null){
        throw new AppError(404, "User not found");
    }

    const user = await userRepository.getUserFromId(uid);

    if(description === ""){
        description = user.description;
    }
    if(username === ""){
        username = user.username
    }
    if(description.length > 100){
        throw new AppError(400, "This description is too long.");
    }
    return await userRepository.changeSettings(uid, description, username);
}

async function getDiscordUser(userId) {
    const discordTokens = await userRepository.getTokens(userId);
    return await discordRepository.getUser(discordTokens.accessToken);
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
    };
}

module.exports = {
    handleLogin,
    registerUser,
    logoutUser,
    isTokenBlocked,
    getUserInformation,
    getDiscordUser,
    getAvatarPath,
    changeSettings,
    mapUserObject,
    getDiscordTag
};

