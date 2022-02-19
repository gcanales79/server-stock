const Track = require("../models/track");
const { check, validationResult } = require("express-validator");
const EasyPost = require("@easypost/api");
const api = new EasyPost(process.env.EASY_POST_API_KEY);
var moment = require("moment-timezone");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

function addTrack(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errores = errors.array();
    return res.send({
      code: "404",
      message: errores[0].msg,
    });
  }
  const { description, tracking, carrier, phone } = req.body;
  //console.log(schedule_date);
  const tracker = new api.Tracker({
    tracking_code: tracking,
    carrier: carrier,
  });
  tracker.save().then((Tracker) => {
    let body = {
      description: description,
      tracking: tracking,
      carrier: carrier,
      phone: phone,
      status: Tracker.status,
      eta: Tracker.est_delivery_date,
      easypost_id: Tracker.id,
    };
    const tracker = new Track(body);
    tracker.save((err, trackStored) => {
      if (err) {
        res.send({ code: "500", message: "Error del servidor" });
      } else {
        if (!trackStored) {
          res.send({
            code: "400",
            message: "No se ha podido crear el tracking",
          });
        } else {
          res.send({ code: "200", message: "Tracking creado correctamente" });
        }
      }
    });
  });
}

function getTracks(req, res) {
  const { page = 1, limit = 12 } = req.query;
  //console.log("page", page)
  //console.log("limit", limit)
  const options = {
    page: page,
    limit: parseInt(limit),
    sort: { eta: "desc" },
  };

  Track.paginate({}, options, (err, tracksStored) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!tracksStored) {
        res.send({
          code: "400",
          message: "No se han encontrado ningun tracking",
        });
      } else {
        res.send({ code: "200", tracks: tracksStored });
      }
    }
  });
}

function updateTrack(req, res) {
  const trackData = req.body;
  const { id } = req.params;

  Track.findByIdAndUpdate(id, trackData, (err, trackUpdate) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!trackUpdate) {
        res.send({
          code: "404",
          message: "No se ha encontrado ningun tracking.",
        });
      } else {
        res.send({
          code: "200",
          message: "Tracking actualizado correctamente",
        });
      }
    }
  });
}

function deleteTrack(req, res) {
  const { id } = req.params;
  Track.findByIdAndRemove(id, (err, trackDeleted) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!trackDeleted) {
        res.send({ code: "404", message: "Tracking no encontrado" });
      } else {
        res.send({ code: "200", message: "Tracking eliminado correctamente" });
      }
    }
  });
}

function getTrack(req, res) {
  const { id } = req.params;
  Track.findOne({ _id: id }, (err, trackStored) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!trackStored) {
        res.send({
          code: "400",
          message: "No se han encontrado ningun tracking",
        });
      } else {
        res.send({ code: "200", tracking: trackStored });
      }
    }
  });
}

function easyPost(req, res) {
  const { result } = req.body;
  if (result) {
    res.status(200).json({
      message: "Tracking data received succesfully",
    });
    Track.findOne({ easypost_id: result.id }, (err, trackStored) => {
      if (err) {
        res.send({ code: "500", message: "Error del servidor" });
      } else {
        if (!trackStored) {
          res.send({
            code: "400",
            message: "No se ha encontrado ningun tracking",
          });
        } else {
          const { status } = trackStored;
          console.log(
            `El status anterior era ${status} el nuevo es ${result.status}`
          );
          if (status != "delivered") {
            updateTracking(result);
          }
        }
      }
    });
  }
}

//Function to updateTracking
async function updateTracking(result) {
  const trackData = {
    status: result.status,
    eta: result.est_delivery_date,
  };
  await Track.findOneAndUpdate(
    { easypost_id: result.id },
    trackData,
    (err, trackUpdate) => {
      if (err) {
        return{ 
            code: "500", 
            message: "Error del servidor" };
      } else {
        if (!trackUpdate) {
          return{
            code: "404",
            message: "No se ha encontrado ningun tracking.",
          };
        } else {
          notificationTracking(result);
          return{
            code: "200",
            message: "Tracking actualizado correctamente",
          };
        }
      }
    }
  ).clone();
}

//Function to send the whatsapp message
async function notificationTracking(result) {
  await Track.findOne({ easypost_id: result.id }, (err, trackStored) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!trackStored) {
        return{
          code: "400",
          message: "No se ha encontrado ningun tracking",
        };
      } else {
        const { phone, description, status, eta } = trackStored;
        const { tracking_details, public_url } = result;
        let trackDetail = tracking_details[tracking_details.length - 1];
        let trackMessage = trackDetail.message;
        let eta_date = moment(eta).format("DD-MM-YYYY");
        client.messages
          .create({
            from: `whatsapp:${process.env.TWILIO_PHONE}`,
            body: `The status of your tracking ${description} is: ${status}, the detail is ${trackMessage}. The estimate delivery date is: ${eta_date}. More info: ${public_url}.`,
            to: `whatsapp:${phone}`,
          })
          .then((message) => {
            console.log(message.sid);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }).clone();
}

module.exports = {
  addTrack,
  getTracks,
  updateTrack,
  deleteTrack,
  getTrack,
  easyPost,
};
