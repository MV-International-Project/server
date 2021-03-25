"use strict";

const mysql = require("mysql");

const config = require("./config");

async function createConnection() {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((err)=>{
            if(err){
                reject(err)
            } else {
                resolve(connection);
            }
        })
    });
}

module.exports={
    createConnection
};
