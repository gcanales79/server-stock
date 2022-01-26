const jwt=require("jwt-simple");
const moment = require("moment");

const SECRET_KEY = process.env.JWT_SECRET;

exports.ensureAuth=(req,res,next)=>{
    if(!req.headers.authorization){
        return res.send({message:"La peticion no tiene cabecera de autenticación",code:"404"})
    }
    const token=req.headers.authorization.replace(/['"]+/g,"");

    try{
        var payload=jwt.decode(token,SECRET_KEY)
        if(payload.exp<=moment.unix()){
            return res.send({message:"El token ha expirado.",code:"404"})
        }
    }catch(ex){
        console.log(ex)
        return res.send({message:"Token inválido",code:"404"})
    }

    req.user=payload
    next();

}