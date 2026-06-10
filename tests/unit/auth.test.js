require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('PE-2 - Unit Tests & TC015 - RNF5 - Encriptação de dados', () => {
  const password = 'mySecurePassword123';
  let hashedPassword = '';

  test('Deve encriptar passwords de forma segura usando bcryptjs', async () => {
    hashedPassword = await bcrypt.hash(password, 10);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')).toBe(true);
  });

  test('Deve verificar passwords encriptadas com sucesso', async () => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    expect(isMatch).toBe(true);
    
    const isWrongMatch = await bcrypt.compare('wrongPass', hashedPassword);
    expect(isWrongMatch).toBe(false);
  });
});

describe('TC013 - RNF3 - Autenticação JWT & TC020 - RNF10 - Código modular', () => {
  const jwtSecret = 'testSecretKey123';
  const payload = { id: 'user123', role: 'admin' };
  let token = '';

  beforeAll(() => {
    process.env.JWT_SECRET = jwtSecret;
  });

  test('Deve assinar payload do token JWT de forma modular', () => {
    token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('Deve descodificar e validar token JWT assinado', () => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.role).toBe(payload.role);
  });

  test('Deve falhar ao validar token com chave secreta errada', () => {
    expect(() => {
      jwt.verify(token, 'invalidSecret');
    }).toThrow();
  });
});
