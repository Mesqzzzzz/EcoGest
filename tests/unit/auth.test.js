require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('PE-2 - Unit Tests & TC015 - RNF5 - Data encryption', () => {
  const password = 'mySecurePassword123';
  let hashedPassword = '';

  test('Should encrypt passwords securely using bcryptjs', async () => {
    hashedPassword = await bcrypt.hash(password, 10);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')).toBe(true);
  });

  test('Should verify encrypted passwords successfully', async () => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    expect(isMatch).toBe(true);
    
    const isWrongMatch = await bcrypt.compare('wrongPass', hashedPassword);
    expect(isWrongMatch).toBe(false);
  });
});

describe('TC013 - RNF3 - JWT Authentication & TC020 - RNF10 - Modular code', () => {
  const jwtSecret = 'testSecretKey123';
  const payload = { id: 'user123', role: 'admin' };
  let token = '';

  beforeAll(() => {
    process.env.JWT_SECRET = jwtSecret;
  });

  test('Should sign JWT token payload in a modular way', () => {
    token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('Should decode and validate signed JWT token', () => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.role).toBe(payload.role);
  });

  test('Should fail to validate token with incorrect secret key', () => {
    expect(() => {
      jwt.verify(token, 'invalidSecret');
    }).toThrow();
  });
});
