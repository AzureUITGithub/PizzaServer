const express = require('express');
const router = express.Router();
const pizzaController = require('../controllers/pizzaController');

router.get('/getAllPizza', pizzaController.getAllPizzas);
router.post('/createPizza', pizzaController.createPizza);

module.exports = router;
