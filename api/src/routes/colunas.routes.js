const { Router } = require('express');
const colunasController = require('../controllers/colunasController');
const { autenticar } = require('../middlewares/autenticacao');

const router = Router();

router.get('/', colunasController.listar);
router.get('/:slug', colunasController.buscar);
router.post('/:slug/posts/:postSlug/interacoes', autenticar, colunasController.alternarInteracao);

module.exports = router;
