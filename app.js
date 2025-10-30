const express = require('express');
const cors = require('cors');
require('dotenv').config()
const {swaggerUi, specs} = require('./swagger');

const indexRouter = require('./routes/index');
//const authRouter = require('./routes/auth');
//const postRouter = require('./routes/post');
//const videoGameDiscoverRouter = require('./routes/vgd');
const {verifyToken} = require('./jwt');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true
}));

// Swagger setup
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Unauthenticated access
//app.use('/auth', authRouter);

// Middleware auth
app.use((req, res, next) => {
  //console.log("Enter protected Area")
  let token;
  try {
    token = req.headers.authorization.split(' ')[1]
  } catch (err) {
    return res.sendStatus(401)
  }
  try {
    verifyToken(token)
    next()
  } catch (err) {
    return res.sendStatus(403)
  }
});

// Protected routes
app.use('/', indexRouter);
//app.use('/post', postRouter);
//app.use('/vgd', videoGameDiscoverRouter);


// Error 404 handler
app.use((req, res, next) => {
  return res.sendStatus(404)
});


module.exports = app;
