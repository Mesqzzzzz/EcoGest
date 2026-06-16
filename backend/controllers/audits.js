const { AuditQuestion, AuditResponse, Project } = require('../models'); // Importa os modelos de Mongoose necessários para as auditorias

// Lista predefinida de perguntas padrão de Eco-Escolas para semear a base de dados caso esteja vazia
const defaultQuestions = [
  // Categoria: Água (Water)
  { category: 'Water', code: 'W1', text: 'Os consumos de água da escola são monitorizados mensalmente?', options: ['Sim', 'Não', 'Parcialmente'] },
  { category: 'Water', code: 'W2', text: 'Existem torneiras com temporizadores ou redutores de caudal nas casas de banho?', options: ['Sim', 'Não', 'Parcialmente'] },
  { category: 'Water', code: 'W3', text: 'A escola recolhe e reutiliza águas pluviais para rega ou limpezas?', options: ['Sim', 'Não', 'Parcialmente'] },
  
  // Categoria: Energia (Energy)
  { category: 'Energy', code: 'E1', text: 'Todas as salas estão equipadas com iluminação LED de alta eficiência?', options: ['Sim', 'Não', 'Parcialmente'] },
  { category: 'Energy', code: 'E2', text: 'Os computadores, projetores e luzes são desligados no final de cada aula?', options: ['Sim', 'Não', 'Parcialmente'] },
  { category: 'Energy', code: 'E3', text: 'A escola possui painéis solares ou outra fonte de energia renovável?', options: ['Sim', 'Não', 'Parcialmente'] },

  // Categoria: Resíduos (Waste)
  { category: 'Waste', code: 'WA1', text: 'Existem ecopontos devidamente sinalizados em todas as salas e espaços comuns?', options: ['Sim', 'Não', 'Parcialmente'] },
  { category: 'Waste', code: 'WA2', text: 'A escola realiza compostagem de resíduos orgânicos da cantina ou jardins?', options: ['Sim', 'Não', 'Parcialmente'] },
  { category: 'Waste', code: 'WA3', text: 'Há políticas ativas para redução do consumo de plástico descartável?', options: ['Sim', 'Não', 'Parcialmente'] }
];

// Função auxiliar interna para verificar e introduzir as perguntas padrão na BD
const seedQuestionsIfNeeded = async () => {
  const count = await AuditQuestion.countDocuments(); // Verifica a quantidade atual de perguntas
  if (count === 0) {
    await AuditQuestion.insertMany(defaultQuestions); // Cria as perguntas caso o contador seja zero
  }
};

// GET /api/audits/questions
// Retorna a lista de perguntas de auditoria ambiental disponíveis para preenchimento
exports.getQuestions = async (req, res) => {
  try {
    await seedQuestionsIfNeeded(); // Executa o seeding se for a primeira vez
    const questions = await AuditQuestion.find(); // Procura todas as perguntas
    res.json({ data: questions }); // Envia resposta JSON
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/audits/responses/:projectId
// Obtém todas as respostas já submetidas para a auditoria de um determinado projeto
exports.getResponses = async (req, res) => {
  try {
    // Procura respostas associadas ao projeto e preenche detalhes da pergunta e do utilizador que respondeu
    const responses = await AuditResponse.find({ project: req.params.projectId })
      .populate('question')
      .populate('answeredBy', 'name');
    res.json({ data: responses });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/audits/responses
// Guarda ou atualiza as respostas da auditoria de um projeto
exports.submitResponses = async (req, res) => {
  try {
    const { projectId, responses } = req.body; // Array de formato [{ questionId, value, comments }]
    // Validação de segurança dos parâmetros obrigatórios
    if (!projectId || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'projectId and responses array required' });
    }

    const saved = [];
    // Itera por cada resposta para calcular o score e efetuar a persistência (upsert)
    for (const r of responses) {
      const { questionId, value, comments } = r;
      
      // Cálculo do score quantitativo com base nas opções qualitativas selecionadas
      let score = 0;
      if (value === 'Sim') score = 100;
      else if (value === 'Parcialmente') score = 50;
      else if (value === 'Não') score = 0;

      // Atualiza o registo se já existir a resposta para esta pergunta no projeto, ou cria um novo se não existir (upsert)
      const response = await AuditResponse.findOneAndUpdate(
        { project: projectId, question: questionId },
        { value, score, comments, answeredBy: req.user._id },
        { new: true, upsert: true } // Upsert ativado
      );
      saved.push(response);
    }

    res.status(201).json({ message: 'Audit responses saved successfully', count: saved.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/audits/report/:projectId
// Compila o relatório estatístico da auditoria do projeto, dividindo por categorias e obtendo o progresso e score geral
exports.getAuditReport = async (req, res) => {
  try {
    await seedQuestionsIfNeeded(); // Assegura que existem perguntas preenchidas
    // Carrega em simultâneo todas as perguntas gerais e todas as respostas do projeto
    const [questions, responses] = await Promise.all([
      AuditQuestion.find(),
      AuditResponse.find({ project: req.params.projectId }).populate('question')
    ]);

    // Extrai uma lista única de categorias ambientais das perguntas existentes
    const categories = [...new Set(questions.map(q => q.category))];
    // Calcula o progresso e a média de score para cada categoria ambiental individualmente
    const categoryScores = categories.map(cat => {
      const catQuestions = questions.filter(q => q.category === cat); // Filtra perguntas da categoria
      const catResponses = responses.filter(r => r.question && r.question.category === cat); // Filtra respostas correspondentes
      
      const answeredCount = catResponses.length;
      const totalCount = catQuestions.length;
      const progress = totalCount ? Math.round((answeredCount / totalCount) * 100) : 0; // Percentagem de preenchimento
      
      // Média aritmética das pontuações das respostas da categoria
      const averageScore = answeredCount 
        ? Math.round(catResponses.reduce((sum, r) => sum + r.score, 0) / answeredCount)
        : 0;

      return {
        category: cat,
        progress,
        averageScore,
        answeredCount,
        totalCount
      };
    });

    // Calcula os indicadores agregados de toda a auditoria do projeto
    const overallAnswered = responses.length;
    const overallTotal = questions.length;
    const overallProgress = overallTotal ? Math.round((overallAnswered / overallTotal) * 100) : 0; // Progresso global
    const overallScore = overallAnswered
      ? Math.round(responses.reduce((sum, r) => sum + r.score, 0) / overallAnswered) // Score de conformidade global
      : 0;

    // Retorna o relatório compilado final
    res.json({
      project: req.params.projectId,
      overallProgress,
      overallScore,
      categoryScores
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
