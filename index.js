//imports
const express = require('express');
const app = express();
const body_parser = require('body-parser');
var promise = require('bluebird');
var pgp = require('pg-promise')({
  promiseLib: promise
});
//databse connection
var db = pgp({database: 'ToDo'})
app.use(body_parser.urlencoded({extended: false}));

//hbs view engine
app.set('view engine', 'hbs');

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

//server start and connect
app.listen(8500, function () {
  console.log('8500 gon head witcha order')
});
