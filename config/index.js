const dotenv = require("dotenv").config();
//create one object
module.exports = {
  PORT: process.env.PORT,
  MONGODB_URL: process.env.MONGODB_URL,
  GMAIL_USERNAME:process.env.GMAIL_USERNAME,
};
