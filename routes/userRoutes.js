const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/all', userController.getAllUsers);

module.exports = router;
