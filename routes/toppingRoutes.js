const express = require('express');
const router = express.Router();
const toppingController = require('../controllers/toppingController');

router.get('/getAllTopping', toppingController.getAllToppings);
router.get('/getTopping/:id', toppingController.getToppingById);
router.post('/createTopping', toppingController.createTopping);
router.put('/updateTopping/:id', toppingController.updateTopping);
router.delete('/deleteTopping/:id', toppingController.deleteTopping);

module.exports = router;
