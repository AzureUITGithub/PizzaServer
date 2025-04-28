const express = require('express');
const router = express.Router();
const drinkController = require('../controllers/drinkController');

router.get('/getAllDrink', drinkController.getAllDrinks);
router.post('/createDrink', drinkController.createDrink);

module.exports = router;
