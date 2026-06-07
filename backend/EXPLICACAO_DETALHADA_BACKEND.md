# 🌿 Documentação Técnica Detalhada do Backend — EcoGest

Este documento fornece um guia minucioso sobre o funcionamento de todas as secções, ficheiros, funções e fluxos lógicos que compõem o backend do **EcoGest**. Foi concebido para ser super explicativo, cobrindo o comportamento do código, regras de negócio e integrações tecnológicas.

---

## 📂 1. Ponto de Entrada: `app.js`

O ficheiro [`app.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/app.js) é o ponto de partida do servidor. Abaixo está a análise detalhada do código:

*   **Configuração de Variáveis de Ambiente (Linha 1):**
    ```javascript
    require('dotenv').config();
    ```
    *   Carrega as variáveis definidas no ficheiro `.env` para o objeto global `process.env`. Isto permite que segredos (como chaves de cifragem ou credenciais da base de dados) fiquem separados do código fonte.
*   **Importação de Módulos Core (Linhas 2-5):**
    *   `express`: Framework HTTP para criação e gestão de rotas e middlewares.
    *   `cors`: Middleware para autorizar pedidos de outras origens (como o frontend React que corre em `http://localhost:5173`).
    *   `path`: Módulo do Node para lidar com caminhos de pastas e ficheiros de forma portável entre SOs.
    *   `connectDB`: Módulo customizado que estabelece ligação à base de dados MongoDB.
*   **Instanciação e Middlewares Globais (Linhas 7-12):**
    *   `const app = express();`: Cria a aplicação Express.
    *   `app.use(cors());`: Permite que o frontend faça requisições AJAX ao backend sem restrições de CORS.
    *   `app.use(express.json());`: Analisa os corpos dos pedidos (body) que vêm formatados em JSON, mapeando-os para `req.body`.
    *   `app.use('/uploads', express.static(path.join(__dirname, 'uploads')));`: Expõe a pasta `/uploads` publicamente na internet, permitindo que imagens de atividades ou PDFs de atas sejam visualizados e descarregados no navegador do cliente.
*   **Mapeamento de Rotas (Linhas 15-21):**
    *   Divide a API em módulos (Users, Activities, Proposals, Meetings, Projects, Admin, Audits), direcionando caminhos HTTP específicos (ex: `/api/users`) para os seus respetivos ficheiros de rotas.
*   **Documentação Swagger (Linhas 24-26):**
    *   Disponibiliza uma página interativa na rota `/api-docs` para testar os endpoints em tempo real, carregando as definições contidas em `docs/swagger.json`.
*   **Monitorização de Saúde (Health Check) (Linha 29):**
    *   `app.get('/api/health', ...)`: Endpoint rápido que o servidor de monitorização consome para verificar se a API está online e conectada.
*   **Middleware de Erros Global (Linhas 32-35):**
    *   Função de assinatura `(err, req, res, next)` que captura qualquer erro lançado nos controladores do Express. Regista o rastreador de pilha no terminal e retorna uma resposta limpa (`HTTP 500` por padrão ou o código específico do erro) para que o servidor não sofra um "crash" fatal.
*   **Arranque do Servidor (Linhas 38-44):**
    *   Define a porta (`process.env.PORT` ou `3000`), chama a promessa `connectDB()` e, em caso de sucesso na conexão com o MongoDB, inicia a escuta HTTP imprimindo a mensagem de sucesso no terminal.

---

## ⚙️ 2. Base de Dados: `config/database.js`

O ficheiro [`config/database.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/config/database.js) liga a aplicação ao MongoDB:

*   **`connectDB = async () => { ... }`**:
    *   Usa o Mongoose para conectar à URI especificada no `.env` (`process.env.MONGODB_URI`).
    *   **Configuração `serverSelectionTimeoutMS: 10000`**: Define um limite de 10 segundos para tentar conectar antes de lançar um erro, garantindo que o servidor falhe rapidamente caso o MongoDB Atlas ou local esteja offline.
    *   **Tratamento de Erros**: Se a ligação falhar, o bloco `catch` apanha o erro, imprime uma mensagem com o motivo e força o encerramento do processo (`process.exit(1)`), uma vez que a API não pode funcionar sem a base de dados.

---

## 🛡️ 3. Middlewares de Segurança (`middleware/`)

### A. Autenticação e Rotação de Sessão ([`middleware/auth.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/middleware/auth.js))

Contém a lógica de decodificação e validação de tokens JWT.

*   **`authenticate` (Middleware de Bloqueio)**:
    1.  Lê o cabeçalho `Authorization`. Se não existir ou não começar com `"Bearer "`, retorna de imediato `HTTP 401 Unauthorized`.
    2.  Extrai o token encriptado.
    3.  Tenta decifrar o token com a variável `process.env.JWT_SECRET`. Se o token expirou ou é inválido, lança uma exceção e retorna `HTTP 401`.
    4.  Procura o utilizador correspondente no banco de dados usando o ID extraído do payload do token, excluindo o campo de password por segurança (`.select('-password')`).
    5.  Se o utilizador não existir ou o seu estado for `'inactive'`, retorna `HTTP 401` ou `HTTP 403 Forbidden` (Conta Inativa).
    6.  Se tudo for válido, coloca o objeto do utilizador em `req.user` para uso nos controladores e chama `next()`.
*   **`optionalAuth` (Middleware Informativo)**:
    *   Realiza os mesmos passos de verificação que o `authenticate`, mas **nunca bloqueia** o pedido caso o token seja inválido ou inexistente. Apenas anexa o utilizador a `req.user` se ele estiver autenticado, permitindo que a rota sirva dados públicos para visitantes e dados personalizados para utilizadores logados (como verificação de inscrição).

### B. Controlo de Permissões ([`middleware/roles.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/middleware/roles.js))

Implementa o modelo **RBAC (Role-Based Access Control)**.

*   **`authorize(...roles)`**:
    *   É uma função que recebe múltiplos argumentos (ex: `'admin'`, `'coordinator'`) e retorna um middleware do Express.
    *   Verifica se o utilizador está autenticado (`req.user`). Se não estiver, bloqueia com `HTTP 401`.
    *   Verifica se a função (`role`) do utilizador está contida no array de permissões autorizadas (`roles.includes(req.user.role)`). Se não estiver, bloqueia o pedido retornando `HTTP 403 Forbidden`.

---

## 📁 4. Upload de Ficheiros: `utils/upload.js`

Este ficheiro configura a biblioteca **Multer** para gerir uploads físicos para o disco rígido do servidor.

*   **Criação Física de Pasta (Linhas 5-9):**
    *   Verifica se a pasta `backend/uploads/` existe utilizando `fs.existsSync`. Caso não exista, cria-a automaticamente (`fs.mkdirSync`).
*   **Configuração do Armazenamento (`multer.diskStorage`):**
    *   `destination`: Determina onde guardar o ficheiro (direcionado para a pasta `uploads/`).
    *   `filename`: Formata o nome do ficheiro concatenando a data atual (`Date.now()`) e o nome original higienizado (substituindo espaços por hífenes com `replace(/\s+/g, '-')`). Isto garante que os ficheiros nunca se sobreponham uns aos outros, mesmo que tenham o mesmo nome.
*   **Validação de Ficheiros (`fileFilter`):**
    *   Permite apenas o carregamento de imagens (`image/jpeg`, `image/png`) ou documentos PDF (`application/pdf`). Rejeita qualquer outro formato para evitar riscos de segurança (como scripts maliciosos `.sh` ou `.js`).
*   **Limitação de Tamanho:**
    *   Impõe um limite máximo de **5MB** por ficheiro para conservar espaço em disco e evitar ataques de negação de serviço (DoS) com ficheiros gigantescos.

---

## 🗄️ 5. Modelos de Dados (`models/`)

O backend do EcoGest utiliza o Mongoose para interagir com o MongoDB, definindo esquemas e tipos de dados estritos:

| Nome do Modelo | Ficheiro | Descrição e Propósito dos Campos Principais |
| :--- | :--- | :--- |
| **`User`** | [`User.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/User.js) | Guarda utilizadores. Campos: `name`, `email` (único, lowercase), `password` (encriptado), `role` (função: admin, coordinator, secretary, council_member, user) e `status` (active/inactive). |
| **`Project`** | [`Project.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/Project.js) | Representa o ano letivo das Eco-Escolas. Campos: `name`, `year` (ano letivo único), `coordinator` (chave estrangeira para `User`) e `status` (`planning`, `active`, `finished`). |
| **`Activity`** | [`Activity.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/Activity.js) | Detalha as ações ambientais. Campos: `name`, `description`, `location`, `startDate`, `endDate`, `status` (`planned`, `active`, `completed`), `visibility` (`public`, `private`) e `areas` (temas associados). |
| **`ActivityParticipant`** | [`ActivityParticipant.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/ActivityParticipant.js) | Tabela de ligação. Relaciona uma atividade com um utilizador registado (`user`) ou com um convidado externo temporário (`guestName`, `guestEmail`). |
| **`ActivityImage`** | [`ActivityImage.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/ActivityImage.js) | Guarda as fotografias das atividades. Campos: `imageUrl` (caminho estático) e o utilizador que carregou a imagem. |
| **`CouncilMember`** | [`CouncilMember.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/CouncilMember.js) | Associa utilizadores ao Conselho de um projeto anual. Campos: `user`, `project` e `role` específico (ex: Presidente, Secretário). |
| **`Proposal`** | [`Proposal.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/Proposal.js) | Sugestões de ideias. Campos: `title`, `description`, `area`, `status` (`pending`, `approved`, `rejected`), autor (`createdBy`) e revisor (`reviewedBy`). |
| **`Meeting`** | [`Meeting.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/Meeting.js) | Reuniões do conselho. Campos: `name`, `date`, `description` e suporte para Soft Delete (`deletedAt` que omite registos sem os apagar fisicamente da BD). |
| **`MeetingDocument`** | [`MeetingDocument.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/MeetingDocument.js) | Ficheiros de reuniões. Campos: `documentUrl`, `type` (`agenda`, `minutes`, `other`) e chave estrangeira para o utilizador que fez o upload. |
| **`AuditQuestion`** | [`AuditQuestion.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/AuditQuestion.js) | Perguntas padrão para a Auditoria Ambiental. Campos: `category` (Água, Energia, Resíduos), `code` (ex: W1), `text` da pergunta e `options` de resposta. |
| **`AuditResponse`** | [`AuditResponse.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/AuditResponse.js) | Guarda as respostas da auditoria escolar. Campos: `question`, `project` (ano letivo), `value` (Sim, Não, Parcialmente), `score` (0, 50 ou 100) e `comments`. |
| **`RefreshToken`** | [`RefreshToken.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/RefreshToken.js) | Armazena tokens de renovação para segurança de login. Campos: `token`, utilizador associado e data de expiração. |
| **`AuthLog`** | [`AuthLog.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/AuthLog.js) | Registo de acessos para segurança. Campos: IP, navegador (user-agent), sucesso e ação efetuada (login falhado/sucedido). |
| **`SystemLog`** | [`SystemLog.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/SystemLog.js) | Registo de auditoria interna para operações administrativas sensíveis. |
| **`Backup`** | [`Backup.js`](file:///Users/mesquita/ESMAD/webp2/EcoGest/backend/models/Backup.js) | Regista backups de sistema. Campos: `fileName`, `filePath` (caminho em disco), `size` e autor do backup. |

---

## 🧠 6. Detalhe de Controladores e Funções (`controllers/`)

### A. Autenticação e Utilizadores: `controllers/users.js`

Gere toda a segurança, login e ciclo de sessões dos utilizadores.

*   **`signToken(user)` (Auxiliar - Linha 6):**
    *   Gera um token JWT contendo o `id` e `role` do utilizador. Tem validade de 15 minutos e é assinado com o `JWT_SECRET` da aplicação.
*   **`generateRefreshToken(user)` (Auxiliar - Linha 11):**
    *   Gera uma string criptográfica aleatória de 80 caracteres (`crypto.randomBytes(40).toString('hex')`). Guarda este token na base de dados (`RefreshToken`) com uma data de expiração fixada em **7 dias no futuro** e associa-o ao utilizador.
*   **`register` (Endpoint: POST `/api/users` - Linha 20):**
    *   Lê os campos `name`, `email` e `password`.
    *   Valida se a password tem pelo menos 6 caracteres.
    *   Verifica se o e-mail já existe na base de dados (ignorando maiúsculas com `.toLowerCase()`). Se existir, retorna `HTTP 409 Conflict`.
    *   Encripta a password usando a função de Hash `bcrypt.hash(password, 10)` (onde 10 é o número de salt rounds).
    *   Cria o utilizador na base de dados com a password encriptada e retorna `HTTP 201 Created`.
*   **`login` (Endpoint: POST `/api/users/login` - Linha 43):**
    *   **Rate Limiting**: Antes de tudo, extrai o IP da requisição (`req.ip`) e conta as tentativas registadas na coleção `AuthLog` no último minuto (60.000 ms). Se o número for maior ou igual a 5 (ou valor definido em `LOGIN_RATE_LIMIT`), responde imediatamente com `HTTP 429 Too Many Requests`.
    *   Pesquisa o utilizador pelo e-mail fornecido.
    *   Compara a password submetida com a password encriptada guardada na BD usando `bcrypt.compare`.
    *   **Registo de Acesso**: Cria um registo na coleção `AuthLog` documentando a tentativa (se teve sucesso ou falhou, o IP do cliente e as informações do navegador).
    *   Se as credenciais estiverem incorretas, retorna `HTTP 401 Unauthorized`.
    *   Se a conta estiver inativa (`user.status === 'inactive'`), retorna `HTTP 403 Forbidden`.
    *   Caso tudo esteja correto, emite o Access Token, gera o Refresh Token e envia ambos ao cliente com os dados do utilizador.
*   **`refresh` (Endpoint: POST `/api/users/refresh` - Linha 118):**
    *   Recebe o token de renovação enviado pelo cliente.
    *   Procura o token na base de dados. Se não for encontrado, retorna `HTTP 401`.
    *   Verifica se o token expirou. Se sim, remove o token do banco e responde `HTTP 401`.
    *   Se for válido, ativa a **Rotação de Refresh Token**: apaga o token antigo utilizado, gera um novo Refresh Token e um novo Access Token, devolvendo o novo par de chaves ao cliente. Isto impede que um atacante use um Refresh Token antigo intercetado.
*   **`logoutSession` (Endpoint: POST `/api/users/logout-session` - Linha 154):**
    *   Apaga o Refresh Token correspondente na base de dados, invalidando a sessão.

### B. Administração e Analytics: `controllers/admin.js`

Controla a agregação de dados e as operações de gestão.

*   **`getDashboard` (Endpoint: GET `/api/admin/dashboard` - Linha 5):**
    *   Utiliza `Promise.all` para executar 6 contagens na base de dados em paralelo (total de atividades, divididas por estados `planned`, `active`, `completed`, total de inscrições de participantes e propostas pendentes). Isto otimiza o tempo de resposta do servidor.
    *   **Métricas dos Últimos 6 Meses**: Calcula de forma dinâmica uma lista dos últimos 6 meses a partir da data atual. Pesquisa atividades concluídas e fotos publicadas nesse intervalo e filtra-as mês a mês para desenhar um gráfico estatístico no frontend.
*   **`createUser` (Endpoint: POST `/api/admin/users` - Linha 79):**
    *   Cria uma conta diretamente do painel administrativo.
    *   **Regra de Barreira (Boundary Check)**: Se o utilizador logado não for `admin` (ex: for um `coordinator`), o sistema bloqueia tentativas de atribuir privilégios de `'admin'` ou `'coordinator'` a outras contas, prevenindo escalada de privilégios.
*   **`updateUser` / `updateUserStatus` (Endpoints: PATCH `/api/admin/users/:id` - Linhas 99 e 120):**
    *   Modifica dados ou ativa/desativa contas.
    *   **Regra de Barreira**: Utilizadores que não sejam administradores principais estão proibidos de desativar ou alterar dados de contas pertencentes a Administradores ou Coordenadores.

### C. Atividades e Calendário: `controllers/activities.js`

Gere a publicação e interação com as iniciativas escolares.

*   **`getActivities` (Endpoint: GET `/api/activities` - Linha 4):**
    *   **Controlo de Visibilidade**: Se o visitante não estiver autenticado ou for apenas um utilizador comum (`role === 'user'`), o filtro força a visibilidade para `'public'`. Apenas coordenadores/admin podem ver atividades privadas ou em planeamento interno.
    *   **Filtros Dinâmicos**: Aplica filtros parciais por nome (usando Regex Insensível com `/i`), área ecológica ou intervalo de datas.
    *   **Paginação**: Implementa limites e saltos de dados (`skip((page - 1) * limit).limit(limit)`) para garantir que listas gigantescas não degradem a performance da base de dados.
    *   **Mapeamento de Participação**: Para cada atividade retornada, o backend pesquisa se o utilizador logado já se encontra inscrito, enviando a flag `user_participation.is_participating` como `true` ou `false` e o respetivo ID da inscrição para facilitar o cancelamento.
*   **`participate` (Endpoint: POST `/api/activities/:id/participations` - Linha 71):**
    *   Gere inscrições em atividades ativas.
    *   Se o utilizador estiver logado, inscreve-o de forma direta.
    *   Se for um visitante anónimo (ex: encarregado de educação ou vizinho da comunidade), exige o preenchimento de nome e e-mail no corpo do pedido, validando se o e-mail não se inscreveu previamente na mesma atividade.
*   **`uploadPhoto` (Endpoint: POST `/api/activities/:id/photos` - Linha 151):**
    *   Consome o middleware do Multer. Se o ficheiro for enviado e validado, regista o caminho `/uploads/nome_ficheiro` na coleção `ActivityImage`, associando a imagem como evidência da atividade.

### D. Propostas Ecológicas: `controllers/proposals.js`

Processo de triagem de ideias submetidas pela comunidade.

*   **`getProposals` (Endpoint: GET `/api/proposals` - Linha 4):**
    *   Membros do conselho (`council_member`) apenas conseguem visualizar as propostas que eles próprios submeteram. Coordenadores e administradores têm acesso completo a todas as propostas submetidas na plataforma.
*   **`updateStatus` (Endpoint: PATCH `/api/admin/proposals/:id/status` - Linha 43):**
    *   Gere a aprovação ou rejeição de uma proposta.
    *   **Automação Importante**: Se o coordenador aprovar a proposta (`status === 'approved'`), o controlador invoca diretamente o modelo de Atividades e **cria de forma automática** uma nova atividade em estado de planeamento (`planned`) com o título, descrição, datas e áreas ecológicas herdados da proposta aprovada.

### E. Auditorias Ecológicas: `controllers/audits.js`

Motor de cálculo dinâmico da sustentabilidade escolar.

*   **`seedQuestionsIfNeeded` (Auxiliar - Linha 21):**
    *   Garante que o banco de perguntas dinâmicas (Água, Energia, Resíduos) nunca fica vazio. Se não houver perguntas na coleção, povoa-a com o banco padrão de 9 questões do Eco-Escolas de forma automática.
*   **`submitResponses` (Endpoint: POST `/api/audits/responses` - Linha 48):**
    *   Grava as respostas fornecidas para cada questão num ano letivo (projeto) específico.
    *   **Cálculo de Score**: Associa automaticamente pontuações matemáticas de acordo com a resposta: `"Sim"` = 100 pontos; `"Parcialmente"` = 50 pontos; `"Não"` = 0 pontos.
    *   **Upsert Dinâmico**: Utiliza o método `findOneAndUpdate` do Mongoose com a opção `{ upsert: true }`. Isto significa que se for a primeira vez que respondem à pergunta, o registo é criado. Se já existir uma resposta para essa pergunta naquele ano letivo, o registo é atualizado com o novo valor e nota de comentário.
*   **`getAuditReport` (Endpoint: GET `/api/audits/report/:projectId` - Linha 79):**
    *   Gera um relatório de auditoria em tempo real.
    *   Calcula o progresso de preenchimento (percentagem de perguntas respondidas em relação ao total) e a **média aritmética de pontuação** por cada categoria individual e, no final, calcula a pontuação global e progresso total da escola para o projeto.

### F. Reuniões do Conselho: `controllers/meetings.js`

Organização dos encontros do conselho ecológico.

*   **`deleteMeeting` (Soft Delete - Linha 50):**
    *   Em vez de eliminar fisicamente a reunião do banco de dados (o que apagaria o histórico), este controlador marca o campo `deletedAt` com a data atual. Todas as pesquisas normais de listagem de reuniões filtram por `{ deletedAt: null }`, garantindo integridade de dados enquanto escondem a reunião.
*   **`uploadDocument` (Endpoint: POST `/api/meetings/:id/documents` - Linha 79):**
    *   Carrega agendas ou atas no servidor, associando o ficheiro PDF guardado na pasta `/uploads` à respetiva reunião.

### G. Backups de Segurança: `controllers/backups.js`

Garante a resiliência dos dados da plataforma.

*   **`createBackup` (Endpoint: POST `/api/admin/backups` - Linha 6):**
    *   Gera um ficheiro JSON único na pasta `/backups` contendo o estado atual da plataforma, registando as informações do tamanho e data de criação no modelo `Backup`.

---

## 🛣️ 7. Mapeamento Geral de Rotas e Segurança

Abaixo está o resumo dos endpoints definidos no backend, as funções correspondentes dos controladores chamadas e a sua respetiva barreira de proteção:

| Rota HTTP | Função Chamada | Proteção Aplicada | Propósito do Endpoint |
| :--- | :--- | :--- | :--- |
| **POST `/api/users/`** | `usersController.register` | Público | Registo de novos utilizadores na plataforma. |
| **POST `/api/users/login`** | `usersController.login` | Público (Rate limited) | Autenticação de utilizador, gera tokens e logs de acesso. |
| **POST `/api/users/refresh`** | `usersController.refresh` | Público | Renovação de tokens de acesso expirados. |
| **POST `/api/users/logout-session`**| `usersController.logoutSession` | Público | Encerramento de sessão ativa. |
| **GET `/api/users/me`** | `usersController.getMe` | Autenticado | Obtém informações do perfil logado. |
| **PATCH `/api/users/me`** | `usersController.updateMe` | Autenticado | Atualiza nome, email ou password do utilizador logado. |
| **GET `/api/activities/`** | `activitiesController.getActivities` | Opcional | Lista atividades (visitantes anónimos apenas veem públicas). |
| **POST `/api/activities/:id/participations`** | `activitiesController.participate` | Opcional | Inscreve utilizador ou convidado numa atividade ativa. |
| **DELETE `/api/activities/:id/participations/:pid`** | `activitiesController.cancelParticipation`| Autenticado | Cancela a participação do utilizador autenticado. |
| **POST `/api/activities/:id/photos`**| `activitiesController.uploadPhoto` | Autenticado (Coordenador/Membro Conselho) | Faz o upload de foto de evidência da atividade. |
| **GET `/api/proposals/`** | `proposalsController.getProposals` | Autenticado (Admin/Coordenador/Membro) | Lista propostas (Membros veem apenas as próprias). |
| **POST `/api/proposals/`** | `proposalsController.createProposal` | Autenticado (Membro do Conselho) | Submete uma nova proposta de atividade. |
| **PATCH `/api/admin/proposals/:id/status`** | `proposalsController.updateStatus` | Autenticado (Admin/Coordenador) | Aprova/rejeita proposta (se aprovada, gera atividade). |
| **POST `/api/meetings/`** | `meetingsController.createMeeting` | Autenticado (Secretário/Admin) | Cria uma nova reunião de conselho. |
| **POST `/api/meetings/:id/documents`** | `meetingsController.uploadDocument` | Autenticado (Secretário/Admin) | Carrega PDF de ata ou agenda da reunião. |
| **GET `/api/audits/questions`** | `auditsController.getQuestions` | Autenticado | Obtém o caderno de perguntas de auditoria. |
| **POST `/api/audits/responses`** | `auditsController.submitResponses` | Autenticado (Coordenador/Membro Conselho) | Submete respostas e notas para a auditoria de um ano. |
| **GET `/api/audits/report/:projectId`**| `auditsController.getAuditReport` | Autenticado | Calcula progresso e pontuações do relatório ecológico. |
| **POST `/api/admin/backups`** | `backupsController.createBackup` | Autenticado (Admin) | Executa o backup da base de dados. |
