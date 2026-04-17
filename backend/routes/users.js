const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { authenticate } = require('../middleware/auth');

router.post('/', usersController.register);
router.post('/login', usersController.login);
router.get('/me', authenticate, usersController.getMe);
router.patch('/me', authenticate, usersController.updateMe);
router.patch('/me/status', authenticate, usersController.updateMyStatus);

module.exports = router;
