const express = require('express');
const router = express.Router();
const saladController = require('../controllers/saladController');

router.get('/all', saladController.getAllSalads);

module.exports = router;
