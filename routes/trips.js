const express = require("express");
const router = express.Router();

const Trips = require("../models/trips");
const mongoose = require("mongoose");

let cartArray = new Array();
let bookingArray = new Array();

// Search MongoDB for a trip
router.post("/", async (req, res) => {
  let { departure, arrival, date } = req.body;
  if (!departure || !arrival || !date) {
    return res.json({
      result: false,
      message: "Invalid query (missing fields).",
    });
  }
  let searchResult = await Trips.aggregate([
    {
      $match: {
        departure: departure,
        arrival: arrival,
      },
    },
  ]);
  date = new Date(date);
  searchResult = searchResult.filter((trip) => {
    return trip.date.getFullYear() == date.getFullYear() &&
      trip.date.getMonth() == date.getMonth() &&
      trip.date.getDate() == date.getDate();
  });
  searchResult.length > 0
    ? res.json({ result: true, data: searchResult })
    : res.json({ result: true, data: [], message: "Not Found" });
});

// Route pour ajouter un trajet au panier
router.post("/cart", async (req, res) => {
  let newTrip = await Trips.findOne({ _id: req.body.id });
  newTrip && cartArray.push(newTrip);
  res.json({
    result: Boolean(newTrip),
    message: newTrip ? "Trip successfully add to cart." : "No such trip.",
    data: cartArray,
  });
});

// Route pour voir le panier
router.get("/cart", (req, res) => {
  res.json({ result: true, data: cartArray });
});

// Route pour supprimer un trajet du panier
router.delete("/cart/:id", (req, res) => {
  console.log(req.params.id);
  cartArray = cartArray.filter((trip) => trip._id != req.params.id);
  res.status(200).json({
    result: true,
    message: "Trip deleted from cart.",
    cart: cartArray,
  });
});

// Route pour effectuer un achat et vider le panier
router.post("/purchase", (req, res) => {
  if (cartArray.length < 1) {
    res.json({
      result: false,
      message: "Empty cart, please search and add trips.",
      data: [],
    });
  }
  bookingArray = cartArray;
  cartArray = [];
  res.json({
    result: true,
    message: "Thank you for your purchase.",
    data: bookingArray,
  });
});

router.get("/bookings", (req, res) => {
  res.json({ result: true, data: bookingArray });
});

module.exports = router;
