const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

const uploadBaseDir = path.join(env.UPLOAD_DIR, 'applications');
if (!fs.existsSync(uploadBaseDir)) {
  fs.mkdirSync(uploadBaseDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // If applicationId is already available on params or req, or use base uploads/applications
    const targetDir = uploadBaseDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  }
});

const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only PDF, JPEG, and PNG endorsement documents are permitted.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const uploadEndorsement = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});

module.exports = {
  uploadEndorsement,
  uploadBaseDir
};
