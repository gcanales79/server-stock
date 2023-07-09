const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const BirthSchema=Schema({
    lastname:String,
    name:String,
    birthday:Date,
    position:String,
  
});

BirthSchema.plugin(mongoosePaginate);

module.exports=mongoose.model("Birthday",BirthSchema);