import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();


const secretKey = process.env.SECRET
const saltRounds = parseInt(process.env.SALT_ROUNDS)

export function generateToken(id) {
  const payload = { id };
  const options = { expiresIn: '1h' }; // Token expiration time
  return jwt.sign(payload, secretKey, options);
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.id;
  } catch (err) {
    throw "Unauthorized user"; // Token is invalid or expired
  }
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(saltRounds)
  return bcrypt.hash(password, salt);
}

export async function validateUser(password, hash) {
  return bcrypt.compare(password, hash)
}

export default {generateToken, verifyToken, hashPassword, validateUser};