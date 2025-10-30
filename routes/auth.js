import express from "express";
import db from "../database.js";
import {generateToken, validateUser} from "../jwt.js";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  const [users] = await db.getLogin(req.body);

  if (users.length === 0) {
    return res.sendStatus(404)
  }

  const user = users[0];
  const vu = await jwt.validateUser(user, user["password"]);
  if (!vu) {
    return res.sendStatus(403)
  } else {
    return res.sendStatus(200)
  }
});

router.post("/auth/sign-in", async (req, res, next) => {
  req.body["hash"] = jwt.hashPassword(req.body["password"]);
  const [result] = await db.signIn(req.body);

  if (result.affectedRows !== 1) {
    return res.sendStatus(404)
  } else {
    return res.sendStatus(200)
  }
});


export default router;
