const Post = require("../models/post");

function addPost(req, res) {
  const body = req.body;
  const post = new Post(body);
  post.save((err, postStored) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!postStored) {
        res.send({ code: "400", message: "No se ha podido crear el post" });
      } else {
        res.send({ code: "200", message: "Post creado correctamente" });
      }
    }
  });
}

function getPosts(req, res) {
  const { page = 1, limit = 6 } = req.query;
  //console.log("page", page)
  //console.log("limit", limit)
  const options = {
    page: page,
    limit: parseInt(limit),
    sort: { date: "desc" },
  };

  Post.paginate({}, options, (err, postsStored) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!postsStored) {
        res.send({ code: "400", message: "No se han encontrado ningun post" });
      } else {
        res.send({ code: "200", posts: postsStored });
      }
    }
  });
}

function updatePost(req,res){
  const postData = req.body;
  const { id } = req.params;

  Post.findByIdAndUpdate(id,postData,(err,postUpdate)=>{
      if(err){
          res.send({code:"500", message:"Error del servidor"})
      }else{
          if(!postUpdate){
              res.send({code:"404",message:"No se ha encontrado ningun post."})
          }else{
              res.send({code:"200",message:"Post actualizado correctamente"})
          }
      }
  })
}

function deletePost(req,res){
  const { id } = req.params;
  Post.findByIdAndRemove(id, (err, postDeleted) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!postDeleted) {
        res.send({ code: "404", message: "Post no encontrado" });
      } else {
        res.send({ code: "200", message: "Post eliminado correctamente" });
      }
    }
  });
}

function getPost(req,res){
  const{url}=req.params
  Post.findOne({url:url},(err,postStored)=>{
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!postStored) {
        res.send({ code: "400", message: "No se han encontrado ningun post" });
      } else {
        res.send({ code: "200", post: postStored });
      }
    }
  })
}

module.exports = {
  addPost,
  getPosts,
  updatePost,
  deletePost,
  getPost
};
