const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.index);
// rota para testar flash messages
router.get('/flash', homeController.flashTest);

module.exports = router;
