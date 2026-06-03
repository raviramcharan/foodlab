import { useState } from 'react'
import Icon from '../components/Icon'
import Photo from '../components/Photo'
import Macros from '../components/Macros'
import MetaRow from '../components/MetaRow'
import { RecipeRailCard } from './HomeScreen'

function scaleAmount(str, factor) {
  if (factor === 1) return str
  const m = str.match(/^(\d+(?:[.,]\d+)?|\d+\/\d+)\s*(.*)$/)
  if (!m) return str
  let n
  if (m[1].includes('/')) { const [a, b] = m[1].split('/'); n = +a / +b }
  else n = parseFloat(m[1].replace(',', '.'))
  const v = n * factor
  const out = Math.round(v * 100) / 100
  return (Number.isInteger(out) ? out : out.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',')) + (m[2] ? ' ' + m[2] : '')
}

function GlassRound({ children, onClick }) {
  return (
    <div onClick={onClick} style={{ width: 40, height: 40, borderRadius: 13, cursor: 'pointer', background: 'rgba(10,14,7,.46)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      {children}
    </div>
  )
}

export default function DetailScreen({ nav, params, recipes, onAddToPlan, favorites, onToggleFav, user, onEdit, onDelete, isDesktop }) {
  const r = recipes.find(x => x.id === params.id) || recipes[0]
  const [servings, setServings] = useState(r?.servings || 1)
  const [done, setDone] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const factor = r ? servings / r.servings : 1
  const similar = recipes.filter(x => x.cat === r?.cat && x.id !== r?.id).slice(0, 4)
  const isFav = favorites ? favorites.has(r?.id) : false
  const isOwner = user && r && user.id === r.user_id

  if (!r) return null

  const stepBtn = (dir) => (
    <div
      onClick={() => setServings(s => Math.max(1, Math.min(12, s + dir)))}
      style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--surface-3)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', cursor: 'pointer' }}
    >
      <Icon name={dir > 0 ? 'plus' : 'minus'} size={17} sw={2.4} />
    </div>
  )

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete && onDelete(r.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className="screen screen-in">
      <div className="scroll" style={{ paddingBottom: 108 }}>
        <div style={{ position: 'relative', height: 288, flexShrink: 0 }}>
          <Photo src={r.img} name={r.name} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,10,5,.4) 0%, rgba(7,10,5,0) 28%, rgba(16,20,12,.2) 72%, var(--bg) 100%)' }} />
          <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 44px) + 12px)', left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
            <GlassRound onClick={() => nav.back()}><Icon name="back" size={19} sw={2.2} /></GlassRound>
            <div style={{ display: 'flex', gap: 10 }}>
              {isOwner && (
                <>
                  <GlassRound onClick={() => onEdit && onEdit(r)}>
                    <Icon name="edit" size={17} sw={2} />
                  </GlassRound>
                  <GlassRound onClick={handleDelete}>
                    <Icon name="trash" size={17} sw={2} style={{ color: confirmDelete ? 'var(--danger)' : '#fff' }} />
                  </GlassRound>
                </>
              )}
              <GlassRound onClick={() => onToggleFav(r.id)}>
                <Icon name="bookmark" size={18} sw={2} fill={isFav} style={{ color: isFav ? 'var(--accent-bright)' : '#fff' }} />
              </GlassRound>
            </div>
          </div>
        </div>

        <div style={{ padding: '4px 20px 0', marginTop: -22, position: 'relative' }}>
          <div style={{ display: 'flex', gap: 7, marginBottom: 11, flexWrap: 'wrap' }}>
            <span className="chip on" style={{ padding: '5px 11px', fontSize: 12.5 }}>{r.cat}</span>
            {(r.tags || []).slice(0, 2).map(t => (
              <span key={t} className="chip" style={{ padding: '5px 11px', fontSize: 12.5 }}>{t}</span>
            ))}
            {isOwner && (
              <span className="chip" style={{ padding: '5px 11px', fontSize: 12.5, color: 'var(--accent)', borderColor: 'rgba(169,224,106,.3)' }}>Mijn recept</span>
            )}
          </div>
          <div className="h-lg" style={{ fontSize: 26, marginBottom: 10 }}>{r.name}</div>
          <MetaRow r={{ ...r, servings }} />

          <div style={{ marginTop: 16 }}>
            <div className="label" style={{ marginBottom: 8 }}>Per portie</div>
            <Macros r={r} />
          </div>

          <div className="card" style={{ marginTop: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="h-sm">Porties</div>
              <div className="body" style={{ fontSize: 13 }}>Past de hoeveelheden aan</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {stepBtn(-1)}
              <span className="num" style={{ fontSize: 20, minWidth: 18, textAlign: 'center' }}>{servings}</span>
              {stepBtn(1)}
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div className="h-md" style={{ marginBottom: 12 }}>Ingrediënten</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(r.ingredients || []).map((ing, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '9px 0', borderBottom: i < r.ingredients.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <span className="num" style={{ fontSize: 13, color: 'var(--accent)', minWidth: 62 }}>{ing[0] ? scaleAmount(ing[0], factor) : '—'}</span>
                  <span style={{ fontSize: 15 }}>{ing[1]}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="h-md" style={{ marginBottom: 14 }}>Bereiding</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(r.steps || []).map((s, i) => {
                const on = done[i]
                return (
                  <div key={i} onClick={() => setDone(d => ({ ...d, [i]: !d[i] }))} style={{ display: 'flex', gap: 13, cursor: 'pointer' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? 'var(--accent)' : 'var(--surface-2)', color: on ? 'var(--accent-ink)' : 'var(--accent)', border: '1px solid ' + (on ? 'var(--accent)' : 'var(--line)'), fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13 }}>
                      {on ? <Icon name="check" size={16} sw={2.6} /> : i + 1}
                    </div>
                    <div style={{ flex: 1, fontSize: 15, lineHeight: 1.45, color: on ? 'var(--faint)' : 'var(--text)', textDecoration: on ? 'line-through' : 'none', paddingTop: 4 }}>{s}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {isOwner && (
            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => onEdit && onEdit(r)}
              >
                <Icon name="edit" size={17} sw={2} /> Bewerken
              </button>
              <button
                className="btn btn-ghost"
                style={{ flex: 1, color: confirmDelete ? 'var(--danger)' : 'var(--text)' }}
                onClick={handleDelete}
              >
                <Icon name="trash" size={17} sw={2} /> {confirmDelete ? 'Zeker weten?' : 'Verwijderen'}
              </button>
            </div>
          )}

          {similar.length > 0 && (
            <div style={{ marginTop: 28, marginLeft: -20, marginRight: -20 }}>
              <div className="h-md" style={{ padding: '0 20px 12px' }}>Vergelijkbare recepten</div>
              <div className="rail">
                {similar.map(s => (
                  <RecipeRailCard key={s.id} r={s} onOpen={x => nav.go('detail', { id: x.id })} w={172} h={124} isFav={favorites ? favorites.has(s.id) : false} onToggleFav={onToggleFav} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bottom-action">
        <button className="btn btn-primary btn-block" onClick={() => onAddToPlan(r)}>
          <Icon name="cal" size={19} sw={2} /> Toevoegen aan dagschema
        </button>
      </div>
    </div>
  )
}
