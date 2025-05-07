const express = require('express');
const router = express.Router();
const pizzaController = require('../controllers/pizzaController');

router.get('/getAllPizza', pizzaController.getAllPizzas);
router.get('/getPizza/:id', pizzaController.getPizzaById);
router.post('/createPizza', pizzaController.createPizza);
router.put('/updatePizza/:id', pizzaController.updatePizza);
router.delete('/deletePizza/:id', pizzaController.deletePizza);

module.exports = router;
