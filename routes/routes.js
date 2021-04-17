const { User, Message } = require("../models/models.js");
const jwt = require("jsonwebtoken");
const { Router } = require("express");
// const { post } = require("../../../twitter/clone/submit2/routes/routes.js");
const router = Router();

let dataMsg = {
  msg: "",
};

router.get("/", async function (req, res) {
  let message = await Message.findAll({
    include: User,
    order: [["id", "DESC"]],
  });

  let data = { message };

  console.log("\nMessage data---->", data, "\n");

  res.render("index", data);
});

router.get("/createUser", function (req, res) {
  res.render("createUser");
});

router.post("/createUser", async function (req, res) {
  let { username, password } = req.body;

  try {
    let user = await User.create({
      username: username,
      password: password,
      role: "user",
    });

    if (user) {
      dataMsg.msg = "Account Created Please login";
      res.redirect("/login", dataMsg);
    } else {
      dataMsg.msg = "Error creating account";
      redirect("/login", dataMsg);
    }
  } catch (e) {
    console.log("\ncatch creating user", e, "\n");
  }
});

router.get("/login", function (req, res) {
  res.render("login", dataMsg);
});

router.post("/login", async function (req, res) {
  let { username, password } = req.body;

  try {
    let user = await User.findOne({
      where: { username },
    });

    if (user && user.password == password) {
      let data = {
        username: username,
        role: user.role,
        userid: user.id,
      };

      let token = jwt.sign(data, "theSecret");
      res.cookie("token", token);
      res.redirect("/");
    } else {
      redirect("/error");
    }
  } catch (e) {
    console.log("\ncatch login user", e, "\n");
  }
});

router.get("/message", async function (req, res) {
  let token = req.cookies.token;

  let verifyToken = jwt.verify(token, "theSecret");

  if (verifyToken) {
    res.render("message");
  } else {
    res.render("login", dataMsg);
  }
});

router.post("/message", async function (req, res) {
  let { token } = req.cookies;
  console.log("\nreq.body----->", req.body, "\nreq.cookies", req.cookies, "\n");
  let { content } = req.body;
  let timeCreated = new Date();

  try {
    if (token) {
      let payload = jwt.verify(token, "theSecret");

      let user = await User.findOne({
        where: { username: payload.username },
      });

      if (user) {
        let msg = await Message.create({
          content: content,
          time: timeCreated.toLocaleTimeString(),
          UserId: user.id,
        });

        if (msg) {
          res.redirect("/");
        } else {
          res.redirect("/error");
        }
      }
    }
  } catch (e) {
    console.error("\nCatch create message --->", e, "\n");
    redirect("/error");
  }
});

router.get("/error", function (req, res) {
  res.render("error");
});

// router.all("*", function (req, res) {
//   res.send("404 dude");
// });

router.post("/like", async (req, res) => {
  console.log("like");
});

router.get("/logout", (req, res) => {
  const { token } = req.cookies;
  // const authHeader = req.headers.Authorization;

  console.log("\ntoken", token, "\n");

  // const token = authHeader && authHeader.split(" ")[1];
  console.log("\ntoken Middleware", token, "\n");

  console.log("\ntoken request--", token);
  // cookie.set(token, { expires: Date.now() });
  // res.cookie(token, { expires: new Date(Date.now()) });
  // res.clearCookie("name", { path: "/" });
  // req.session.cookie.expires = true;
  res.cookie(token, { expires: new Date(Date.now() + 100) });

  res.redirect("/login");
});

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

module.exports = router;
