const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { authenticate } = require('../middleware/auth');

router.post('/', usersController.register);
router.post('/login', usersController.login);
router.post('/refresh', usersController.refresh);
router.post('/logout-session', usersController.logoutSession);
router.get('/me', authenticate, usersController.getMe);
router.patch('/me', authenticate, usersController.updateMe);
router.patch('/me/status', authenticate, usersController.updateMyStatus);

module.exports = router;
