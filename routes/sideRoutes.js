const express = require('express');
const router = express.Router();
const sideController = require('../controllers/sideController');

router.get('/getAllSide', sideController.getAllSides);
router.post('/createSide', sideController.createSide);

module.exports = router;
