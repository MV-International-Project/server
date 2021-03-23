"use strict";

const config = require("../config");
const ENDPOINT = "https://discord.com/api/v8";
const fetch = require('node-fetch');

function fetchWithAccessToken(url, options = {}) {
    const token = "RmZFuimTOyFev1lub4iOVzl6bnY0uJ";
    let optionsWithToken = options;
    if(token != null) {
        if(optionsWithToken.headers == null) {
            optionsWithToken.headers = {};
        }
        optionsWithToken.headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, optionsWithToken);
}

function getUser() {
    return new Promise((resolve, reject) => {
        fetchWithAccessToken(`${ENDPOINT}/users/@me`, 
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