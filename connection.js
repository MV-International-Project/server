"use strict";

const mysql = require("mysql");

async function createConnection() {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(getDB());
        connection.connect((err) => {
            if (err) {
                reject(err)
            } else {
                resolve(connection);
            }
        })
    });
}

function getDB() { // retrieves the DB config from the .ENV
    return {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PW
    }
}

module.exports = {
    createConnection,
    getDB
};


