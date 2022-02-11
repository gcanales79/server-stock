require("dotenv").config();
var moment = require("moment-timezone");
const axios = require("axios");
var Twitter = require("twitter");
var client = new Twitter({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEYN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRETN,
});

let fecha = moment().tz("Europe/Warsaw").format("X");

axios
  .get(`${process.env.url_netzwerk}/to-send-tweets/${fecha}`)
  .then((response) => {
    const { tweet } = response.data;
    //console.log(response)
    let data=tweet;
    console.log(data)
    for (let i = 0; i < data.length; i++) {
      client.post(
        "statuses/update",
        { status: data[i].comment },
        function (error, tweet, response) {
          if (!error) {
            //console.log(tweet);
            axios.put(`${process.env.url_netzwerk}/update-tweet/${data[i]._id}`,{
                complete:true,
            })
            .then((response)=>{
                console.log(response.data)
            }).catch((err)=>{
                console.log(err)
            })
          }else
          console.log(error)
        }
      );
    }
  })
  .catch((err) => {
    console.log(err);
  });