"use strict";

const config = require("../config");
const fetch = require('node-fetch');
const ENDPOINT = "https://discord.com/api/v8";

async function getAccessToken(code) {
    return new Promise((resolve, reject) => {
        fetch(`${ENDPOINT}/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `client_id=${config.discord.client_id}&client_secret=${config.discord.client_secret}&grant_type=authorization_code&code=${code}\&
        scope=identify%20connections%20gdm.join&redirect_uri=http://127.0.0.1:8888/api/users/login`})
        .then(res => res.json())
        .then(token => {
            resolve(token);
        });
    });
}

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
        return resolve(true);
    })
    .catch(err => reject(err));
}

function revokeToken(token, type) {
    return new Promise((resolve, reject) => {
        fetch(`${ENDPOINT}/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `client_id=${config.discord.client_id}&client_secret=${config.discord.client_secret}&\
        token=${token}&token_type_hint=${type}`})
        .then(res => {
            resolve();
        }).catch(err => {
            reject(err);
        });
    });   
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
    getAccessToken,
    revokeToken,
    getUser
}