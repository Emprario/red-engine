import express from "express";
import {createNewVgd, deleteVgd, putNewVgd} from "../../database.js";
import dc from "../../debugcon.js"

const router = express.Router();

let orSend, orJson;
router.use((req, res, next) => {
  [orSend, orJson] = dc.log(dc.vgdCon, req, res, next, '(manager)');
  next()
})

router.use('/:vgdId', (req, res, next) => {
  dc.vgdCon("vgdId: " + req.params.vgdId)
  next()
})

router.post('/', async (req, res) => {
  try {
    await createNewVgd(req.body)
  } catch (err) {
    dc.vgdCon(err)
    return res.sendStatus(400)
  }

  return res.sendStatus(201)
})

router.put('/:vgdId', async (req, res) => {
  req.body.id_vg = req.params.vgdId
  try {
    await putNewVgd(req.body)
  } catch (err) {
    dc.vgdCon(err)
    return res.sendStatus(404)
  }

  return res.sendStatus(200)
})

router.delete('/:vgdId', async (req, res) => {
  try {
    await deleteVgd({id_vg: req.params.vgdId})
  } catch (err) {
    dc.vgdCon(err)

    return res.status(400).send("Verify VG exists. Try to unlink all post from this VG")
  }

  return res.sendStatus(200)
})

router.use((req, res, next) => {
  dc.unlog(dc.vgdCon, req, res, next, '(manager)', orSend, orJson);
  next()
})

export default router;