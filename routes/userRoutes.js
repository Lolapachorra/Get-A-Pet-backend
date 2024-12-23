const express = require('express');

const router = express.Router()

const UserController = require('../controller/UserControler.js');

//midleware
const verifyToken = require('../helpers/verify-token.js');
const { upload } = require('../helpers/image-upload.js');

// Route 
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/checkuser', UserController.checkUser)
router.get("/:id", UserController.getUserById)
router.patch('/edit/:id', verifyToken, upload.single('image'),  UserController.editUser)
module.exports = router