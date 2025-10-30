import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import debug from 'debug';

dotenv.config();
const debugdb = debug("red-engine:database")


const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'awp_vgm',
});

debugdb("Connected to the database");

export async function getLogin({username}) {
  return db.query("SELECT id_login FROM `Login` WHERE `username`=?", [username])
}

export async function signIn({username, email, hash}, callback) {
  return db.query("INSERT INTO `Login` (`mail`, `password`, `username`) VALUES (?, ?, ?)",
    [email, hash, username])
}

export default {getLogin, signIn};