import { useState, useRef } from 'react'
import Icon from '../components/Icon'
import Photo from '../components/Photo'

function matchPct(r) {
  const prot = Math.min(1, r.eiwit / 45)
  const light = Math.max(0, Math.min(1, (700 - r.kcal) / 320))
  return Math.round(72 + (0.6 * prot + 0.4 * light) * 26)
}

function matchReason(r) {
  if (r.eiwit >= 30) return 'Eiwitrijk'
  if (r.kcal <= 320) return 'Licht & vullend'
  if (r.time <= 15) return 'Snel klaar'
  return 'Past bij je doel'
}

export default function RecommendScreen({ nav, recipes, onSaveRecipe }) {
  const deck = useRef(null)
  if (!deck.current) deck.current = [...recipes].sort(() => Math.random() - 0.5)
  const list = deck.current

  const [i, setI] = useState(0)
  const [dx, setDx] = useState(0)
  const [anim, setAnim] = useState(false)
  const [saved, setSaved] = useState(0)
  const start = useRef(null)

  const advance = (dir) => {
    if (dir > 0) { onSaveRecipe(list[i]); setSaved(s => s + 1) }
    setAnim(true)
    setDx(dir * 520)
    setTimeout(() => { setAnim(false); setDx(0); setI(n => n + 1) }, 240)
  }

  const onDown = (e) => { start.current = e.clientX; setAnim(false); e.currentTarget.setPointerCapture?.(e.pointerId) }
  const onMove = (e) => { if (start.current == null) return; setDx(e.clientX - start.current) }
  const onUp = () => {
    if (start.current == null) return
    const d = dx
    start.current = null
    if (Math.abs(d) > 95) advance(d > 0 ? 1 : -1)
    else { setAnim(true); setDx(0); setTimeout(() => setAnim(false), 200) }
  }

  const done = i >= list.length

  return (
    <div className="screen screen-in">
      <div className="topbar" style={{ paddingBottom: 6, alignItems: 'center' }}>
        <div>
          <div className="label" style={{ marginBottom: 4 }}>Op basis van je doel · high-protein</div>
          <div className="h-xl">Ontdek</div>
        </div>
        <div className="iconbtn"><Icon name="spark" size={20} fill /></div>
      </div>
      <div style={{ padding: '2px 22px 8px' }} className="body">
        {done ? 'Klaar voor nu' : 'Swipe of tik — ✕ overslaan, ♥ bewaren'}
      </div>

      {done ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 40px 90px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={30} sw={2.4} />
          </div>
          <div className="h-md">Je bent bij!</div>
          <div className="body">Je bewaarde <b style={{ color: 'var(--accent)' }}>{saved}</b> recept{saved === 1 ? '' : 'en'}. Kom morgen terug voor nieuwe suggesties.</div>
          <button className="btn btn-ghost" onClick={() => { deck.current = [...recipes].sort(() => Math.random() - 0.5); setI(0); setSaved(0) }}>Opnieuw bekijken</button>
        </div>
      ) : (
        <>
          <div className="swipe-wrap">
            {[2, 1, 0].map(off => {
              const idx = i + off
              if (idx >= list.length) return null
              const r = list[idx]
              const top = off === 0
              const rot = top ? dx / 22 : 0
              const sc = 1 - off * 0.05
              const ty = off * 14
              return (
                <div
                  key={r.id}
                  className="swipe-card"
                  style={top
                    ? { transform: `translateX(${dx}px) rotate(${rot}deg)`, transition: anim ? 'transform .24s ease' : 'none', cursor: 'grab', zIndex: 10, touchAction: 'none' }
                    : { transform: `translateY(${ty}px) scale(${sc})`, zIndex: 10 - off, filter: 'brightness(.8)' }}
                  onPointerDown={top ? onDown : undefined}
                  onPointerMove={top ? onMove : undefined}
                  onPointerUp={top ? onUp : undefined}
                  onPointerCancel={top ? onUp : undefined}
                >
                  <div style={{ position: 'absolute', inset: 0 }}><Photo src={r.img} name={r.name} /></div>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,10,5,.92) 8%, rgba(7,10,5,.15) 52%, rgba(7,10,5,.1) 100%)' }} />
                  <div className="swipe-badge"><Icon name="spark" size={14} fill style={{ color: 'var(--accent-bright)' }} /> {matchPct(r)}% match</div>
                  {top && <>
                    <div className="swipe-stamp" style={{ left: 18, color: '#7CE38B', borderColor: '#7CE38B', opacity: dx > 40 ? Math.min(1, dx / 120) : 0 }}>BEWAAR</div>
                    <div className="swipe-stamp" style={{ right: 18, color: 'var(--danger)', borderColor: 'var(--danger)', opacity: dx < -40 ? Math.min(1, -dx / 120) : 0 }}>NOPE</div>
                  </>}
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 18 }}>
                    <span className="chip on" style={{ fontSize: 12, padding: '4px 10px', marginBottom: 10, display: 'inline-flex' }}>{matchReason(r)}</span>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-.4px', lineHeight: 1.08 }}>{r.name}</div>
                    <div className="num" style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', marginTop: 8 }}>
                      {r.kcal} kcal · {r.eiwit}g eiwit · {r.time} min
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 26, padding: '14px 0 26px', alignItems: 'center' }}>
            <div className="round-btn" style={{ color: 'var(--danger)' }} onClick={() => advance(-1)}><Icon name="x" size={26} sw={2.6} /></div>
            <div className="round-btn" onClick={() => nav.go('detail', { id: list[i].id })} style={{ width: 48, height: 48, color: 'var(--dim)' }}><Icon name="search" size={20} /></div>
            <div className="round-btn" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={() => advance(1)}><Icon name="heart" size={26} sw={2.4} fill /></div>
          </div>
        </>
      )}
    </div>
  )
}
