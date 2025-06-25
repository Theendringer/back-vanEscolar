const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

router.post('/', alunoController.createAluno);
router.get('/', alunoController.getAlunos);
router.get('/:id', alunoController.getAlunoById);
router.get('/motorista/:motoristaId', alunoController.getAlunosByMotoristaId);
router.put('/:id', alunoController.updateAluno);
router.delete('/:id', alunoController.deleteAluno);
router.get('/rota/:motoristaId', alunoController.getRotaByMotoristaId);
router.get('/rotas/:motoristaId', alunoController.getRotaOtimizada);




module.exports = router;
