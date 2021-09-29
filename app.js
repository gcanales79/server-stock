var express=require('express');
var bodyParser = require('body-parser');

var app=express();
var {API_VERSION}=require("./config");

//Load routings
///...

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Configure Header HTTP 
//....

//Router Basic
//...

module.exports=app;
