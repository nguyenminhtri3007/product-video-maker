import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import captionRouter from './routes/caption.js';
import renderRouter from './routes/render.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

for (const dir of ['uploads', 'output']) {
  const p = path.join(ROOT, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') ?? '*' }));
app.use(express.json({ limit: '10mb' }));

app.use('/output', express.static(path.join(ROOT, 'output')));
app.use('/uploads', express.static(path.join(ROOT, 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/caption', captionRouter);
app.use('/api/render', renderRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? 'Internal error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
