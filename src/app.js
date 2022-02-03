const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const app = express();
const path = require("path");
const hbs = require("hbs");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs")
const server = http.createServer(app);
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const port = process.env.PORT || 3000;

dotenv.config();
app.use(bodyParser.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))


mongoose.connect(process.env.MONGO_URL);
try {
  console.log("connect sucessfully............");
} catch (error) {
  console.log(error);
}



// require schema 
const Register = require("./models/register")
const auth = require("./middleware/auth")

app.use(express.static(path.join(__dirname, "../public")));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../templates/views"));
hbs.registerPartials(path.join(__dirname, "../templates/partials"));

app.get("/", (req, res) => res.render("index"));

app.get("/secret", auth, (req, res) => {

  res.render("secretpage")
});
app.get("/logout", auth,async (req, res) => {
  res.clearCookie("jwt")
  await res.user
  res.render("login")
  
});

app.get("/register", (req, res) => res.render("register"));

app.post("/register", async (req, res) => {
  try {

    const passwd = req.body.password;
    const cpsswd = req.body.confirmpassword
    if (passwd === cpsswd) {

      const newUser = new Register({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword,
      })
      const token = await newUser.generateAuthToken()
      res.cookie("jwt", token, {
        expires: new Date(Date.now + 30000),
        httpOnly: true
      })

      const user = await newUser.save()
      console.log(user);
      res.status(201).render("index")
    } else {
      res.send("invalid password")
    }

  } catch (error) {
    res.send(error)
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userEmail = await Register.findOne({ email })
    const token = await userEmail.generateAuthToken()
    const isMatch = bcrypt.compare(password, userEmail.password)
    res.cookie("jwt", token, {
      expires: new Date(Date.now + 60000),
      httpOnly: true,
      secure: true

    })

    if (isMatch) {
      res.status(201).render("index")
    } else {
      res.send("invalid details")
    }
  } catch (error) {
    res.send("invalid details")
  }
});


app.listen(port, () =>
  console.log(`Example app listening on port http://localhost:${port}`)
);
