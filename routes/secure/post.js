import express from "express";
import {
  addRecordToSession,
  attachedVgToPost,
  createPost, createQset, createQuestion,
  createReply,
  deletePost, fetchPost,
  fetchReplies, fetchSubmitionAnswers, getAvgScoreFromPost,
  getQSetsFromPost, getQuestionsFromQSet, getSessionScore,
  linkReply,
  queryPostInfos, reserveNewSession, unlinkVgToPost, updatePost
} from "../../database.js";
import dc from "../../debugcon.js"

const router = express.Router();

let orSend, orJson;
router.use((req, res, next) => {
  [orSend, orJson] = dc.log(dc.postCon, req, res, next, '(secure)');
  next()
})

router.use('/:postId', (req, res, next) => {
  dc.postCon("postId: " + req.params.postId)
  next()
})


router.get('/', async (req, res) => {
  const params = {
    "gs": {
      "close": '%'
    },
    "u": {
      "close": '%'
    },
    "q": {
      "close": "%"
    }
  }
  //dc.postCon(req.query)

  if (req.query.gs) {
    //params.gs.ask = 'vgd'
    params.gs.close = '%'
    let prev = ''
    for (let vg of req.query.gs.split('-').sort()) {
      dc.postCon(parseInt(vg) - 1, prev)
      if (parseInt(vg) - 1 === prev) {
        params.gs.close = params.gs.close + vg + ","
      } else {
        params.gs.close = params.gs.close + "%," + vg + ","
      }
      prev = parseInt(vg)
    }
    params.gs.close += '%'
  }

  if (req.query.u) {
    params.u.close = req.query.u
  }

  if (req.query.q) {
    params.q.close = "%" + req.query.q + "%"
  }

  //dc.postCon(params)
  try {
    //dc.postCon(await queryPostInfos(params))
    let [r] = await queryPostInfos(params)
    r = r.map(x => {
      //dc.postCon("lst::", x['vgd'].split(","))
      if (x !== null) {
        let sp = x["vgd"].split(",")
        sp.shift()
        sp.pop()
        x["vgd"] = sp.map(x => parseInt(x))
      } else {
        x["vgd"] = []
      }
      return x
    })

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
  try {
    for (let id of req.body.vgd) {
      await attachedVgToPost({id_post: post.insertId, id_vg: id})
    }
  } catch (err) {
    dc.postCon(err)
    await deletePost({id_post: post.insertId, id_login: req.body["id_login"]})
    return res.sendStatus(400)
  }

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
          await deletePost({id_post: post.insertId, id_login: req.body["id_login"]})
          return res.sendStatus(400)
          // TODO: clean db before
        }
      }
    } catch (err) {
      dc.postCon(err)
      await deletePost({id_post: post.insertId, id_login: req.body["id_login"]})
      return res.sendStatus(400)
      // TODO: clean db before
    }
  }

  return res.sendStatus(201)
})

router.get("/:postId", async (req, res) => {

  async function rootfetch({parentJson, id_post}) {
    [parentJson["post"]] = await fetchPost({id_post});

    if (parentJson["post"].length === 0) {
      throw new Error("No parent post")
    }

    parentJson["post"] = parentJson["post"][0];
    if (parentJson["post"]["vgd"] !== null) {
      parentJson["post"]["vgd"] = parentJson["post"]["vgd"].split(",").map(x => parseInt(x))
    } else {
      parentJson["post"]["vgd"] = []
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

/*router.post("/:postId/new-session", async (req, res) => {
  req.body["id_login"] = req.body["secure_id"]
  req.body["id_post"] = req.params["postId"]

  let new_session;
  try {
    [new_session] = await reserveNewSession(req.body)
  } catch (err) {
    dc.postCon(err)
    return res.sendStatus(404)
  }

  //dc.dgCon(new_session)
  return res.status(201).json({id_session: new_session.insertId})

})*/

router.get("/:postId/score", async (req, res) => {
  let r;
  try {
    [r] = await getAvgScoreFromPost({id_post: req.params.postId})
  } catch (err) {
    dc.ssCon(err)
    return res.sendStatus(404)
  }

  if (r.length !== 1) {
    res.sendStatus(404)
  }

  r = r[0]

  return res.status(200).send(r)
})

router.post("/:postId/submit", async (req, res) => {

  req.body["id_post"] = req.params.postId
  let r
  try {
    [r] = await fetchSubmitionAnswers(req.body)
  } catch (err) {
    dc.postCon(err)
    return res.sendStatus(400)
  }

  if (r.length === 0) {
    res.sendStatus(404)
  }

  // Sort our array
  req.body.data.sort(
    (a, b) => ((a.id_set === b.id_set) && (a.id_question > b.id_question)) || (a.id_set > b.id_set)
  )

  function right2score(is_correct, right) {
    if (!right) {
      return -1
    } else {
      if (is_correct) {
        return 1
      } else {
        return 0
      }
    }
  }

  const mt = []
  const ms = {}
  let j = 0
  for (let i = 0; i < r.length && j < req.body.data.length; i++) {
    //dc.postCon(i,j)
    if (!(req.body.data[j].id_set === r[i].id_set && req.body.data[j].id_question === r[i].id_question)) {
      //dc.postCon("Erreur Interne !!!")
      //return res.sendStatus(500)
      continue
    }
    req.body.data[j]["right"] = req.body.data[j]["is_correct"] === !!r[i]["is_correct"]
    if (!ms[req.body.data[j].id_set]) {
      ms[req.body.data[j].id_set] = 0
    }
    ms[req.body.data[j].id_set] += right2score(!!r[i]["is_correct"], req.body.data[j]["right"])
    delete req.body.data[j]["is_correct"]
    mt.push(req.body.data[j])
    j++;
  }

  // Convert ms to score
  let newId = -1
  for (let id_set in ms) {
    try {
      let record = {
        id_login: req.body["secure_id"],
        id_post: req.params.postId,
        id_set,
        score: Math.max(ms[id_set], 0)
      }
      if (req.body["id_session"] !== null) {
        record.id_session = req.body["id_session"]
        await addRecordToSession(record)
      } else {
        let [r] = await reserveNewSession(record)
        newId = r.insertId
      }

    } catch (err) {
      dc.postCon(err)
      return res.sendStatus(400)
    }
  }

  let returnObject
  if (newId >= 0) {
    returnObject  ={
      id_session: newId,
      data: mt
    }
  } else {
    returnObject = {
      id_session: req.body["id_session"],
      data: mt
    }
  }

  return res.status(200).send(returnObject)

})

router.delete("/:postId", async (req, res) => {
  req.body["id_login"] = req.body["secure_id"]
  req.body["id_post"] = req.params["postId"]


  //dc.postCon(req.body)

  let r
  try {
    [r] = await deletePost(req.body)
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

router.put("/:postId", async (req, res) => {
  // First find out if post is post or play

  // Fetch defaults for the post
  req.body["id_post"] = req.params.postId
  let defaultPreset;
  try {
    [defaultPreset] = await fetchPost(req.body);
  } catch (err) {
    dc.postCon(err)
    return res.sendStatus(400)
  }

  if (defaultPreset.length === 0) {
    dc.postCon("Unknown Post!")
    return res.status(404).send("Unknown Post!")
  }

  defaultPreset = defaultPreset[0];

  if (defaultPreset.id_login !== req.body["secure_login"]) {
    return res.sendStatus(403)
  }

  if (defaultPreset["vgd"] !== null) {
    defaultPreset["vgd"] = defaultPreset["vgd"].split(",").map(x => parseInt(x))
  } else {
    defaultPreset["vgd"] = []
  }

  //prevent create a new post by adding title
  let is_reply = false
  if (defaultPreset["title"] === null) {
    delete defaultPreset["title"]
    is_reply = true
  }
  delete defaultPreset["publish_date"]
  delete defaultPreset["publisher"]

  if (!is_reply && req.body.vgd) {
    //dc.dgCon(req.body.vgd)
    //dc.dgCon(defaultPreset["vgd"])
    for (let id_vg of req.body.vgd) {
      if (!defaultPreset["vgd"].includes(id_vg)) {
        // post already exists only error is unknown vg
        try {
          await attachedVgToPost({id_post: req.body.id_post, id_vg})
        } catch (err) {
          dc.postCon(err)
          return res.status(404).send("Unknown VG!")
        }
      }
    }
    for (let id_vg of defaultPreset["vgd"]) {
      if (!req.body.vgd.includes(id_vg)) {
        // post already exists only error is unknown vg
        try {
          await unlinkVgToPost({id_post: req.body.id_post, id_vg})
        } catch (err) {
          dc.postCon(err)
          return res.res.status(404).send("Unknown VG!")
        }
      }
    }
  }

  for (let param in defaultPreset) {
    if (req.body[param]) {
      defaultPreset[param] = req.body[param]
    }
  }
  //dc.dgCon(defaultPreset)
  try {
    await updatePost(defaultPreset)
  } catch (err) {
    dc.postCon(err)
    return res.sendStatus(400)
  }


  res.sendStatus(200)
})

router.use((req, res, next) => {
  dc.unlog(dc.postCon, req, res, next, '(secure)', orSend, orJson);
  next()
})

export default router;