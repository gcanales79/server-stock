const Course = require("../models/course");

function addCourse(req, res) {
  const body = req.body;
  const course = new Course(body);
  course.order = 1000;

  //console.log(course)

  course.save((err, courseStored) => {
    if (err) {
      res.send({
        code: "500",
        message: "El curso que estas creando ya existe.",
      });
    } else {
      if (!courseStored) {
        res.send({ code: "400", message: "No se ha podido crear el curso." });
      } else {
        res.send({ code: "200", message: "Curso creado correctamente" });
      }
    }
  });
}

function getCourses(req, res) {
  Course.find()
    .sort({ order: "asc" })
    .exec((err, coursesStored) => {
      if (err) {
        res.send({ code: "500", message: "Error del servidor" });
      } else {
        if (!coursesStored) {
          res.send({
            code: "404",
            message: "No se ha encontrado ningun curso",
          });
        } else {
          res.send({ code: "200", courses: coursesStored });
        }
      }
    });
}

function deleteCourse(req, res) {
  const { id } = req.params;
  Course.findByIdAndRemove(id, (err, courseDeleted) => {
    if (err) {
      res.send({ code: "500", message: "Error del servidor" });
    } else {
      if (!courseDeleted) {
        res.send({ code: "404", message: "Curso no encontrado" });
      } else {
        res.send({ code: "200", message: "Curso eliminado correctamente" });
      }
    }
  });
}

function updateCourse(req, res) {
  const courseData = req.body;
  const { id } = req.params;

  Course.findByIdAndUpdate(id,courseData,(err,courseUpdate)=>{
      if(err){
          res.send({code:"500", message:"Error del servidor"})
      }else{
          if(!courseUpdate){
              res.send({code:"404",message:"No se ha encontrado ningun curso."})
          }else{
              res.send({code:"200",message:"Curso actualizado correctamente"})
          }
      }
  })
}

module.exports = {
  addCourse,
  getCourses,
  deleteCourse,
  updateCourse,
};
