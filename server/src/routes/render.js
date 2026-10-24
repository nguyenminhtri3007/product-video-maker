import { Router } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { renderVideo } from '../services/ffmpeg.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
const OUTPUT_DIR = path.resolve(__dirname, '../../output');

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { filenames, slides, hook, cta, shopeeLink } = req.body ?? {};
    if (!Array.isArray(filenames) || filenames.length === 0) {
      return res.status(400).json({ error: 'Thiếu danh sách ảnh' });
    }

    const imagePaths = [];
    for (const name of filenames) {
      const safe = path.basename(name);
      const full = path.join(UPLOAD_DIR, safe);
      try {
        await fs.access(full);
        imagePaths.push(full);
      } catch {
        return res.status(400).json({ error: `Không tìm thấy ảnh: ${safe}` });
      }
    }

    const result = await renderVideo({
      imagePaths,
      slides: slides ?? [],
      hook: hook ?? '',
      cta: cta ?? '',
      shopeeLink: shopeeLink ?? '',
      outputDir: OUTPUT_DIR,
    });

    res.json({
      id: result.id,
      videoUrl: `/output/${result.filename}`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
