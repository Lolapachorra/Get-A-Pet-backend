
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configuração do cliente S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_SECRET_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configuração do multer com S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NOME,
    
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const folder = req.baseUrl.includes('users') ? 'users' : 'pets';
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path.extname(file.originalname)}`;
      cb(null, `${folder}/${uniqueName}`);
    },
  }),
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Somente arquivos .jpg, .jpeg e .png são permitidos.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

module.exports = { upload };

