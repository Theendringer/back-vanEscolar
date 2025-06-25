const mongoose = require('mongoose');

const pontoDeParadaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  endereco: {
    type: String,
    required: true,
  },
  // Latitude e Longitude do ponto de parada
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  motorista: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Motorista',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PontoDeParada', pontoDeParadaSchema);
