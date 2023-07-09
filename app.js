var express=require('express');
var bodyParser = require('body-parser');

var app=express();
var {API_VERSION}=require("./config");

//Load routings
const authRoutes=require("./routers/auth");
const userRoutes=require("./routers/user");
const menuRoutes=require("./routers/menu");
const NewsLetterRoutes=require("./routers/newsletter");
const CourseRoutes=require("./routers/course");
const PostRoutes=require("./routers/post");
const TweetRoutes=require("./routers/tweet");
const TrackRoutes=require("./routers/track");
const CallRoutes=require("./routers/call");
const BirthdayRoutes=require("./routers/birthday");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Configure Header HTTP 
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token, Authorization, Access-Control-Allow-Request-Method");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
    next();
  });

//Router Basic
app.use(`/api/${API_VERSION}`,authRoutes)
app.use(`/api/${API_VERSION}`,userRoutes)
app.use(`/api/${API_VERSION}`,menuRoutes)
app.use(`/api/${API_VERSION}`,NewsLetterRoutes)
app.use(`/api/${API_VERSION}`,CourseRoutes)
app.use(`/api/${API_VERSION}`,PostRoutes)
app.use(`/api/${API_VERSION}`,TweetRoutes)
app.use(`/api/${API_VERSION}`,TrackRoutes)
app.use(`/api/${API_VERSION}`,CallRoutes)
app.use(`/api/${API_VERSION}`,BirthdayRoutes)


module.exports=app;
