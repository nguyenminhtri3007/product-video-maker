# 🚀 Deploy miễn phí lên Vercel + Render

Target: anh sẽ có 2 URL miễn phí:
- Frontend: `https://product-video-maker.vercel.app`
- Backend: `https://product-video-maker-server.onrender.com`

Thời gian: ~15 phút.

---

## Bước 1 — Tạo GitHub repo (3 phút)

**1.1** Vào https://github.com/new
- Repository name: `product-video-maker`
- Public hoặc Private đều được
- **KHÔNG** tick "Add README/gitignore/license" (vì mình đã có rồi)
- → Create repository

**1.2** Mở PowerShell trong thư mục `c:\Users\Laptop\Desktop\tool` và chạy:
```powershell
git remote add origin https://github.com/<USERNAME>/product-video-maker.git
git push -u origin main
```

GitHub sẽ hỏi login — paste **Personal Access Token** (lấy ở https://github.com/settings/tokens → Generate new token classic → tick `repo` → Generate).

---

## Bước 2 — Deploy Backend lên Render (5 phút)

**2.1** Vào https://render.com → Sign up bằng GitHub

**2.2** Dashboard → **New +** → **Blueprint**

**2.3** Connect repo `product-video-maker` → Apply

Render tự detect `render.yaml`, hiện form điền env:

| Key | Value |
|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-xxx` (từ console.anthropic.com, nạp $5 trước) |
| `CLIENT_ORIGIN` | `https://product-video-maker.vercel.app` (sẽ có sau bước 3, tạm để `*`) |

**2.4** Click **Apply** → chờ build ~3-5 phút.

Khi xong, ghi lại URL: `https://product-video-maker-server-xxxx.onrender.com`

Test: mở `<URL>/api/health` phải trả `{"ok":true}`.

---

## Bước 3 — Deploy Frontend lên Vercel (4 phút)

**3.1** Vào https://vercel.com → Sign up bằng GitHub

**3.2** Dashboard → **Add New** → **Project** → Import `product-video-maker`

**3.3** Config:
- **Root Directory**: click Edit → chọn `client` ← quan trọng!
- Framework Preset: **Vite** (tự detect)
- Environment Variables: add
  - Key: `VITE_API_BASE`
  - Value: URL Render từ bước 2 (VD: `https://product-video-maker-server-xxxx.onrender.com`)

**3.4** Click **Deploy** → chờ ~1-2 phút

Có URL: `https://product-video-maker-xxx.vercel.app`

---

## Bước 4 — Update CORS cho Render (1 phút)

Quay lại Render dashboard → service của anh → **Environment**:
- Sửa `CLIENT_ORIGIN` = URL Vercel vừa có
- Save → Render tự redeploy

---

## Bước 5 — Test production

Mở URL Vercel → upload ảnh → generate caption → render video.

**⚠️ Cold start lần đầu:** Render free tier sleep sau 15 phút không dùng. Click đầu tiên có thể chờ 30-50s. Những lần sau nhanh.

---

## 🔧 Troubleshooting

**Render build fail "ffmpeg not found"**
→ `@ffmpeg-installer/ffmpeg` phải có trong `dependencies` (không phải `devDependencies`). Kiểm tra `server/package.json`.

**Frontend trả "Failed to fetch"**
→ Check 2 thứ:
1. `VITE_API_BASE` ở Vercel đúng URL Render chưa
2. `CLIENT_ORIGIN` ở Render match đúng URL Vercel chưa (không có dấu `/` cuối)
→ Sửa xong → redeploy

**Render error "ANTHROPIC_API_KEY not configured"**
→ Vào Render → Environment → thêm key đúng format `sk-ant-xxx`

**Video render chậm quá (>60s)**
→ Free tier Render có 0.5 CPU. Giảm `SLIDE_DURATION` trong `server/src/services/ffmpeg.js` từ 2.5s xuống 2s, hoặc giới hạn max 4 ảnh.

**File MP4 bị xóa sau restart**
→ Render free tier dùng ephemeral disk. Cho production thực tế: tích hợp Cloudinary free tier (25GB) — upload file sau render xong, trả về CDN URL.

---

## 💰 Chi phí thực tế

| Service | Free tier | Khi nào phải trả |
|---|---|---|
| Vercel | 100GB bandwidth/tháng | Khi vượt lưu lượng |
| Render | 750h/tháng (1 service chạy 24/7 OK) | Nếu muốn không sleep: $7/tháng |
| Anthropic API | **Pay-as-you-go** | ~$0.003 / request (Sonnet 4.6 vision) |
| **Tổng cho MVP** | **$0** + chi phí API theo usage | |

Ước tính: 1000 lần tạo caption ≈ $3-5 Claude API.

---

## 🌐 Domain riêng (sau này)

Khi anh muốn `yourtool.com` thay vì `*.vercel.app`:

**Option 1 — Mua $9/năm:**
- Cloudflare Registrar → mua `.com`
- Vercel → Project Settings → Domains → add domain → copy nameservers
- Cloudflare → set nameservers → chờ 5 phút → done

**Option 2 — Free `*.is-a.dev`:**
- Fork https://github.com/is-a-dev/register
- Add file `domains/yourname.json` với CNAME trỏ về `cname.vercel-dns.com`
- PR → merge trong 1-2 ngày
