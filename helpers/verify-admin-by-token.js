const jwt = require("jsonwebtoken");
const getToken = require("./get-tokens");
const User = require("../models/User.js");
const verifyAdmin = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      message: "Token nao fornecido",
    });
  }

  const token = getToken(req);
  if (!token) {
    return res.status(403).json({ error: "Token não fornecido" });
  }
  try {
    const verified = jwt.verify(token, process.env.DB_SECRET);
    //verify if the user has the isAdmin true
    const userId = verified.id;

    const user = await User.findOne({ _id: userId });
    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ error: "Você não possui permissão para acessar este recurso" });
    }
    req.user = verified;

    next();
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ error: "Token Inválido!!!!!" });
  }
};

module.exports = verifyAdmin;
