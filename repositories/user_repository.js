const mysql = require("mysql");
const config = require("../config");

function dataToUser(data) {
    const user = {
        userId: data.userId,
        username: data.username,
        description: data.description,
        last_login: data.last_login
    };
    return user;
}

function addUser(userId ,username, description, accessToken, refreshToken) {
    let connection =  mysql.createConnection(config.db);
    return new Promise((resolve, reject) => {
    // Transaction to add user and his discord information
        connection.beginTransaction(function(err) {

            // Add user to the users table
            let sql = "INSERT into users(user_id ,username, description) VALUES(?,?,?)";
            connection.query(sql, [userId,username, description], (err) =>{
                if(err){
                    reject(err);
                    connection.end();
                    return;
                }
                else {
                    resolve(true);
                }
            });

            // Add the users discord information
            sql = `INSERT INTO discord(user_id, access_token, refresh_token)
            VALUES(?, ?, ?);`;
            connection.query(sql, [userId, accessToken, refreshToken], (err) => {
                connection.end();
                if(err){
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });

            // Commit transaction if previous queries were succesful
            connection.commit(err => {
                if(err) {
                    connection.rollback(() => {
                        reject(err);
                        connection.end();  
                        return;
                    });
                }

                connect.end();
                resolve(true);
            });
        });
    });
}

function getUserFromId(userId) {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((error)=>{
            if(error){
                reject(error);
            }
            else {
                let sql = "SELECT * from users where user_id = ?";
                connection.query(sql, [userId], (err, data) => {
                    connection.end();
                    if(err){
                        reject(err);
                    }
                    else {
                        resolve(data.map(dataToUser));
                    }
                })
            }
        });
    });
}

function updateTokens(userId, accessToken, refreshToken) {
    return new Promise((resolve, reject) => {
        let connection =  mysql.createConnection(config.db);
            connection.connect( (error) =>{
                if(error){
                    reject(error);
                }
                else {
                    let sql = `UPDATE discord 
                    SET access_token = ?, 
                    refresh_token = ?
                    WHERE user_id = ?`;
                    connection.query(sql, [accessToken,refreshToken,userId], (err) =>{
                        connection.end();
                        if(err){
                            reject(err);
                        }
                        else {
                            resolve(true);
                        }
                    });
                }
            });
    });   
}

module.exports={
    addUser,
    updateTokens,
    getUserFromId
};
