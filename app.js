const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/motoristas', require('./routes/motoristaRoutes'));  
app.use('/api/alunos', require('./routes/alunoRoutes'));          
app.use('/api/pontosParada', require('./routes/pontoParadaRoutes')); 

module.exports = app;
