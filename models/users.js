const mongoose = require("mongoose");

const usersScheme = mongoose.Schema({
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "trips" }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "trips" }],
});

const Users = mongoose.model("users", usersScheme);

module.exports = Users;
