var express = require('express');
var router = express.Router();
var tripsRoutes = require('./trips'); // Import des routes des trajets

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Utiliser les routes des trajets sous "/trips"
router.use('/trips', tripsRoutes);

module.exports = router;
