const mongoose = require('mongoose');
const uri = process.env.DB_ACESS
// Connect to MongoDB

async function main(){
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
}

main().catch((err) => console.log(err))

module.exports = mongoose