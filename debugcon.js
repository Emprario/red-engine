import debug from 'debug';

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
    res.send = originalSend
    res.json = originalJson;
    con('Response: [' + res.statusCode + '] ', body);
    originalSend.call(res, body);
  };

  // Override res.json to capture the body
  res.json = (body) => {
    res.send = originalSend;
    res.json = originalJson;
    con('Response: (JSON) [' + res.statusCode + '] ');
    con(body)
    originalJson.call(res, body);
  };

  return [originalSend, originalJson]
}

// Wrapper function
function unlog(con, req, res, next, base, originalSend, originalJson) {
  if (base === undefined || base == null) {
    base = ""
  }
  con('EndZone:', req.method, base + req.path, req.query);

  res.send = originalSend;
  res.json = originalJson;
}

export default {
  log: log,
  unlog: unlog,
  svCon: debug('red-engine:server'),
  dbCon: debug("red-engine:database"),
  authCon: debug("red-engine:route/auth"),
  postCon: debug("red-engine:route/post"),
  playCon: debug("red-engine:route/post:play"),
  signalCon: debug("red-engine:route/post:signal"),
  userCon: debug("red-engine:route/user"),
  vgdCon: debug("red-engine:route/vgd"),
  dgCon: debug("red-engine:debug"),
}