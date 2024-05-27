require('dotenv').config();
const mongoose = require("mongoose");
const app = require("./app");
const PORT_SERVER = process.env.PORT || 3977;
const { API_VERSION, IP_SERVER, PORT_DB } = require("./config");

// MongoDB connection details
const isProduction = process.env.NODE_ENV === 'production';

const mongoURI = isProduction
  ? `mongodb+srv://${process.env.MONGO_ATLAS_USERNAME}:${process.env.MONGO_ATLAS_PASSWORD}@${process.env.MONGO_ATLAS_CLUSTER}/${process.env.MONGO_ATLAS_DBNAME}?retryWrites=true&w=majority`
  : `mongodb://${IP_SERVER}:${PORT_DB}/netzwerk`;

mongoose.connect(
  mongoURI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, res) => {
    if (err) {
      throw err;
    } else {
      console.log("La conexion a la base de datos es correcta");

      app.listen(PORT_SERVER, () => {
        console.log("###################");
        console.log("##### API REST ####");
        console.log("###################");
        console.log(`http://${IP_SERVER}:${PORT_SERVER}/api/${API_VERSION}/`);
      });
    }
  }
);
