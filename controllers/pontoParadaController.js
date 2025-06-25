const PontoParada = require('../models/PontoParada');

// Criar ponto de parada
exports.createPontoParada = async (req, res) => {
  try {
    const { nome, endereco, latitude, longitude, motorista } = req.body;

    const pontoParada = new PontoParada({
      nome,
      endereco,
      latitude,
      longitude,
      motorista,
    });

    await pontoParada.save();
    res.status(201).json(pontoParada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar ponto de parada' });
  }
};

// Listar todos pontos de parada
exports.getPontosParada = async (req, res) => {
  try {
    const pontos = await PontoParada.find().populate('motorista', 'name email');
    res.json(pontos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar pontos de parada' });
  }
};

// Buscar ponto por ID
exports.getPontoParadaById = async (req, res) => {
  try {
    const ponto = await PontoParada.findById(req.params.id).populate('motorista', 'name email');
    if (!ponto) return res.status(404).json({ message: 'Ponto de parada não encontrado' });
    res.json(ponto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar ponto de parada' });
  }
};

// Atualizar ponto de parada
exports.updatePontoParada = async (req, res) => {
  try {
    const ponto = await PontoParada.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ponto) return res.status(404).json({ message: 'Ponto de parada não encontrado' });
    res.json(ponto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar ponto de parada' });
  }
};

// Deletar ponto de parada
exports.deletePontoParada = async (req, res) => {
  try {
    const ponto = await PontoParada.findByIdAndDelete(req.params.id);
    if (!ponto) return res.status(404).json({ message: 'Ponto de parada não encontrado' });
    res.json({ message: 'Ponto de parada deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar ponto de parada' });
  }
};
