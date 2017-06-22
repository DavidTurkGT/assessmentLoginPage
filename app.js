const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const session = require('express-session');
const path = require('path');

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

let users = [
  {username: "David", password: "password", visits: 0, id: 0}
];

let messages = [];


app.get("/", function(req, res){
  if(req.session.userid === undefined){
    res.redirect("/login");
  }
  else{
    users[req.session.userid].visits++;
    res.render('index', {user: users[req.session.userid].username, clicks: users[req.session.userid].visits});
  }
});

app.post("/", function(req, res){
  console.log(req.body);
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
    users.forEach(function(user){
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

app.listen(3000, function(){
  console.log("App running on localhost:3000")
});
