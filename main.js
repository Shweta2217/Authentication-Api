require("dotenv").config();
const Router = require("express").Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

Router.use(bodyParser.json());
Router.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("SuccessFully Connected to DB");
  }
});

//Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: Number,
  role: String,
});

//Model
const User = mongoose.model("Users", userSchema);

Router.get("/", (req, res) => {
  res.send({ message: "Welcome Here" });
});

//______________________________Register____________________________

Router.post("/register", (req, res) => {
  let email = req.body.email;
  let saltRound = 10;
  let Password = req.body.password;
  User.find({ email: email }, (err, user) => {
    if (err) console.log(err);
    if (user.length !== 0)
      res.send({message: "Email allready Taken" });
    else {
      bcrypt.genSalt(saltRound, function (err, salt) {
        if (err) console.log(err);
        bcrypt.hash(Password, salt, function (err, hash) {
          if (err) console.log(err);
          if (hash) {
            const user = new User({
              name: req.body.name,
              email: req.body.email,
              password: hash,
              phone: req.body.phone,
              role: req.body.role || "user",
            });
            user.save((err, user) => {
              if (err)
                console.log(
                  "Error while Registering and Error === " + err,
                );
              if (user) res.send({ message: "Successfully registered" });
            });
          }
        });
      });
    }
  });
});
//________________________________Login __________________________________

Router.post("/login", (req, res) => {
  let email = req.body.email;
  let Password = req.body.password;
  User.findOne({ email: email }, (err, user) => {
    if (err) console.log(err);
    if (!user)
      res.send({ message: "InCorrect Email", auth: false, token: "No Token" });
    else {
      let Hash = user.password;
      bcrypt.compare(Password, Hash, (err, match) => {
        if (!match) res.send({ message: "Wrong Password" });
        if (match) {
          let token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: "12h",
          });
          res.send({
            message: "SuccessFully Login",
            auth: true,
            token: token,
          });
        }
      });
    }
  });
});
// _______________________________User Profile_______________________________________

Router.get("/userPofile", (req, res) => {
  let token = req.headers["access-token"];
  if (!token) res.send({ auth: false, token: "No Token" });
  else {
    jwt.verify(token, process.env.SECRET, (err, result) => {
      if (err) res.send({ message: err, auth: false });
      if (result) {
        User.findById(result.id, (err, user) => {
          if (err) console.log(err);
          res.send(user);
        });
      }
    });
  }
});

Router.get("*",(req,res)=>{
  res.send({message: "Route Does't Exists !"});
})



module.exports = Router;