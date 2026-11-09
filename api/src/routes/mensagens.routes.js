const { Router } = require('express');
const mensagensController = require('../controllers/mensagensController');
const { autenticarSeHouverToken } = require('../middlewares/autenticacao');

const router = Router();

// Contato é aberto a todos; pergunta à equipe exige login (conferido no controller)
router.post('/', autenticarSeHouverToken, mensagensController.criar);

module.exports = router;
