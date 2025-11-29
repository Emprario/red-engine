import express from "express";
import dc from "../../debugcon.js";
import {getAllMySessions, getSessionScore} from "../../database.js";

const router = express.Router();

let orSend, orJson;
router.use((req, res, next) => {
  [orSend, orJson] = dc.log(dc.ssCon, req, res, next, '(secure)');
  next()
})

router.use('/:sessionId', (req, res, next) => {
  dc.ssCon("sessionId: " + req.params.sessionId)
  next()
})


router.get('/', async (req, res) => {
  let r;
  try {
    [r] = await getAllMySessions({id_login: req.body["secure_id"]})
  } catch (err) {
    dc.ssCon(err)
    return res.sendStatus(500)
  }

  return res.status(200).send(r)
})

router.get('/:sessionId', async (req, res) => {
  let r;
  try {
    [r] = await getSessionScore({id_login: req.body["secure_id"], id_session: req.params["sessionId"]})
  } catch (err) {
    dc.ssCon(err)
    return res.sendStatus(404)
  }

  if (r.length !== 1) {
    res.sendStatus(404)
  }

  r[0] = r

  return res.status(200).send(r)
})


router.use((req, res, next) => {
  dc.unlog(dc.postCon, req, res, next, '(secure)', orSend, orJson);
  next()
})

export default router;