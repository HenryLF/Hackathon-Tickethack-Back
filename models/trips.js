const mongoose = require("mongoose");

const tripsScheme = mongoose.Schema({
  departure: String,
  arrival: String,
  date: Date,
  price: Number,
});

const Trips = mongoose.model("trips", tripsScheme);

module.exports = Trips;
