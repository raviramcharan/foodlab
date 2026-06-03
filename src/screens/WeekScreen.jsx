import { useState } from 'react'
import Icon from '../components/Icon'
import Photo from '../components/Photo'

const MEALS = ['Ontbijt', 'Tussendoortje', 'Lunch', 'Diner', 'Tussendoor']
const DAY_NAMES = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
const DAY_NAMES_FULL = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag']
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

function getWeekDays(offset = 0) {
  const today = new Date()
  const day = today.getDay()
  const mon = new Date(today)
  mon.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d
  })
}

function dateKey(d) {
  return d.toISOString().slice(0, 10)
}

function isToday(d) {
  return dateKey(d) === dateKey(new Date())
}

function RecipePicker({ recipes, onSelect, onClose }) {
  const [q, setQ] = useState('')
  const filtered = q.trim()
    ? recipes.filter(r => r.name.toLowerCase().includes(q.toLowerCase()))
    : recipes
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--bg)', borderRadius: '22px 22px 0 0', maxHeight: '80vh', display: 'flex', flexDirection: 'column', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div className="h-md" style={{ flex: 1 }}>Kies een recept</div>
          <div className="iconbtn" onClick={onClose}><Icon name="x" size={18} sw={2.2} /></div>
        </div>
        <div style={{ padding: '0 20px 12px', flexShrink: 0 }}>
          <div className="search">
            <Icon name="search" size={17} style={{ color: 'var(--faint)' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Zoek recept…" autoFocus />
          </div>
        </div>
        <div style={{ overflowY: 'auto', padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(r => (
            <div
              key={r.id}
              onClick={() => onSelect(r)}
              style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', borderRadius: 14, border: '1px solid var(--line)', cursor: 'pointer', background: 'var(--surface)' }}
            >
              <div style={{ position: 'relative', width: 52, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                <Photo src={r.img} name={r.name} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>{r.cat} · {r.time} min{r.kcal ? ` · ${r.kcal} kcal` : ''}</div>
              </div>
              <Icon name="fwd" size={16} style={{ color: 'var(--faint)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MealSlotMobile({ meal, recipe, onAdd, onRemove, onOpen }) {
  if (recipe) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', cursor: 'pointer' }}
        onClick={() => onOpen(recipe)}
      >
        <div style={{ position: 'relative', width: 40, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          <Photo src={recipe.img} name={recipe.name} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recipe.name}</div>
          <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 1 }}>{meal}{recipe.kcal ? ` · ${recipe.kcal} kcal` : ''}</div>
        </div>
        <div onClick={e => { e.stopPropagation(); onRemove() }} style={{ color: 'var(--faint)', cursor: 'pointer', padding: '2px 4px' }}>
          <Icon name="x" size={14} sw={2} />
        </div>
      </div>
    )
  }
  return (
    <div
      onClick={onAdd}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 12, border: '1.5px dashed var(--line-strong)', cursor: 'pointer' }}
    >
      <div style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="plus" size={13} sw={2.4} style={{ color: 'var(--faint)' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--faint)', fontWeight: 500 }}>{meal}</span>
    </div>
  )
}

function DayCard({ date, dayIdx, weekPlan, recipes, onAdd, onRemove, onOpen }) {
  const key = dateKey(date)
  const dayPlan = weekPlan[key] || {}
  const hasMeals = Object.keys(dayPlan).length > 0
  const today = isToday(date)

  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${today ? 'rgba(169,224,106,.35)' : 'var(--line)'}`, borderRadius: 18, padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: today ? 'var(--accent)' : 'var(--surface-2)',
          color: today ? 'var(--accent-ink)' : 'var(--text)',
          fontWeight: 700, fontSize: 14
        }}>{date.getDate()}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{DAY_NAMES_FULL[dayIdx]}</div>
          <div style={{ fontSize: 11, color: 'var(--faint)' }}>{MONTHS[date.getMonth()]}</div>
        </div>
        {hasMeals && (
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 700 }}>
            {Object.values(dayPlan).reduce((sum, id) => {
              const r = recipes.find(r => r.id === id)
              return sum + (r?.kcal || 0)
            }, 0)} kcal
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {MEALS.map(meal => (
          <MealSlotMobile
            key={meal}
            meal={meal}
            recipe={dayPlan[meal] ? recipes.find(r => r.id === dayPlan[meal]) : null}
            onAdd={() => onAdd(key, meal)}
            onRemove={() => onRemove(key, meal)}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  )
}

function DesktopWeekGrid({ days, weekPlan, recipes, onAdd, onRemove, onOpen }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, minmax(140px, 1fr))`, gap: 12, minWidth: 980 }}>
        {days.map((date, dayIdx) => {
          const key = dateKey(date)
          const dayPlan = weekPlan[key] || {}
          const today = isToday(date)
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ padding: '8px 4px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--faint)', fontWeight: 600, letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 6 }}>{DAY_NAMES[dayIdx]}</div>
                <div style={{
                  width: 36, height: 36, borderRadius: 11, margin: '0 auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: today ? 'var(--accent)' : 'transparent',
                  color: today ? 'var(--accent-ink)' : 'var(--text)',
                  fontSize: 18, fontWeight: 700
                }}>{date.getDate()}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {MEALS.map(meal => {
                  const rid = dayPlan[meal]
                  const r = rid ? recipes.find(r => r.id === rid) : null
                  if (r) {
                    return (
                      <div key={meal} style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: 'var(--surface)' }} onClick={() => onOpen(r)}>
                        <div style={{ position: 'relative', height: 64 }}>
                          <Photo src={r.img} name={r.name} />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,10,5,.7) 0%, transparent 60%)' }} />
                          <div onClick={e => { e.stopPropagation(); onRemove(key, meal) }} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 6, background: 'rgba(10,14,7,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <Icon name="x" size={12} sw={2.2} />
                          </div>
                        </div>
                        <div style={{ padding: '6px 8px' }}>
                          <div style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 2 }}>{meal}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={meal}
                      onClick={() => onAdd(key, meal)}
                      style={{ border: '1.5px dashed var(--line-strong)', borderRadius: 12, padding: '10px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center', minHeight: 68, transition: 'border-color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(169,224,106,.4)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = ''}
                    >
                      <Icon name="plus" size={16} sw={2.2} style={{ color: 'var(--faint)' }} />
                      <span style={{ fontSize: 11, color: 'var(--faint)', textAlign: 'center' }}>{meal}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function WeekScreen({ nav, recipes, weekPlan, onWeekPlanChange, isDesktop }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [picker, setPicker] = useState(null)
  const days = getWeekDays(weekOffset)

  const weekLabel = (() => {
    const first = days[0], last = days[6]
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()}–${last.getDate()} ${MONTHS[first.getMonth()]}`
    }
    return `${first.getDate()} ${MONTHS[first.getMonth()]} – ${last.getDate()} ${MONTHS[last.getMonth()]}`
  })()

  const handleAdd = (dateStr, meal) => setPicker({ dateStr, meal })
  const handleRemove = (dateStr, meal) => {
    const updated = { ...weekPlan, [dateStr]: { ...(weekPlan[dateStr] || {}), [meal]: undefined } }
    delete updated[dateStr][meal]
    onWeekPlanChange(updated)
  }
  const handleSelect = (r) => {
    if (!picker) return
    const updated = { ...weekPlan, [picker.dateStr]: { ...(weekPlan[picker.dateStr] || {}), [picker.meal]: r.id } }
    onWeekPlanChange(updated)
    setPicker(null)
  }

  const content = isDesktop ? (
    <DesktopWeekGrid
      days={days}
      weekPlan={weekPlan}
      recipes={recipes}
      onAdd={handleAdd}
      onRemove={handleRemove}
      onOpen={r => nav.go('detail', { id: r.id })}
    />
  ) : (
    <div className="scroll screen-in" style={{ padding: '0 16px 120px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {days.map((date, dayIdx) => (
        <DayCard
          key={dateKey(date)}
          date={date}
          dayIdx={dayIdx}
          weekPlan={weekPlan}
          recipes={recipes}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onOpen={r => nav.go('detail', { id: r.id })}
        />
      ))}
    </div>
  )

  return (
    <div className={isDesktop ? '' : 'screen screen-in'} style={isDesktop ? {} : { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {!isDesktop && (
        <div className="topbar" style={{ paddingBottom: 8 }}>
          <div>
            <div className="label" style={{ marginBottom: 4 }}>Weekplanning</div>
            <div className="h-xl">Weekmenu</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="iconbtn" style={{ width: 38, height: 38 }} onClick={() => setWeekOffset(o => o - 1)}><Icon name="back" size={18} sw={2.2} /></div>
            <div className="iconbtn" style={{ width: 38, height: 38 }} onClick={() => setWeekOffset(o => o + 1)}><Icon name="fwd" size={18} sw={2.2} /></div>
          </div>
        </div>
      )}

      {isDesktop ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div className="iconbtn" style={{ width: 38, height: 38 }} onClick={() => setWeekOffset(o => o - 1)}><Icon name="back" size={18} sw={2.2} /></div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.2px' }}>{weekLabel}</div>
            <div className="iconbtn" style={{ width: 38, height: 38 }} onClick={() => setWeekOffset(o => o + 1)}><Icon name="fwd" size={18} sw={2.2} /></div>
            {weekOffset !== 0 && (
              <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => setWeekOffset(0)}>
                Vandaag
              </button>
            )}
          </div>
          {content}
        </div>
      ) : (
        <>
          <div style={{ padding: '0 20px 10px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dim)' }}>{weekLabel}</div>
            {weekOffset !== 0 && (
              <span className="chip" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setWeekOffset(0)}>Vandaag</span>
            )}
          </div>
          {content}
        </>
      )}

      {picker && (
        <RecipePicker
          recipes={recipes}
          onSelect={handleSelect}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}
