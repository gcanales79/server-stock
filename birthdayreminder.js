require("dotenv").config();
const moment = require("moment-timezone");
const axios = require("axios");

let daylight = moment().tz("Europe/Warsaw").isDST();

//let now=moment().format("DD-MMM-YYYY HH:mm:ss")

//console.log(`Daylight: ${daylight}`)
//console.log(`Current time ${now}`)
//console.log(`${process.env.url_netzwerk}`)

let data = {
  email: process.env.USERNAME_MAIL,
  password: process.env.PASSWORD,
};

let day = moment().format("DD");
let month = moment().format("MM");

console.log(`${day} ${month}`);

if (daylight) {
  axios
    .post(`${process.env.url_netzwerk}/sign-in`, data)
    .then((response) => {
     //console.log(response.data.accessToken)
      let token = response.data.accessToken;
      if (!token) {
        res.send({ code: "404", message: "Usuario no encontrado" });
      } else {
        axios
          .get(`${process.env.url_netzwerk}/get-today-bdays/${month}/${day}`, {
            headers: { Accept: "application/json", Authorization: token },
          })
          .then((response) => {
            //console.log(response)
            if (response.data.bday.length === 0) {
              console.log("No hay cumpleaños hoy")
            } else {
              //console.log(response.data.bday);
              reminder(response.data.bday, token);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
} else {
  console.log("No es horario de verano");
}

function reminder(data, token) {
  axios
    .post(`${process.env.url_netzwerk}/reminder`, data, {
      headers: { Accept: "application/json", Authorization: token },
    })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
}
