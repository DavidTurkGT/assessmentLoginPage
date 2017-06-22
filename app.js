const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const session = require('express-session');
const path = require('path');
const jsonfile = require('jsonfile');

const app = express();

app.use(express.static(path.join(__dirname,"public")));

app.engine('mustache',mustacheExpress());
app.set('views',path.join(__dirname,"views"));
app.set('view engine','mustache');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(validator());

app.use(session({
  secret: 'cornbread',
  resave: false,
  saveUninitialized: false
}));

// let users = [
//   {username: "David", password: "password", visits: 0, id: 0}
// ];

let data = {};

jsonfile.readFile('users.json',function(err,obj){
  data.users = obj.users;
});

let messages = [];


app.get("/", function(req, res){
  if(req.session.userid === undefined){
    res.redirect("/login");
  }
  else{
    data.users[req.session.userid].visits++;
    res.render('index', {user: data.users[req.session.userid].username, clicks: data.users[req.session.userid].visits});
  }
});

app.post("/", function(req, res){
  if(req.body.button = "logout"){
    req.session.destroy(function(err){
      console.error(err);
    });
  }
  res.redirect("/");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", function(req, res){
  messages = [];
  //Validate username and password
  req.checkBody("username", "Please enter a username before you log in.").notEmpty();
  req.checkBody("password", "Please enter a password before you log in.").notEmpty();

  let errors = req.validationErrors();

  if(errors){
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    res.render("login",{errors: messages});
  }
  else{
    //Check username and password
    let loggedUser;
    data.users.forEach(function(user){
      if(user.username === req.body.username){
        loggedUser = user;
      }
    });

    if(loggedUser){
      req.session.userid = loggedUser.id;
      res.redirect("/");
    }
    else{
      messages.push("Invalid username/password.");
      res.render("login", {errors: messages} );
    }
  }
});

app.post("/signup", function(req, res){
  messages = [];
  //Validate input
  req.checkBody("username", "Please enter a username to sign up.").notEmpty();
  req.checkBody("password", "Please enter a password to sign up.").notEmpty();

  let errors = req.validationErrors();

  if(errors){
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    res.render("login", {errors: messages})
  }
  else{
    //Check if a user exists
    let existingUser = false;
    data.users.forEach(function(user){
      if (user.username === req.body.username){
        existingUser = true;
      }
    });
    if(existingUser){
      messages.push("Username already taken.");
      res.render("login", {errors: messages});
    }
    //Create new user and add to users file
    let newUser= {
      username: req.body.username,
      password: req.body.password,
      visits: 0,
      id: data.users.length
    }

    data.users.push(newUser);
    messages.push("Created a new account.  Username: " + newUser.username);
    jsonfile.writeFile('users.json',data, function(err){
      console.error(err);
    })

    //Reload /login with success message
    res.render("login", {messages: messages});

  }
});

app.listen(3000, function(){
  console.log("App running on localhost:3000")
});
