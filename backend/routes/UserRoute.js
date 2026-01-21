// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { protect, adminOnly } = require("../MiddleWare/Auth");

router.post('/register', UserController.registerUser);
router.post('/login', UserController.login);


router.get('/profile', protect, UserController.getCurrentUser);
router.put('/change-password', protect, UserController.changePassword);


router.get('/', protect, adminOnly, UserController.getAllUsers);
router.get('/:id', protect, adminOnly, UserController.getUserById);
router.post('/', protect, adminOnly, UserController.createUser);
router.put('/:id', protect, adminOnly, UserController.updateUser);
router.delete('/:id', protect, adminOnly, UserController.deleteUser);


module.exports = router;
