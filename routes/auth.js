import express from "express";
import db from "../database.js";
import dc from "../debugcon.js"
import {generateToken, validateUser, hashPassword} from "../jwt.js";

const router = express.Router();

router.use((req, res, next) => {
  dc.log(dc.authCon, req, res, next);
})

router.post("/login", async (req, res, next) => {
  let users;
  try {
    [users] = await db.getLogin(req.body);
  } catch (err){
    dc.authCon(err)
    return res.sendStatus(400)
  }

  if (users.length === 0) {
    return res.sendStatus(404)
  }

  const user = users[0];
  //dc.authCon(user, req.body)
  const vu = await validateUser(req.body["password"], user["password"]);
  if (!vu) {
    return res.sendStatus(403)
  } else {
    return res.status(200).json({token: generateToken(user.id_login)});
  }
});

router.post("/sign-in", async (req, res, next) => {
  req.body["hash"] = await hashPassword(req.body["password"]);

  let result
  try {
    [result] = await db.signIn(req.body);
  } catch (err){
    dc.authCon(err)
    return res.sendStatus(400)
  }

  return res.sendStatus(200)
});


export default router;
