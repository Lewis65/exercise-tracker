const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const moment = require('moment');
const cors = require('cors')
require('dotenv').config();

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI)

const User = require('./models/User');

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'))


//Routes
app.post('/api/exercise/new-user', (req, res) => {
  //Handle form data
  let user = new User({
    username: req.body.username
  });
  //Check for existing username
  User.find({username: user.username}, (err, doc) => {
    if (err) {
      res.end(err)
    } else if (doc.length){
      res.end("Error: username already in use")
    } else {
      //Save new user to db
      user.save((err, savedUser) => {
        if (err) {
          res.end(err);
        } else {
          //Return object with username and _id
          res.json({
            _id: savedUser._id,
            username: savedUser.username
          });
        }
      })
    }
  })
  
  
})

app.get('api/exercise/users', (req, res) => {
  //Get list of all users
  //Display usernames and _ids in array
})

app.post('/api/exercise/add', (req, res) => {
  //Handle form data _id, exercise, duration, (optional)date
  //Update user and return updated User object
})

app.get('/api/exercise/log?:userId', (req, res) => {
  //Return _id's exercise log as array with total exercise count
  console.log(req.query);
  User.findById(req.query.userId, (err, user) => {
    if(err){
      res.send(err);
    } else {
      let log = user.exercises;
      let dateObj = {}
      //Check for `from` & `to` (yyyy-mm-dd) constraints
      if(req.query.from || req.query.to){
        if(req.query.from){
          //If there's from and no to
        }
      } else if (req.query.limit){
        //Check for `limit` (int) constraint
      }
      res.json({
        exerciseCount: log.length,
        exercises: log
      });
    }
  });
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: '404 not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + (process.env.PORT || 3000))
})
