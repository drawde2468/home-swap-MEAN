require('dotenv').config();

const createError       = require('http-errors');
const express           = require('express');
const path              = require('path');
const cookieParser      = require('cookie-parser');
const logger            = require('morgan');
const passport          = require("passport");
const bodyParser        = require("body-parser");
const cloudinary        = require("cloudinary");
const session           = require('express-session');

const passportSetup = require('./config/passport');
passportSetup(passport);

const app = express();

//Import the mongoose module
const mongoose = require('mongoose');
//Set up default mongoose connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true
});
//Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
const db = mongoose.connection;
//Success MongoDB Connection
db.on('connected', () => {
  console.log("Successfully connected to Mongo!")
});
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//End of mongoose config

//middleware configuration for cloudinary (to upload images)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
  });
//End Cloudinary config
//passport
app.use(session({
  secret: process.env.SECRET_SESSION,
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 2419200000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const homeRouter = require('./routes/home');
const reviewRouter = require('./routes/review');
const matchRouter = require('./routes/match');
const travelRouter = require('./routes/travel');

//login and signup both point to authRouter
app.use('/api', authRouter);
app.use('/api', homeRouter);
app.use('/api', reviewRouter);
app.use('/api', matchRouter);
app.use('/api', travelRouter);

app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;