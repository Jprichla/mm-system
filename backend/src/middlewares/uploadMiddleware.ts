import multer from 'multer';

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

// Guarda o arquivo em memória (buffer) — dali ele é enviado direto pro Cloudflare R2.
// Não gravamos mais nada em disco local: no Railway o filesystem é efêmero e some a cada deploy.
const storage = multer.memoryStorage();

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
