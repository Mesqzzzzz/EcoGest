const sequelize    = require('../config/database');
const User         = require('./User');
const Project      = require('./Project');
const ProjectArea  = require('./ProjectArea');
const Activity     = require('./Activity');
const ActivityArea = require('./ActivityArea');
const ActivityParticipant = require('./ActivityParticipant');
const ActivityImage= require('./ActivityImage');
const CouncilMember= require('./CouncilMember');
const Proposal     = require('./Proposal');
const Meeting      = require('./Meeting');
const MeetingDocument = require('./MeetingDocument');
const Report       = require('./Report');
const Backup       = require('./Backup');
const AuthLog      = require('./AuthLog');
const SystemLog    = require('./SystemLog');

// ── Associations ────────────────────────────────────────────────────

// User ↔ Project (coordinator)
Project.belongsTo(User, { foreignKey: 'coordinator_id', as: 'coordinator' });
User.hasMany(Project,   { foreignKey: 'coordinator_id', as: 'coordinated_projects' });

// Project ↔ ProjectArea
Project.hasMany(ProjectArea,  { foreignKey: 'project_id', as: 'areas' });
ProjectArea.belongsTo(Project, { foreignKey: 'project_id' });

// Project ↔ Activity
Project.hasMany(Activity,   { foreignKey: 'project_id', as: 'activities' });
Activity.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Activity creator
Activity.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Activity ↔ ActivityArea
Activity.hasMany(ActivityArea,  { foreignKey: 'activity_id', as: 'areas' });
ActivityArea.belongsTo(Activity, { foreignKey: 'activity_id' });

// Activity ↔ ActivityParticipant
Activity.hasMany(ActivityParticipant, { foreignKey: 'activity_id', as: 'participations' });
ActivityParticipant.belongsTo(Activity, { foreignKey: 'activity_id' });
ActivityParticipant.belongsTo(User,     { foreignKey: 'user_id', as: 'user' });

// Activity ↔ ActivityImage
Activity.hasMany(ActivityImage,  { foreignKey: 'activity_id', as: 'images' });
ActivityImage.belongsTo(Activity, { foreignKey: 'activity_id' });

// Project ↔ CouncilMember ↔ User
CouncilMember.belongsTo(User,    { foreignKey: 'user_id',    as: 'user' });
CouncilMember.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Project.hasMany(CouncilMember,   { foreignKey: 'project_id', as: 'council_members' });
User.hasMany(CouncilMember,      { foreignKey: 'user_id',    as: 'memberships' });

// Project ↔ Proposal
Project.hasMany(Proposal,   { foreignKey: 'project_id', as: 'proposals' });
Proposal.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Proposal.belongsTo(User,    { foreignKey: 'created_by', as: 'author' });
Proposal.belongsTo(User,    { foreignKey: 'reviewed_by', as: 'reviewer' });

// Project ↔ Meeting
Project.hasMany(Meeting,   { foreignKey: 'project_id', as: 'meetings' });
Meeting.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Meeting ↔ MeetingDocument
Meeting.hasMany(MeetingDocument,   { foreignKey: 'meeting_id', as: 'documents' });
MeetingDocument.belongsTo(Meeting, { foreignKey: 'meeting_id' });

// Project ↔ Report
Project.hasMany(Report,   { foreignKey: 'project_id', as: 'reports' });
Report.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// AuthLog ↔ User
AuthLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User, Project, ProjectArea,
  Activity, ActivityArea, ActivityParticipant, ActivityImage,
  CouncilMember, Proposal,
  Meeting, MeetingDocument,
  Report, Backup, AuthLog, SystemLog,
};
