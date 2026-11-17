const { Router } = require('express');
const usuariosController = require('../controllers/usuariosController');
const { autenticar } = require('../middlewares/autenticacao');
const { permitirNiveis, proprioUsuarioOuAdmin } = require('../middlewares/permissoes');

const router = Router();

router.post('/', usuariosController.cadastrar); // aberta: criar conta
router.get('/', autenticar, permitirNiveis('admin'), usuariosController.listar);
router.get('/:id', autenticar, proprioUsuarioOuAdmin, usuariosController.buscar);
router.get('/:id/interacoes', autenticar, proprioUsuarioOuAdmin, usuariosController.listarInteracoes);
router.patch('/:id/verificacao', autenticar, permitirNiveis('admin'), usuariosController.atualizarVerificacao);
router.patch('/:id/papel', autenticar, permitirNiveis('admin'), usuariosController.definirPapel);
router.patch('/:id/suspensao', autenticar, permitirNiveis('admin'), usuariosController.definirSuspensao);
router.delete('/:id', autenticar, proprioUsuarioOuAdmin, usuariosController.excluir); // a própria conta ou admin

module.exports = router;
