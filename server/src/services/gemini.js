import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'node:fs/promises';
import path from 'node:path';

const MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `Bạn là chuyên gia marketing TikTok/Shopee. Nhiệm vụ: nhìn ảnh sản phẩm → sinh nội dung quảng cáo tiếng Việt NGẮN, HẤP DẪN, có cảm xúc.
Trả về JSON hợp lệ, KHÔNG bọc trong markdown code fence, chỉ in ra object JSON:
{
  "productName": "tên sản phẩm ngắn gọn (<=40 ký tự)",
  "slides": ["caption slide 1 (<=25 ký tự)", "caption slide 2", "caption slide 3"],
  "hook": "câu hook 1 dòng (<=30 ký tự)",
  "cta": "lời kêu gọi mua (<=25 ký tự, VD: 'Mua ngay tại Shopee')",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}
Caption phải cô đọng, có emoji phù hợp, giọng điệu bán hàng Việt Nam. Số lượng slides = số ảnh được gửi.`;

async function imageToPart(filePath) {
  const buffer = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return {
    inlineData: {
      mimeType,
      data: buffer.toString('base64'),
    },
  };
}

export async function generateCaptions(imagePaths, userHint = '') {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY chưa cấu hình trong .env');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.9,
    },
  });

  const imageParts = await Promise.all(imagePaths.slice(0, 8).map(imageToPart));

  const userText =
    (userHint ? `Gợi ý của người bán: ${userHint}\n\n` : '') +
    `Phân tích ${imageParts.length} ảnh sản phẩm sau và sinh nội dung quảng cáo theo format JSON đã quy định (slides có đúng ${imageParts.length} phần tử).`;

  const result = await model.generateContent([...imageParts, { text: userText }]);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Gemini không trả về JSON hợp lệ');
    return JSON.parse(jsonMatch[0]);
  }
}
