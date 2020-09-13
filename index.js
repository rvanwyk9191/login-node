const express = require('express')
const cors = require('cors');
const app = express()
const port = 3001
const fs = require('fs');
const key = fs.readFileSync('../key.pem');
const cert = fs.readFileSync('../cert.pem');
const https = require('https');

const hash = require('pbkdf2-password')()
const path = require('path')
const session = require('express-session')

const bodyParser = require('body-parser').json();

const dbconnection = require('./src/services/connections')

var assert = require("assert");

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src/views'))

app.use(cors({
   origin: 'http://localhost:3000'
}))
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
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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
   const server = https.createServer({key: key, cert: cert }, app);
   server.listen('3002',() => {console.log('Listening on 3002')});
}

require('./src/api-routes/authentication')(app)