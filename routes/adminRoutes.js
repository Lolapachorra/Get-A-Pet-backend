const router = require('express').Router();

const AdminController = require('../controller/AdminController.js');
const { upload } = require('../helpers/image-upload.js');
const verifyAdmin = require('../helpers/verify-admin-by-token.js')

//routes

router.get('/users', verifyAdmin,  AdminController.getAllUsers);
 router.get('/users/:id', verifyAdmin,  AdminController.getUserById)
router.patch('/users/edit/:id', verifyAdmin, upload.single('image'), AdminController.editUserPatch)
router.delete('/users/delete/:id', verifyAdmin,  AdminController.deleteUser)
//pets routes

router.get('/pets', verifyAdmin,  AdminController.getAllPets)
 router.get('/pets/:id', verifyAdmin,  AdminController.getPetById)
router.patch('/pets/edit/:id', verifyAdmin, upload.array('images'), AdminController.editPetPatch)
router.delete('/pets/delete/:id', verifyAdmin,  AdminController.deletePet)

module.exports = router