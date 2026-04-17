const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const proposalsController = require('../controllers/proposals');
const backupsController = require('../controllers/backups');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// Dashboard & Stats
router.get('/dashboard', authenticate, authorize('admin', 'coordinator'), adminController.getDashboard);
router.get('/report', authenticate, authorize('admin'), adminController.getReport);
router.post('/report', authenticate, authorize('admin'), adminController.generateReport);

// User Management
router.get('/users', authenticate, authorize('admin'), adminController.getUsers);
router.post('/users', authenticate, authorize('admin'), adminController.createUser);
router.patch('/users/:id', authenticate, authorize('admin'), adminController.updateUser);
router.patch('/users/:id/status', authenticate, authorize('admin'), adminController.updateUserStatus);

// Activities Admin
router.get('/activities', authenticate, authorize('admin', 'coordinator'), adminController.getActivities);
router.post('/activities', authenticate, authorize('admin', 'coordinator'), adminController.createActivity);
router.patch('/activities/:id', authenticate, authorize('admin', 'coordinator'), adminController.updateActivity);
router.patch('/activities/:id/status', authenticate, authorize('admin', 'coordinator'), adminController.updateActivityStatus);

// Proposals Admin
router.patch('/proposals/:id/status', authenticate, authorize('admin', 'coordinator'), proposalsController.updateStatus);

// Backups Admin
router.get('/backups', authenticate, authorize('admin'), backupsController.getBackups);
router.post('/backups', authenticate, authorize('admin'), backupsController.createBackup);
router.post('/backups/:id/restore', authenticate, authorize('admin'), backupsController.restoreBackup);

module.exports = router;
