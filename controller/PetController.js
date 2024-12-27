const Pet = require("../models/Pets.js");

// helpers
const getUserByToken = require("../helpers/get-user-by-tokem");
const getToken = require("../helpers/get-tokens.js");
const ObjectId = require("mongoose").Types.ObjectId;
module.exports = class PetController {
  // create a pet
  static async createPet(req, res) {
    const { name, age, color, weight } = req.body;
    const images = req.files;
    const available = true;

    // validations
    if (!name || !age || !weight || !color) {
      res.status(422).json({ message: "O nome é obrigatório!" });
      return;
    }

    const weightNum = Number(weight);

    if (isNaN(weightNum)) {
      return res.status(422).json({ message: "Peso precisa ser um número!" });
    }
    //verify if the number has a symbol like + or -
    if (weight.includes("+") || weight.includes("-")) {
      return res
        .status(422)
        .json({ message: "Peso não pode conter símbolos (+ ou -)!" });
    }
    if (!images || images.length === 0) {
      res.status(422).json({ message: "A imagem é obrigatória!" });
      return;
    }
    //get user
    const token = await getToken(req);
    const user = await getUserByToken(token);

    // create pet
    const pet = new Pet({
      name: name,
      age: age,
      weight: weight,
      color: color,
      available: available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });

    images.map((image) => {
      pet.images.push(image.location);
    });

    try {
      const newPet = await pet.save();

      res.status(201).json({
        message: "Pet cadastrado com sucesso!",
        newPet: newPet,
      });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
  static async getAll(req, res) {
    const pets = await Pet.find().sort("-createdAt");

    res.status(200).json({ pets: pets });
  }
  static async getUserPets(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);
    const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt");
    // console.log(pets);
    res.status(200).json({ pets: pets });
  }
  static async getUserAdoptions(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);
    const adoptedPets = await Pet.find({ "adopter._id": user._id }).sort(
      "-createdAt"
    );
    //console.log(user._id)
    res.status(200).json({ adoptedPets: adoptedPets });
  }

  static async getPetById(req, res) {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const pet = await Pet.findById(id);

    if (!pet) return res.status(404).json({ error: "Pet não encontrado" });

    res.status(200).json({ pet: pet });
  }

  static async deletePetById(req, res) {
    const id = req.params.id;
    //check if Id is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const pet = await Pet.findById(id);

    if (!pet) return res.status(404).json({ error: "Pet não encontrado" });
    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);
    if (pet.user._id.toString() !== user._id.toString()) {
      return res.status(422).json({ error: "Você não pode deletar este pet" });
    }
    await Pet.findByIdAndDelete(id);
    res.status(200).json({ message: "Pet deletado com sucesso" });
  }
  static async patchPetById(req, res) {
    const id = req.params.id;
    //check if Id is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const { name, age, weight, color, available } = req.body;
    const images = req.files;

    const updatedData = {};
    //check if pets exists
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ error: "Pet não encontrado" });
    const token = getToken(req);
    const user = await getUserByToken(token);
    if (pet.user._id.toString() !== user._id.toString()) {
      return res.status(422).json({ error: "Você não pode editar este pet" });
    }
    if (!name || !age || !weight || !color) {
      return res
        .status(422)
        .json({ message: "Todos os dados são obrigatórios!" });
    }
    const weightNum = Number(weight);

    if (isNaN(weightNum)) {
      return res.status(422).json({ message: "Peso precisa ser um número!" });
    }

    updatedData.name = name;
    updatedData.age = age;
    updatedData.weight = weight;
    updatedData.color = color;

    if (images && images.length > 0) {
      updatedData.images = images.map((image) => image.location);
    } else {
      updatedData.images = pet.images; // Mantém as imagens existentes
    }
    // console.log(updatedData);
    const updatedPet = await Pet.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    console.log(updatedPet);
    res.status(200).json({ message: "Pet editado com sucesso", updatedPet });
  }

  static async Schedule(req, res) {
    const id = req.params.id;
    //check if Id is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    //check if pet exists
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ error: "Pet não encontrado" });
    //check if user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);
    if (pet.user._id.equals(user._id)) {
      return res
        .status(422)
        .json({
          error: "Você não pode agendar um atendimento com seu proprio pet",
        });
    }
    //check if the user has already scheduled a visit
    if (pet.adopter) {
      if (pet.adopter._id.equals(user._id)) {
        return res
          .status(422)
          .json({
            error: "Você já possui um atendimento agendado com este pet",
          });
      }
    }

    //add user to pet
    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
      phone: user.phone,
    };
    await Pet.findByIdAndUpdate(id, pet);
    res
      .status(200)
      .json({
        message: `Agendamento realizado com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}`,
      });
  }
  static async concludeAdoption(req, res) {
    const id = req.params.id;

    //check if Id is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    //check if pet exists
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ error: "Pet não encontrado" });

    //check if the pet is from the user
    const token = getToken(req);
    const user = await getUserByToken(token);
    //console.log(pet.user._id)
    //console.log(user._id)
    if (!pet.user._id.equals(user._id)) {
      return res
        .status(422)
        .json({
          error: "Você não possui permissão para concluir este atendimento",
        });
    }

    pet.available = false;

    await Pet.findByIdAndUpdate(id, pet);
    res
      .status(200)
      .json({
        message: `Atendimento concluído com sucesso! O pet ${pet.name} foi adotado`,
      });
  }
};
