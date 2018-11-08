const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const moment = require('moment');
const cors = require('cors')
require('dotenv').config();

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI)

const User = require('./models/User');
const Exercise = require('./models/Exercise');

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'))


//Routes
app.post('/api/exercise/new-user', (req, res) => {

  //Check for username
  if (!req.body.username) {
    res.end("Error: No username entered")
  }

  //Handle form data
  let user = new User({
    username: req.body.username
  });

  //Check for existing username
  User.find({username: user.username}, (err, existingUser) => {
    if (err) {
      res.end(err)
    } else if (existingUser.length){
      res.end("Error: Username already in use")
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

app.get('/api/exercise/users', (req, res) => {
  //Get list of all users
  //Display usernames and _ids in array
  User.find((err, users) => {
    if (err) {
      res.end(err);
    }
    res.json(users);
  })
})

app.post('/api/exercise/add', (req, res) => {

  //Handle form data userId, description, duration, (optional)date
  if (!req.body.userId || !req.body.description || !req.body.duration) {
    res.end("Error: Please fill all fields marked with an asterisk (*)");
  }

  let exercise = new Exercise({
    duration: req.body.duration,
    description: req.body.description,
    userId: req.body.userId
  })

  if (req.body.date) {
    exercise.date = moment.utc(req.body.date);
  }

  console.log(exercise);

  //Update user and return updated User object
  exercise.save((err, savedExercise) => {
    if (err) {
      res.send(err);
    } else {
      User.findOne(savedExercise.userId, (err1, userThatExercised) => {
        if (err1) {
          res.send(err1);
        } else {
          userThatExercised.exercises = userThatExercised.exercises.concat(savedExercise._id);
          console.log(userThatExercised);
          userThatExercised.save((err2, updatedUser) => {
            if (err2) {
              res.send(err2);
            } else {
              User.findById(userThatExercised._id).populate('exercises').exec((err3, user) => {
                if (err3) {
                  res.send(err3);
                } else {
                  res.json(user);
                }
              });
            }
          })
        }
      });
    }
  })
})

app.get('/api/exercise/log?:userId', (req, res) => {
  //Return _id's exercise log as array with total exercise count
  console.log("req.query:", req.query);

  if (!req.query.userId) {
    res.end("Error: No userId supplied")
  }

  let criteria = {userId: req.query.userId};

  //Check for `from` and `to` queries and apply to date ranges
  if(req.query.from){
    criteria.date.$gte = moment.utc(req.query.from);
  }
  if(req.query.to){
    criteria.date.$lte = moment.utc(req.query.to);
  }

  console.log("criteria:", criteria);

  Exercise.find(criteria, (err, exercises) => {
    if (err) {
      res.end(err);
    }
    if (req.query.limit) {
      res.json(exercises.slice(0, req.query.limit));
    } else {
      res.json(exercises);
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
