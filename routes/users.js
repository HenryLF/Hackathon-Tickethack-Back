var express = require("express");
var router = express.Router();

var Users = require("../models/users");

/* GET users listing. */
router.get("/",async function  (req, res) {
  let newUser = new Users({ cart: [], bookings: [] });
  res.json(newUser);
});

module.exports = router;
