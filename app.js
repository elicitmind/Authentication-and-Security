require('dotenv').config()
const express = require("express")
const ejs = require("ejs")
const app = express()
const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const saltRounds = 10;


app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({
    extended: true
}))

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

const User = new mongoose.model("User", userSchema)



app.get("/", (req, res) => {
    res.render("home")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("register")
})


app.post("/register", (req, res) => {
    console.log(req.body)
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        })
        newUser.save((err) => {
            if (err) {
                console.log(err)
            } else {
                res.render("secrets")
            }
        })
    });

})

app.post("/login", (req, res) => {
    
    const usernameLogin = req.body.username
    const passwordLogin = req.body.password
    console.log(req.body)

    User.findOne({
        email: usernameLogin
    }, (err, results) => {
        if (err) {
            console.log(err)
        } else {
            if (results) {
                bcrypt.compare(passwordLogin, results.password, function(err, found) {
                    if(found){
                    res.render("secrets")
                }
                }) 
            }
        }
    })
})








app.listen(3000, () => {
    console.log("server running on 3k")
})