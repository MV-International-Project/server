const config = {};

// Webserver
config.port = 8888;

// Client
config.clientPath = "http://127.0.0.1:63342/client/src/"

// Database
config.db = {
    host: "185.94.230.142",
    port: 3306,
    database: "liamd_int_project",
    user: "liamd_int_project",
    password: "H2t8abKWDQZBvW"
};

// Webtoken key
config.jsonwebtoken = {
    key: "hVmYq3t6w9z$B&E)H@McQfTjWnZr4u7x"
}

// Discord application
config.discord = {
    client_id: "823503484522463263",
    client_secret: "is170xkhKhm_4Z_CnNJQlWsdXhPBviSe"
}
config.redirectUri = "https://ip-binder.herokuapp.com/api/users/login";

module.exports = config;