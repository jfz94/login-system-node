var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'./uploads'});

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

module.exports = router;
