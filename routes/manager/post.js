import express from "express";
import {deletePost, deletePostManager, fetchPost} from "../../database.js";
import dc from "../../debugcon.js"

const router = express.Router();

router.use((req, res, next) => {
  dc.log(dc.postCon, req, res, next, '(manager)');
})

router.delete("/:postId", async (req, res) => {
  req.body["id_post"] = req.params["postId"]

  let r
  try {
    [r] = await deletePostManager(req.body)
  } catch (err) {
    dc.postCon(err)
    return res.sendStatus(400)
  }

  if (r.affectedRows > 0) {
    return res.sendStatus(200)
  } else {
    return res.sendStatus(404)
  }
})


export default router;