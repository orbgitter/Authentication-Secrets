//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

const secret = process.env.SECRET;

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser:true});

//mongoose-encryption package must have this right hand addition config to the Schema
//turning it not to just a js object but now an object that's created from Mongoose schema class
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
//^alternatively^ can make this elegant by defining: var Schema = mongoose.Schema;
//then assign it thus: var blogSchema (userSchema in our case) = new Schema({email: String,...})

  

//this plugin line must be before the following mongoose.model assignment (to the const User)
userSchema.plugin(encrypt, {secret:secret, encryptedFields: ["password"] });


const User = new mongoose.model("User", userSchema); 

app.listen(3000,function() {
    console.log("Server started on port 3000");
});


app.get("/", (req,res)=>{
    res.render("home");
})

app.get("/login", (req,res)=>{
    res.render("login");
})

app.get("/register", (req,res)=>{
    res.render("register");
})

app.post("/register", (req,res)=>{
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });    

    newUser.save((err,password)=>{
        if(err){
            console.log(err);
        } else {
            res.render("secrets");
        }
    })
})

app.post("/login", (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username}, (err, foundUser)=>{
        if(err){
            console.log(err);
            // res.send(err);
        } else {
            if(foundUser) {
                if (foundUser.password === password){
                    res.render("secrets");
                }
            }
        }
    });
});
