const express = require('express');
const router = express.Router();
const saladController = require('../controllers/saladController');

router.get('/getAllSalad', saladController.getAllSalad);
router.post('/createSalad', saladController.createSalad);

module.exports = router;
