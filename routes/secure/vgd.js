import express from "express";
import {fetchVgd, getAllVgd} from "../../database.js";
import dc from "../../debugcon.js"

const router = express.Router();

let orSend, orJson
router.use((req, res, next) => {
  [orSend, orJson] = dc.log(dc.vgdCon, req, res, next, '(secure)');
  next()
})

router.use('/:vgdId', (req, res, next) => {
  dc.vgdCon("vgdId: " + req.params.vgdId)
  next()
})


router.get('/', async (req, res) => {
  let alls;
  try {
    [alls] = await getAllVgd();
  } catch (err) {
    dc.vgdCon(err)
    return res.status(500).send(err.message)
  }

  return res.status(200).send(alls);
})

router.get('/:vgdId', async (req, res) => {
  let alls;
  try {
    [alls] = await fetchVgd({id_vg: req.params.vgdId});
  } catch (err) {
    dc.vgdCon(err)
    return res.status(400).send(err.message)
  }
  dc.vgdCon(alls)
  if (alls.length === 0) {
    return res.sendStatus(404)
  }

  return res.status(200).json(alls[0]);
})

router.use((req, res, next) => {
  dc.unlog(dc.vgdCon, req, res, next, '(secure)', orSend, orJson);
  next()
})

export default router;