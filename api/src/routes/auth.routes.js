const { Router } = require('express');
const authController = require('../controllers/authController');
const { autenticar } = require('../middlewares/autenticacao');

const router = Router();

router.post('/login', authController.login); // aberta: devolve o token
router.get('/perfil', autenticar, authController.perfil); // exige "Authorization: Bearer <token>"

module.exports = router;
