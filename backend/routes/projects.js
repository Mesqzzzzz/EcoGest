const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', authenticate, projectsController.getProjects);
router.get('/:id', authenticate, projectsController.getProject);
router.post('/', authenticate, authorize('admin'), projectsController.createProject);
router.patch('/:id', authenticate, authorize('admin'), projectsController.updateProject);
router.patch('/:id/status', authenticate, authorize('admin'), projectsController.updateStatus);
router.patch('/:id/coordinator', authenticate, authorize('admin'), projectsController.assignCoordinator);

module.exports = router;
