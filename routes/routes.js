const { User, Message } = require("../models/models.js");
const jwt = require("jsonwebtoken");
const { Router } = require("express");
// const { post } = require("../../../twitter/clone/submit2/routes/routes.js");
const router = Router();

let dataMsg = {
  msg: "",
};

router.get("/", async function (req, res) {
  try {
    let { token } = req.cookies;
    console.log("\nreq.body:--->", req.body, "\n");
    let payload = jwt.verify(token, "theSecret");

    console.log("\nverify token--->", payload, "\n");

    // if (token) {
    //   return res.send("cookies found");
    // }

    let messages = await Message.findAll({
      include: User,
      order: [["id", "DESC"]],
    });

    let data = { messages };

    console.log(data);

    if (payload) {
      res.render("index", data);
    } else {
      res.render("login", dataMsg);
    }
  } catch (e) {
    console.log("\nGet home catch--->", e, "\n");
    res.render("login", dataMsg);
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

  dataMsg.msg = "Account Created, please login!";

  res.render("login", dataMsg);
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

    console.log("\nUser db---.", user, "\n");
    console.log("\nUser id db--->", user.id, "\n");

    if (user && user.password === password) {
      let data = {
        username: username,
        role: user.role,
        userid: user.id,
      };

      let token = jwt.sign(data, "theSecret");
      res.cookie(token, { maxAge: 5 * 60 * 1000 });
      console.log("\nUser", user, "\n");
      console.log("\nSign token", token, "\n");
      res.redirect("/");
    } else {
      dataMsg.msg = "Invalid Username or password";
      res.render("login", dataMsg);
    }
  } catch (e) {
    console.log(e);
  }
});

router.get("/message", async function (req, res) {
  let token = req.cookies.token;
  console.log("\nreq.body.token", token, "\n");
  let verifyToken = jwt.verify(token, "theSecret");
  console.log("\nverifytoken", verifyToken, "\n");
  if (verifyToken) {
    // very bad, no verify, don't do this
    res.render("message");
  } else {
    dataMsg.msg = "Invalid token used";
    res.render("login", dataMsg);
  }
});

router.post("/message", async function (req, res) {
  let { token } = req.cookies;
  let { content } = req.body;
  console.log("\nreq.body:--->", req.body, "\n");

  try {
    let payload = jwt.verify(token, "theSecret");
    if (payload) {
      let user = await User.findOne({
        where: { username: payload.username },
      });

      let msg = await Message.create({
        content,
        time: new Date(),
        UserId: user.id,
      });

      if (msg) {
        res.redirect("/");
      } else {
        res.sendStatus(500);
      }
    } else {
      res.redirect("/login");
    }
  } catch (e) {
    res.statusCode = 500;
    console.error(e);
    res.redirect("/login");
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

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  // const authHeader = req.headers.Authorization;

  console.log("\nauthHeader", authHeader, "\n");

  const token = authHeader && authHeader.split(" ")[1];
  console.log("\ntoken Middleware", token, "\n");

  if (token == null) {
    console.info("\nNull token\n");
    dataMsg.msg = "Your token has expired. Please login again";
    // res.statusCode = 401;
    // res.render("login", dataMsg);
  }

  jwt.verify(token, "theSecret", (err, data) => {
    if (err) {
      console.info("\n token Error\n");
      // res.statusCode = 403;
      dataMsg.msg = "Your token has expired. Please login again";
      res.render("login", dataMsg);
    }
    console.log("\nreq.data---->", data, "\n");
    req.data = data;
    next();
  });
}

module.exports = router;
