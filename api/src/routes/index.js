const { Router } = require('express');
const artigosController = require('../controllers/artigosController');
const statusController = require('../controllers/statusController');

// Todas as rotas da API ficam sob o prefixo /api
const router = Router();

router.get('/status', statusController.status);
router.get('/categorias', artigosController.listarCategorias);

router.use('/auth', require('./auth.routes'));
router.use('/usuarios', require('./usuarios.routes'));
router.use('/artigos', require('./artigos.routes'));
router.use('/comentarios', require('./comentarios.routes'));

module.exports = router;
