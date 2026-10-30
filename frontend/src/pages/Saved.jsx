import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Saved() {
  const [items, setItems] = useState([])
  useEffect(() => {
    api.get('/knowledge', { params: { saved: 1 } }).then(({ data }) => setItems(data.data || []))
  }, [])

  return (
    <div>
      <h1 className="mb-4 text-3xl font-semibold">Saved items</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((t) => (
          <Link key={t.id} to={`/app/knowledge/${t.id}`} className="card p-4">
            <div className="font-semibold">{t.title}</div>
            <div className="text-sm text-[#7a6a5c]">{t.type}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
