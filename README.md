# 🎬 Product Video Maker — Shopee

Web tool: upload ảnh sản phẩm → **Claude AI** sinh caption/hook/CTA/hashtag → **FFmpeg** render video dọc 9:16 (TikTok/Reels/Shopee video) có QR code dẫn tới link Shopee.

## 📁 Cấu trúc

```
tool/
├── server/     # Node.js + Express + FFmpeg + Claude SDK
└── client/     # React + Vite + Tailwind
```

## 🚀 Chạy local

**Bước 1 — Lấy Anthropic API key**
1. Vào https://console.anthropic.com → Settings → API Keys → Create Key
2. Nạp ít nhất $5 credit (gói Claude Max KHÔNG tính vào API)

**Bước 2 — Config env**
```bash
cp server/.env.example server/.env
# sửa server/.env, dán ANTHROPIC_API_KEY=sk-ant-xxx
```

**Bước 3 — Install & run**
```bash
npm run install:all   # cài deps cho cả client + server
npm run dev           # chạy đồng thời cả 2
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🧪 Flow sử dụng

1. Kéo thả 2–8 ảnh sản phẩm
2. (Tuỳ chọn) Nhập gợi ý: "son môi dưỡng ẩm, 99k, giảm 50%"
3. Click **"🪄 Tạo nội dung bằng AI"** → Claude phân tích ảnh và sinh caption
4. Sửa caption/hook/CTA nếu muốn, dán **link Shopee**
5. Click **"🎬 Render video MP4"** → chờ 15–45s
6. Preview và tải xuống

## 🌐 Deploy miễn phí

### Frontend → Vercel

```bash
cd client
npx vercel
# chọn project, set env: VITE_API_BASE=https://<server-url>.onrender.com
```

Hoặc deploy qua GitHub:
1. Push repo lên GitHub
2. Vercel → Import project → chọn thư mục `client/`
3. Build Command: `npm run build` · Output: `dist`
4. Env: `VITE_API_BASE` = URL backend

### Backend → Render.com

1. https://render.com → New → Web Service → connect GitHub repo
2. Config:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
3. Env vars:
   - `ANTHROPIC_API_KEY` = `sk-ant-xxx`
   - `CLIENT_ORIGIN` = `https://your-app.vercel.app`

**⚠️ Lưu ý free tier Render:**
- Service sleep sau 15 phút không dùng → cold start ~30s
- Giới hạn 512MB RAM, 0.5 CPU → render video 15s mất ~30–60s
- Dung lượng ephemeral (file render sẽ mất khi restart) — cần tích hợp Cloudinary/S3 nếu muốn giữ lâu

### Alternative: deploy backend qua Railway (nhanh hơn free tier)
```bash
cd server
npx @railway/cli up
```

## 🔧 Tùy chỉnh

**Đổi template video**: sửa `server/src/services/ffmpeg.js`:
- `SLIDE_DURATION` — thời lượng mỗi slide (giây)
- `WIDTH / HEIGHT` — kích thước (hiện 1080×1920 dọc; đổi 1920×1080 cho ngang)
- Filter FFmpeg (zoom, fade, text position)

**Đổi phong cách caption**: sửa `SYSTEM_PROMPT` trong `server/src/services/claude.js`.

**Thêm nhạc nền**: 
1. Để file `bg.mp3` trong `server/assets/`
2. Thêm `.input('assets/bg.mp3').inputOptions(['-stream_loop -1'])` trong ffmpeg.js
3. Add `-c:a aac`, `-shortest` vào outputOptions

## 🎯 Giới hạn hiện tại

- Shopee không có public API → chỉ gắn link + QR, không tự fetch được giá/tên SP
- Chưa có nhạc nền (dễ thêm, xem phần tùy chỉnh)
- Caption dùng font mặc định của FFmpeg (có thể lỗi dấu tiếng Việt trên 1 số môi trường — nếu lỗi, cần thêm `fontfile=path/to/vn-font.ttf` vào drawtext)
- File render lưu local → cần Cloudinary/S3 cho production thực sự

## 📝 Tech stack

- **Frontend**: React 18, Vite, Tailwind
- **Backend**: Express, Multer
- **AI**: Claude Sonnet 4.6 (vision)
- **Video**: FFmpeg (@ffmpeg-installer/ffmpeg, fluent-ffmpeg)
- **QR**: node-qrcode
