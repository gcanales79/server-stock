const express= require("express");
const TrackController=require("../controllers/track");
const { check, validationResult } = require("express-validator");

const md_auth=require("../middleware/authenticated")

const api=express.Router();

api.post("/add-track",check("phone")
.isMobilePhone("", { strictMode: true })
.withMessage("No es un telefono valido"),[md_auth.ensureAuth],TrackController.addTrack);

api.get("/get-all-tracking",TrackController.getTracks)

api.put("/update-track/:id",[md_auth.ensureAuth],TrackController.updateTrack);

api.delete("/delete-track/:id",[md_auth.ensureAuth],TrackController.deleteTrack)

api.get("/get-track/:id",TrackController.getTrack)

api.post("/easypost-webhook",TrackController.easyPost)


module.exports=api;