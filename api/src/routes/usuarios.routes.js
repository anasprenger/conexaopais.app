const { Router } = require('express');
const usuariosController = require('../controllers/usuariosController');

const router = Router();

router.post('/', usuariosController.cadastrar);
router.get('/', usuariosController.listar); // Entrega 3: somente admin
router.get('/:id', usuariosController.buscar);
router.get('/:id/interacoes', usuariosController.listarInteracoes);
router.patch('/:id/verificacao', usuariosController.atualizarVerificacao); // Entrega 3: somente admin

module.exports = router;
