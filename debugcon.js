import debug from 'debug';
import db from "./database.js";
import {validateUser} from "./jwt.js";

// Wrapper function
function log(con, req, res, next) {
  con('Request:', req.method, req.path, req.query);

  const originalSend = res.send;
  const originalJson = res.json;

  // Override res.send to capture the body
  res.send = (body) => {
    con('Response: [' + res.statusCode + '] ', body);
    originalSend.call(res, body);
  };

  // Override res.json to capture the body
  res.json = (body) => {
    con('Response: [' + res.statusCode + '] ');
    con(body)
    originalSend.call(res, JSON.stringify(body));
  };

  next();
}

export default {
  log: log,
  svCon: debug('red-engine:server'),
  dbCon: debug("red-engine:database"),
  authCon: debug("red-engine:route/auth"),
  postCon: debug("red-engine:route/post")
}