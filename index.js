const express = require('express')
const app = express()
const port = 3000

const hash = require('pbkdf2-password')()
const path = require('path')
const session = require('express-session')

const bodyParser = require('body-parser').json();

const dbconnection = require('./src/services/connections')

var assert = require("assert");

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src/views'))

app.use(express.urlencoded({ extended: false }))
app.use(session({
   resave: false,
   saveUninitalized: false,
   secret: 'shhhh, very secret'
}))

app.use(function(req, res, next){
   var err = req.session.error;
   var msg = req.session.success;
   delete req.session.error;
   delete req.session.success;
   res.locals.message = '';
   if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
   if (msg) res.locals.message = '<p class="msg success">' + msg  + '</p>';
   next();
 })

let opts = {
   password: ""
};

app.get('/', function(req, res){
   res.render('login',{
      err:false
   });
})

if(!module.parent){
   app.listen(port);
   console.log('Express started on port 3000');
}

require('./src/api-routes/authentication')(app)