const createUserToken = require("../helpers/create-user-token.js");
const getToken = require("../helpers/get-tokens.js");
const getUserByToken = require("../helpers/get-user-by-tokem.js");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;

function validarEmail(email) {
  const dominiosPermitidos = /@(gmail\.com|outlook\.com)$/;
  return dominiosPermitidos.test(email);
}

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, password, confirmPassword, phone } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Senhas não são iguais" });
    }
    if (!name || !email || !password || !phone) {
      return res
        .status(422)
        .json({ error: "Todos os campos precisam ser preenchidos" });
    }
    if (!password.trim() || password.length < 6) {
      return res
          .status(422)
          .json({ error: "A senha deve conter pelo menos 6 caracteres e não pode ser composta apenas por espaços." });
  }
  if (password.includes(" ")) {
    return res.status(400).json({ error: "A senha não pode conter espaços" });
  }
    if (!validarEmail(email)) {
      return res.status(422).json({ error: "Email inválido" });
    }
    //check if user exists
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({ error: "Usuário já existe" });
    }
    //create password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create User
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone,
    });
    try {
      const userCreated = await user.save();
      await createUserToken(userCreated, req, res);
     return res.status(201).json({ message: "Usuário criado com sucesso" });
    } catch (error) {
      console.log(error);
     return res.status(400).json({ error: error.message });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;
    //console.log(email, password)
    if (!validarEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }
    if (!password) {
      return res.status(400).json({ error: "Senha é obrigatória" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Usuário com esse e-mail não existe" });
    }
    //check if password with dbpassword
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({ error: "Senha incorreta" });
    }
    

    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, process.env.DB_SECRET);
      currentUser = await User.findById(decoded.id);
      currentUser.password = undefined;
    }
    res.status(200).send(currentUser);
  }
  static async getUserById(req, res) {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User não encontrado" });
    }
    res.status(200).json({ user });
  }

  static async editUser(req, res) {
    const { name, email, phone, password, confirmPassword } = req.body;
    let hashedPassword;
    const token = getToken(req);
    const user = await getUserByToken(token);
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

};
