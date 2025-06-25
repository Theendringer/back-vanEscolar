const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar novo motorista
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email já cadastrado' });

    // Criar hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Criar usuário
    const user = new User({ name, email, passwordHash, role });
    await user.save();

    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Login do motorista
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Buscar usuário por email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email ou senha inválidos' });

    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Email ou senha inválidos' });

    // Criar token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};
