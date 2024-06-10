require("dotenv").config();
const Bday = require("../models/birthday");
var moment = require("moment-timezone");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
var XLSX = require("xlsx");
const { exec } = require('child_process');
const path = require('path');



function addBday(req, res) {
 
  const body = req.body;
  const bday= new Bday(body);
  bday.save((err, bdayStored) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!bdayStored) {
        res.send({ code: "400", message: "No se ha podido añadir el cumpleaños" });
      } else {
        res.send({ code: "200", message: "Bday creado correctamente" });
      }
    }
  });
}

function getBdays(req, res) {
    const { page = 1, limit = 12 } = req.query;
    //console.log("page", page)
    //console.log("limit", limit)
    const options = {
      page: page,
      limit: parseInt(limit),
      sort: { birthday: "desc" },
    };
  
    Bday.paginate({}, options, (err, bdayStored) => {
      if (err) { 
        res.send({ code: "500", message: "Error del servidor" });
      } else {
        if (!bdayStored) {
          res.send({
            code: "400",
            message: "No se han encontrado ningun cumpleaños",
          });
        } else {
          res.send({ code: "200", bdays: bdayStored });
        }
      }
    });
  }

  function updateBday(req, res) {
    const bdayData = req.body;
    const { id } = req.params;
  
    Bday.findByIdAndUpdate(id, bdayData, (err, bdayUpdate) => {
      if (err) {
        res.send({ code: "500", message: "Error del servidor" });
      } else {
        if (!bdayUpdate) {
          res.send({ code: "404", message: "No se ha encontrado ningun registro." });
        } else {
          res.send({ code: "200", message: "Registro actualizado correctamente" });
        }
      }
    });
  }
  
  function deleteBday(req, res) {
    const { id } = req.params;
    Bday.findByIdAndRemove(id, (err, bdayDeleted) => {
      if (err) {
        res.send({ code: "500", message: "Error del servidor" });
      } else {
        if (!bdayDeleted) {
          res.send({ code: "404", message: "Cumpleaños no encontrado" });
        } else {
          res.send({ code: "200", message: "Cumpleaños eliminado correctamente" });
        }
      }
    });
  }
  
  function getBday(req, res) {
    const { id } = req.params;
    Bday.findOne({ _id: id }, (err, bdayStored) => {
      if (err) {
        res.send({ code: "500", message: "Error del servidor" });
      } else {
        if (!bdayStored) {
          res.send({ code: "400", message: "No se han encontrado ningun cumpleaños" });
        } else {
          res.send({ code: "200", bday: bdayStored });
        }
      }
    });
  }

 
// Funcion para leer el archivo de excel.
  async function uploadFile(req,res){
    //console.log(req.file)
        try {
          let path = req.file.path;
          var workbook = XLSX.readFile(path);
          var sheet_name_list = workbook.SheetNames;
          let jsonData = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheet_name_list[0]]
          );
          if (jsonData.length === 0) {
            res.send({code:"400", message:"El archivo xlsx no tiene datos."})
          }
          let savedData = await Bday.create(jsonData);

          //console.log(jsonData)
          res.send({code:"200", message: `Se han añadido ${savedData.length} registros.`})
         
        } catch (err) {
            console.log(err)
            res.send({code:"500", message:"Error del servidor"})
        }
    

  }

  //Encontrar los cumplen en cierto dia
  function todayBday(req,res){
    const{month,day}=req.params;
    //console.log(month)
    //console.log(day)
    Bday.find({$and:[{$expr:{"$eq":[{"$dayOfMonth":"$birthday"},parseInt(day)]}},{$expr:{"$eq":[{"$month":"$birthday"},parseInt(month)]}}]},(err,bdayStored)=>{
        if (err) {
            res.send({ code: "500", message: "Error del servidor",error:err });
          } else {
            if (!bdayStored) {
              res.send({ code: "400", message: "No se han encontrado ningun cumpleaños" });
            } else {
              res.send({ code: "200", bday: bdayStored });
            }
          }
    })

  }

  //Mandar el whatsapp
  function reminder(req,res){
    const data = req.body;
    console.log(data.length)
    for (let i=0;i<data.length;i++){
        client.messages.create({
          contentSid:"HX2e9318ca017594745efa8ebe3baf7d27",
            from:`whatsapp:${process.env.TWILIO_PHONE}`,
            messagingServiceSid: process.env.serviceSid,
            contentVariables:JSON.stringify({
              1: String(data[i].name),
              2: String(data[i].lastname),
              3: String(data[i].birthday)
            }),
            to:`whatsapp:${process.env.GUS_PHONE}`,
        }).then((message)=>{
            console.log(`Whatsapp: ${message.sid}`)
            res.json(message)
        }).catch((err)=>{
            res.json(err)
        })
    }
  }

    //No birthday
    function noBirthday(req,res){
      //const data = req.body;
      //console.log(data.length)
      //console.log("No Birthday")
          client.messages.create({
              contentSid:"HX67f8f6c8a78e7117220178b2f8f2a2f1",
              from:`whatsapp:${process.env.TWILIO_PHONE}`,
              messagingServiceSid: process.env.serviceSid,
              to:`whatsapp:${process.env.GUS_PHONE}`,
              body: "There is no birthday today."
          }).then((message)=>{
              console.log(`Whatsapp: ${message.sid}`)
              res.json(message)
          }).catch((err)=>{
              res.json(err)
          })
      
    }

  //Que te de los cumpleaños
  function BdayToday(req,res){
    // Path to the script you want to run
    const scriptPath = path.resolve(__dirname, '../birthdayreminder.js');

  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).send(`Error: ${error.message}`);
    }
    if (stderr) {
      console.error(`Script error: ${stderr}`);
      return res.status(500).send(`Script error: ${stderr}`);
    }
    console.log(`Script output: ${stdout}`);
    res.send(`Script executed successfully: ${stdout}`);
  });
  }

 

module.exports = {
    addBday,
    getBdays,
    updateBday,
    deleteBday,
    getBday,
    uploadFile,
    todayBday,
    reminder,
    BdayToday,
    noBirthday
  };
