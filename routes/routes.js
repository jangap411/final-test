const { User, Message } = require("../models/models.js");
const jwt = require("jsonwebtoken");
const { Router } = require("express");
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
      res.redirect("/login");
    } else {
      dataMsg.msg = "Error creating account";
      res.redirect("/login");
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
      dataMsg.msg = "";
      res.redirect("/");
    } else {
      dataMsg.msg =
        "Invalid Username or password.\nTry signup to access this site";
      res.redirect("/login");
    }
  } catch (e) {
    console.log("\ncatch login user", e, "\n");
  }
});

router.get("/message", async function (req, res) {
  let token = req.cookies.token;

  let verifyToken = jwt.verify(token, "theSecret");

  if (token) {
    res.render("message");
  } else {
    dataMsg.msg = "Please login. your session has expired";
    res.render("login", dataMsg);
  }
});

router.post("/message", async function (req, res) {
  let { token } = req.cookies;
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
  let { id } = req.body;
  console.log("like");

  let message = await Message.findOne({ where: { id: id } });

  if (message) {
    let like = await Message.update(
      {
        likes: parseInt(message.likes) + 1,
      },
      {
        where: { id: message.id },
        returning: true,
        plain: true,
      }
    );
    if (like) {
      res.redirect("/");
    } else {
      res.send("error");
    }
  }
});

router.get("/logout", (req, res) => {
  const { token } = req.cookies;
  res.cookie(token, { expires: new Date(Date.now() + 100) });
  dataMsg.msg = "";
  res.render("login", dataMsg);
});

module.exports = router;
