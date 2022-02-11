const Tweet = require("../models/tweet");
var moment = require("moment-timezone");

function addTweet(req, res) {
  //   console.log("Tweet Add");
  const {title,comment,date} = req.body;
  let fecha = moment.tz(date, "Europe/Warsaw");
  let body={
      title: title, 
      comment: comment, 
      date: fecha}
  const twitter = new Tweet(body);
  twitter.save((err, tweetStored) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!tweetStored) {
        res.send({ code: "400", message: "No se ha podido crear el tweet" });
      } else {
        res.send({ code: "200", message: "Tweet creado correctamente" });
      }
    }
  });
}

function getTweets(req, res) {
  const { page = 1, limit = 5 } = req.query;
  //console.log("page", page)
  //console.log("limit", limit)
  const options = {
    page: page,
    limit: parseInt(limit),
    sort: { date: "desc" },
  };

  Tweet.paginate({}, options, (err, tweetsStored) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!tweetsStored) {
        res.send({ code: "400", message: "No se han encontrado ningun post" });
      } else {
        res.send({ code: "200", tweets: tweetsStored });
      }
    }
  });
}

function updateTweet(req, res) {
  const tweetData = req.body;
  const { id } = req.params;

  Tweet.findByIdAndUpdate(id, tweetData, (err, tweetUpdate) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!tweetUpdate) {
        res.send({ code: "404", message: "No se ha encontrado ningun tweet." });
      } else {
        res.send({ code: "200", message: "Tweet actualizado correctamente" });
      }
    }
  });
}

function deleteTweet(req, res) {
  const { id } = req.params;
  Tweet.findByIdAndRemove(id, (err, tweetDeleted) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!tweetDeleted) {
        res.send({ code: "404", message: "Tweet no encontrado" });
      } else {
        res.send({ code: "200", message: "Tweet eliminado correctamente" });
      }
    }
  });
}

function getTweet(req, res) {
  const { id } = req.params;
  Tweet.findOne({ _id: id }, (err, tweetStored) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!tweetStored) {
        res.send({ code: "400", message: "No se han encontrado ningun tweet" });
      } else {
        res.send({ code: "200", tweet: tweetStored });
      }
    }
  });
}

function sendTweet(req,res){
   // console.log("send tweet")
    const { startinghour} = req.params;
    //console.log(startinghour)
    let fechaInicial = moment.unix(startinghour).format("YYYY-MM-DD HH:mm");
    console.log(fechaInicial)
    Tweet.find({
        date:{
            $lte: fechaInicial
        }, 
        complete:false
    },(err,tweetStored)=>{
        if (err) {
            res.send({ code: "500", message: "Error del servidor" });
          } else {
            if (!tweetStored) {
              res.send({ code: "400", message: "No se han encontrado ningun tweet" });
            } else {
              res.send({ code: "200", tweet: tweetStored });
            }
          }
    })
}

module.exports = {
  addTweet,
  getTweets,
  updateTweet,
  deleteTweet,
  getTweet,
  sendTweet
};
