const jwt = require("../services/jwt");
const moment = require("moment");
const User = require("../models/user");

function willExpireToken(token) {
  const { exp } = jwt.decodeToken(token);
  const currentDate = moment().unix();
  if (currentDate > exp) {
    return true;
  }
  return false;
}

function refreshAccessToken(req,res){
    const {refreshToken}=req.body;
    //console.log(refreshToken)
    const isTokenExpired=willExpireToken(refreshToken);
    //console.log(isTokenExpired)
    if(isTokenExpired){
        res.send({message:"El refreshToken ha expirado",code:"404"})
    }else{
        const {id}=jwt.decodeToken(refreshToken);
        User.findOne({_id:id},(err,userStored)=>{
            if(err){
                res.send({message:"Error del Servidor",code:"500"})
            }else{
                if(!userStored){
                    res.send({message:"Usuario no encontrado",code:"400"})
                }else{
                    res.send({
                        accessToken:jwt.createAccessToken(userStored),
                        refreshToken:refreshToken,
                        code:"200"
                    })
                }
            }
        })
    }
}

module.exports={
    refreshAccessToken,
}
