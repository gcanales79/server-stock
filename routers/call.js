const express= require("express");
const CallController=require("../controllers/call");

const md_auth=require("../middleware/authenticated");

const api=express.Router();

api.post("/record",CallController.receiveCall)

api.post("/handle_transcribe",CallController.transcribeCall)

api.post("/handle_recording",CallController.recordCall)

api.get("/get-calls",[md_auth.ensureAuth],CallController.getCalls)

api.delete("/delete-call/:id",[md_auth.ensureAuth],CallController.deleteCall)

module.exports=api;