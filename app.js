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

app.get("/", async (req, res)=>{
    try {
        res.render("home");    
    } catch (error) {
        res.send(error);
    }
    
});

app.get("/login", async (req, res)=>{
    res.render("login");
});

app.get("/register", async (req, res)=>{
    res.render("register");
});






app.listen(port, function(){
    console.log("Hasmukh's Secrets Authentication App listening on "+port);
});
