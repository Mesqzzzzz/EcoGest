import http from 'k6/http';
import { sleep, check } from 'k6';

// Configurações do teste de carga
export const options = {
  stages: [
    { duration: '10s', target: 10 }, // Ramp-up: sobe para 10 utilizadores simultâneos em 10 segundos
    { duration: '20s', target: 20 }, // Carga constante: mantém 20 utilizadores simultâneos por 20 segundos
    { duration: '10s', target: 0 },  // Ramp-down: reduz para 0 utilizadores
  ],
  thresholds: {
    // TC011 - RNF1 - Performance: 95% dos pedidos bem-sucedidos têm de ter tempo de resposta inferior a 800ms
    'http_req_duration{my_check:true}': ['p(95)<800'],
    // TC019 - RNF9 - Disponibilidade: taxa de falha de requisições monitorizadas tem de ser inferior a 1%
    'http_req_failed{my_check:true}': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export default function () {
  // 1. Hit no Health Check (Disponibilidade)
  const healthRes = http.get(`${BASE_URL}/api/health`, { tags: { my_check: 'true' } });
  check(healthRes, {
    'health check retorna HTTP 200': (r) => r.status === 200,
    'health check status é ok': (r) => r.json().status === 'ok',
  });
  sleep(1);

  // 2. Hit na listagem pública de atividades (Performance e carga)
  const activitiesRes = http.get(`${BASE_URL}/api/activities`, { tags: { my_check: 'true' } });
  check(activitiesRes, {
    'listagem de atividades retorna HTTP 200': (r) => r.status === 200,
    'atividades retornam array de dados': (r) => Array.isArray(r.json().data),
  });
  sleep(1);

  // 3. Simular tentativa de login falhada (Rate Limiting e segurança)
  const payload = JSON.stringify({
    email: 'nonexistent@escola.pt',
    password: 'wrongpassword',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const loginRes = http.post(`${BASE_URL}/api/users/login`, payload, params);
  check(loginRes, {
    'login falhado retorna status 401 ou 429': (r) => r.status === 401 || r.status === 429,
  });
  sleep(1);
}
