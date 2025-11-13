import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();


const secretKey = process.env.SECRET
const saltRounds = parseInt(process.env.SALT_ROUNDS)

export function generateToken(id, roles) {
  const payload = { id, roles};
  const options = { expiresIn: '6h' }; // Token expiration time
  return jwt.sign(payload, secretKey, options);
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey);
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