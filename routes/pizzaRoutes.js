const express = require('express');
const router = express.Router();
const multer = require('multer');
const pizzaController = require('../controllers/pizzaController');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.get('/getAllPizza', pizzaController.getAllPizzas);
router.get('/getPizza/:id', pizzaController.getPizzaById);
router.post('/createPizza', upload.single('image'), pizzaController.createPizza); // Add multer
router.put('/updatePizza/:id', pizzaController.updatePizza);
router.delete('/deletePizza/:id', pizzaController.deletePizza);

module.exports = router;