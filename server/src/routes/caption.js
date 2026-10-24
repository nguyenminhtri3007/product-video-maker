import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { nanoid } from 'nanoid';
import { generateCaptions } from '../services/gemini.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${nanoid(6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) {
      return cb(new Error('Chỉ chấp nhận JPG/PNG/WEBP'));
    }
    cb(null, true);
  },
});

const router = Router();

router.post('/', upload.array('images', 8), async (req, res, next) => {
  try {
    const files = req.files ?? [];
    if (!files.length) return res.status(400).json({ error: 'Thiếu ảnh' });

    const paths = files.map((f) => f.path);
    const hint = req.body.hint ?? '';
    const content = await generateCaptions(paths, hint);

    res.json({
      content,
      images: files.map((f) => ({
        filename: f.filename,
        url: `/uploads/${f.filename}`,
      })),
    });
  } catch (err) {
    for (const f of req.files ?? []) await fs.unlink(f.path).catch(() => {});
    next(err);
  }
});

export default router;
