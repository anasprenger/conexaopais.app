const { Router } = require('express');
const comentariosController = require('../controllers/comentariosController');
const { autenticar } = require('../middlewares/autenticacao');
const { autorDoComentarioOuAdmin } = require('../middlewares/permissoes');

const router = Router();

router.delete('/:id', autenticar, autorDoComentarioOuAdmin, comentariosController.excluir);

module.exports = router;
