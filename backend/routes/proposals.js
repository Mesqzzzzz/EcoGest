const express = require('express');
const router = express.Router();
const proposalsController = require('../controllers/proposals');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', authenticate, authorize('admin', 'coordinator', 'council_member'), proposalsController.getProposals);
router.get('/:id', authenticate, authorize('admin', 'coordinator', 'council_member'), proposalsController.getProposal);
router.post('/', authenticate, authorize('council_member'), proposalsController.createProposal);

module.exports = router;
