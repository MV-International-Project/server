const mysql = require("mysql");
const config = require("../config");

function dataToUser(data) {
    const user = {
        user_id: data.user_id,
        username: data.username,
        description: data.description,
        last_login: data.last_login
    };
    return user;
}

function addUser(user_id ,username, description) {
    return new Promise((resolve, reject) => {
        let connection =  mysql.createConnection(config.db);
        connection.connect( (error)=>{
            if(error){
                reject(error);
            }
            else {
                let sql = "INSERT into users(user_id ,username, description) VALUES(?,?,?)";
                connection.query(sql, [user_id,username, description], (err) =>{
                    connection.end();
                    if(err){
                        reject(err);
                    }
                    else {
                        resolve(true);
                    }
                })
            }
        });
    });
}


function getUserFromId(user_id) {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(config.db);
        connection.connect((error)=>{
            if(error){
                reject(error);
            }
            else {
                let sql = "SELECT * from users where user_id = ?";
                connection.query(sql, [user_id], (err, data) => {
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

module.exports={
    addUser,
    getUserFromId
};
