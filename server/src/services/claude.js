import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs/promises';
import path from 'node:path';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `Bạn là chuyên gia marketing TikTok/Shopee. Nhiệm vụ: nhìn ảnh sản phẩm → sinh nội dung quảng cáo tiếng Việt NGẮN, HẤP DẪN, có cảm xúc.
Trả về JSON hợp lệ, không bọc trong markdown fence:
{
  "productName": "tên sản phẩm ngắn gọn (<=40 ký tự)",
  "slides": ["caption slide 1 (<=25 ký tự)", "caption slide 2", "caption slide 3"],
  "hook": "câu hook 1 dòng (<=30 ký tự)",
  "cta": "lời kêu gọi mua (<=25 ký tự, VD: 'Mua ngay tại Shopee')",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}
Caption phải cô đọng, có emoji phù hợp, giọng điệu bán hàng Việt Nam.`;

async function imageToBlock(filePath) {
  const buffer = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mediaType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: mediaType,
      data: buffer.toString('base64'),
    },
  };
}

export async function generateCaptions(imagePaths, userHint = '') {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY chưa cấu hình trong .env');
  }

  const imageBlocks = await Promise.all(imagePaths.slice(0, 5).map(imageToBlock));

  const userText =
    (userHint ? `Gợi ý của người bán: ${userHint}\n\n` : '') +
    `Phân tích ${imageBlocks.length} ảnh sản phẩm sau và sinh nội dung quảng cáo theo format JSON đã quy định.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [...imageBlocks, { type: 'text', text: userText }],
      },
    ],
  });

  const text = response.content.find((b) => b.type === 'text')?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude không trả về JSON hợp lệ');
  return JSON.parse(jsonMatch[0]);
}
