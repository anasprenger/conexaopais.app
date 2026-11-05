const { Router } = require('express');
const comentariosController = require('../controllers/comentariosController');

const router = Router();

router.delete('/:id', comentariosController.excluir); // Entrega 3: autor do comentário ou admin

module.exports = router;
