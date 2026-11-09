const { Router } = require('express');
const artigosController = require('../controllers/artigosController');
const comentariosController = require('../controllers/comentariosController');
const interacoesController = require('../controllers/interacoesController');
const { autenticar } = require('../middlewares/autenticacao');
const { exigirPublicador } = require('../middlewares/permissoes');

// Entidade principal: CRUD de artigos.
// Leitura aberta a todos (visitante incluído); escrita exige token e nível.
const router = Router();

router.get('/', artigosController.listar);
router.get('/:id', artigosController.buscar);
router.post('/', autenticar, exigirPublicador, artigosController.criar);
router.put('/:id', autenticar, artigosController.atualizar);
router.delete('/:id', autenticar, artigosController.excluir);

router.get('/:id/comentarios', comentariosController.listar);
router.post('/:id/comentarios', autenticar, comentariosController.criar);
router.post('/:id/interacoes', autenticar, interacoesController.alternar);

module.exports = router;
