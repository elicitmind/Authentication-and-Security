const express = require("express")
const ejs = require("ejs")
const app = express()
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")

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
//I CAN USE dotEnv and pass this string into an .env file and use it as process.env.myEncryptingString
const secret = "thisismystringtoencryptpasswords"
//IMPORTANT TO CREATE IT BEFORE USER NEW MODEL, AS WE PASSING userSchema TO IT, WE WANT IT WITH PLUGIN!
userSchema.plugin(encrypt, {
    secret: secret,
    encryptedFields: ["password"]
});

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

    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    newUser.save((err) => {
        if (err) {
            console.log(err)
        } else {
            res.render("secrets")
        }
    })
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
                if (results.password === passwordLogin) {
                    res.render("secrets")
                }
            }
        }
    })
})








app.listen(3000, () => {
    console.log("server running on 3k")
})