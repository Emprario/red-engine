const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET

function generateToken(id) {
  const payload = { id };
  const options = { expiresIn: '1h' }; // Token expiration time
  return jwt.sign(payload, secretKey, options);
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.id;
  } catch (err) {
    throw "Unauthorized user"; // Token is invalid or expired
  }
}

module.exports = { generateToken, verifyToken }