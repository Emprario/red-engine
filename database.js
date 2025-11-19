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

export async function signIn({username, mail, hash}) {
  return db.query("INSERT INTO `Login` (`mail`, `password`, `username`) VALUES (?, ?, ?)",
    [mail, hash, username])
}


// =============== POST =============== //

// --------------- root --------------- //

export async function queryPostInfos({gs, u, q}) {
  return db.query(`
      SELECT Post.id_post,
             title,
             content,
             publish_date,
             username AS publisher,
             CONCAT(',', GROUP_CONCAT(DISTINCT id_vg ORDER BY id_vg ASC SEPARATOR ',' ), ',') AS vgd
      FROM Post
               LEFT JOIN Talk_about USING(id_post)
               INNER JOIN Login ON Post.id_login = Login.id_login
      WHERE title IS NOT NULL AND username LIKE ? AND title LIKE ?
      GROUP BY Post.id_post
      HAVING CONCAT(',', GROUP_CONCAT(DISTINCT id_vg ORDER BY id_vg ASC SEPARATOR ',' ), ',') LIKE ?
      ORDER BY Post.id_post
  `, [u.close, q.close, gs.close])
}

export async function createPost({title, content, id_login}) {
  return db.query("INSERT INTO `Post` (title, content, publish_date, id_login) VALUES (?, ?, CURRENT_TIMESTAMP, ?)",
    [title, content, id_login])
}

export async function attachedVgToPost({id_post, id_vg}) {
  return db.query(`INSERT INTO Talk_about (id_post, id_vg) VALUES (?, ?)`, [id_post, id_vg])
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
  return db.query(`
      SELECT Post.id_post,
             title,
             content,
             publish_date,
             username AS publisher,
             GROUP_CONCAT(DISTINCT id_vg SEPARATOR ',') AS vgd
      FROM Post
               LEFT JOIN Talk_about USING(id_post)
               INNER JOIN Login ON Post.id_login = Login.id_login
      WHERE id_post=?
      GROUP BY Post.id_post
      ORDER BY Post.id_post
      `, [id_post])
}

export async function getQSetsFromPost({id_post}) {
  return db.query("SELECT * FROM `QSet` WHERE id_post = ?", [id_post])
}

export async function getQuestionsFromQSet({id_set}) {
  return db.query("SELECT id_set, id_question, statement FROM `Question` WHERE id_set = ?", [id_set])
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

export async function fetchSubmitionAnswers({id_post}) {
  return db.query("SELECT Qt.id_set, Qt.id_question, Qt.is_correct FROM Question AS Qt " +
    "INNER JOIN QSet AS Qs ON Qs.id_set = Qt.id_set " +
    "WHERE id_post=? " +
    "ORDER BY Qt.id_set, Qt.id_question", [id_post])
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

// =============== USER =============== //

export async function getUserInfo({id_login}) {
  return db.query("SELECT id_login, mail, username FROM Login WHERE id_login=?", [id_login])
}

export async function getUserInfoFromUsername({username}) {
  // Username is also unique
  return db.query("SELECT id_login, mail, username FROM Login WHERE username=?", [username])
}

export async function getUserRoles({id_login}) {
  return db.query("SELECT DISTINCT quick FROM `Role` INNER JOIN HAS_A USING(id_role) WHERE id_login=?", [id_login])
}

export async function getRoleId({quick}) {
  return db.query("SELECT id_role FROM `Role` WHERE quick=?", quick)
}

export async function assignRole({id_role, id_login}) {
  return db.query("INSERT INTO `HAS_A` (id_role, id_login) VALUES (?, ?)", [id_role, id_login])
}

export async function deleteRole({id_role, id_login}) {
  return db.query("DELETE FROM `HAS_A` WHERE id_role=? AND id_login=?", [id_role, id_login])
}

// =============== VGD  =============== //

export async function fetchVgd({id_vg}) {
  return db.query("SELECT * FROM `VGDiscover` WHERE id_vg=?", [id_vg])
}

export async function getAllVgd() {
  return db.query("SELECT * FROM `VGDiscover`")
}

export async function createNewVgd({name, image_link, release_date, description}) {
  return db.query("INSERT INTO `VGDiscover` (name, image_link, release_date, description) VALUES (?, ?, ?, ?)", [name, image_link, release_date, description])
}

export async function deleteVgd({id_vg}) {
  return db.query("DELETE FROM `VGDiscover` WHERE id_vg=?", [id_vg])
}

export async function putNewVgd({id_vg, name, image_link, release_date, description}) {
  return db.query("UPDATE `VGDiscover` SET name=?, image_link=?, release_date=?, description=? WHERE id_vg=?", [name, image_link, release_date, description, id_vg])
}