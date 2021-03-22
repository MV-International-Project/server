"use strict";

const config = require('./config');

const http = require("http");
const express = require("express");
const data = require("./repositories/user_repository");

const app = express();
app.use(express.json());
app.use(errorHandler);


/*
    Error handler
*/
function errorHandler(err, req, res, next) {
    console.log(err);
    res.status(500)
    .json({error: err});
}

/*
    API requests
*/
const router = express.Router();
app.use('/api', router);

router.get("/user/:id", (req, res) => {
    let id = req.params.id;
    data.getUserFromId(id, (err, user) =>{
        if(err){
            errorHandler(err);
        } else {
            res.json(user);
        }
    })
});


router.get("/user/:id", (req, res) => {
    let user_id = req.params.user_id;
    data.getUserFromId(user_id, (err, user) =>{
        if(err){
            errorHandler(err);
        } else {
            res.json(user);
        }
    })
});


const server = http.createServer(app);
const port = config.port;
server.listen(port);