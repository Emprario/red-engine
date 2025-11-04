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

export async function queryPostInfos({gs, u, q}) {
  return db.query("SELECT id_post, title, content, publish_date, username AS publisher FROM `Post` " +
    "INNER JOIN `Login` ON `Post`.id_login = `Login`.id_login " +
    "WHERE ?=? AND ?=? AND ? LIKE ?", [gs.ask, gs.close, u.ask, u.close, q.ask, q.close])
}

export async function createPost({title, content, id_login}) {
  return db.query("INSERT INTO `Post` (title, content, publish_date, id_login) VALUES (?, ?, CURRENT_TIMESTAMP, ?)",
    [title, content, id_login])
}

export async function createQuestion({is_correct, statement, id_set, id_question}) {
  return db.query("INSERT INTO `Question` (id_set, id_question, is_correct, statement) VALUES (?, ?, ?, ?)",
    [id_set, id_question, is_correct, statement])
}

export async function createQset({prompt, ressource_type, ressource_link, id_post}) {
  return db.query("INSERT INTO `QSet` (prompt, ressource_type, ressource_link, id_post) VALUES (?, ?, ?, ?)",
    [prompt, ressource_type, ressource_link, id_post])
}

export default {getLogin, signIn, queryPostInfos, createPost, createQuestion, createQset};