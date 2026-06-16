// Importa cada um dos modelos do Mongoose de forma individual
const User               = require('./User'); // Modelo de Utilizador (autenticação e perfis)
const Project            = require('./Project'); // Modelo de Projeto (iniciativas ecológicas)
const ProjectArea        = require('./ProjectArea'); // Modelo de Área geográfica de intervenção do projeto
const Activity           = require('./Activity'); // Modelo de Atividade (ações ambientais associadas a projetos)
const ActivityParticipant= require('./ActivityParticipant'); // Modelo de Participantes de Atividades (ligação utilizador-atividade)
const ActivityImage      = require('./ActivityImage'); // Modelo de Imagens/Fotos das Atividades realizadas
const CouncilMember      = require('./CouncilMember'); // Modelo de Membro do Conselho Consultivo
const Proposal           = require('./Proposal'); // Modelo de Proposta de iniciativa ambiental
const Meeting            = require('./Meeting'); // Modelo de Reunião de conselho
const MeetingDocument    = require('./MeetingDocument'); // Modelo de Documentos ou atas de reuniões
const Report             = require('./Report'); // Modelo de Relatório anual ou periódico de impacto
const Backup             = require('./Backup'); // Modelo de Registo de Backups de base de dados
const AuthLog            = require('./AuthLog'); // Modelo de Histórico/Log de tentativas de autenticação
const SystemLog          = require('./SystemLog'); // Modelo de Logs gerais de auditoria de operações do sistema
const AuditQuestion      = require('./AuditQuestion'); // Modelo de Perguntas de Auditoria de conformidade
const AuditResponse      = require('./AuditResponse'); // Modelo de Respostas às perguntas de auditoria de projetos
const RefreshToken       = require('./RefreshToken'); // Modelo de Refresh Tokens para manter sessões ativas

// Exporta todos os modelos agrupados num único objeto para simplificar importações noutros locais do backend
module.exports = {
  User, Project, ProjectArea,
  Activity, ActivityParticipant, ActivityImage,
  CouncilMember, Proposal,
  Meeting, MeetingDocument,
  Report, Backup, AuthLog, SystemLog,
  AuditQuestion, AuditResponse, RefreshToken
};
