const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activities');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const upload = require('../utils/upload');

router.get('/', optionalAuth, activitiesController.getActivities);
router.get('/:id', activitiesController.getActivity);
router.post('/:id/participations', optionalAuth, activitiesController.participate);
router.delete('/:id/participations/:pid', authenticate, activitiesController.cancelParticipation);

// Admin/Coordinator restricted
router.get('/:id/participants', authenticate, authorize('admin', 'coordinator'), activitiesController.listParticipants);
router.post('/:id/participants', authenticate, authorize('admin', 'coordinator'), activitiesController.addParticipant);
router.post('/:id/executions', authenticate, authorize('admin', 'coordinator'), activitiesController.registerExecution);
router.post('/:id/photos', authenticate, authorize('admin', 'coordinator'), upload.single('photo'), activitiesController.uploadPhoto);

module.exports = router;