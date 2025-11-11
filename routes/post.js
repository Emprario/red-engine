import express from "express";
import {
  createPost, createQset, createQuestion,
  createReply,
  deletePost, fetchPost,
  fetchReplies,
  getQSetsFromPost, getQuestionsFromQSet,
  linkReply,
  queryPostInfos
} from "../database.js";
import dc from "../debugcon.js"
import playRouter from "./post/play.js"
import signalRouter from "./post/signal.js"

const router = express.Router();

router.use('/:postId/play', (req, res, next) => {
  req.body.id_post = req.params.postId
  req.body.id_login = req.body.secure_id
  playRouter(req, res, next)
})

router.use('/:postId/signal', (req, res, next) => {
  req.body.id_post = req.params.postId
  req.body.id_login = req.body.secure_id
  signalRouter(req, res, next)
})

router.use((req, res, next) => {
  dc.log(dc.postCon, req, res, next);
})

router.use('/:postId', (req, res, next) => {
  dc.postCon("postId: " + req.params.postId)
  next()
})


router.get('/', async (req, res) => {
  const params = {
    "gs": {
      "ask": '1',
      "close": '1'
    },
    "u": {
      "ask": '1',
      "close": '1'
    },
    "q": {
      "ask": 'title',
      "close": "%"
    }
  }
  dc.postCon(req.query)

  if (req.query.gs) {
    params.gs.ask = '1'
    params.gs.close = '1'
  }

  if (req.query.u) {
    params.u.ask = "username"
    params.u.close = req.query.u
  }

  if (req.query.q) {
    params.q.ask = "title"
    params.q.close = req.query.u + "%"
  }

  dc.postCon(params)
  try {
    dc.postCon(await queryPostInfos(params))
    const [r] = await queryPostInfos(params)
    return res.status(200).json(r)
  } catch (err) {
    dc.postCon(err)
    return res.sendStatus(400)
  }
})

router.post('/', async (req, res) => {
  if (!req.body.qsetArray) {
    return res.sendStatus(400)
  }

  // 1. Create Post
  req.body["id_login"] = req.body["secure_id"]
  //dc.postCon(req.body)
  var post;
  try {
    [post] = await createPost(req.body)
  } catch (err) {
    dc.postCon(err)
    return res.sendStatus(400)
  }
  //dc.postCon(post)

  // 2. Create QSets
  for (const qset of req.body.qsetArray) {
    qset.id_post = post.insertId
    var set;
    try {
      [set] = await createQset(qset)
      // 3. Create Questions
      for (let i = 0; i < qset.questionArray.length; i++) {
        try {
          qset.questionArray[i].id_set = set.insertId;
          qset.questionArray[i].id_question = i + 1;
          await createQuestion(qset.questionArray[i])
        } catch (err) {
          dc.postCon(err)
          return res.sendStatus(400)
          // TODO: clean db before
        }
      }
    } catch (err) {
      dc.postCon(err)
      return res.sendStatus(400)
      // TODO: clean db before
    }
  }

  return res.sendStatus(201)
})

router.get("/:postId", async (req, res) => {

  async function rootfetch({parentJson, id_post}) {
    [parentJson["post"]]= await fetchPost({id_post})

    if (parentJson["post"].length === 0) {
      throw new Error("No parent post")
    }

    [parentJson["qset"]] = await getQSetsFromPost({id_post})

    for (let i = 0; i < parentJson["qset"].length; i++) {
      [parentJson["qset"][i]["questionArray"]] = await getQuestionsFromQSet(result["qset"][i])
      //dc.postCon(result["qset"][i]["questionArray"])
    }

    parentJson["replies"] = []
    let all_repl_id
    [all_repl_id] = await fetchReplies({id_post})
    //dc.postCon("replies", all_repl_id)
    for (const id of all_repl_id) {
      let obj = {}
      await rootfetch({"parentJson": obj, "id_post": id["id_post_reply"]})
      parentJson["replies"].push(obj)
    }

  }

  let result = {}
  try {
    await rootfetch({"parentJson": result, "id_post": req.params.postId})
  } catch (err) {
    dc.postCon(err)
    return res.sendStatus(404)
  }

  res.json(result)

})

router.post("/:postId/reply", async (req, res) => {

  req.body["id_login"] = req.body["secure_id"]

  try {
    const [r] = await createReply(req.body)
    req.body["id_post_reply"] = r.insertId
  } catch (err) {
    dc.postCon(err)
    return res.sendStatus(400)
  }

  req.body["id_post"] = req.params.postId
  try {
    //dc.postCon(req.body)
    await linkReply(req.body)
  } catch (err) {
    dc.postCon(err)
    return res.sendStatus(404)
  }

  res.sendStatus(201)
})

router.delete("/:postId", async (req, res) => {
  req.body["id_login"] = req.body["secure_id"]
  req.body["id_post"] = req.params["postId"]



  dc.postCon(req.body)

  let r
  try {
    r = await deletePost(req.body)
  } catch (err) {
    dc.postCon(err)
    return res.sendStatus(400)
  }

  if (r.affectedRows > 0) {
    return res.sendStatus(200)
  } else {
    if ((await fetchPost(req.body))[0].length > 0) {
      //dc.postCon(await fetchPost(req.body))
      return res.sendStatus(403)
    } else {
      return res.sendStatus(404)
    }
  }
})


export default router;