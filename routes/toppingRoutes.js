const express = require('express');
const router = express.Router();
const toppingController = require('../controllers/toppingController');

router.get('/getAllTopping', toppingController.getAllToppings);
router.post('/createTopping', toppingController.createTopping);

module.exports = router;
