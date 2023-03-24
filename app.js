const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

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

const userSchema = {
    email : {
        type: String,
        required: [true, 'Can not allow null user email']
    },
    password: {
        type: String,
        required: [true, 'Can not allow null password']
    }
};

const User = mongoose.Model("User",userSchema);

//Render the Home page while someone hits the base URI
app.get("/", async (req, res)=>{
    try {
        res.render("home");    
    } catch (error) {
        res.send(error);
    }    
});

//Render the Login page while someone hits the Login URI
app.get("/login", async (req, res)=>{
    res.render("login");
});

//Render the Register page while someone hits the Register URI
app.get("/register", async (req, res)=>{
    res.render("register");
});

//Accept the login credentials and register them post page upon submissions

app.post("/register", async (req,res)=>{
    const newUser = new User({
        email: req.body.email,
        password: req.body.password
    });

    try {        
        let result = await newUser.save();
        res.render("login");    
    } catch (error) {
        console.log(error);
    }   
});

app.post("/login", async (req,res)=>{
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    try {
        const foundUser = await User.findOne({email: userEmail});
        if(foundUser){
            if (foundUser.password === userPassword){
                res.render("secrets");
            }
        }
    } catch (error) {
        console.log(error);
    }
});




app.listen(port, function(){
    console.log("Hasmukh's Secrets Authentication App listening on "+port);
});
