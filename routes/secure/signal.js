import express from "express";
import {getSignaled, getAmountSignal, signalPost} from "../../database.js";
import dc from "../../debugcon.js"

const router = express.Router();

router.use((req, res, next) => {
  dc.log(dc.signalCon, req, res, next, '(secure)');
})

router.use((req, res, next) => {
  dc.signalCon("postId: " + req.body.id_post)
  req.body.id_login = req.body.secure_id
  next();
})

router.get('/', async (req, res) => {
  let r
  try {
    [r] = await getSignaled(req.body)
  } catch (err) {
    dc.signalCon(err)
    return res.sendStatus(400)
  }
  let body = {};

  body["signaled"] = r.length !== 0;

  body["amount"] = (await getAmountSignal(req.body))[0][0]["AMOUNT"]

  res.status(200).json(body)
})

router.post('/', async (req, res) => {
  let r
  try {
    [r] = await signalPost(req.body)
  } catch (err) {
    dc.signalCon(err)
    return res.sendStatus(404)
  }

  return res.sendStatus(201)

})

export default router;