const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')
require('dotenv').config();

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI)

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'))


//Routes
app.post('/api/exercise/new-user', (req, res) => {
  //Handle form data
  //Create new user and save to db
  //Return object with username and _id
})

app.get('api/exercise/users', (req, res) => {
  //Get list of all users
  //Display usernames and _ids in array
})

app.post('/api/exercise/add', (req, res) => {
  //Handle form data _id, exercise, duration, (optional)date
  //Return new user object
})

app.get('/api/exercise/log/:userId', (req, res) => {
  //Return _id's exercise log as array with total exercise count
  //If req.queries contains `from` & `to` (yyyy-mm-dd), limit by those, else limit by `limit` (int)
  res.send({
    from: req.query('from'),
    to: req.query('to'),
    limit: req.query('limit')
  })
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
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
