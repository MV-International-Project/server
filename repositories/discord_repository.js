const fetch = require('node-fetch');

const ENDPOINT = "https://discord.com/api/v8";

async function getAccessToken(code) {
    return new Promise((resolve, reject) => {
        fetch(`${ENDPOINT}/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `client_id=${process.env.DISCORD_CLIENT_ID}&client_secret=${process.env.DISCORD_CLIENT_SECRET}&grant_type=authorization_code&code=${code}\&
        scope=identify%20connections%20gdm.join&redirect_uri=${process.env.REDIRECT_URI}`})
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

function refreshAccessToken(refreshToken) {
    return new Promise((resolve, reject) => {
        fetch(`${ENDPOINT}/oauth2/token`, 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `client_id=${process.env.DISCORD_CLIENT_ID}&client_secret=${process.env.DISCORD_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refreshToken}\&
            scope=identify%20connections%20gdm.join`
        })
        .then(res => res.json())
        .then(newToken => {
            resolve(newToken);
            return;
        })
        .catch(err => reject(err));
    });
}

function revokeToken(token, type) {
    return new Promise((resolve, reject) => {
        fetch(`${ENDPOINT}/oauth2/token/revoke`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `client_id=${process.env.DISCORD_CLIENT_ID}&client_secret=${process.env.DISCORD_CLIENT_SECRET}&\
        token=${token}&token_type_hint=${type}`})
        .then(res => {
            resolve(true);
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
    refreshAccessToken,
    revokeToken,
    getUser
};