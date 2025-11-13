import express from "express";
import {} from "../../database.js";
import dc from "../../debugcon.js"

const router = express.Router();

router.use((req, res, next) => {
  dc.log(dc.postCon, req, res, next, '(manager)');
})

export default router;