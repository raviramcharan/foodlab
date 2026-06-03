import { useState } from 'react'
import Icon from '../components/Icon'
import Photo from '../components/Photo'

const CATEGORIES = ['Ontbijt', 'Lunch', 'Diner', 'Tussendoor']

function RecipeRailCard({ r, onOpen, w = 216, h = 150 }) {
  return (
    <div className="rcard" style={{ width: w, height: h }} onClick={() => onOpen(r)}>
      <Photo src={r.img} name={r.name} />
      <div className="scrim" />
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(10,14,7,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Icon name="heart" size={18} sw={2} />
        </div>
      </div>
      <div className="meta">
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.12, letterSpacing: '-.2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
          <span className="num" style={{ fontSize: 12.5, color: 'var(--accent-bright)' }}>{r.kcal} kcal</span>
          <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>·</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>{r.time} min</span>
        </div>
      </div>
    </div>
  )
}

function WebRecipeCard({ r, onOpen }) {
  return (
    <div className="wcard" onClick={() => onOpen(r)}>
      <div className="ph"><Photo src={r.img} name={r.name} /><div className="heart"><Icon name="heart" size={17} sw={2} /></div></div>
      <div className="bd">
        <div className="nm">{r.name}</div>
        <div className="mt"><b>{r.kcal} kcal</b><span>{r.eiwit}g eiwit</span><span>{r.time} min</span></div>
      </div>
    </div>
  )
}

export function SearchResultRow({ r, onOpen }) {
  return (
    <div onClick={() => onOpen(r)} style={{ display: 'flex', gap: 13, alignItems: 'center', padding: '10px 0', cursor: 'pointer' }}>
      <div style={{ position: 'relative', width: 68, height: 56, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
        <Photo src={r.img} name={r.name} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.2px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
        <div className="num" style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>
          {r.kcal} kcal · {r.eiwit}g eiwit · {r.time} min
        </div>
      </div>
      <Icon name="fwd" size={18} style={{ color: 'var(--faint)' }} />
    </div>
  )
}

export { RecipeRailCard }

export default function HomeScreen({ nav, recipes, user, isDesktop, search: externalSearch, setSearch: setExternalSearch }) {
  const [localQ, setLocalQ] = useState('')

  const q = isDesktop ? (externalSearch ?? '') : localQ
  const setQ = isDesktop ? (setExternalSearch ?? (() => {})) : setLocalQ

  const query = q.trim().toLowerCase()
  const results = query
    ? recipes.filter(r =>
        r.name.toLowerCase().includes(query) ||
        (r.ingredients || []).some(i => i[1]?.toLowerCase().includes(query))
      )
    : null

  const today = new Date()
  const DAYS = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
  const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
  const dateLabel = `${DAYS[today.getDay()].toUpperCase()} ${today.getDate()} ${MONTHS[today.getMonth()].toUpperCase()}`

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'S'

  const openRecipe = x => nav.go('detail', { id: x.id })

  // ── Desktop layout ──
  if (isDesktop) {
    return (
      <div>
        {results ? (
          <>
            <div className="label" style={{ marginBottom: 10 }}>{results.length} resultaten</div>
            {results.length === 0 && <div className="body" style={{ padding: '24px 0' }}>Niets gevonden voor "{q}".</div>}
            <div className="wgrid">{results.map(r => <WebRecipeCard key={r.id} r={r} onOpen={openRecipe} />)}</div>
          </>
        ) : (
          CATEGORIES.map(cat => {
            const list = recipes.filter(r => r.cat === cat)
            if (!list.length) return null
            return (
              <div key={cat} style={{ marginBottom: 32 }}>
                <div className="wsec-h">
                  <h2>{cat}</h2>
                  <span className="chip" onClick={() => nav.go('filters', { cat })}>Toon meer</span>
                </div>
                <div className="wgrid">{list.map(r => <WebRecipeCard key={r.id} r={r} onOpen={openRecipe} />)}</div>
              </div>
            )
          })
        )}
      </div>
    )
  }

  // ── Mobile layout ──
  return (
    <div className="scroll screen-in" style={{ paddingBottom: 100 }}>
      <div className="topbar" style={{ paddingBottom: 14 }}>
        <div>
          <div className="label" style={{ marginBottom: 4 }}>{dateLabel}</div>
          <div className="h-xl">Recepten</div>
        </div>
        <div className="avatar" onClick={() => nav.tab('profiel')}>{initials}</div>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '0 20px 16px' }}>
        <div className="search" style={{ flex: 1 }}>
          <Icon name="search" size={19} style={{ color: 'var(--faint)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Zoek een recept of ingrediënt" />
        </div>
        <div className="iconbtn" onClick={() => nav.go('filters')}><Icon name="sliders" size={20} /></div>
      </div>

      {results ? (
        <div style={{ padding: '0 20px' }}>
          <div className="label" style={{ marginBottom: 6 }}>{results.length} resultaten</div>
          {results.length === 0 && <div className="body" style={{ padding: '24px 0' }}>Niets gevonden voor "{q}".</div>}
          {results.map((r, i) => (
            <div key={r.id}>
              {i > 0 && <hr className="hr" />}
              <SearchResultRow r={r} onOpen={openRecipe} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {CATEGORIES.map(cat => {
            const list = recipes.filter(r => r.cat === cat)
            if (!list.length) return null
            return (
              <div key={cat}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 11px' }}>
                  <div className="h-lg">{cat}</div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--dim)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => nav.go('filters', { cat })}
                  >
                    Toon meer <Icon name="fwd" size={15} sw={2.2} />
                  </div>
                </div>
                <div className="rail">
                  {list.map(r => (
                    <RecipeRailCard key={r.id} r={r} onOpen={openRecipe} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
