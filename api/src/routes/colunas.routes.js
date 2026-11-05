const { Router } = require('express');
const colunasController = require('../controllers/colunasController');

const router = Router();

router.get('/', colunasController.listar);
router.get('/:slug', colunasController.buscar);

module.exports = router;
