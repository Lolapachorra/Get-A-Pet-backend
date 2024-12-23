const jwt = require('jsonwebtoken');
const getToken = require('./get-tokens');

const verifyToken = (req, res, next) => {

    if(!req.headers.authorization){
        return res.status(401).json({
            message: "Token nao fornecido"
        })
    }
    
    const token = getToken(req)
    if(!token){
        return res.status(403).json({error: 'Token não fornecido'})
    }
    try{
       const verified =  jwt.verify(token, process.env.DB_SECRET)
        
        req.user = verified
        next()
    }
    catch(err){
        console.log(err.message)
        res.status(400).json({error: "Token Inválido!!!!!"})
    }
}

module.exports = verifyToken