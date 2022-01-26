require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
const saltRounds = 10;
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const imagemin = require("imagemin");
const imageminWebp = require("imagemin-webp");

function signUp(req, res) {
  const user = new User();

  const { email, password, repeatPassword, name, lastname } = req.body;
  user.email = email.toLowerCase();
  user.role = "admin";
  user.active = false;
  user.name = name;
  user.lastname = lastname;

  if (!password || !repeatPassword) {
    res.status(200).send({ message: "Las contraseñas son obligatorias." });
  } else {
    if (password !== repeatPassword) {
      res.status(200).send({ message: "Las contraseñas no son iguales." });
    } else {
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
          console.log(err);
          res
            .status(200)
            .send({ message: "Error al encriptar la contraseña." });
        } else {
          user.password = hash;

          //Para guardar en MongoDB
          user.save((err, userStored) => {
            if (err) {
              res.status(200).send({ message: "El usuario ya existe" });
            } else {
              if (!userStored) {
                res.status(200).send({ message: "Error al crear el usuario" });
              } else {
                res.status(200).send({ user: userStored });
              }
            }
          });
        }
      });
    }
  }
}

function signIn(req, res) {
  const params = req.body;
  const email = params.email.toLowerCase();
  const password = params.password;

  User.findOne({ email }, (err, userStored) => {
    if (err) {
      res.send({ message: "Error del servidor" });
    } else {
      if (!userStored) {
        res.send({ message: "Usuario no encontrado" });
      } else {
        bcrypt.compare(password, userStored.password, function (err, check) {
          if (err) {
            res.send({ message: "Error del servidor" });
          } else if (!check) {
            res.send({ message: "Contraseña incorrecta" });
          } else {
            if (!userStored.active) {
              res.send({ code: 200, message: "El usuario no se ha activado" });
            } else {
              res.send({
                accessToken: jwt.createAccessToken(userStored),
                refreshToken: jwt.createRefreshToken(userStored),
              });
            }
          }
        });
      }
    }
  });
}

function getUsers(req, res) {
  User.find().then((users) => {
    if (!users) {
      res.send({ message: "No se ha encontrado ningun usuario", code: "404" });
    } else {
      res.send({ users });
    }
  });
}

function getUsersActive(req, res) {
  const query = req.query;
  User.find({
    active: query.active,
  }).then((users) => {
    if (!users) {
      res.send({ message: "No se ha encontrado ningun usuario", code: "404" });
    } else {
      res.send({ users });
    }
  });
}

function uploadAvatar(req, res) {
  const params = req.params;
  User.findById({ _id: params.id }, (err, userData) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!userData) {
        res.send({
          code: "404",
          message: "No se ha encontrado ningun usuario",
        });
      } else {
        let user = userData;
        console.log(user);
        if (req.files) {
          //console.log(req.files)
          let filePath = req.files.avatar.path.replace(/\\/g, "/");
          let fileSplit = filePath.split("/");
          let fileName = fileSplit[2];
          let extSplit = fileName.split(".");
          console.log(extSplit);
          let fileExt = extSplit[1];
          if (
            fileExt !== "png" &&
            fileExt !== "jpg" &&
            fileExt !== "JPG" &&
            fileExt !== "PNG" &&
            fileExt !== "JPEG" &&
            fileExt !== "jpeg"
          ) {
            res.send({
              code: "400",
              message:
                "La extensión de la imagen no es valida. (Extensiones permitidas: .png, .jpg o .jpeg",
            });
          } else {
            user.avatar = `${extSplit[0]}.webp`;
            imagemin([`${filePath}`], {
              destination: "./uploads/avatar",
              plugins: [imageminWebp({ quality: 50 })],
            })
              .then(() => {
                User.findByIdAndUpdate(
                  { _id: params.id },
                  user,
                  (err, userResult) => {
                    if (err) {
                      res.send({ code: "500", message: "Error del servidor" });
                    } else {
                      if (!userResult) {
                        res.send({
                          code: "404",
                          message: "No se ha encontrado el usuario",
                        });
                      } else {
                        fs.unlink(filePath, function (err) {
                          if (err) {
                            res.send({
                              code: "500",
                              message: "Error al borrar la imagen",
                            });
                          } else {
                            res.send({ code: "200", avatarName: user.avatar });
                          }
                        });
                      }
                    }
                  }
                );
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }
      }
    }
  });
}

function getAvatar(req, res) {
  const avatarName = req.params.avatarName;
  const filePath = `./uploads/avatar/${avatarName}`;
  fs.access(filePath, (err) => {
    if (err) {
      res.send({ code: "404", message: "El avatar que buscas no existe." });
    } else {
      res.sendFile(path.resolve(filePath));
    }
  });
}

async function updateUser(req, res) {
  let userData = req.body;
  userData.email = req.body.email.toLowerCase();
  const params = req.params;
  if (userData.password) {
    await bcrypt.hash(userData.password, saltRounds, function (err, hash) {
      if (err) {
        res.send({ code: "500", message: "Error del servidor" });
      } else {
        userData.password = hash;
        updateUserData(params, userData, res);
      }
    });
  } else {
    updateUserData(params, userData, res);
  }
}

function updateUserData(params, userData, res) {
  User.findByIdAndUpdate({ _id: params.id }, userData, (err, userUpdate) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!userUpdate) {
        res.send({
          code: "404",
          message: "No se ha encontrado ningun usuario",
        });
      } else {
        res.send({ code: "200", message: "Usuario actualizado correctamente" });
      }
    }
  });
}

function activateUser(req, res) {
  const { id } = req.params;
  const { active } = req.body;
  User.findByIdAndUpdate(id, { active }, (err, userStored) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!userStored) {
        res.send({
          code: "404",
          message: "No se ha encontrado ningun usuario",
        });
      } else {
        if (active === true) {
          res.send({ code: "200", message: "Usuario activado correctamente" });
        } else {
          res.send({
            code: "200",
            message: "Usuario desactivado correctamente",
          });
        }
      }
    }
  });
}

function deleteUser(req, res) {
  const { id } = req.params;
  User.findByIdAndRemove(id, (err, userDeleted) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!userDeleted) {
        res.send({ code: "404", message: "Usuario no encontrado" });
      } else {
        res.send({ code: "200", message: "Usuario eliminado correctamente" });
      }
    }
  });
}

function signUpAdmin(req, res) {
  const user = new User();
  const { name, lastname, email, role, password } = req.body;
  user.name = name;
  user.lastname = lastname;
  user.email = email.toLowerCase();
  user.role = role;
  user.active = true;

  if (!password) {
    res.send({ code: "500", message: "La contraseña es obligatoria" });
  } else {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) {
        res.send({ code: "500", message: "Error al encriptar la contraseña" });
      } else {
        user.password = hash;
        user.save((err,userStored)=>{
          if(err){
            res.send({code: "500", message: "El usuario ya existe"})
          }else{
            if(!userStored){
              res.send({code:"404", message: "Error al crear el nuevo usuario"})
            }else{
              res.send({code:"200",user:userStored})
            }
          }
        })
      }
    });
  }

 
}

module.exports = {
  signUp,
  signIn,
  getUsers,
  getUsersActive,
  uploadAvatar,
  getAvatar,
  updateUser,
  activateUser,
  deleteUser,
  signUpAdmin,
};
