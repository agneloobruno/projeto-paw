const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/filmesController');

router.get('/', ctrl.index);
router.get('/novo', ctrl.novo);
router.post('/salvar', ctrl.salvar);
router.get('/editar/:id', ctrl.editar);
router.post('/atualizar', ctrl.atualizar);
router.get('/excluir/:id', ctrl.excluir);

module.exports = router;
