const express = require('express')
const app = express()
const port = 3000

const hash = require('pbkdf2-password')()
const path = require('path')
const session = require('express-session')

const bodyParser = require('body-parser').json();

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

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

const users = {
   tj: { name: 'tj' }
}

hash({ password: 'foobar' }, function (err, pass, salt, hash){
   if(err) throw err;
   users.tj.salt = salt;
   users.tj.hash = hash;
})

function authenticate(name, pass, fn){
   if(!module.parent) console.log('authentication %s:%s', name, pass);
   var user = users[name];
   if(!user) return fn(new Error('cannot find user'));
   hash({ password: pass, salt: user.salt}, function(err, pass, salt, hash) {
      if(err) return fn(err);
      if(hash === user.hash) return fn(null, user);
      fn(new Error('invalid password'));
   })
}

function restrict(req, res, next){
   if(req.session.user){
      next();
   } else {
      req.session.error = 'Access denied!';
      res.render('login',{
         error: true
      })
   }
}

app.get('/', function(req, res){
   res.render('login',{
      error:false
   });
})

app.get('/restricted', restrict, function(req, res){
   res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
})

app.get('/logout', function(req, res){
   req.session.destroy(function(){
      res.redirect('/');
   })
})

app.post('/login', bodyParser, function(req, res){
   console.log(req.body)
   authenticate(req.body.username, req.body.password, function(err, user){
      if(user){
         console.log("User passed");
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
         res.redirect('/login');
      }
   })
})

if(!module.parent){
   app.listen(port);
   console.log('Express started on port 3000');
}