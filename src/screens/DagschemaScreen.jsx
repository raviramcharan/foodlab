import { useState } from 'react'
import Icon from '../components/Icon'
import Photo from '../components/Photo'

const MEALS = ['Ontbijt', 'Lunch', 'Diner', 'Tussendoor']
const DAYS = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

export default function DagschemaScreen({ nav, plan, onPlanChange, goals, recipes }) {
  const [off, setOff] = useState(0)

  const today = new Date(2026, 5, 3)
  const date = new Date(today)
  date.setDate(date.getDate() + off)
  const dateLabel = `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`

  const get = id => recipes.find(r => r.id === id)
  const planned = MEALS.map(m => plan[m] ? get(plan[m]) : null).filter(Boolean)
  const tot = planned.reduce((a, r) => ({ kcal: a.kcal + r.kcal, eiwit: a.eiwit + r.eiwit, vet: a.vet + r.vet, kh: a.kh + r.kh }), { kcal: 0, eiwit: 0, vet: 0, kh: 0 })

  const bar = (label, val, goal, unit) => {
    const pct = Math.min(100, Math.round(val / goal * 100))
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="label">{label}</span>
          <span className="num" style={{ fontSize: 12.5, color: 'var(--dim)' }}>{val} / {goal}{unit}</span>
        </div>
        <div className="prog"><span style={{ width: pct + '%' }} /></div>
      </div>
    )
  }

  const removeMeal = (meal, e) => {
    e.stopPropagation()
    onPlanChange({ ...plan, [meal]: undefined })
  }

  return (
    <div className="screen screen-in">
      <div className="scroll" style={{ paddingBottom: 120 }}>
        <div className="topbar" style={{ paddingBottom: 10 }}>
          <div className="h-xl">Dagschema</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 14px' }}>
          <div className="iconbtn" style={{ width: 38, height: 38 }} onClick={() => setOff(o => o - 1)}>
            <Icon name="back" size={18} sw={2.2} />
          </div>
          <div className="h-sm">{dateLabel}</div>
          <div className="iconbtn" style={{ width: 38, height: 38 }} onClick={() => setOff(o => o + 1)}>
            <Icon name="fwd" size={18} sw={2.2} />
          </div>
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <span className="num" style={{ fontSize: 30, color: 'var(--accent)' }}>{tot.kcal}</span>
                <span className="num" style={{ fontSize: 15, color: 'var(--dim)' }}> / {goals.kcal} kcal</span>
              </div>
              <span className="label">{Math.max(0, goals.kcal - tot.kcal)} kcal over</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {bar('Eiwit', tot.eiwit, goals.eiwit, 'g')}
              {bar('Vet', tot.vet, goals.vet, 'g')}
              {bar('Koolhydraten', tot.kh, goals.kh, 'g')}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MEALS.map(meal => {
            const r = plan[meal] ? get(plan[meal]) : null
            return (
              <div key={meal} className={'slot' + (r ? '' : ' empty')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: r ? 11 : 0 }}>
                  <span className="label" style={{ color: 'var(--dim)' }}>{meal}</span>
                  {r
                    ? <span className="num" style={{ fontSize: 12, color: 'var(--accent)' }}>{r.kcal} kcal</span>
                    : <span className="chip sm" style={{ padding: '4px 11px', fontSize: 12.5 }} onClick={() => nav.go('filters', { cat: meal })}>
                        <Icon name="plus" size={14} sw={2.4} /> Voeg toe
                      </span>}
                </div>
                {r && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} onClick={() => nav.go('detail', { id: r.id })}>
                    <div style={{ position: 'relative', width: 58, height: 48, borderRadius: 13, overflow: 'hidden', flexShrink: 0 }}>
                      <Photo src={r.img} name={r.name} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                      <div className="num" style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 4 }}>{r.eiwit}g eiwit · {r.time} min</div>
                    </div>
                    <div className="iconbtn" style={{ width: 34, height: 34 }} onClick={e => removeMeal(meal, e)}>
                      <Icon name="x" size={15} sw={2.2} style={{ color: 'var(--faint)' }} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
