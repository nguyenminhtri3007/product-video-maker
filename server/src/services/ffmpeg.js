import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import QRCode from 'qrcode';
import path from 'node:path';
import fs from 'node:fs/promises';
import { nanoid } from 'nanoid';

ffmpeg.setFfmpegPath(ffmpegPath.path);

const WIDTH = 1080;
const HEIGHT = 1920;
const SLIDE_DURATION = 2.5;
const FPS = 30;

function escapeDrawText(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "’")
    .replace(/%/g, '\\%');
}

function buildSlideFilter(index, caption, totalSlides) {
  const start = index * SLIDE_DURATION;
  const end = start + SLIDE_DURATION;
  const zoomIn = `zoompan=z='min(zoom+0.0015,1.15)':d=${Math.round(SLIDE_DURATION * FPS)}:s=${WIDTH}x${HEIGHT}:fps=${FPS}`;
  const scalePad = `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black`;

  const textFilter = caption
    ? `,drawtext=text='${escapeDrawText(caption)}':fontcolor=white:fontsize=64:box=1:boxcolor=black@0.55:boxborderw=20:x=(w-text_w)/2:y=h-280`
    : '';

  return { scalePad, zoomIn, textFilter, start, end };
}

export async function renderVideo({ imagePaths, slides, hook, cta, shopeeLink, outputDir }) {
  const id = nanoid(10);
  const outputFile = path.join(outputDir, `${id}.mp4`);

  const totalSlides = imagePaths.length;
  const totalDuration = totalSlides * SLIDE_DURATION;

  let qrPath = null;
  if (shopeeLink) {
    qrPath = path.join(outputDir, `${id}-qr.png`);
    await QRCode.toFile(qrPath, shopeeLink, { width: 300, margin: 1 });
  }

  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();

    for (const img of imagePaths) {
      cmd.input(img).inputOptions([`-loop 1`, `-t ${SLIDE_DURATION}`]);
    }

    if (qrPath) cmd.input(qrPath);

    const filterParts = [];
    const concatInputs = [];

    imagePaths.forEach((_, i) => {
      const caption = slides?.[i] ?? '';
      const label = `v${i}`;
      filterParts.push(
        `[${i}:v]scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=0x111111,setsar=1,fps=${FPS}${
          caption
            ? `,drawtext=text='${escapeDrawText(caption)}':fontcolor=white:fontsize=72:box=1:boxcolor=black@0.6:boxborderw=24:x=(w-text_w)/2:y=h-320`
            : ''
        }${i === 0 && hook ? `,drawtext=text='${escapeDrawText(hook)}':fontcolor=yellow:fontsize=80:box=1:boxcolor=black@0.6:boxborderw=24:x=(w-text_w)/2:y=200` : ''}${
          i === totalSlides - 1 && cta
            ? `,drawtext=text='${escapeDrawText(cta)}':fontcolor=white:fontsize=90:box=1:boxcolor=0xee4d2d@0.9:boxborderw=30:x=(w-text_w)/2:y=(h-text_h)/2`
            : ''
        }[${label}]`
      );
      concatInputs.push(`[${label}]`);
    });

    filterParts.push(`${concatInputs.join('')}concat=n=${totalSlides}:v=1:a=0[vconcat]`);

    let finalLabel = 'vconcat';
    if (qrPath) {
      const qrInputIndex = imagePaths.length;
      filterParts.push(
        `[${qrInputIndex}:v]scale=240:240[qr]`,
        `[vconcat][qr]overlay=W-w-40:H-h-40:enable='between(t,${Math.max(0, totalDuration - SLIDE_DURATION)},${totalDuration})'[vout]`
      );
      finalLabel = 'vout';
    }

    cmd
      .complexFilter(filterParts, finalLabel)
      .outputOptions([
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-preset veryfast',
        '-movflags +faststart',
        `-r ${FPS}`,
        `-t ${totalDuration}`,
      ])
      .on('start', (cmdline) => console.log('[ffmpeg]', cmdline.slice(0, 200), '...'))
      .on('error', (err) => reject(new Error('FFmpeg: ' + err.message)))
      .on('end', async () => {
        if (qrPath) await fs.unlink(qrPath).catch(() => {});
        resolve({ id, file: outputFile, filename: `${id}.mp4` });
      })
      .save(outputFile);
  });
}
