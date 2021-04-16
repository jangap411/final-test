const { User, Message } = require("../models/models.js");
const jwt = require("jsonwebtoken");
const { Router } = require("express");
const { post } = require("../../../twitter/clone/submit2/routes/routes.js");
const router = Router();

router.get("/", async function (req, res) {
  try {
    let messages = await Message.findAll({
      include: User,
      order: [["id", "DESC"]],
    });
    let data = { messages };

    console.log(data);

    res.render("index", data);
  } catch (e) {
    console.log(e);
  }
});

router.get("/createUser", async function (req, res) {
  res.render("createUser");
});

router.post("/createUser", async function (req, res) {
  let { username, password } = req.body;

  try {
    await User.create({
      username: username,
      password: password,
      role: "user",
    });
  } catch (e) {
    console.log(e);
  }

  res.redirect("/login");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/login", async function (req, res) {
  let { username, password } = req.body;

  try {
    let user = await User.findOne({
      where: { username },
    });

    console.log("\nUser db---.", user, "\n");
    console.log("\nUser id db--->", user.id, "\n");

    if (user && user.password === password) {
      let data = {
        username: username,
        role: user.role,
        userid: user.id,
      };

      let token = jwt.sign(data, "theSecret");
      res.cookie("token", token);
      console.log("\nUser", user, "\n");
      console.log("\nSign token", token, "\n");
      res.redirect("/");
    } else {
      res.redirect("/error");
    }
  } catch (e) {
    console.log(e);
  }
});

router.get("/message", async function (req, res) {
  let token = req.cookies.token;

  if (token) {
    // very bad, no verify, don't do this
    res.render("message");
  } else {
    res.render("login");
  }
});

router.post("/message", async function (req, res) {
  let { token } = req.cookies;
  let { content } = req.body;
  console.log("\nreq.body:--->", req.body, "\n");

  try {
    if (token) {
      let payload = await jwt.verify(token, "theSecret");

      let user = await User.findOne({
        where: { username: payload.username },
      });

      let msg = await Message.create({
        content,
        time: new Date(),
        UserId: user.id,
      });

      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  } catch (e) {
    res.statusCode = 500;
    console.error(e);
  }
});

router.get("/error", function (req, res) {
  res.render("error");
});

// router.all("*", function (req, res) {
//   res.send("404 dude");
// });

//test | see db content
router.get("/msg", async (req, res) => {
  try {
    let messages = await Message.findAll({
      include: User,
      order: [["id", "DESC"]],
    });
    let data = { messages };

    console.log("\nMessages: ", data, "\n");
    console.log("\nMessages: ", JSON.stringify(data), "\n");
    res.send(data);
  } catch (e) {
    console.error(e);
  }
});

router.get("/users", async (req, res) => {
  try {
    let users = await User.findAll({});
    let data = { users };

    console.log("\nUsers: ", data, "\n");
    res.send(data);
  } catch (e) {
    console.error(e);
  }
});

router.post("/like", async (req, res) => {
  console.log("like");
});

module.exports = router;
