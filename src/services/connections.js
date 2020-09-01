const mysql = require('mysql')

const con = mysql.createConnection({
    host: 'eportfolio.cs64bjeijp5s.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Secunda3090!',
    database: 'USER_MANAGEMENT'
});

const dbconnection = function(){
    con.connect(function(err){
        if(err) throw err;
        console.log("Database is connected!");
    })
}

module.exports = {
    getdbconnections: function() {
        return dbconnection
    },
    getuser: (username) => {
        return new Promise((resolve, reject) => {
            con.query('SELECT * FROM USERS where USERNAME=?',[username], function(err, results){
                return err ? reject(err) : resolve(results[0]);
            })
        })
    },
    adduser: (username, password, salt) => {
        let message = "";
        con.query('INSERT INTO USERS VALUES (?,?,?)',[username, password, salt], function(err, results){
            if (err) {
                console.log(err);
                message = "Error adding user";
            } else {
                message = "User successfully added";
            }
        })
        return message;
    },
    userexists: (username) => {
        return new Promise((resolve, reject) => {
            con.query('SELECT 1 FROM USERS WHERE USERNAME=?',[username], function(err, results){
                return err ? reject(err) : resolve(results[0]);
            })})
    }
}