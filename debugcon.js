import debug from 'debug';
import {validateUser} from "./jwt.js";

// Wrapper function
function log(con, req, res, next, base) {
  if (base === undefined || base == null) {
    base = ""
  }
  con('Request:', req.method, base + req.path, req.query);

  const originalSend = res.send;
  const originalJson = res.json;

  // Override res.send to capture the body
  res.send = (body) => {
    con('Response: [' + res.statusCode + '] ', body);
    originalSend.call(res, body);
  };

  // Override res.json to capture the body
  res.json = (body) => {
    res.send = originalSend;
    con('Response: (JSON) [' + res.statusCode + '] ');
    con(body)
    originalJson.call(res, body);
  };

  next();
}

export default {
  log: log,
  svCon: debug('red-engine:server'),
  dbCon: debug("red-engine:database"),
  authCon: debug("red-engine:route/auth"),
  postCon: debug("red-engine:route/post"),
  playCon: debug("red-engine:route/post:play"),
  signalCon: debug("red-engine:route/post:signal")
}