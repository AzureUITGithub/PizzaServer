const express = require('express');
const router = express.Router();
const drinkController = require('../controllers/drinkController');

router.get('/all', drinkController.getAllDrinks);

module.exports = router;
