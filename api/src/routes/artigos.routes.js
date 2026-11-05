const { Router } = require('express');
const artigosController = require('../controllers/artigosController');

// Entidade principal: CRUD de artigos
// Entrega 3: POST/PUT/DELETE passam a exigir token (autor do artigo ou admin)
const router = Router();

router.get('/', artigosController.listar);
router.get('/:id', artigosController.buscar);
router.post('/', artigosController.criar);
router.put('/:id', artigosController.atualizar);
router.delete('/:id', artigosController.excluir);

module.exports = router;
