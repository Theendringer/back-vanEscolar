const axios = require('axios');
const Aluno = require('../models/Aluno');
const fetch = require('node-fetch'); // npm install node-fetch@2

// Função para geocodificar endereço (usar OpenStreetMap Nominatim)
async function geocodeAddress(enderecoSemNumero) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(enderecoSemNumero)}&format=json&limit=1`;
    console.log('URL usada para geocodificação:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SeuAppAqui' // obrigatório para o Nominatim
      }
    });

    const data = await response.json();
    console.log('Dados da geocodificação:', data);

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    return {}; // retorna objeto vazio se não encontrar
  } catch (error) {
    console.error('Erro na geocodificação:', error);
    return {};
  }
}

// Criar aluno
exports.createAluno = async (req, res) => {
  try {
    const {
      nome,
      nomeResponsavel,
      telefoneResponsavel,
      endereco,
      numero,
      complemento,
      pontoParada,
      motorista
    } = req.body;

    const enderecoCompleto = endereco + ', n° '  + numero + ', ' + complemento
    const enderecoParaGeocode = endereco; // envia só o endereço principal, sem número e complemento
    console.log(enderecoParaGeocode)

    const coords = await geocodeAddress(enderecoParaGeocode);

    const aluno = new Aluno({
      nome,
      nomeResponsavel,
      telefoneResponsavel,
      endereco: enderecoCompleto,
      numero,
      complemento,
      pontoParada,
      motorista,
      latitude: coords.latitude,
      longitude: coords.longitude
    });

    await aluno.save();
    res.status(201).json(aluno);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar aluno' });
  }
};

// Listar todos alunos
exports.getAlunos = async (req, res) => {
  try {
    const alunos = await Aluno.find()
      .populate('pontoParada')
      .populate('motorista', 'name email');
    res.json(alunos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar alunos' });
  }
};

// Buscar aluno por ID
exports.getAlunoById = async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.id)
      .populate('pontoParada')
      .populate('motorista', 'name email');
    if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado' });
    res.json(aluno);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar aluno' });
  }
};

// Buscar aluno por ID do motorista
exports.getAlunosByMotoristaId = async (req, res) => {
  try {
    const motoristaId = req.params.motoristaId;
    const alunos = await Aluno.find({ motorista: motoristaId })
      .populate('pontoParada')
      .populate('motorista', 'name email');
      
    res.json(alunos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar alunos do motorista' });
  }
};

exports.getRotaOtimizada = async (req, res) => {
  console.log('Chegou na rota otimizada');
  try {
    const motoristaId = req.params.motoristaId;
    const alunos = await Aluno.find({ motorista: motoristaId });

    if (alunos.length === 0) {
      return res.status(404).json({ message: 'Nenhum aluno encontrado para este motorista' });
    }

    const pontos = alunos.map(aluno => ({
      nome: aluno.nome,
      endereco: aluno.endereco,
      latitude: aluno.latitude,
      longitude: aluno.longitude
    }));

    const pontosValidos = pontos.filter(p => p.latitude && p.longitude);

    if (pontosValidos.length < 2) {
      return res.status(400).json({ message: 'É necessário pelo menos dois alunos com coordenadas para gerar rota otimizada.' });
    }

    const { latitude, longitude } = req.query;

    let origem;
    if (latitude && longitude) {
      origem = `${latitude},${longitude}`;
    } else {
      origem = `${pontosValidos[0].latitude},${pontosValidos[0].longitude}`;
    }

    const destino = '-23.564224,-46.652679'; // Exemplo: escola

    const waypointsPontos = pontosValidos.filter(p => {
      const latLng = `${p.latitude},${p.longitude}`;
      return latLng !== origem;
    });

    const waypoints = waypointsPontos.map(p => `${p.latitude},${p.longitude}`).join('|');

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origem}&destination=${destino}&waypoints=optimize:true|${waypoints}&key=${apiKey}`;
    console.log('URL enviada para Google:', url);

    const response = await axios.get(url);

    if (response.data.status !== 'OK') {
      console.error('Erro do Google Maps:', response.data);
      return res.status(500).json({ message: 'Erro ao buscar rota no Google Maps', details: response.data });
    }

    const route = response.data.routes[0];
    const legs = route.legs;
    const waypoint_order = route.waypoint_order;
    const polyline = route.overview_polyline.points;

    // Construir rota com pontos e coordenadas
    const rota = legs.map((etapa, index) => ({
      endereco: etapa.end_address,
      duracao: etapa.duration.text,
      distancia: etapa.distance.text,
      ordem: index + 1,
      latitude: etapa.end_location.lat,
      longitude: etapa.end_location.lng
    }));

    // Enviar os dados que o frontend pode usar direto no Google Maps
    res.json({
      origem: route.legs[0].start_location,
      destino: route.legs[route.legs.length - 1].end_location,
      waypoints: rota.slice(0, -1).map(ponto => ({ location: { lat: ponto.latitude, lng: ponto.longitude } })),
      polyline,
      rota,
      ordemOtimizada: waypoint_order
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao calcular rota otimizada' });
  }
};






// Buscar rota (coordenadas) por ID do motorista
exports.getRotaByMotoristaId = async (req, res) => {
  try {
    const motoristaId = req.params.motoristaId;
    const alunos = await Aluno.find({ motorista: motoristaId });

    if (!alunos.length) {
      return res.status(404).json({ message: 'Nenhum aluno encontrado para este motorista' });
    }

    const rota = alunos.map((aluno) => ({
      id: aluno._id,
      nome: aluno.nome,
      endereco: aluno.endereco,
      latitude: aluno.latitude,
      longitude: aluno.longitude
    }));

    res.json(rota);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar rota do motorista' });
  }
};




// Atualizar aluno
exports.updateAluno = async (req, res) => {
  try {
    const {
      nome,
      nomeResponsavel,
      telefoneResponsavel,
      endereco,
      numero,
      complemento,
      pontoParada,
      motorista
    } = req.body;

    const enderecoCompleto = `${endereco}${numero ? ', Nº ' + numero : ''}${complemento ? ', ' + complemento : ''}`;
    const enderecoParaGeocode = endereco;

    const coords = await geocodeAddress(enderecoParaGeocode);

    const updatedData = {
      nome,
      nomeResponsavel,
      telefoneResponsavel,
      endereco: enderecoCompleto,
      numero,
      complemento,
      pontoParada,
      motorista,
      latitude: coords.latitude,
      longitude: coords.longitude
    };

    const aluno = await Aluno.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado' });
    res.json(aluno);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar aluno' });
  }
};

// Deletar aluno
exports.deleteAluno = async (req, res) => {
  try {
    const aluno = await Aluno.findByIdAndDelete(req.params.id);
    if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado' });
    res.json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar aluno' });
  }
};
