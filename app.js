require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');



//Setting up MongoDB COnnections and it's values through process envirnment variables. 
const srvURL = process.env.N1_URL || "127.0.0.1:27017";
const dbUser = process.env.N1_KEY || "userAdmin";
const dbPasswd = process.env.N1_SECRET || "userAdmin123";
const dbName = process.env.N1_DB || "userDB";

mongoose.set("strictQuery", false);

const app = express();

const port = 2933;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: "This is our little secret!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const mongoDB = "mongodb://"+dbUser+":"+dbPasswd+"@"+srvURL+"/"+dbName;
//const mongoDB = 'mongodb+srv://'+dbUser+':'+dbPasswd+'@'+srvURL+'/'+dbName+'?retryWrites=true&w=majority';

main().catch(err => console.log(err));
async function main() {
    //await mongoose.connect('mongodb://127.0.0.1:27017/test');
    try {
      await mongoose.connect(mongoDB);  //if your database has auth enabled  
    } catch (error) {
      console.log(error);
    }    
};

const userSchema = new mongoose.Schema ({
    email : {
        type: String,
        //required: [true, 'Can not allow null user email']
    },
    password: {
        type: String,
        //required: [true, 'Can not allow null password']
    }
});

//const secret = process.env.SECRET;
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
//userSchema.plugin(encrypt,{ secret : secret , encryptedFields: ['password']});

const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
  });
  
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:2933/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOne({ googleId: profile.id }).then((foundUser) => {
        if (foundUser) {
          return foundUser;
        } else {
          const newUser = new User({
            googleId: profile.id
          });
          return newUser.save();
        }
      }).then((user) => {
        return cb(null, user);
      }).catch((err) => {
        return cb(err);
      });
  }
));

//Render the Home page while someone hits the base URI
app.get("/", async (req, res)=>{
    try {
        res.render("home");    
    } catch (error) {
        res.send(error);
    }    
});

//Helps authenticate against the Google sign page
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));


app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  });

//Render the Login page while someone hits the Login Route
app.get("/login", async (req, res)=>{
    res.render("login");
});

//Render the Register page while someone hits the Register Route
app.get("/register", async (req, res)=>{
    res.render("register");
});

//Render the Logout page while someone hits the Logout Route
app.get("/logout", async (req, res)=>{
    req.logout((err)=>{
        if (err) { return next(err); }
        res.redirect('/');
    });
});

//Render the Submit secrets page while someone hits the Submit Route
app.get("/submit", async (req, res)=>{
    res.render("submit");
});

//Render the Secrets page only if someone's Authenticated with Passport JS middleware

app.get("/secrets", async (req,res)=>{
    if (req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

//Accept the login credentials and register them post page upon submissions

app.post("/register", async (req,res)=>{
    const userEmail = req.body.username;
    const userPassword = req.body.password;
    console.log("User provided following inputs -->"+userEmail+" and "+userPassword);
    /* try {
        const registrationResult = User.register({username: userEmail}, userPassword);
        console.log(registrationResult + "2");
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
        });
    } catch (error) {
        console.log(error+"I'm in Error Catch Mode");
        res.redirect("/register");
    } */

    User.register({username: userEmail}, userPassword, (err, user)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            //console.log(user+ " 2 ");
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/secrets");
            });
        }
    });

});

/* app.post("/login", async (req,res)=>{
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err)=>{
        if(err){
            console.log(err+" This is Error Page");
            res.redirect("/login");
        }
        else{
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/secrets");
            });
        }
    });

}); */

app.post("/login", passport.authenticate("local"), (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password     
    });
    req.login(user, (err)=> {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/secrets");
        }
    });
});



app.listen(port, function(){
    console.log("Hasmukh's Secrets Authentication App listening on "+port);
});
