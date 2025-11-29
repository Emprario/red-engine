import express from "express";
import {getUserRoles, getUserInfo} from "../../database.js";
import dc from "../../debugcon.js"

const router = express.Router();

let orSend, orJson
router.use((req, res, next) => {
  [orSend, orJson] = dc.log(dc.userCon, req, res, next, '(secure)');
  next()
})

router.get("/me", async (req, res) => {
  req.body["id_login"] = req.body["secure_id"];

  let u;
  try {
    [u] = await getUserInfo(req.body);
  } catch (err) {
    dc.userCon(err)
    return res.sendStatus(400)
  }

  if (u.length === 0) {
    return res.sendStatus(404)
  }

  u = u[0]

  let [r] = await getUserRoles(u);
  u["roles"] = r.map(r => r.quick)
  return res.status(200).json(u);
})

router.use((req, res, next) => {
  dc.unlog(dc.userCon, req, res, next, '(secure)', orSend, orJson);
  next()
})

export default router;