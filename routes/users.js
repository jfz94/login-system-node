var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'./uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// access to user object //
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// /users/register
router.get('/register', function(req, res, next) {
  res.render('register', {title:'Register'});
});

// /users/login
router.get('/login', function(req, res, next) {
  res.render('login',{title:'Login'});
});

router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:'Invalid username or password'}),
  function(req, res) {
    // If this function gets called, authentication was successful.
    req.flash("success","You are now logged in");
    // `req.user` contains the authenticated user.
    res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


// local passport strategy
passport.use(new LocalStrategy(function(username,password,done){
  User.getUserByUsername(username,function(err,user){
    if(err) throw err;
    if(!user){
      return done(null,false,{message: 'Unknown User'});
    }

    User.comparePassword(password,user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null,user);
      }else{
        return done(null, false, {message: 'Invalid Password'});
      }
    });
  });
}));

// /users/register
router.post('/register', upload.single('profileimage'),function(req, res, next) {
  // bodyparse can't handle file uploads -> multer
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  if(req.file){
    console.log('Uploading file...');
    var profileImage = req.file.filename;
  }else{
    console.log('No File Upload...');
    var profileImage = 'noimage.jpg';
  }

  // form validator
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email is not valid').isEmail();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);

  // check Errors
  var errors =req.validationErrors();
  if(errors){
    console.log('Errors');
    res.render('register',{
      errors: errors
    });
  }else{
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileImage
    });

    User.createUser(newUser,function(err,user){
      if(err) throw err
      console.log(user);
    });

    req.flash('success','You are now registered and can login');

    res.location('/');
    res.redirect('/');
  } 

});

router.get('/logout', function(req,res){
  req.logout();
  req.flash('success','You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
