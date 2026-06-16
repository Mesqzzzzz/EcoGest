const jwt  = require('jsonwebtoken'); // Importa a biblioteca jsonwebtoken para lidar com a assinatura e verificação de tokens
const { User } = require('../models'); // Importa o modelo de Utilizador para verificar dados no banco de dados

/** Verifica o JWT e coloca req.user */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization; // Obtém o cabeçalho Authorization do pedido HTTP
  if (!header || !header.startsWith('Bearer ')) // Verifica se o cabeçalho existe e segue o formato 'Bearer <token>'
    return res.status(401).json({ error: 'No token provided' }); // Retorna erro 401 caso não haja token

  const token = header.split(' ')[1]; // Extrai apenas a string do token JWT do cabeçalho
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // Descodifica e verifica a assinatura do token
    const user = await User.findById(payload.id).select('-password'); // Procura o utilizador correspondente omitindo a palavra-passe
    if (!user)               return res.status(401).json({ error: 'User not found' }); // Retorna erro caso o utilizador não exista
    if (user.status === 'inactive') // Verifica se a conta do utilizador está inativa
      return res.status(403).json({ error: 'Account is inactive' }); // Retorna erro 403 (Proibido) se inativo
    req.user = user; // Anexa o utilizador autenticado ao objeto de pedido para acesso nas rotas
    next(); // Continua a execução para o próximo middleware ou rota
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' }); // Retorna erro 401 caso o token seja inválido/expirado
  }
};

/** Auth opcional — anexa utilizador se token existir, mas não falha se não houver */
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization; // Obtém o cabeçalho de autorização
  if (!header || !header.startsWith('Bearer ')) return next(); // Se não houver token válido, avança diretamente sem autenticar
  const token = header.split(' ')[1]; // Obtém o token JWT
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // Verifica a integridade e validade do token
    const user = await User.findById(payload.id).select('-password'); // Procura o utilizador correspondente
    if (user && user.status === 'active') req.user = user; // Se o utilizador existir e estiver ativo, anexa-o ao pedido
  } catch { /* ignorar erros e simplesmente prosseguir como utilizador não autenticado */ }
  next(); // Prossegue com o processamento do pedido
};

module.exports = { authenticate, optionalAuth }; // Exporta as funções de middleware
