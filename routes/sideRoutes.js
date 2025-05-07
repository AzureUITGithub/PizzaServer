const express = require('express');
const router = express.Router();
const sideController = require('../controllers/sideController');

router.get('/getAllSide', sideController.getAllSides);
router.get('/getSide/:id', sideController.getSideById);
router.post('/createSide', sideController.createSide);
router.put('/updateSide/:id', sideController.updateSide);
router.delete('/deleteSide/:id', sideController.deleteSide);

module.exports = router;
