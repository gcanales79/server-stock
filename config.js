require("dotenv").config();

const API_VERSION="v1";
const IP_SERVER=process.env.IP_SERVER;
const PORT_DB=27017;

module.exports={
    API_VERSION,
    IP_SERVER,
    PORT_DB
}