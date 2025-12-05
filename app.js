import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import {specs} from './swagger.js';
import authRouter from './routes/auth.js';
import secPostRouter from './routes/secure/post.js';
import secPlayRouter from "./routes/secure/play.js"
import secSignalRouter from "./routes/secure/signal.js"
import sessionRouter from "./routes/secure/session.js"
import secUserRouter from './routes/secure/user.js';
import secVgdRouter from './routes/secure/vgd.js'
import mgrPostRouter from './routes/manager/post.js';
import mgrVgdRouter from './routes/manager/vgd.js';
import sysUserRouter from './routes/sysadmin/user.js';
import {verifyToken} from './jwt.js';
import dc from "./debugcon.js";
import {getUserRoles} from "./database.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
//app.use(express.static('public'));
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: true
}));

// Swagger setup
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Analyse body
app.use((req,res,next)=>{
  dc.svCon("Body:")
  if (req.body.hasOwnProperty("password")) {
    dc.svCon("## Redacted (body contains password) ##")
  } else {
    dc.svCon(req.body)
  }
  next()
})

// Unauthenticated access
app.use('/auth', authRouter);

// Middleware global auth
app.use(async (req, res, next) => {
  dc.svCon("Enter auth area ...")
  let token;
  try {
    token = req.headers.authorization.split(' ')[1]
  } catch (err) {
    dc.svCon("[401] Fail to authenticate with authorization");
    return res.sendStatus(401)
  }
  let decoded;
  try {
    decoded = verifyToken(token)
    req.body["secure_id"] = decoded.id;
  } catch (err) {
    dc.svCon("[403] Invalid token");
    return res.sendStatus(403)
  }

  let roles
  try {
    [roles] = await getUserRoles({id_login: decoded.id})
  } catch (err) {
    dc.svCon("[403] Invalid token (cannot find roles of current user - user deleted ?)");
    return res.sendStatus(403)
  }
  roles = roles.map(x => x.quick)

  //dc.svCon(roles)

  for (const role of roles) {
    switch (role) {
      case "sysadmin":
        dc.svCon("Add sysadmin zone ...");
        app.use('/user', sysUserRouter);
        break;
      case "manager":
        dc.svCon("Add manager zone ...");
        app.use('/post', mgrPostRouter);
        app.use('/vgd', mgrVgdRouter);
        break;
    }
  }

  // Protected global routes
  app.use('/vgd', secVgdRouter);
  app.use('/post', secPostRouter);
  app.use('/post/:postId/play', (req, res, next) => {
    req.body.id_post = req.params.postId
    secPlayRouter(req, res, next)
  })

  app.use('/post/:postId/signal', (req, res, next) => {
    req.body.id_post = req.params.postId
    secSignalRouter(req, res, next)
  })
  app.use('/session', sessionRouter)
  app.use('/user', secUserRouter);

  // Error 404 handler
  app.use((req, res, next) => {
    dc.svCon("Cannot find route !")
    return res.sendStatus(404)
  });

  next()
});

export default app;