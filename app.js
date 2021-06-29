require('dotenv').config()
const express = require("express")
const ejs = require("ejs")
const app = express()
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")


app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({
    extended: true
}))

app.use(session({
    secret: "Magick is real",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true
    }
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", (req, res) => {
    res.render("home")
})

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets")
    } else {
        res.redirect("/login")
    }
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
res.render("register")
})


app.post("/register", (req, res) => {
    console.log(req.body)
    User.register({
        username: req.body.username
    }, req.body.password, (err, user) => {
        if(err) {
            console.log(err)
            res.redirect("/register")
        } else {
            passport.authenticate("local", { failureRedirect: '/login' })(req, res, () => {
                res.redirect("/secrets")
            })
        }
    })
})

app.post("/login", (req, res) => {

})








app.listen(3000, () => {
    console.log("server running on 3k")
})