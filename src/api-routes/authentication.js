const express = require('express')
const app = express()

const hash = require('pbkdf2-password')()

const bodyParser = require('body-parser').json();

const dbconnection = require('../services/connections')

function authenticate(name, pass, fn){
    (async () => {
        const user = await dbconnection.getuser(name);
        if(typeof user === 'undefined') return fn("Username or password is incorrect");
        hash({ password: pass, salt: user.SALT}, function(err, pass, salt, hash) {
            if(err) return fn(err);
            if(hash === user.PASSWORD) return fn(null, user);
            return fn("Username or password is incorrect");
        })})();
}

module.exports = function(app) {
    app.post('/login', bodyParser, function(req, res){
        authenticate(req.body.username, req.body.password, function(err, user){
            if(user){
                req.session.regenerate(function(){
                    req.session.user = user;
                    req.session.success = 'Authenticated as ' + user.name
                        + ' click to <a href="/logout">logout</a>. '
                        + ' You may now access <a href="/restricted">/restricted</a>.';
                    res.redirect('/restricted');
                })
            }else{
                req.session.error = 'Authentication failed, please check your '
                    + ' username and password.'
                    + ' (use "tj" and "foobar")';
                res.render('login', {err: err});
            }
        })
    })

    app.get('/register', function(req, res){
        res.render('register',{err:false});
    })

    app.post('/registeruser', function(req, res){
        if(req.body.password != req.body.confirmpassword) res.render('register',{err:'Passwords dont match'});
        opts.password = req.body.password;
        hash(opts, function(err, pass, salt, hash){
            res.render('register', {err: dbconnection.adduser(req.body.username, hash, salt)});
        });

    })
}