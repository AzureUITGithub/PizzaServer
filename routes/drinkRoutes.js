const express = require('express');
const router = express.Router();
const drinkController = require('../controllers/drinkController');

router.get('/getAllDrink', drinkController.getAllDrinks);
router.get('/getDrink/:id', drinkController.getDrinkById);
router.post('/createDrink', drinkController.createDrink);
router.put('/updateDrink/:id', drinkController.updateDrink);
router.delete('/deleteDrink/:id', drinkController.deleteDrink);

module.exports = router;
