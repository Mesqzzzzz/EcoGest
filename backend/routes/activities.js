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

// Admin/Coordinator/Council Member restricted for modifications, but all auth can view participants
router.get('/:id/participants', authenticate, activitiesController.listParticipants);
router.post('/:id/participants', authenticate, authorize('coordinator', 'council_member'), activitiesController.addParticipant);
router.post('/:id/executions', authenticate, authorize('coordinator', 'council_member'), activitiesController.registerExecution);
router.post('/:id/photos', authenticate, authorize('coordinator', 'council_member'), upload.single('photo'), activitiesController.uploadPhoto);

module.exports = router;