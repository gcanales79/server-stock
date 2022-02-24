const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const CallSchema=Schema({
    CallSid:String,
    Caller:String,
    CallerCountry:String,
    RecordingUrl:String,
    RecordingStatus:String,
    RecordingStartTime:Date,
    TranscriptionText:String,
  
});

CallSchema.plugin(mongoosePaginate);

module.exports=mongoose.model("Call",CallSchema);