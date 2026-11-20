import { useEffect, useMemo, useRef, useState } from 'react'

const css = `
@keyframes fd-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.fd-arrow{animation:fd-bob 2s ease-in-out infinite}
.fd-over .fd-arrow{animation-duration:.7s}
@media (prefers-reduced-motion:reduce){.fd-arrow{animation:none}}
`

const mb = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

/**
 * A clear "drop your files here" box instead of the plain browser file input.
 * files: array of File objects. onChange receives the new array.
 */
export default function FileDropzone({ files, onChange, accept = 'image/*,video/*', multiple = true, label = 'Add photos or a video', hint = 'JPG, PNG or MP4' }) {
  const inputRef = useRef(null)
  const [over, setOver] = useState(false)

  const previews = useMemo(
    () => files.map((file) => ({ file, url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null })),
    [files],
  )
  useEffect(() => () => previews.forEach((p) => p.url && URL.revokeObjectURL(p.url)), [previews])

  const allowed = (f) =>
    accept.split(',').some((raw) => {
      const t = raw.trim()
      if (t.endsWith('/*')) return f.type.startsWith(t.slice(0, -1))
      if (t.startsWith('.')) return f.name.toLowerCase().endsWith(t)
      return f.type === t
    })

  const add = (list) => {
    const incoming = Array.from(list || []).filter(allowed)
    if (!incoming.length) return
    onChange(multiple ? [...files, ...incoming] : incoming.slice(0, 1))
  }

  const open = () => inputRef.current?.click()

  return (
    <div>
      <style>{css}</style>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${label}. Drag and drop files here or press Enter to browse.`}
        onClick={open}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files) }}
        className={`${over ? 'fd-over border-[#7a5539] bg-[#e0b46a]/25' : 'border-[#c6a786] bg-[#f6efe6] hover:border-[#7a5539] hover:bg-[#f0e3d0]'} flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e0b46a]`}
      >
        <svg className="fd-arrow text-[#7a5539]" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4 4 0 0 1-.5 9.5" />
          <path d="M12 21v-8" />
          <path d="M8.8 15.8L12 12.6l3.2 3.2" />
        </svg>
        <div className="font-semibold text-[#2c2118]">{over ? 'Drop to add' : label}</div>
        <div className="text-sm text-[#6b5a4c]">
          Drag and drop here, or <span className="font-semibold text-[#7a5539] underline underline-offset-2">browse</span>
        </div>
        <div className="text-xs text-[#8a7b6d]">{hint}</div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          tabIndex={-1}
          className="sr-only"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => { add(e.target.files); e.target.value = '' }}
        />
      </div>

      {previews.length > 0 && (
        <ul className="mt-3 space-y-2">
          {previews.map(({ file, url }, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-[#e0d2c2] bg-white p-2">
              {url ? (
                <img src={url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#f3ebe0] text-[#7a5539]" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{file.name}</div>
                <div className="text-xs text-[#8a7b6d]">{mb(file.size)}</div>
              </div>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                aria-label={`Remove ${file.name}`}
                className="rounded-lg px-2.5 py-1.5 text-sm text-rose-700 transition hover:bg-rose-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}