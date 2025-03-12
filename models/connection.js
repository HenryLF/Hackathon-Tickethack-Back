const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL, { connectTimeoutMS: 2000 })
  .then(() => console.log("Database connected"))
  .catch((error) => console.error(error));
