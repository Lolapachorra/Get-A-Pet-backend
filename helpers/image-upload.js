const multer = require('multer');

const path = require('path');
//destination to store the images

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   let folder = ''
   if(req.baseUrl.includes('users')){
     folder = 'users'
   }else if(req.baseUrl.includes('pets')){
   folder = 'pets'
   }

   cb(null, `public/images/${folder}`)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + String(Math.floor(Math.random() * 1000)) + path.extname(file.originalname));
  },
});

const upload = multer({
    storage: storage,
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png)$/)){
            return cb(new Error('Only .jpg and .png files are allowed'))
        }
        cb(undefined, true)
    }
})

module.exports = {upload}