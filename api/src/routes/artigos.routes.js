const { Router } = require('express');
const artigosController = require('../controllers/artigosController');
const comentariosController = require('../controllers/comentariosController');
const interacoesController = require('../controllers/interacoesController');
const { autenticar } = require('../middlewares/autenticacao');
const { autorDoArtigoOuAdmin, exigirPublicador } = require('../middlewares/permissoes');

// Entidade principal: CRUD de artigos (tabela publicacoes do site). O artigo é identificado pelo slug, como no site.
// Leitura aberta a todos (visitante incluído); escrita exige token e nível.
const router = Router();

router.get('/', artigosController.listar);
router.get('/:slug', artigosController.buscar);
router.post('/', autenticar, exigirPublicador, artigosController.criar);
router.put('/:slug', autenticar, autorDoArtigoOuAdmin, artigosController.atualizar);
router.delete('/:slug', autenticar, autorDoArtigoOuAdmin, artigosController.excluir);

router.get('/:slug/comentarios', comentariosController.listar);
router.post('/:slug/comentarios', autenticar, comentariosController.criar);
router.post('/:slug/interacoes', autenticar, interacoesController.alternar);

module.exports = router;
