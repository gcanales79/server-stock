const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const TrackSchema=Schema({
    carrier:String,
    tracking:String,
    easypost_id:String,
    description:String,
    status:String,
    eta:Date,
    phone:String
  
});

TrackSchema.plugin(mongoosePaginate);

module.exports=mongoose.model("Track",TrackSchema);