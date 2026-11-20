const { Router } = require('express');
const revistasController = require('../controllers/revistasController');
const { autenticar } = require('../middlewares/autenticacao');
const { permitirNiveis } = require('../middlewares/permissoes');

const router = Router();

router.get('/', revistasController.listar);
router.get('/:slug', revistasController.buscar);
router.put('/:slug', autenticar, permitirNiveis('admin'), revistasController.atualizar);

module.exports = router;
