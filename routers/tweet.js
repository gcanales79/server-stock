const express= require("express");
const TweetController=require("../controllers/tweet");

const md_auth=require("../middleware/authenticated")

const api=express.Router();

api.post("/add-tweet",[md_auth.ensureAuth],TweetController.addTweet);

api.get("/get-tweets",TweetController.getTweets);

api.put("/update-tweet/:id",TweetController.updateTweet);

api.delete("/delete-tweet/:id",[md_auth.ensureAuth],TweetController.deleteTweet)

api.get("/get-tweet/:id",TweetController.getTweet)

api.get("/to-send-tweets/:startinghour",TweetController.sendTweet)



module.exports=api;