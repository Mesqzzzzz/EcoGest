const crypto  = require('crypto'); // Importa o módulo nativo crypto para gerar strings seguras aleatórias
const bcrypt  = require('bcryptjs'); // Importa o bcryptjs para cifrar e comparar passwords
const jwt     = require('jsonwebtoken'); // Importa o jsonwebtoken para emitir Tokens JWT de acesso
const { User, AuthLog, RefreshToken } = require('../models'); // Importa os modelos necessários do Mongoose

// Função interna para assinar o Access Token JWT para autenticação rápida nas rotas
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m', // Define o tempo de expiração padrão para 15 minutos se não configurado
  });

// Função interna para gerar um novo Refresh Token seguro (guardado na BD para renovação de sessões)
const generateRefreshToken = async (user) => {
  const token = crypto.randomBytes(40).toString('hex'); // Gera um token aleatório seguro de 40 bytes em hexadecimal
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Define a data de expiração para daqui a 7 dias
  await RefreshToken.create({ token, user: user._id, expiresAt }); // Grava o refresh token na base de dados
  return token;
};

// POST /api/users
// Efetua o autocadastro (registo) de novos utilizadores com validação de credenciais
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Valida o envio obrigatório de todos os campos do formulário
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required' });

    // Restringe o registo de passwords demasiado curtas (menos de 6 caracteres)
    if (password.length < 6)
      return res.status(400).json({ error: 'A palavra-passe deve conter pelo menos 6 caracteres.' });

    // Evita a duplicação de contas com o mesmo endereço de correio eletrónico
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already registered' }); // Erro de conflito (409)

    // Cifra a password fornecida usando salt-rounds de 10
    const hashed = await bcrypt.hash(password, 10);
    // Cria o utilizador com o perfil padrão de 'user'
    const user   = await User.create({ name, email, password: hashed });

    // Responde com os dados do utilizador criado e status 201 (Criado)
    return res.status(201).json({
      message: 'User created successfully',
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/users/login
// Autentica o utilizador através de email e password, aplicando proteção de Rate Limit e logs de segurança
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Proteção de Segurança: Rate limit de tentativas de login por IP no último minuto
    const ipAddress = req.ip;
    const oneMinuteAgo = new Date(Date.now() - 60000); // Calcula a data correspondente a 1 minuto atrás
    const loginAttempts = await AuthLog.countDocuments({
      ipAddress,
      createdAt: { $gte: oneMinuteAgo }
    });

    const LIMIT = parseInt(process.env.LOGIN_RATE_LIMIT) || 5; // Limite padrão de 5 tentativas
    if (loginAttempts >= LIMIT) {
      // Retorna erro de limite de pedidos (429) se ultrapassar o limite de tentativas falhadas/efetuadas
      return res.status(429).json({
        error: 'Muitas tentativas de login. Por favor, aguarde 1 minuto antes de tentar novamente.'
      });
    }

    // Procura o utilizador correspondente ao e-mail fornecido
    const user = await User.findOne({ email: email?.toLowerCase() });

    // Compara a password fornecida com o hash guardado na base de dados
    const ok = user && await bcrypt.compare(password, user.password);

    // Regista o evento de autenticação na tabela de logs (AuthLog) para auditorias de segurança
    await AuthLog.create({
      user: user?._id || null,
      action: ok ? 'login' : 'failed_login',
      success: !!ok,
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent'],
    });

    if (!ok) return res.status(401).json({ error: 'Invalid credentials' }); // Retorna 401 em caso de credenciais incorretas
    if (user.status === 'inactive') return res.status(403).json({ error: 'Account is inactive' }); // Impede acesso se suspenso

    // Emite os tokens de acesso (JWT) e de renovação de sessão (Refresh Token)
    const token = signToken(user);
    const refreshToken = await generateRefreshToken(user);
    
    // Retorna credenciais de acesso válidas ao cliente
    return res.json({
      token,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role, name: user.name },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/users/me
// Retorna os dados de perfil do próprio utilizador atualmente autenticado
exports.getMe = async (req, res) => {
  const u = req.user; // Obtém o utilizador anexado pelo middleware authenticate
  res.json({ id: u._id, name: u.name, email: u.email, role: u.role, status: u.status });
};

// PATCH /api/users/me
// Permite ao próprio utilizador atualizar informações do seu próprio perfil
exports.updateMe = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};
    if (name)     updates.name  = name;
    if (email)    updates.email = email;
    // Cifra a nova password se fornecida no body
    if (password) updates.password = await bcrypt.hash(password, 10);
    
    // Aplica as atualizações na base de dados para o utilizador logado
    await User.findByIdAndUpdate(req.user._id, updates);
    res.json({ message: 'Profile updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// PATCH /api/users/me/status
// Permite ao próprio utilizador alterar o seu estado (ex: autodegradação para inativo/suspender a própria conta)
exports.updateMyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Valida se o estado fornecido é active ou inactive
    if (!['active', 'inactive'].includes(status))
      return res.status(400).json({ error: 'status must be active or inactive' });
    // Aplica a alteração do estado na BD
    await User.findByIdAndUpdate(req.user._id, { status });
    res.json({ message: 'Status updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/users/refresh
// Efetua a renovação segura do Access Token utilizando a rotação de Refresh Tokens
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    // Valida presença do token de renovação
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Procura o token correspondente nos registos da base de dados
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid refresh token' }); // Erro 401 se for inválido
    }

    // Verifica se o refresh token já expirou temporalmente
    if (new Date() > storedToken.expiresAt) {
      await RefreshToken.deleteOne({ _id: storedToken._id }); // Elimina o token expirado
      return res.status(401).json({ error: 'Refresh token expired' }); // Retorna erro 401
    }

    // Obtém o utilizador associado ao refresh token
    const user = await User.findById(storedToken.user);
    if (!user || user.status === 'inactive') {
      return res.status(401).json({ error: 'User is inactive or not found' });
    }

    // Mecanismo de Segurança: Rotação de Refresh Token (apagar o atual usado e gerar um novo para prevenir roubos)
    await RefreshToken.deleteOne({ _id: storedToken._id });
    const newRefreshToken = await generateRefreshToken(user); // Gera novo token de renovação de 7 dias

    const token = signToken(user); // Assina novo Access Token válido de 15m

    // Retorna o novo par de tokens de acesso e de renovação
    return res.json({
      token,
      refreshToken: newRefreshToken,
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/users/logout-session
// Encerra a sessão ativa invalidando e apagando o Refresh Token correspondente da base de dados
exports.logoutSession = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken }); // Elimina o token do banco de dados para evitar reuso
    }
    return res.json({ message: 'Session logged out successfully' }); // Confirmação de logout
  } catch (e) { res.status(500).json({ error: e.message }); }
};
