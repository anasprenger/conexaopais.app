const { Router } = require('express');
const revistasController = require('../controllers/revistasController');

const router = Router();

router.get('/', revistasController.listar);
router.get('/:slug', revistasController.buscar);

module.exports = router;
