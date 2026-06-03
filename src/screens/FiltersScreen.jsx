import { useState, useMemo } from 'react'
import Icon from '../components/Icon'
import { RecipeRailCard, WebRecipeCard } from './HomeScreen'

const CATEGORIES = ['Ontbijt', 'Lunch', 'Diner', 'Tussendoor', 'Desserts']
const DIETS = ['Vega', 'Veganistisch', 'High-protein', 'Glutenvrij', 'Meal-prep']

export function matchRecipe(r, f) {
  if (f.cats.length && !f.cats.includes(r.cat)) return false
  if (r.kcal > f.kcalMax) return false
  if (r.eiwit < f.eiwitMin) return false
  if (f.time && r.time > f.time) return false
  if (f.diets.length && !f.diets.some(d => (r.tags || []).includes(d))) return false
  return true
}

function Slider({ value, min, max, step = 1, onChange }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(+e.target.value)}
      className="slider"
      style={{ background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--surface-3) ${pct}%, var(--surface-3) 100%)` }}
    />
  )
}

export default function FiltersScreen({ nav, params, recipes }) {
  const [f, setF] = useState({
    cats: params?.cat ? [params.cat] : [],
    kcalMax: 800,
    eiwitMin: 0,
    time: null,
    diets: [],
  })
  const toggle = (key, v) => setF(s => ({ ...s, [key]: s[key].includes(v) ? s[key].filter(x => x !== v) : [...s[key], v] }))
  const count = useMemo(() => recipes.filter(r => matchRecipe(r, f)).length, [f, recipes])
  const reset = () => setF({ cats: [], kcalMax: 800, eiwitMin: 0, time: null, diets: [] })

  return (
    <div className="screen screen-in">
      <div className="screen-hdr">
        <div className="iconbtn" onClick={() => nav.back()}><Icon name="back" size={20} sw={2.2} /></div>
        <div className="h-sm">Filters</div>
        <div onClick={reset} style={{ color: 'var(--dim)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Wis</div>
      </div>

      <div className="scroll" style={{ padding: '4px 20px 100px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div className="label" style={{ marginBottom: 10 }}>Maaltijdtype</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <span key={c} className={'chip' + (f.cats.includes(c) ? ' on' : '')} onClick={() => toggle('cats', c)}>{c}</span>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="label">Max. calorieën</span>
            <span className="num" style={{ fontSize: 13, color: 'var(--accent)' }}>{f.kcalMax >= 800 ? 'Alles' : '≤ ' + f.kcalMax + ' kcal'}</span>
          </div>
          <Slider value={f.kcalMax} min={150} max={800} step={10} onChange={v => setF(s => ({ ...s, kcalMax: v }))} />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="label">Min. eiwit</span>
            <span className="num" style={{ fontSize: 13, color: 'var(--accent)' }}>{f.eiwitMin <= 0 ? 'Geen min.' : '≥ ' + f.eiwitMin + 'g'}</span>
          </div>
          <Slider value={f.eiwitMin} min={0} max={45} step={5} onChange={v => setF(s => ({ ...s, eiwitMin: v }))} />
        </div>

        <div>
          <div className="label" style={{ marginBottom: 10 }}>Bereidingstijd</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['≤ 10 min', 10], ['≤ 20 min', 20], ['≤ 30 min', 30]].map(([l, v]) => (
              <span key={v} className={'chip' + (f.time === v ? ' on' : '')} onClick={() => setF(s => ({ ...s, time: s.time === v ? null : v }))}>{l}</span>
            ))}
          </div>
        </div>

        <div>
          <div className="label" style={{ marginBottom: 10 }}>Dieet</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DIETS.map(d => (
              <span key={d} className={'chip' + (f.diets.includes(d) ? ' on' : '')} onClick={() => toggle('diets', d)}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-action">
        <button
          className="btn btn-primary btn-block"
          disabled={!count}
          style={!count ? { opacity: .5 } : null}
          onClick={() => count && nav.go('results', { f })}
        >
          {count ? `Toon ${count} recept${count === 1 ? '' : 'en'}` : 'Geen resultaten'}
        </button>
      </div>
    </div>
  )
}

export function ResultsScreen({ nav, params, recipes, isDesktop, favorites, onToggleFav }) {
  const f = params.f
  const list = recipes.filter(r => matchRecipe(r, f))
  const active = [
    ...f.cats,
    f.kcalMax < 800 ? '≤ ' + f.kcalMax + ' kcal' : null,
    f.eiwitMin > 0 ? '≥ ' + f.eiwitMin + 'g eiwit' : null,
    f.time ? '≤ ' + f.time + ' min' : null,
    ...f.diets,
  ].filter(Boolean)

  const openRecipe = r => nav.go('detail', { id: r.id })
  const isFav = id => favorites ? favorites.has(id) : false

  return (
    <div className="screen screen-in">
      <div className="screen-hdr-left">
        <div className="iconbtn" onClick={() => nav.back()}><Icon name="back" size={20} sw={2.2} /></div>
        <div className="h-md">{list.length} recept{list.length === 1 ? '' : 'en'}</div>
      </div>

      <div style={{ flexShrink: 0, padding: '0 20px 10px', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {active.length
          ? active.map((a, i) => <span key={i} className="chip on" style={{ fontSize: 12.5 }}>{a}</span>)
          : <span className="chip">Alle recepten</span>}
      </div>

      <div className="scroll" style={{ padding: '4px 20px 30px' }}>
        {!list.length && <div className="body" style={{ padding: '30px 0', textAlign: 'center' }}>Niets gevonden met deze filters.</div>}

        {isDesktop ? (
          <div className="wgrid">
            {list.map(r => <WebRecipeCard key={r.id} r={r} onOpen={openRecipe} isFav={isFav(r.id)} onToggleFav={onToggleFav} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {list.map(r => (
              <div key={r.id} onClick={() => openRecipe(r)} style={{ display: 'flex', gap: 13, alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', minHeight: 88 }}>
                <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
                  <img src={r.img} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--surface-2), var(--surface-3))', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: r.img ? -1 : 0 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 16, color: 'var(--faint)', textTransform: 'uppercase' }}>{r.name.slice(0, 2)}</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0, padding: '12px 14px 12px 0' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.2px', lineHeight: 1.2, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="chip on" style={{ fontSize: 11, padding: '3px 8px' }}>{r.cat}</span>
                    {r.kcal > 0 && <span className="num" style={{ fontSize: 12, color: 'var(--accent)' }}>{r.kcal} kcal</span>}
                    <span style={{ fontSize: 12, color: 'var(--dim)' }}>{r.time} min</span>
                  </div>
                </div>
                <div style={{ paddingRight: 16, color: 'var(--faint)' }}>
                  <Icon name="fwd" size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

