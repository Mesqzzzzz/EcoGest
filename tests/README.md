# 📖 Guia da Suite de Testes Automatizados — EcoGest

Este documento fornece uma explicação detalhada sobre a arquitetura, as ferramentas utilizadas, a finalidade de cada ficheiro e o funcionamento interno da suite de testes automatizados do projeto **EcoGest**.

---

## 🛠️ 1. Tecnologias & Ferramentas Utilizadas

A suite foi estruturada de forma desacoplada para não interferir na lógica de negócio do sistema principal, recorrendo às seguintes tecnologias de referência na indústria:

1.  **[Jest](https://jestjs.io/) (Test Runner & Assertions)**
    *   **Função**: É o motor de execução principal para os testes funcionais (Unitários, API e UI). Gere o ciclo de vida dos testes (`beforeAll`, `beforeEach`, `afterAll`, etc.) e valida os resultados através de asserções (`expect`).
2.  **[Selenium WebDriver](https://www.selenium.dev/documentation/webdriver/) (Automação de Interface/UI)**
    *   **Função**: Simula um utilizador real interagindo com o browser Chrome. É utilizado para testar a interface gráfica, submeter formulários, clicar em botões, redimensionar janelas e validar fluxos de navegação.
3.  **[Supertest](https://github.com/ladjs/supertest) (Testes de Integração de API)**
    *   **Função**: Efetua chamadas HTTP reais para os endpoints da API do backend sem precisar de carregar a interface. Usado para validar códigos de status HTTP, payloads JSON e a segurança das rotas.
4.  **[Apache JMeter](https://jmeter.apache.org/) (Testes de Carga e Performance)**
    *   **Função**: Ferramenta Java para simulação de múltiplos utilizadores concorrentes. Efetua pedidos sequenciais e concorrentes à API para avaliar a estabilidade sob stresse, tempos de resposta e debitar métricas.
5.  **[Allure Reports](https://allurereport.org/) (Relatórios Visuais)**
    *   **Função**: Gera relatórios visuais ricos em formato HTML, agregando capturas de ecrã (screenshots) automáticas de falhas nos testes de UI e métricas detalhadas.
6.  **[Jira Xray Cloud API](https://docs.getxray.app/display/XRAYCLOUD/Xray+Cloud+API)**
    *   **Função**: Permite a integração CI/CD enviando os resultados dos testes automatizados diretamente para as chaves de teste mapeadas no Jira (ex: `PE-1` a `TC020`).

---

## 📁 2. Estrutura de Pastas e Finalidade de Cada Ficheiro

Abaixo encontra-se o mapeamento completo dos ficheiros criados no diretório `/tests` e na raiz do projeto:

```bash
EcoGest/
├── package.json              # Dependências da suite de testes e scripts de atalho
├── Jenkinsfile               # Pipeline CI/CD para automação total no Jenkins
└── tests/
    ├── README.md             # Este guia completo explicativo da suite de testes
    ├── jest.config.js        # Configurações globais do Jest e Allure Reports
    │
    ├── unit/
    │   └── auth.test.js      # Testes unitários de lógica isolada (encriptação e JWT)
    │
    ├── api/
    │   └── api.test.js       # Testes integrados de rotas e segurança HTTP da API
    │
    ├── ui/
    │   ├── pages/            # Implementação do Padrão Page Object Model (POM)
    │   │   ├── base.page.js  # Classe base com métodos Selenium reutilizáveis
    │   │   ├── login.page.js # Ações e seletores da página de Login
    │   │   └── register.page.js # Ações e seletores da página de Registo
    │   └── specs/
    │       └── ui.test.js    # Casos de teste de interface (E2E) e responsividade
    │
    ├── performance/
    │   └── load_test.jmx     # Plano de testes de stresse e performance para o Apache JMeter
    │
    └── xray/
        └── xray_uploader.js  # Conector para importação de resultados no Jira Xray
```

### 📝 Descrição Detalhada dos Ficheiros

#### Configuração Geral:
*   **`package.json`**: Adiciona dependências de testes (`jest`, `selenium-webdriver`, `supertest`, `allure-jest`, `axios`, `bcryptjs`, `jsonwebtoken`) e os comandos `npm test`, `npm run test:unit`, `npm run test:api`, `npm run test:ui`, `npm run test:perf`, `npm run test:all` (executa todos os testes e abre os relatórios) e `npm run jira-upload` (atualiza os itens no Jira).
*   **`tests/jest.config.js`**: Configura o ambiente de testes como `allure-jest/node`, define o diretório de relatórios (`./tests/allure-results`) e estabelece o timeout padrão de 60 segundos por teste.
*   **`Jenkinsfile`**: Pipeline completo declarativo. Realiza o checkout do git, instala dependências, inicia o backend/frontend, executa as suites de testes sequencialmente, corre o JMeter, carrega relatórios no Jira e gera o painel visual do Allure.
*   **`run_all_tests.sh`**: Script utilitário em Bash para executar toda a suite de testes locais, gerar relatórios e abri-los de imediato no browser.

#### 🔐 Testes Unitários (`tests/unit/`):
*   **`auth.test.js`**: Testa funções de segurança do Node.js de forma totalmente isolada (sem aceder a base de dados).
    *   **O que faz**: Valida se a encriptação de palavras-passe do `bcryptjs` gera hashes seguros e corretos, e se a assinatura/validação de tokens JWT através do `jsonwebtoken` emite payloads válidos ou falha com chaves secretas incorretas.

#### 🌐 Testes de API & Requisitos (`tests/api/`):
*   **`api.test.js`**: Cobertura consolidada executável dos **14 Requisitos Funcionais (RFs)** e **10 Requisitos Não Funcionais (RNFs)** do EcoGest.
    *   **O que faz**:
        *   **RF1 a RF14 & RF21**: Testa fluxos completos de negócio (registo, login, atualização de perfil, alteração de estado de utilizadores/atividades, criação e edição de projetos/atividades, atribuição de coordenador, inscrições, criação de reuniões e geração de dados para relatórios).
        *   **RNF1 a RNF10**: Valida garantias não funcionais de performance (resposta da API < 800ms), escalabilidade, expiração de JWT, middlewares, hashing bcryptjs, responsividade/usabilidade, disponibilidade, modularidade do código MVC e robustez.

#### 🖥️ Testes de Interface UI (`tests/ui/`):
Segue a arquitetura **Page Object Model (POM)**, onde os seletores de elementos e as ações são encapsulados em ficheiros separados das asserções de teste.
*   **`pages/base.page.js`**: Inicializa o Chrome (com suporte a modo `--headless` e definições de tamanho de janela). Contém invólucros seguros para métodos Selenium (`find`, `click`, `write`, `getText`) que usam esperas explícitas de até 10 segundos, além da lógica para guardar capturas de ecrã em `tests/screenshots/` quando um teste falha.
*   **`pages/login.page.js`**: Guarda seletores do formulário de login (`email`, `password`, botão `submit`) e oferece o método `login(email, pass)`.
*   **`pages/register.page.js`**: Mapeia campos do formulário de registo e oferece o método `register(nome, email, pass, confirmPass)`.
*   **`specs/ui.test.js`**: Define os fluxos reais de teste de UI:
    *   **Isolamento**: Um gancho `beforeEach` limpa o `localStorage` e cookies a cada execução para evitar persistência de sessão de testes passados.
    *   **Casos**:
        *   `TC001`: Regista um utilizador aleatório e garante que é redirecionado para `/dashboard`.
        *   `TC002`: Efetua login do coordenador e garante o redirecionamento.
        *   `TC003`: Inicia sessão e clica na navegação para a página de perfil para validar inputs.
        *   `TC004`: Autentica o administrador para validar a interface de criação de projetos.
        *   `TC016/TC017`: Redimensiona a janela para dimensões móveis (`375x812`) e valida se o ecrã de login ajusta o layout (responsividade).

#### ⚡ Testes de Performance (`tests/performance/`):
*   **`load_test.jmx`**: Plano de testes de carga para o Apache JMeter.
    *   **O que faz**: Rampa de utilizadores simultâneos (até 20 threads) a efetuar pedidos periódicos à API (health check, listagem de atividades e dezenas de tentativas de login falhas). Inclui asserções de resposta HTTP 200, validação de JSON `status = ok` e tratamento correto de erros de autenticação previstos (HTTP 401 e 429).

#### 📤 Conector Jira Xray (`tests/xray/`):
*   **`xray_uploader.js`**: Script de integração.
    *   **O que faz**: Procura as credenciais Xray no ficheiro `.env` e constrói um payload JSON formatado. Caso as credenciais não estejam definidas no sistema, executa em **modo simulação (dry-run)**, exibindo o payload exato que seria transmitido à API Cloud do Jira Xray.

---

## ⚙️ 3. Como os Testes Funcionam em Lote (Sem conflitos)

Nas nossas correções de robustez, identificámos e mitigámos dois problemas comuns em suites de testes integradas:

1.  **Poluição de Sessão**:
    *   *Problema*: O Selenium reutiliza a mesma janela/instância do browser por questões de desempenho. Se o teste A fizer login e o teste B visitar a página de login, o React redirecionará o browser imediatamente para `/dashboard`, quebrando o teste B que esperava ver o formulário de login.
    *   *Solução*: No ficheiro `ui.test.js`, o `beforeEach` executa:
        ```javascript
        await driver.get(baseUrl);
        await driver.executeScript('window.localStorage.clear();');
        await driver.manage().deleteAllCookies();
        ```
        Isto garante que cada teste se inicia num browser limpo e desautenticado.
2.  **Rate Limiting (Bloqueio de IP)**:
    *   *Problema*: O backend do EcoGest tem um limitador de segurança que permite apenas 5 tentativas de login por IP a cada minuto. O Jest, a UI e o JMeter efetuam dezenas de logins em poucos segundos, ativando o limitador e resultando em erros HTTP `429 Too Many Requests`.
    *   *Solução*: No ficheiro de ambiente do backend `backend/.env`, definimos `LOGIN_RATE_LIMIT=1000`. Desta forma, o servidor passa a aceitar todas as requisições legítimas dos testes sem bloquear o IP de testes.
