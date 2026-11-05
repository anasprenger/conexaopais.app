const { Router } = require('express');
const mensagensController = require('../controllers/mensagensController');

const router = Router();

router.post('/', mensagensController.criar);

module.exports = router;
