const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const TweetSchema=Schema({
    title:String,
    comment:String,
    date:Date,
    complete:{
        type:Boolean,
        default:false
    },
  
});

TweetSchema.plugin(mongoosePaginate);

module.exports=mongoose.model("Tweet",TweetSchema);