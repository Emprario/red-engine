import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import {specs} from './swagger.js';



import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js';
//import postRouter from './routes/post.js';
//import videoGameDiscoverRouter from './routes/vgd.js';
import {verifyToken} from './jwt.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: true
}));

// Swagger setup
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Unauthenticated access
app.use('/auth', authRouter);

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


export default app;