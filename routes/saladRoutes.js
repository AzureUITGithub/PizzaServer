const express = require('express');
const router = express.Router();
const saladController = require('../controllers/saladController');

router.get('/getAllSalad', saladController.getAllSalad);
router.get('/getSalad/:id', saladController.getSaladById);
router.post('/createSalad', saladController.createSalad);
router.put('/updateSalad/:id', saladController.updateSalad);
router.delete('/deleteSalad/:id', saladController.deleteSalad);

module.exports = router;