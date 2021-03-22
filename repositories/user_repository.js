const mysql = require("mysql");
const config = require("../config");

function dataToUser(data) {
    const user = {
        user_id: data.user_id,
        username: data.user_id,
        description: data.description,
        last_login: data.last_login
    }
}

function addUser(user_id ,username, description, last_login ,cb) {
  let connection =  mysql.createConnection(config.db);
  connection.connect( (error)=>{
      if(error){
          cb(error);
      }
      else {
          console.log("Connected to DB");
          let sql = "INSERT into users(user_id ,username, description, last_login) VALUES(?,?,?,?)";
          connection.query(sql, [user_id,username, description, last_login], (err) =>{
              if(err){
                  cb(err);
              }
              else {
                  // The callback method should be like X(errors, succeeded)
                  cb(err, true);
              }
          })
      }
  });
}

function getUserFromId(user_id, cb) {
    let connection = mysql.createConnection(config.db);
    connection.connect((error)=>{
        if(error){
            cb(error);
        }
        else {
            console.log("Connected to DB");
            let sql = "SELECT * from users where user_id = ?";
            connection.query(sql, [user_id], (err, data) => {
                if(err){
                    cb(err);
                }
                else {
                    cb(err, data.map(dataToUser));
                }
            })
        }
    });
}

module.exports={
    addUser,
    getUserFromId
};
