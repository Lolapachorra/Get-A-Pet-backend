const User = require("../models/User.js");
const Pet = require("../models/Pets.js");
const bcrypt = require('bcrypt')
const ObjectId = require("mongoose").Types.ObjectId;
function validarEmail(email) {
    const dominiosPermitidos = /@(gmail\.com|outlook\.com)$/;
    return dominiosPermitidos.test(email);
  }
  function validarTelefone(telefone) {
    const regex = /^21( ?\d{5} ?\d{4}| ?\d{4}-?\d{4}| ?\d{5}-\d{4})$/;
    return regex.test(telefone);
  }
module.exports = class AdminController {
  static async getAllUsers(req, res) {
    try {
      const users = await User.find();
      res.status(200).json({ users: users });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  static async getUserById(req, res) {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      res.status(200).json({ user: user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteUser(req, res) {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      res.status(200).json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
   static async editUserPatch(req,res){
    const { name, email, phone, password, confirmPassword } = req.body;
    const id = req.params.id;
     if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    
    let hashedPassword;
    
    const user = await User.findById(id);
    let image
    if (req.file) {
    image = user.image = req.file.location;
    }

    // Check if user exists before proceeding
    if (!user) {
      return res.status(422).json({ error: "User não encontrado" });
    }
   
    // Validations
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Todos os campos precisam ser preenchidos" });
    }
   
    if (password && (password.trim() === "")) {
      return res.status(400).json({ error: "Senha não pode ser vazia" });
    }
    if (password &&  password.length < 6) {
      return res.status(400).json({ error: "A senha deve conter pelo menos 6 caracteres" });
    }
    if (password && password.includes(" ")) {
      return res.status(400).json({ error: "A senha não pode conter espaços" });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }
    if (!validarTelefone(phone)) {
      return res.status(422).json({ error: "Telefone inválido. O formato deve ser: 21 XXXXX-XXXX" });
    }

    if ((password && !confirmPassword) || (!password && confirmPassword)) {
      return res.status(400).json({ error: "Ambos os campos de senha devem ser preenchidos" });
    }
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Senhas não são iguais" });
      }
     
      try {
        const salt = await bcrypt.genSalt(12);
        hashedPassword = await bcrypt.hash(password, salt);
      } catch (error) {
        return res.status(500).json({ error: "Erro ao gerar hash da senha" });
      }
    }

    // Check if email is already taken by another user
    const userExists = await User.findOne({ email: email });
    if (user.email !== email && userExists) {
      return res.status(400).json({ error: "Email já está em uso" });
    }

    const userUpdated = {
      name: name,
      email: email,
      phone: phone,
      ...(hashedPassword && { password: hashedPassword }), // Only include password if it's updated
      ...(image && { image: image }), // Only include image if updated
    };
    // Update user in the database
    try {
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: userUpdated },
        { new: true }
        
      );
      console.log(userUpdated);
      res.status(200).json({ message: "Usuário editado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }
  static async getAllPets(req, res) {
    try {
      const pets = await Pet.find();
      res.status(200).json({ pets: pets });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  static async getPetById(req, res) {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    try {
      const pet = await Pet.findById(id);
      if (!pet) {
        return res.status(404).json({ message: "Pet não encontrado" });
      }
      res.status(200).json({ pet: pet });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async editPetPatch(req,res){
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
    try {
        const updatedPet = await Pet.findByIdAndUpdate(id, updatedData, {
          new: true,
        });
        console.log(updatedPet);
        res.status(200).json({ message: "Pet editado com sucesso", updatedPet });
    } catch (error) {
         console.error(error);
        res.status(400).json({ error: error.message });
    }
  }
  static async deletePet(req, res){
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    try {
      const pet = await Pet.findByIdAndDelete(id);
      if (!pet) {
        return res.status(404).json({ message: "Pet não encontrado" });
      }
      res.status(200).json({ message: "Pet deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
