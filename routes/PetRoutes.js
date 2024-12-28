const router = require('express').Router();

const PetController = require('../controller/PetController.js');
const { upload } = require('../helpers/image-upload.js');
const verifyToken = require('../helpers/verify-token.js');
//ROUTES
router.get('/search', PetController.searchPets);
router.post('/create', verifyToken, upload.array("images"),  PetController.createPet);
router.get('/',  PetController.getAll);
router.get('/mypets', verifyToken, PetController.getUserPets)
router.get('/myadoptions', verifyToken, PetController.getUserAdoptions)
router.patch('/schedule/:id', verifyToken, PetController.Schedule)
router.get('/:id', PetController.getPetById)
router.delete('/:id', verifyToken, PetController.deletePetById)
router.patch('/:id', verifyToken, upload.array('images'), PetController.patchPetById)
router.patch('/conclude/:id', verifyToken, PetController.concludeAdoption);
module.exports = router