const { Router } = require('express');
const statusController = require('../controllers/statusController');

// Todas as rotas da API ficam sob o prefixo /api
const router = Router();

router.get('/status', statusController.status);


module.exports = router;
