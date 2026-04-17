const express = require('express');
const router = express.Router();
const meetingsController = require('../controllers/meetings');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const upload = require('../utils/upload');

router.get('/', authenticate, authorize('admin', 'coordinator', 'council_member', 'secretary'), meetingsController.getMeetings);
router.get('/:id', authenticate, authorize('admin', 'coordinator', 'council_member', 'secretary'), meetingsController.getMeeting);
router.post('/', authenticate, authorize('secretary', 'admin'), meetingsController.createMeeting);
router.patch('/:id', authenticate, authorize('secretary', 'admin'), meetingsController.updateMeeting);
router.delete('/:id', authenticate, authorize('secretary', 'admin'), meetingsController.deleteMeeting);

router.post('/:id/convocations', authenticate, authorize('secretary', 'admin'), meetingsController.sendConvocations);
router.get('/:id/documents', authenticate, authorize('admin', 'coordinator', 'council_member', 'secretary'), meetingsController.getDocuments);
router.post('/:id/documents', authenticate, authorize('secretary', 'admin'), upload.single('document'), meetingsController.uploadDocument);
router.delete('/documents/:id', authenticate, authorize('secretary', 'admin'), meetingsController.deleteDocument);

module.exports = router;
