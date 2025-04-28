const express = require('express');
const router = express.Router();
const sideController = require('../controllers/sideController');

router.get('/all', sideController.getAllSides);

module.exports = router;
