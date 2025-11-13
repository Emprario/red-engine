import express from "express";
import {getUserRoles, getUserInfo} from "../../database.js";
import dc from "../../debugcon.js"
const router = express.Router();

router.use((req, res, next) => {
  dc.log(dc.userCon, req, res, next, '(sysadmin)');
})

router.post("/assign", async (req, res) => {
  dc.userCon("hello world")
  res.sendStatus(418)
})

router.delete("/assign", async (req, res) => {

})

export default router;