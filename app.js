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
  {username: "David", password: "password", visits: 0}
];


app.get("/", function(req, res){
  if(!req.session.username){
    res.redirect("/login");
  }
  else{
    res.send("You are logged in!");
  }
});

app.get("/login", function(req, res){
  res.render("login");
});

app.listen(3000, function(){
  console.log("App running on localhost:3000")
});
