const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/filmesController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '..', 'public', 'uploads'));
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random()*1E9);
		const ext = path.extname(file.originalname);
		cb(null, unique + ext);
	}
});
const upload = multer({ storage: storage });

router.get('/', ctrl.index);
router.get('/novo', ctrl.novo);
router.post('/salvar', upload.single('imagem_file'), ctrl.salvar);
router.get('/editar/:id', ctrl.editar);
router.post('/atualizar', upload.single('imagem_file'), ctrl.atualizar);
router.get('/excluir/:id', ctrl.excluir);

module.exports = router;
