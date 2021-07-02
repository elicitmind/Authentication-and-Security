require("dotenv").config()
const express = require("express")
const ejs = require("ejs")
const app = express()
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate")
const FacebookStrategy = require("passport-facebook")


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
        secure: false
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
    password: String,
    googleId: String,
    knowledge: String
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets"
        // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile)
        User.findOrCreate({
            googleId: profile.id
        }, function (err, user) {
            return cb(err, user);
        });
    }
));

passport.use(new FacebookStrategy({
        clientID: process.env.FB_APP_ID,
        clientSecret: process.env.FB_APP_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({
            facebookId: profile.id
        }, function (err, user) {
            return cb(err, user);
        });
    }
));



app.get("/", (req, res) => {
    res.render("home")
})

app.get("/auth/google",
    passport.authenticate("google", {
        scope: ["profile"]
    }));

app.get("/auth/google/secrets",
    passport.authenticate("google", {
        failureRedirect: "/login"
    }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/secrets");
    });

app.get("/auth/facebook",
    passport.authenticate("facebook"));

app.get("/auth/facebook/callback",
    passport.authenticate("facebook", {
        failureRedirect: "/login"
    }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/secrets");
    });


app.get("/secrets", (req, res) => {
  User.find({"knowledge":{$ne: null}}, (err, results)=>{
      if(err) {
          consol.log(err)
      } else {
          if (results) {
              res.render("secrets", {usersWithKnowledge: results} )
          }
      }
  })
})

app.get("/submit", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("submit")
    } else {
        res.redirect("/login")
    }
})

app.post("/submit", (req, res) => {
    const submittedKnowledge = req.body.knowledge

    User.findById(req.user.id, (err, results) => {
        if (err) {
            console.log(err)
        } else {
            if (results) {
                results.knowledge = submittedKnowledge
                results.save(() => {
                    res.redirect("/secrets")
                })
            }
        }
    })
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/logout", (req, res) => {
    req.logout()
    res.redirect("/")
})


app.post("/register", (req, res) => {
    console.log(req.body)
    User.register({
        username: req.body.username
    }, req.body.password, (err, account) => {
        if (err) {
            console.log(err)
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            })
        }
    })
})

app.post("/login", (req, res) => {
    //new user
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    //method from passport
    req.login(user, (err) => {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets")
            })
        }
    })
})








app.listen(3000, () => {
    console.log("server running on 3k")
})