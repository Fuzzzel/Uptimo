const db = require("quick.db")
const express = require("express")
const app = express()
require("./ping.js")

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

/* REDIRECT HTTP to HTTPS */
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] === 'http')
    return res.redirect(301, `https://${req.headers.host}/${req.url}`)

  next();
});

/* RENDER INDEX */
app.get("/", async(req, res) => {
  var i = db.get("urls")
  res.render("index", {
    has: i.length
  })
})

app.get("/admin", async(req, res) => {
  var i = db.get("urls")
  res.render("admin", {
    has: i.length
  })
})

/* CREATE */
app.post("/create", async(req, res) => {
  var url = req.body.ur
  var u = db.get("urls")

  if (u.indexOf(url) > -1) {
    return res.json({
      status: 400,
      error:"URL_IN_DB"
    })
  }

  db.push("urls",url)
  res.json({
    status: 200,
    message: "URL is added! (" + url + ")"
  })
})

app.post("/remove", async(req, res) => {
  var u = db.get("urls")
  var url = req.body.ur
  var key = req.body.key

  if(!url) return res.json({
    status: 400,
    error: "Please define url"
  })
  if(!key) return res.json({
    status: 400,
    error: "Please define key"
  })

  if(key !== process.env.key) return res.json({error:"Invalid KEY"})

  if (u.indexOf(url) > -1) {
    var array = db.get("urls");
    array = array.filter(v => v !== url);
    db.set("urls", array)

    res.json({
      status: 200,
      message: "URL is deleted! (" + url + ")"
    })
  return;
  }

  return res.json({
    status: 400,
    error:"URL_NOT_IN_DB"
  })
})

app.listen(process.env.port || 5000, () => {
  console.log("Website started")
})
