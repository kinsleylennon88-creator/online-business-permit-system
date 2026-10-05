const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure local uploads directory exists outside public root
const uploadsDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Cloudinary if valid credentials exist
let cloudinaryStorage = null;
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET && 
  !process.env.CLOUDINARY_CLOUD_NAME.includes('your-cloudinary');

if (isCloudinaryConfigured) {
  try {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    cloudinaryStorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'janiuay-business-permits',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        public_id: (req, file) => {
          const timestamp = Date.now();
          const cleanName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_');
          return `${cleanName}_${timestamp}`;
        }
      }
    });
  } catch (err) {
    console.warn('⚠️ Cloudinary initialization failed, falling back to local storage:', err.message);
    cloudinaryStorage = null;
  }
}

// Safe Local Disk Storage with sanitized unique filenames
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const safeBaseName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    cb(null, `doc_${safeBaseName}_${uniqueSuffix}${ext}`);
  }
});

// Use Cloudinary if configured, else robust local disk storage
const activeStorage = cloudinaryStorage || diskStorage;

// Allowed MIME types and extensions
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'];

// File filter preventing executable or malicious files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error(`Unsupported file extension (${ext}). Allowed formats: JPEG, PNG, WEBP, PDF, DOC, DOCX.`), false);
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error(`Unsupported file type (${file.mimetype}). Allowed formats: Images, PDF, Word documents.`), false);
  }

  cb(null, true);
};

// Multer upload instance
const upload = multer({
  storage: activeStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10
  }
});

// Single file upload middleware with robust JSON error handling
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum allowable file size is 5MB per file.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Maximum file count exceeded.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed. Please ensure file is valid.'
        });
      }
      next();
    });
  };
};

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum allowable file size is 5MB per file.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum is ${maxCount} files.`
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed. Please check file format.'
        });
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadsDir
};
