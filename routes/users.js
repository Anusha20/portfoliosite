var express = require('express');
var router = express.Router();
var User = require('../models/user');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{
  	title:'Register'
  });

});

router.get('/login', function(req, res, next) {
  res.render('login',{
  	title:'Log In'
  });

});

router.post('/register',function(req,res,next){
	//get form values
	var name =req.body.name;
	var email=req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	

		//check for the image field
		if(req.body.profileImage){
			console.log('uploading File.....');
			//file info
			var profileimageOrgName = require.profileImage.originalname;
			var profileImageName = req.profileImage.name;
			var profileImageMime = req.profileImage.type;
			/*var profileImagePath = req.profileImage.path;
			var profileImageExt = req.profileImage.extension;*/
			var profileImageSize = req.profileImage.size;
		}else{
			//set a default image
			var profileimageOrgName = 'noimage.png';
			var profileImageName = 'defaultPic';
			/*var profileImageMime = req.profileImage.;
			var profileImagePath = req.profileImage.path;
			var profileImageExt = req.profileImage.extension;
			var profileImageSize = req.profileImage.size;*/

		}

		//FORM VALIDATION
		req.checkBody('name','Name Field is Required'+name).notEmpty();
		req.checkBody('email','Email Field is Required').notEmpty();
		req.checkBody('email','email is not valid').isEmail();
		req.checkBody('username','username is Required'+username).notEmpty();
		req.checkBody('password','password Field is Required').notEmpty();
		req.checkBody('password2','Password do not match').equals(req.body.password);
		
		//check for errors
		var errors= req.validationErrors();


		if(errors){
			console.log('.....'+name+''+email+''+username);
			res.render('register',{
				errors:errors,
				name:name,
				email:email,
				username:username,
				password:password,
				password2:password2,
				

			});
		}else{
			var newUser = new User({
				name:name,
				email:email,
				password:password,
				password2:password2,
				username:username,
				profileImageName:profileImageName
			});
		

		// Create user
		
		User.createUser(newUser,function(err,user){
			if(err) throw err;
			console.log(user);
		});



		//Success Message
		req.flash('success','You have been successfully Register and may log in');
		res.location('/');
		res.redirect('/');
	}

});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err,user){
  	 done(err, user);
  	}) ;
   
  });


passport.use(new LocalStrategy(
	function(username,password,done){
		User.getUserByUsername(username,function(err,user){
			if(err)throw err;
			if(!user){
				console.log('Unknown User');
				return done(null,false,{message:'Unknow User'})
			}
			User.comparePassword(password,user.password,function(err,isMatch){
					if(err) throw err;
					if(isMatch){
						return done(null,user);
					}else{
						//console.log('Invalid Password'+user.password+''+password+' '+isMatch);
						return done(null,false,{message:'Invalid Password'});
					}
			});
		})
	}
	));

router.post('/login',passport.authenticate('local',{failureRedirect:'/users/login',failureFlast:'Invalid Password'}),
	function(req,res){
		console.log('Authentication Successful');
		req.flash('success','You are logged in ');
		res.redirect('/');
});


router.get('/logout',function(req,res){
	req.logout();
	req.flash('success','You have logged out');
	res.redirect('/users/login');
});

module.exports = router;
