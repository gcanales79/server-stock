const express = require("express");
const BdayController = require("../controllers/birthday");
const multer = require("multer");
var upload = multer({ dest: "./bdayFiles" });



const md_auth = require("../middleware/authenticated");

const api = express.Router();

api.post("/add-bday", [md_auth.ensureAuth],BdayController.addBday);

api.get("/get-all-bdays", [md_auth.ensureAuth], BdayController.getBdays);

api.put("/update-bday/:id", [md_auth.ensureAuth], BdayController.updateBday);

api.delete("/delete-bday/:id",[md_auth.ensureAuth],  BdayController.deleteBday);

api.get("/get-bday/:id",[md_auth.ensureAuth], BdayController.getBday);

api.post("/upload", upload.single("bdayFile"), [md_auth.ensureAuth], BdayController.uploadFile);

api.get("/get-today-bdays/:month/:day", [md_auth.ensureAuth],BdayController.todayBday)

api.post("/reminder",[md_auth.ensureAuth],BdayController.reminder)

module.exports = api;
