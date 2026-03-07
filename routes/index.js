const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.index);
// rota para testar flash messages
router.get('/flash', homeController.flashTest);

// receive OMDb API key (AJAX)
router.post('/omdb-key', homeController.saveOmdbKey);

// trigger seed classics (AJAX)
router.post('/seed-classics', homeController.runSeedClassics);

module.exports = router;
