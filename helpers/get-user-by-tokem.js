const jwt = require('jsonwebtoken');

const User = require('../models/User.js');

const  getUserByToken = async (token) => {
    if(!token){
        return res.status(403).json({error: 'Token não fornecido'})
    }
    const decoded = jwt.verify(token, process.env.DB_SECRET)
    const userId = decoded.id
   
    const user = await User.findOne({_id: userId})

    return user;
}

module.exports = getUserByToken;