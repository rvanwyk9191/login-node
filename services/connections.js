const mysql = require('mysql')

const con = mysql.createConnection({
    host: 'localhost',
    user: '',
    password: '',
    database: ''
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
    getuser: (username, password) => {
        return new Promise((resolve, reject) => {
            con.query('SELECT * FROM users where username=? AND password=?',[username, password], function(err, results){
                return err ? reject(err) : resolve(results[0]);
            })
        })
    }
}