import express from "express";
import db from "../database.js";
import dc from "../debugcon.js"
import {validateUser} from "../jwt.js";

const router = express.Router();

router.use((req, res, next) => {
  dc.log(dc.postCon, req, res, next);
})

router.get('/', async (req, res) => {
  const params = {
    "gs": {
      "ask": 1,
      "close": 1
    },
    "u": {
      "ask": 1,
      "close": 1
    },
    "q": {
      "ask": 1,
      "close": 1
    }
  }
  if (req.query.gs) {
    params.gs.ask= "..."
    params.gs.close = req.query.gs

  }
})