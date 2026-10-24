import { useState } from 'react';
import Uploader from './components/Uploader.jsx';
import Editor from './components/Editor.jsx';
import { generateCaption, renderVideo, assetUrl } from './api.js';

export default function App() {
  const [files, setFiles] = useState([]);
  const [hint, setHint] = useState('');
  const [content, setContent] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [shopeeLink, setShopeeLink] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    setVideoUrl('');
    if (!files.length) return setError('Hãy chọn ít nhất 1 ảnh');
    setLoading('caption');
    try {
      const res = await generateCaption(files, hint);
      setContent(res.content);
      setUploadedImages(res.images);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleRender = async () => {
    setError('');
    setVideoUrl('');
    setLoading('render');
    try {
      const res = await renderVideo({
        filenames: uploadedImages.map((i) => i.filename),
        slides: content.slides,
        hook: content.hook,
        cta: content.cta,
        shopeeLink,
      });
      setVideoUrl(assetUrl(res.videoUrl));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-shopee font-bold">S</div>
        <div>
          <h1 className="text-2xl font-bold">Product Video Maker</h1>
          <p className="text-sm text-slate-400">Ảnh sản phẩm → video quảng cáo Shopee · AI caption · 1 click</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="rounded-2xl bg-slate-900 p-5 ring-1 ring-slate-800">
            <h2 className="mb-3 text-lg font-semibold">1. Upload ảnh</h2>
            <Uploader files={files} onChange={setFiles} disabled={loading === 'caption'} />
            <div className="mt-4">
              <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">
                Gợi ý thêm cho AI (tùy chọn)
              </label>
              <input
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="VD: son môi dưỡng ẩm, giá 99k, giảm 50%"
                className="w-full rounded-lg bg-slate-800 px-3 py-2 outline-none ring-1 ring-slate-700 focus:ring-shopee"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading !== null || files.length === 0}
              className="mt-4 w-full rounded-lg bg-shopee px-4 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === 'caption' ? '🤖 Claude đang phân tích...' : '🪄 Tạo nội dung bằng AI'}
            </button>
          </div>

          {content && (
            <>
              <h2 className="text-lg font-semibold">2. Chỉnh sửa nội dung</h2>
              <Editor
                content={content}
                onChange={setContent}
                shopeeLink={shopeeLink}
                onShopeeLink={setShopeeLink}
              />
              <button
                onClick={handleRender}
                disabled={loading !== null}
                className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === 'render' ? '🎬 Đang render video...' : '🎬 Render video MP4'}
              </button>
            </>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">3. Preview & tải xuống</h2>
          <div className="aspect-[9/16] overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800">
            {videoUrl ? (
              <video src={videoUrl} controls autoPlay loop className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                {loading === 'render'
                  ? 'Đang render, giữ máy chạy ~15-45 giây...'
                  : 'Video sẽ hiện ở đây sau khi render'}
              </div>
            )}
          </div>
          {videoUrl && (
            <a
              href={videoUrl}
              download
              className="block w-full rounded-lg bg-slate-800 px-4 py-2.5 text-center font-semibold hover:bg-slate-700"
            >
              ⬇️ Tải MP4
            </a>
          )}
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">
              ⚠️ {error}
            </div>
          )}
        </section>
      </div>

      <footer className="mt-12 text-center text-xs text-slate-500">
        Powered by Claude Sonnet 4.6 vision · FFmpeg · React · Node.js
      </footer>
    </div>
  );
}
