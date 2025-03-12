const express = require("express");
const router = express.Router();

const Trips = require("../models/trips");
const Users = require("../models/users");


// Search MongoDB for a trip
router.post("/", async (req, res) => {
  let { departure, arrival, date } = req.body;
  if (!departure || !arrival || !date) {
    return res.json({
      result: false,
      message: "Invalid query (missing fields).",
    });
  }

  let startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  let endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);
  let searchResult = await Trips.aggregate([
    {
      $match: {
        departure: { $regex: new RegExp(departure, "i") },
        arrival: { $regex: new RegExp(arrival, "i") },
        date: { $gte: startOfDay, $lte: endOfDay },
      },
    },
  ]);

  searchResult.length > 0
    ? res.json({ result: true, data: searchResult })
    : res.json({ result: true, data: [], message: "Not Found" });
});

// Route pour ajouter un trajet au panier
router.post("/cart/:userID", async (req, res) => {
  let newTrip = await Trips.findOne({ _id: req.body.id });
  !newTrip &&
    res.json({
      result: false,
      message: "No such trip.",
      data: {},
    });
  await Users.findByIdAndUpdate(req.params.userID, {
    $push: { cart: newTrip._id },
  });

  res.json({
    result: true,
    message: "Trip successfully add to cart.",
    data: newTrip,
  });
});

// Route pour voir le panier
router.get("/cart/:userID", async (req, res) => {
  let userProfile = await Users.findById(req.params.userID);
  !userProfile &&
    res.json({
      result: false,
      message: "Unknown user",
    });
  await Users.populate(userProfile, "cart");
  res.json({ result: true, data: userProfile.cart });
});

// Route pour supprimer un trajet du panier
router.delete("/cart/:userID/:tripID", async (req, res) => {
  let userProfile = await Users.findById(req.params.userID);
  !userProfile &&
    res.json({
      result: false,
      message: "Unknown user",
    });

  await Users.findByIdAndUpdate(req.params.userID, {
    $pull: { cart: req.params.tripID },
  });

  res.status(200).json({
    result: true,
    message: "Trip deleted from cart.",
    data: req.params.tripID,
  });
});

// Route pour effectuer un achat et vider le panier
router.post("/purchase/:userID", async (req, res) => {
  let userProfile = await Users.findById(req.params.userID);
  !userProfile &&
    res.json({
      result: false,
      message: "Unknown user",
    });

  userProfile.cart.length < 1 &&
    res.json({
      result: false,
      message: "Empty cart, please search and add trips.",
    });

  await Users.findByIdAndUpdate(req.params.userID, [
    { $set: { bookings: { $concatArrays: ["$bookings", "$cart"] } } },
    { $set: { cart: [] } },
  ]);

  res.json({
    result: true,
    message: "Thank you for your purchase.",
  });
});

router.get("/bookings/:userID", async (req, res) => {
  let userProfile = await Users.findById(req.params.userID);
  !userProfile &&
    res.json({
      result: false,
      message: "Unknown user",
    });
  await Users.populate(userProfile, "bookings");
  res.json({ result: true, data: userProfile.bookings });
});

module.exports = router;
