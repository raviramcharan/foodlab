import { useState } from 'react'

export default function Photo({ src, name, style }) {
  const [ok, setOk] = useState(true)
  const init = (name || '?').replace(/^(de|het|een)\s+/i, '').slice(0, 2)
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
      <div className="photo-ph">
        <span className="pinit">{init}</span>
      </div>
      {ok && src && (
        <img
          src={src}
          alt={name || ''}
          loading="lazy"
          onError={() => setOk(false)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  )
}
