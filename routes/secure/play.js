import express from "express";
import {getPlayed, getAmountPlay, playPost, disPlay} from "../../database.js";
import dc from "../../debugcon.js"

const router = express.Router();

router.use((req, res, next) => {
  dc.log(dc.playCon, req, res, next, '(secure)');
})

router.use((req, res, next) => {
  dc.playCon("postId: " + req.body.id_post)
  req.body.id_login = req.body.secure_id
  next();
})

router.get('/', async (req, res) => {
  let r
  try {
    [r] = await getPlayed(req.body)
  } catch (err) {
    dc.playCon(err)
    return res.sendStatus(400)
  }
  let body = {};

  body["played"] = r.length !== 0;

  body["amount"] = (await getAmountPlay(req.body))[0][0]["AMOUNT"]

  res.status(200).json(body)
})

router.post('/', async (req, res) => {
  let r
  try {
    [r] = await playPost(req.body)
  } catch (err) {
    dc.playCon(err)
    return res.sendStatus(404)
  }

  return res.sendStatus(201)

})

router.delete('/', async (req, res) => {
  let r
  try {
    [r] = await disPlay(req.body)
  } catch (err) {
    dc.playCon(err)
    return res.sendStatus(404)
  }

  return res.sendStatus(200)
})

export default router;