//imports
const express = require('express');
const app = express();
const body_parser = require('body-parser');
var promise = require('bluebird');
var pgp = require('pg-promise')({
  promiseLib: promise
});
var session = require('express-session');
var pbkdf2 = require('pbkdf2');
var crypto = require('crypto');

//databse connection
var db = pgp({database: 'ToDo'})
app.use(body_parser.urlencoded({extended: false}));
//hbs view engine
app.set('view engine', 'hbs');
//session middleware initialized
app.use(session({
  secret: process.env.SECRET_KEY || 'dev',
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 60000}
}));
//session object
app.use(function (req, res, next) {
  if(req.session.user) {
    next();
  } else if (req.path == '/login'){
    next();
  } else {
    res.redirect('/login');
  }
})
//password encryption
var salt = crypto.randomBytes(20).toString('hex');
var password = 'some-password';
var key = pbkdf2.pbkdf2Sync(
  password, salt, 36000, 256, 'sha256'
);
var hash = key.toString('hex');

//URLS for views
app.get('/', function (req, res) {
  var context = {
    title: 'To Do List Home'
  }
  res.render('splash.hbs', context)
});

app.get('/todos', function (req, res) {
  var context = {
    title: 'To Do List'
  }
  db.query('SELECT * from task')
    .then(function(taskArray) {
      res.render('todos.hbs', {task: taskArray});
    })
});
app.get('/todos/add', function (req, res) {
  var context = {
    title: 'Add Items'
  }
  res.render('add.hbs', context);
});
//post form info to database
app.post('/submit', function(req, res, next) {
  var newTask = 'INSERT INTO task VALUES(default, $1)';
  db.result(newTask, req.body.name).then(function () {
    res.redirect('/todos')
  })
  .catch(next);

});
//mark entry as done via slug in url
app.get('/todos/done/:id', function(req, res) {
  var id = req.params.id;
  var update = 'UPDATE task SET done = TRUE WHERE id = $1';
  db.query(update, id)
    .then(function() {
      res.redirect('/todos')
    })
  });
//user login
app.get('/login', function (req, res) {
  response.render('login.hbs');
});
app.post('/login', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (username == 'aaron' && password == 'narf') {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.render('login.hbs');
  }
});
//server start and connect
app.listen(8500, function () {
  console.log('8500 gon head witcha order')
});
