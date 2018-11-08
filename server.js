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

//Get list of all users
app.get('/api/exercise/users', (req, res) => {
  
  //Use projection to only select userIds and usernames
  const projection = {
    _id: 1,
    username: 1
  }

  User.find({}, projection,(err, userList) => {
    if (err) {
      res.end(err);
    }
    res.json(userList);
  })
})

//Post form to add an exercise to a userId
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
    exercise.date = moment.utc(req.body.date, "YYYY-MM-DD");
  } else {
    exercise.date = moment.utc()
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

              const populate = {
                path: 'exercises',
                select: 'date description duration -_id',
                options: {
                  sort: {
                    date: -1
                  }
                }
              }

              User.findById(userThatExercised._id).populate(populate).exec((err3, user) => {
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
//Return _id's exercise log as array with total exercise count
app.get('/api/exercise/log?:userId', (req, res) => {
  
  if (!req.query.userId) {
    res.end("Error: No userId supplied")
  }

  //Options for populating the exercise references stored in a User
  const populate = {
    path: 'exercises',
    select: 'date description duration -_id',
    options: {
      sort: {
        date: -1
      }
    }
  }

  User.findById(req.query.userId).populate(populate).exec((err, user) => {
    if (err) {
      res.send(err);
    }
    if (req.query.from) {
      //Filter user.exercises to those created on or after `from` date
      //Use !isAfter instead of isBefore to include the same day
      let filtered = user.exercises.filter(exercise => {
        return !moment.utc(req.query.from, "YYYY-MM-DD").isAfter(moment.utc(exercise.date, "YYYY-MM-DD"))
      });
      user.exercises = filtered;
    }
    if (req.query.to) {
      //Filter user.exercises to those created on or before `to` date
      let filtered = user.exercises.filter(exercise => {
        return !moment.utc(req.query.to, "YYYY-MM-DD").isBefore(moment.utc(exercise.date, "YYYY-MM-DD"))
      });
      user.exercises = filtered;
    }
    if (req.query.limit) {
      //Use limit to return x most recent exercise entries
      user.exercises = user.exercises.slice(0, req.query.limit);
    }
    res.json(user);
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
