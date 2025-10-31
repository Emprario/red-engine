import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import dc from './debugcon.js';

dotenv.config();


const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'awp_vgm',
});

dc.dbCon("Connected to the database");

export async function getLogin({username}) {
  return db.query("SELECT * FROM `Login` WHERE `username`=?", [username])
}

export async function signIn({username, email, hash}) {
  return db.query("INSERT INTO `Login` (`mail`, `password`, `username`) VALUES (?, ?, ?)",
    [email, hash, username])
}

export default {getLogin, signIn};