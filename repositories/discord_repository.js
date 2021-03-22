"use strict";

const config = require("../config");
const ENDPOINT = "https://discord.com/api/v8";
const fetch = require('node-fetch');

function refreshAccessToken(refreshToken) {
    fetch(`${ENDPOINT}/oauth2/token`, 
    {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `client_id=${config.discord.client_id}&client_secret=${config.discord.client_secret}&grant_type=refresh_token&refresh_token=${refreshToken}\&
        scope=identify%20connections%20gdm.join`
    })
    .then(res => res.json())
    .then(newToken => {
        // TODO: Set new access and refresh token in the database
        console.log(newToken);
    });
}

function getUser(accessToken) {
    return new Promise((resolve, reject) => {
        fetch(`${ENDPOINT}/users/@me`, 
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
        .then(res => {
            if(res.status === 401) {
                reject("Unauthorized");
            }

            return res.json();
        }).then(user => {
            resolve(user);
        })
    });
}

module.exports = {
    refreshAccessToken,
    getUser
}