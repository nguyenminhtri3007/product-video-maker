import { useRef, useState } from 'react';

export default function Uploader({ files, onChange, disabled }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (list) => {
    const incoming = Array.from(list ?? []).filter((f) =>
      /image\/(jpeg|jpg|png|webp)/.test(f.type)
    );
    if (!incoming.length) return;
    const merged = [...files, ...incoming].slice(0, 8);
    onChange(merged);
  };

  const removeAt = (idx) => onChange(files.filter((_, i) => i !== idx));

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragOver ? 'border-shopee bg-shopee/10' : 'border-slate-700 hover:border-slate-500'
        } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        <p className="text-lg font-semibold">Kéo thả ảnh sản phẩm vào đây</p>
        <p className="mt-1 text-sm text-slate-400">hoặc click để chọn (tối đa 8 ảnh, JPG/PNG/WEBP, ≤ 8MB mỗi ảnh)</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {files.map((f, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-800">
              <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs opacity-0 transition group-hover:opacity-100"
              >
                ✕
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-0.5 text-xs">#{i + 1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
