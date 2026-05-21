const { AuditQuestion, AuditResponse, Project } = require('../models');

// Pre-seeded standard Eco-Escolas questions if DB is empty
const defaultQuestions = [
  // Water
  { category: 'Water', code: 'W1', text: 'Os consumos de água da escola são monitorizados mensalmente?', options: ['Sim', 'Não', 'Parcialmente'] },
  { category: 'Water', code: 'W2', text: 'Existem torneiras com temporizadores ou redutores de caudal nas casas de banho?', options: ['Sim', 'Não', 'Parcialmente'] },
  { category: 'Water', code: 'W3', text: 'A escola recolhe e reutiliza águas pluviais para rega ou limpezas?', options: ['Sim', 'Não', 'Parcialmente'] },
  
  // Energy
  { category: 'Energy', code: 'E1', text: 'Todas as salas estão equipadas com iluminação LED de alta eficiência?', options: ['Sim', 'Não', 'Parcialmente'] },
  { category: 'Energy', code: 'E2', text: 'Os computadores, projetores e luzes são desligados no final de cada aula?', options: ['Sim', 'Não', 'Parcialmente'] },
  { category: 'Energy', code: 'E3', text: 'A escola possui painéis solares ou outra fonte de energia renovável?', options: ['Sim', 'Não', 'Parcialmente'] },

  // Waste
  { category: 'Waste', code: 'WA1', text: 'Existem ecopontos devidamente sinalizados em todas as salas e espaços comuns?', options: ['Sim', 'Não', 'Parcialmente'] },
  { category: 'Waste', code: 'WA2', text: 'A escola realiza compostagem de resíduos orgânicos da cantina ou jardins?', options: ['Sim', 'Não', 'Parcialmente'] },
  { category: 'Waste', code: 'WA3', text: 'Há políticas ativas para redução do consumo de plástico descartável?', options: ['Sim', 'Não', 'Parcialmente'] }
];

const seedQuestionsIfNeeded = async () => {
  const count = await AuditQuestion.countDocuments();
  if (count === 0) {
    await AuditQuestion.insertMany(defaultQuestions);
  }
};

// GET /api/audits/questions
exports.getQuestions = async (req, res) => {
  try {
    await seedQuestionsIfNeeded();
    const questions = await AuditQuestion.find();
    res.json({ data: questions });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/audits/responses/:projectId
exports.getResponses = async (req, res) => {
  try {
    const responses = await AuditResponse.find({ project: req.params.projectId })
      .populate('question')
      .populate('answeredBy', 'name');
    res.json({ data: responses });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/audits/responses
exports.submitResponses = async (req, res) => {
  try {
    const { projectId, responses } = req.body; // responses: Array of { questionId, value, comments }
    if (!projectId || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'projectId and responses array required' });
    }

    const saved = [];
    for (const r of responses) {
      const { questionId, value, comments } = r;
      
      // Calculate a basic numerical score for treatment
      let score = 0;
      if (value === 'Sim') score = 100;
      else if (value === 'Parcialmente') score = 50;
      else if (value === 'Não') score = 0;

      // Upsert response for this question in this project
      const response = await AuditResponse.findOneAndUpdate(
        { project: projectId, question: questionId },
        { value, score, comments, answeredBy: req.user._id },
        { new: true, upsert: true }
      );
      saved.push(response);
    }

    res.status(201).json({ message: 'Audit responses saved successfully', count: saved.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/audits/report/:projectId
exports.getAuditReport = async (req, res) => {
  try {
    await seedQuestionsIfNeeded();
    const [questions, responses] = await Promise.all([
      AuditQuestion.find(),
      AuditResponse.find({ project: req.params.projectId }).populate('question')
    ]);

    const categories = [...new Set(questions.map(q => q.category))];
    const categoryScores = categories.map(cat => {
      const catQuestions = questions.filter(q => q.category === cat);
      const catResponses = responses.filter(r => r.question && r.question.category === cat);
      
      const answeredCount = catResponses.length;
      const totalCount = catQuestions.length;
      const progress = totalCount ? Math.round((answeredCount / totalCount) * 100) : 0;
      
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

    const overallAnswered = responses.length;
    const overallTotal = questions.length;
    const overallProgress = overallTotal ? Math.round((overallAnswered / overallTotal) * 100) : 0;
    const overallScore = overallAnswered
      ? Math.round(responses.reduce((sum, r) => sum + r.score, 0) / overallAnswered)
      : 0;

    res.json({
      project: req.params.projectId,
      overallProgress,
      overallScore,
      categoryScores
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
