import express from "express";
import {getRoleId, assignRole, getUserInfoFromUsername, deleteRole} from "../../database.js";
import dc from "../../debugcon.js"
const router = express.Router();

router.use((req, res, next) => {
  dc.log(dc.userCon, req, res, next, '(sysadmin)');
})

router.post("/assign", async (req, res) => {
  let id
  try {
    [id] = await getRoleId({quick: req.body.role})
  } catch (error) {
    dc.userCon(error)
    res.sendStatus(404)
  }
  id = id[0]

  req.body["id_login"] = req.body["secure_id"];

  let u;
  try {
    [u] = await getUserInfoFromUsername(req.body);
  } catch (err) {
    dc.userCon(err)
    return res.sendStatus(400)
  }

  if (u.length === 0) {
    return res.sendStatus(404)
  }

  u = u[0]

  //dc.userCon({id_role: id.id_role, id_login: u.id_login})
  try {
    await assignRole({id_role: id.id_role, id_login: u.id_login});
  } catch (err) {
    dc.userCon(err)
    return res.sendStatus(406)
  }

  return res.sendStatus(201)


})

router.delete("/assign", async (req, res) => {
  let id
  try {
    [id] = await getRoleId({quick: req.body.role})
  } catch (error) {
    dc.userCon(error)
    res.sendStatus(404)
  }
  id = id[0]

  req.body["id_login"] = req.body["secure_id"];

  let u;
  try {
    [u] = await getUserInfoFromUsername(req.body);
  } catch (err) {
    dc.userCon(err)
    return res.sendStatus(400)
  }

  if (u.length === 0) {
    return res.sendStatus(404)
  }

  u = u[0]

  //dc.userCon({id_role: id.id_role, id_login: u.id_login})
  try {
    await deleteRole({id_role: id.id_role, id_login: u.id_login});
  } catch (err) {
    dc.userCon(err)
    return res.sendStatus(400)
  }

  return res.sendStatus(200)
})

export default router;