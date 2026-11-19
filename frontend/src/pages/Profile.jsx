import { useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'

// Crops to a square and shrinks the photo so it stays small (about 20 to 40 KB).
function toAvatar(file, size = 256) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file could not be read as an image.'))
    }
    img.src = url
  })
}

export default function Profile() {
  const { user, roleLabel, updateProfile } = useAuth()
  const fileRef = useRef(null)
  const [name, setName] = useState(user?.name || '')
  const [photo, setPhoto] = useState(null) // new photo waiting to be saved
  const [removed, setRemoved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  const preview = removed ? null : photo || user?.avatar_path
  const dirty = name.trim() !== user?.name || photo || removed

  const choose = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setDone('')
    if (!file.type.startsWith('image/')) return setError('Please choose an image file (JPG, PNG or WebP).')
    if (file.size > 10 * 1024 * 1024) return setError('That photo is too large. Choose one under 10 MB.')
    try {
      setPhoto(await toAvatar(file))
      setRemoved(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setError('')
    setDone('')
    setBusy(true)
    try {
      await updateProfile({ name: name.trim(), ...(photo ? { avatar: photo } : {}), ...(removed ? { remove_avatar: true } : {}) })
      setPhoto(null)
      setRemoved(false)
      setDone('Your profile was saved.')
    } catch (err) {
      const fields = err.response?.data?.errors
      setError((fields && Object.values(fields).flat()[0]) || err.response?.data?.message || 'Could not save your profile. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold sm:text-4xl">Your profile</h1>
      <p className="mt-2 text-[#6b5a4c]">Change your name and profile photo. Others will see them across PrinTour.</p>

      <form onSubmit={save} className="mt-8 rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-6">
          <Avatar user={preview ? { ...user, avatar_path: preview } : { ...user, avatar_path: null }} size={104} />
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={choose} className="sr-only" aria-label="Choose a profile photo" />
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => fileRef.current?.click()} className="rounded-xl bg-[#7a5539] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg">
                {preview ? 'Change photo' : 'Upload photo'}
              </button>
              {preview && (
                <button type="button" onClick={() => { setPhoto(null); setRemoved(true); setDone('') }} className="rounded-xl border border-[#e0d2c2] px-4 py-2.5 text-sm font-medium transition hover:bg-white">
                  Remove photo
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-[#8a7b6d]">JPG, PNG or WebP. It is cropped to a square.</p>
          </div>
        </div>

        <label htmlFor="pf-name" className="mt-8 block text-sm font-medium">Full name</label>
        <input id="pf-name" required maxLength={100} value={name} onChange={(e) => { setName(e.target.value); setDone('') }} className="mt-1.5 w-full rounded-xl border border-[#e0d2c2] bg-white px-4 py-3 outline-none focus:border-[#7a5539] focus:ring-4 focus:ring-[#e0b46a]/35" />

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          {[['Email', user?.email], ['Role', roleLabel], ['Department', user?.department || 'Not set']].map(([k, v]) => (
            <div key={k}><dt className="text-[#8a7b6d]">{k}</dt><dd className="mt-0.5 break-words font-medium">{v}</dd></div>
          ))}
        </dl>

        {error && <p role="alert" className="mt-6 rounded-xl border border-rose-300 bg-rose-100 p-3 text-sm font-medium text-rose-800">{error}</p>}
        {done && <p role="status" className="mt-6 rounded-xl border border-green-300 bg-green-100 p-3 text-sm font-medium text-green-900">{done}</p>}

        <button type="submit" disabled={busy || !dirty} className="mt-6 rounded-xl bg-[#7a5539] px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {busy ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}