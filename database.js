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


// =============== AUTH =============== //

export async function getLogin({username}) {
  return db.query("SELECT * FROM `Login` WHERE `username`=?", [username])
}

export async function signIn({username, email, hash}) {
  return db.query("INSERT INTO `Login` (`mail`, `password`, `username`) VALUES (?, ?, ?)",
    [email, hash, username])
}


// =============== POST =============== //

// --------------- root --------------- //

export async function queryPostInfos({gs, u, q}) {
  return db.query("SELECT `Post`.id_post, title, content, publish_date, username AS publisher, COUNT(*) AS plays FROM `Post` " +
    "INNER JOIN `Login` ON `Post`.id_login = `Login`.id_login " +
    "INNER JOIN `Play` ON `Post`.id_post = `Play`.id_post " +
    "WHERE ?=? AND ?=? AND username LIKE ? AND LENGTH(title)>0 " +
    "GROUP BY `Post`.id_post ", [gs.ask, gs.close, u.ask, u.close, q.close])
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


// -------------- postId -------------- //

export async function fetchPost({id_post}) {
  return db.query("SELECT * FROM `Post` WHERE id_post=?", [id_post])
}

export async function getQSetsFromPost({id_post}) {
  return db.query("SELECT * FROM `QSet` WHERE id_post = ?", [id_post])
}

export async function getQuestionsFromQSet({id_set}) {
  return db.query("SELECT * FROM `Question` WHERE id_set = ?", [id_set])
}

export async function fetchReplies({id_post}) {
  return db.query("SELECT Reply.id_post_reply FROM `Reply` WHERE id_post = ?", [id_post])
}

export async function createReply({content, id_login}) {
  return db.query("INSERT INTO `Post` (content, publish_date, id_login) VALUES (?, CURRENT_TIMESTAMP, ?)", [content, id_login])
}

export async function linkReply({id_post, id_post_reply}) {
  return db.query("INSERT INTO `Reply` (id_post, id_post_reply) VALUES (?, ?)", [id_post, id_post_reply])
}

export async function deletePost({id_post, id_login}) {
  return db.query("DELETE FROM `Post` WHERE id_post=? AND id_login=?", [id_post, id_login])
}


// --------------- play --------------- //

export async function playPost({id_post, id_login}) {
  return db.query("INSERT INTO `Play` (id_login, id_post) VALUES (?, ?)", [id_login, id_post])
}

export async function getPlayed({id_post, id_login}) {
  return db.query("SELECT id_login FROM `Play` WHERE id_post=? AND id_login=?", [id_post, id_login])
}

export async function getAmountPlay({id_post}) {
  return db.query("SELECT COUNT(*) AS 'AMOUNT' FROM `Play` WHERE id_post=?", [id_post])
}

export async function disPlay({id_post, id_login}) {
  return db.query("DELETE FROM `Play` WHERE id_login=? AND id_post=?", [id_login, id_post])
}


// -------------- signal -------------- //

export async function signalPost({id_post, id_login}) {
  return db.query("INSERT INTO `Signal` (id_login, id_post) VALUES (?, ?)", [id_login, id_post])
}

export async function getSignaled({id_post, id_login}) {
  return db.query("SELECT id_login FROM `Signal` WHERE id_post=? AND id_login=?", [id_post, id_login])
}

export async function getAmountSignal({id_post}) {
  return db.query("SELECT COUNT(*) AS 'AMOUNT' FROM `Signal` WHERE id_post=?", [id_post])
}
