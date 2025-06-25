const mongoose = require('mongoose');

const AlunoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nomeResponsavel: { type: String, required: true },
  telefoneResponsavel: { type: String, required: true },
  endereco: { type: String, required: true },
  numero: { type: String },
  complemento: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  motorista: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pontoParada: { type: mongoose.Schema.Types.ObjectId, ref: 'PontoDeParada' }
});

module.exports = mongoose.model('Aluno', AlunoSchema);
