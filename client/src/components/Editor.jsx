export default function Editor({ content, onChange, shopeeLink, onShopeeLink }) {
  if (!content) return null;

  const update = (patch) => onChange({ ...content, ...patch });
  const updateSlide = (i, v) => {
    const slides = [...(content.slides ?? [])];
    slides[i] = v;
    update({ slides });
  };

  return (
    <div className="space-y-4 rounded-2xl bg-slate-900 p-5 ring-1 ring-slate-800">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Tên sản phẩm</label>
        <input
          value={content.productName ?? ''}
          onChange={(e) => update({ productName: e.target.value })}
          className="w-full rounded-lg bg-slate-800 px-3 py-2 outline-none ring-1 ring-slate-700 focus:ring-shopee"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Hook (xuất hiện ở slide đầu)</label>
        <input
          value={content.hook ?? ''}
          onChange={(e) => update({ hook: e.target.value })}
          className="w-full rounded-lg bg-slate-800 px-3 py-2 outline-none ring-1 ring-slate-700 focus:ring-shopee"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Caption từng slide</label>
        <div className="space-y-2">
          {(content.slides ?? []).map((s, i) => (
            <input
              key={i}
              value={s}
              onChange={(e) => updateSlide(i, e.target.value)}
              placeholder={`Slide ${i + 1}`}
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-shopee"
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">CTA (slide cuối)</label>
        <input
          value={content.cta ?? ''}
          onChange={(e) => update({ cta: e.target.value })}
          className="w-full rounded-lg bg-slate-800 px-3 py-2 outline-none ring-1 ring-slate-700 focus:ring-shopee"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Link Shopee (sẽ gen QR đè lên slide cuối)</label>
        <input
          value={shopeeLink}
          onChange={(e) => onShopeeLink(e.target.value)}
          placeholder="https://shopee.vn/..."
          className="w-full rounded-lg bg-slate-800 px-3 py-2 outline-none ring-1 ring-slate-700 focus:ring-shopee"
        />
      </div>

      {content.hashtags?.length > 0 && (
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Hashtags (copy cho caption Shopee/TikTok)</label>
          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-800 p-2 text-sm">
            {content.hashtags.map((h, i) => (
              <span key={i} className="rounded bg-slate-700 px-2 py-0.5">{h}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
