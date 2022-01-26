const Newsletter = require("../models/newsletter");

function suscribeEmail(req,res){
    const{email}=req.params;
    const newsletter=new Newsletter()
    


    if(!email){
        res.status({code:"404",message:"El email es obligatorio"})
    }else{
        newsletter.email=email.toLowerCase();
        newsletter.save((err,newsletterStore)=>{
            if(err){
                res.send({code:"500",message:"El email ya existe"})
            }else{
                if(!newsletterStore){
                    res.send({code:"404",message:"Error al registrar en la newsletter"})
                }else{
                    res.send({code:"200",message:"Email registrado correctamente"})
                }
            }
    
        })

    }

  

}

module.exports={
    suscribeEmail
};