const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

const port = 2933;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

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






app.listen(port, function(){
    console.log("Hasmukh's Secrets Authentication App listening on "+port);
});
