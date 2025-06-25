const express = require('express');
const router = express.Router();

// Rota de teste temporária
router.get('/', (req, res) => {
  res.send('Rota de motorista funcionando!');
});

module.exports = router;
