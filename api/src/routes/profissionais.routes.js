const { Router } = require('express');
const profissionaisController = require('../controllers/profissionaisController');

const router = Router();

router.get('/', profissionaisController.listar);
router.get('/:slug', profissionaisController.buscar);

module.exports = router;
