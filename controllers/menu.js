const Menu = require("../models/menu");

function addMenu(req,res){
    const {title,url,order,active}=req.body
    const menu=new Menu();
    menu.title=title;
    menu.url=url;
    menu.order=order;
    menu.active=active;

    menu.save((err,createdMenu)=>{
        if(err){
            res.send({code:"500",message:"Error del servidor"})
        }else{
            if(!createdMenu){
                res.send({code:"404",message:"Error al crear el menu"})
            }else{
                res.send({code:"200",message:"Menu creado correctamente"})
            }
        }

    })
}

function getMenu(req,res){
    Menu.find().sort({order:"asc"}).exec((err,menuStored)=>{
        if(err){
            res.send({code:"500",message:"Error del servidor"})
        }else{
            if(!menuStored){
                res.send({code:"404",message:"No se ha encontrado ningun elemento en el menu."})
            }else{
                res.send({code:200,menu:menuStored})
            }
        }
    })
        
}

function updateMenu(req,res){
    let menuData=req.body
    const params=req.params
    Menu.findByIdAndUpdate(params.id,menuData,(err,menuUpdate)=>{
        if(err){
            res.send({code:"500",message:"Error del servidor"})
        }else{
            if(!menuUpdate){
                res.send({code:"404",message:"No se ha encontrado ningun menu"})
            }else{
                res.send({code:"200",message:"Menu actualizado correctamente"})
            }
        }
    })
}

function activateMenu(req,res){
    const {id}=req.params;
    const {active}=req.body;
    Menu.findByIdAndUpdate(id,{active},(err,menuStored)=>{
        if(err){
            res.send({code:"500",message:"Error del servidor"})
        }else{
            if(!menuStored){
                res.send({code:"404",message:"No se ha encontrado ningun menu"})
            }else{
                if(active===true){
                res.send({code:"200",message:"Menu activado correctamente"})
                }else{
                    res.send({code:"200",message:"Menu desactivado correctamente"})  
                }

            }
        }
    })
}

function deleteMenu(req,res){
    const{id}=req.params
    Menu.findByIdAndRemove(id,(err,menuDeleted)=>{
        if(err){
            res.send({code:"500",message:"Error del servidor"})
        }else{
            if(!menuDeleted){
                res.send({code:"404",message:"No se ha encontrado ningun menu"})
            }else{
                res.send({code:"200",message:"Menu eliminado correctamente"})
            }
        }
    })
}

module.exports={
    addMenu,
    getMenu,
    updateMenu,
    activateMenu,
    deleteMenu
}