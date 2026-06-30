import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'image/vnd.dwg',
  'application/acad',
  'application/octet-stream',
  'application/x-rfa',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    cb(null, `${base}_${timestamp}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Tipo de arquivo não permitido'));
  },
});

export const uploadsPublicPath = '/uploads';
export const uploadsFsPath = uploadDir;
