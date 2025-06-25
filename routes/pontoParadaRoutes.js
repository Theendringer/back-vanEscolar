const express = require('express');
const router = express.Router();
const pontoParadaController = require('../controllers/pontoParadaController');

router.post('/', pontoParadaController.createPontoParada);
router.get('/', pontoParadaController.getPontosParada);
router.get('/:id', pontoParadaController.getPontoParadaById);
router.put('/:id', pontoParadaController.updatePontoParada);
router.delete('/:id', pontoParadaController.deletePontoParada);

module.exports = router;
