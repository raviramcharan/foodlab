export default function Macros({ r, compact = false }) {
  const items = [
    { v: r.kcal, k: 'kcal', hero: true },
    { v: r.eiwit + 'g', k: 'eiwit' },
    { v: r.vet + 'g', k: 'vet' },
    { v: r.kh + 'g', k: 'koolh.' },
  ]
  return (
    <div className="macro-strip">
      {items.map((m, i) => (
        <div key={i} className={'macro' + (m.hero ? ' hero' : '')} style={compact ? { padding: '8px 6px' } : null}>
          <div className="mv">{m.v}</div>
          <div className="mk">{m.k}</div>
        </div>
      ))}
    </div>
  )
}
