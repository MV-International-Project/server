"use strict";

const config = require("../config");
const fetch = require('node-fetch');
const ENDPOINT = "https://discord.com/api/v8";

function fetchWithAccessToken(url, token, options = {}) {
    let optionsWithToken = options;
    if(token != null) {
        if(optionsWithToken.headers == null) {
            optionsWithToken.headers = {};
        }
        optionsWithToken.headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, optionsWithToken);
}

function refreshAccessToken() {
    const refreshToken = "xHVikocIYsu8ZotjOLOrCTT0vhrSba";
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
        console.log(newToken);
        return resolve(true);
    })
    .catch(err => reject(err));
}

function getUser(accessToken) {
    return new Promise((resolve, reject) => {
        fetchWithAccessToken(`${ENDPOINT}/users/@me`, 
        accessToken,
        {
            method: "GET",
        })
        .then(res => res.json())
        .then(user => {
            resolve(user);
        })
        .catch(err => console.log(err));
    });
}

module.exports = {
    getUser
}