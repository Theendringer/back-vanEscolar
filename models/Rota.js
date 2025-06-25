const mongoose = require('mongoose');

const rotaSchema = new mongoose.Schema({
  motorista: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  alunos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Aluno' }],
  startedAt: { type: Date },
  finishedAt: { type: Date },
  status: { type: String, enum: ['pendente', 'em_andamento', 'finalizada'], default: 'pendente' },
}, { timestamps: true });

module.exports = mongoose.model('Rota', rotaSchema);
