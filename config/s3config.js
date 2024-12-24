const AWS = require('aws-sdk');


// Configurar o AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

module.exports = s3; 