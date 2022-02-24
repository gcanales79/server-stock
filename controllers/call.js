const Call = require("../models/call");
var moment = require("moment-timezone");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const VoiceResponse = require("twilio").twiml.VoiceResponse;

function receiveCall(req, res) {
  const twiml = new VoiceResponse();
  //   console.log(req.body);
  const { CallSid, Caller, CallerCountry, CallStatus } = req.body;
  console.log(`CallSid:${CallSid}`)
  if (CallStatus === "ringing") {
    let CallData = {
      CallSid: CallSid,
      Caller: Caller,
      CallerCountry: CallerCountry,
    };
    const callTwilio = new Call(CallData);
    callTwilio.save((err, callStored) => {
      if (err) {
        res.send({ code: "500", message: "Error del servidor" });
      } else {
        if (!callStored) {
          res.send({
            code: "400",
            message: "No se ha podido crear el registro",
          });
        } else {
          twiml.say(
            {
              voice: "alice",
            },
            "Hi. You have reached the virtual assistant of Gustavo Canales. Please leave your message after the beep."
          );

          console.log(`${process.env.URL_TWILIO}/handle_recording`);

          twiml.record({
            transcribe: true,
            maxLength: 30,
            playBeep: true,
            transcribeCallback: `${process.env.URL_TWILIO}/handle_transcribe`,
            recordingStatusCallback: `${process.env.URL_TWILIO}/handle_recording`,
          });

          twiml.hangup();

          res.type("text/xml");
          // console.log(twiml.toString())
          res.send(twiml.toString());
        }
      }
    });
  }
}

function recordCall(req, res) {
  //console.log(req)
  const { CallSid, RecordingUrl, RecordingStatus, RecordingStartTime } =
    req.body;
  console.log(
    `CallSid:${CallSid} Status:${RecordingStatus} RecordingUrl:${RecordingUrl}`
  );
  if (RecordingStatus === "completed") {
    let callData = {
      RecordingUrl: RecordingUrl,
      RecordingStartTime: RecordingStartTime,
      RecordingStatus: RecordingStatus,
    };
    Call.findOneAndUpdate({ CallSid: CallSid }, callData, (err, callUpdate) => {
      if (err) {
        return {
          code: "500",
          message: "Error del servidor",
        };
      } else {
        if (!callUpdate) {
          return {
            code: "404",
            message: "No se ha encontrado ningun registro",
          };
        } else {
          notificationRecord(CallSid);
          return {
            code: "200",
            message: "Registro actualizado correctamente",
          };
        }
      }
    });
  }
}

function transcribeCall(req, res) {
  //console.log(req)
  const { CallSid, TranscriptionText, TranscriptionStatus } = req.body;
  console.log(
    `TrascriptionStatus:${TranscriptionStatus} TranscriptionText:${TranscriptionText}`
  );
  if (TranscriptionStatus === "completed") {
    let callData = {
      TranscriptionText: TranscriptionText,
    };
    Call.findOneAndUpdate({ CallSid: CallSid }, callData, (err, callUpdate) => {
      if (err) {
        return {
          code: "500",
          message: "Error del servidor",
        };
      } else {
        if (!callUpdate) {
          return {
            code: "404",
            message: "No se ha encontrado ningun registro",
          };
        } else {
          notificationTranscription(CallSid)
          return {
            code: "200",
            message: "Registro actualizado correctamente",
          };
        }
      }
    });
  }
}

function notificationRecord(CallSid) {
  Call.findOne({ CallSid: CallSid }, (err, callStored) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!callStored) {
        return {
          code: "400",
          message: "No se ha encontrado ningun registo",
        };
      } else {
        const { Caller, RecordingStartTime, RecordingUrl } = callStored;
        let date = moment(RecordingStartTime).format("DD-MM-YYYY HH:mm");
        client.messages
          .create({
            from: `${process.env.TWILIO_PHONE}`,
            body: `You have a new call from ${Caller} on ${date}. Here is the message: ${RecordingUrl}`,
            to: `${process.env.GUS_PHONE}`,
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

function notificationTranscription(CallSid) {
    Call.findOne({ CallSid: CallSid }, (err, callStored) => {
      if (err) {
        res.send({ code: "500", message: "Error del servidor" });
      } else {
        if (!callStored) {
          return {
            code: "400",
            message: "No se ha encontrado ningun registo",
          };
        } else {
          const { Caller, RecordingStartTime, TranscriptionText } = callStored;
          let date = moment(RecordingStartTime).format("DD-MM-YYYY HH:mm");
          client.messages
            .create({
              from: `${process.env.TWILIO_PHONE}`,
              body: `You have a new call from ${Caller} on ${date}. Here is the message: ${TranscriptionText}`,
              to: `${process.env.GUS_PHONE}`,
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

function getCalls(req, res) {
  const { page = 1, limit = 5 } = req.query;
  //console.log("page", page)
  //console.log("limit", limit)
  const options = {
    page: page,
    limit: parseInt(limit),
    sort: { RecordingStartTime: "desc" },
  };

  Call.paginate({}, options, (err, callsStored) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!callsStored) {
        res.send({ code: "400", message: "No se han encontrado ningun post" });
      } else {
        res.send({ code: "200", calls: callsStored });
      }
    }
  });
}

function deleteCall(req, res) {
  const { id } = req.params;
  Call.findByIdAndRemove(id, (err, callDeleted) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!callDeleted) {
        res.send({ code: "404", message: "Registro no encontrado" });
      } else {
        res.send({ code: "200", message: "Registro eliminado correctamente" });
      }
    }
  });
}

module.exports = {
  receiveCall,
  transcribeCall,
  recordCall,
  getCalls,
  deleteCall,
};
