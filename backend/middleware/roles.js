/**
 * Role-based access control middleware factory.
 * Usage: authorize('admin', 'coordinator')
 */
const authorize = (...roles) => (req, res, next) => {
  // Verifica se o utilizador está autenticado (se existe req.user no pedido)
  if (!req.user)
    return res.status(401).json({ error: 'Authentication required' }); // Retorna 401 se não estiver autenticado
  // Verifica se a função (role) do utilizador atual está incluída nas funções autorizadas
  if (!roles.includes(req.user.role))
    return res.status(403).json({ error: 'Insufficient permissions' }); // Retorna 403 se não tiver permissão
  next(); // Permite avançar caso o utilizador tenha permissão adequada
};

module.exports = { authorize }; // Exporta o middleware de autorização baseado em perfis
