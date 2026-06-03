import { useState } from 'react'
import Icon from '../components/Icon'
import { RecipeRailCard } from './HomeScreen'
import { supabase } from '../lib/supabase'

const DIETS = ['Vega', 'Veganistisch', 'High-protein', 'Glutenvrij', 'Meal-prep', 'Lactosevrij']
const SERVING_OPTIONS = [1, 2, 3, 4]

function SectionHeader({ icon, label, open, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={17} sw={1.8} />
      </div>
      <span style={{ flex: 1, fontSize: 15.5, fontWeight: 500 }}>{label}</span>
      <Icon name={open ? 'minus' : 'plus'} size={16} sw={2} style={{ color: 'var(--faint)', transition: 'transform .2s' }} />
    </div>
  )
}

function AccountPanel({ user, onSaved }) {
  const initial = user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const [name, setName] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const hasCredentials = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    if (hasCredentials) {
      await supabase.auth.updateUser({ data: { full_name: name.trim() } })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved && onSaved(name.trim())
  }

  return (
    <div className="settings-panel-body">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="label">Weergavenaam</div>
        <input
          className="field"
          value={name}
          onChange={e => { setName(e.target.value); setSaved(false) }}
          placeholder="Jouw naam"
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="label">E-mailadres</div>
        <input
          className="field"
          value={user?.email || ''}
          readOnly
          style={{ color: 'var(--faint)', cursor: 'default' }}
        />
        <div style={{ fontSize: 12, color: 'var(--faint)' }}>E-mailadres kan niet worden gewijzigd.</div>
      </div>
      <button
        className="btn btn-primary"
        style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: 14 }}
        onClick={save}
        disabled={saving || !name.trim() || name.trim() === initial}
      >
        {saved ? <><Icon name="check" size={15} sw={2.6} /> Opgeslagen</> : saving ? 'Bezig…' : 'Opslaan'}
      </button>
    </div>
  )
}

function VoorkeurenPanel({ user }) {
  const stored = user?.user_metadata?.preferences || {}
  const [diets, setDiets] = useState(stored.diets || [])
  const [servings, setServings] = useState(stored.servings || 2)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const hasCredentials = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

  const toggleDiet = d => setDiets(a => a.includes(d) ? a.filter(x => x !== d) : [...a, d])

  const save = async () => {
    setSaving(true)
    if (hasCredentials) {
      await supabase.auth.updateUser({ data: { preferences: { diets, servings } } })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="settings-panel-body">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="label">Dieetvoorkeur</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DIETS.map(d => (
            <span key={d} className={'chip' + (diets.includes(d) ? ' on' : '')} onClick={() => toggleDiet(d)}>{d}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="label">Standaard porties</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SERVING_OPTIONS.map(n => (
            <span
              key={n}
              className={'chip' + (servings === n ? ' on' : '')}
              onClick={() => setServings(n)}
              style={{ minWidth: 44, justifyContent: 'center' }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>
      <button
        className="btn btn-primary"
        style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: 14 }}
        onClick={save}
        disabled={saving}
      >
        {saved ? <><Icon name="check" size={15} sw={2.6} /> Opgeslagen</> : saving ? 'Bezig…' : 'Opslaan'}
      </button>
    </div>
  )
}

export default function ProfielScreen({ nav, onLogout, recipes, favorites, user }) {
  const mine = recipes.filter(r => r.user_id === user?.id)
  const favRecipes = recipes.filter(r => favorites.has(r.id))

  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Gebruiker'
  )
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const email = user?.email || ''

  const [openSection, setOpenSection] = useState(null)
  const toggle = key => setOpenSection(k => k === key ? null : key)

  return (
    <div className="screen screen-in">
      <div className="scroll" style={{ paddingBottom: 120 }}>
        <div className="topbar" style={{ paddingBottom: 14 }}>
          <div className="h-xl">Profiel</div>
          <div className="iconbtn" onClick={() => toggle('account')}><Icon name="edit" size={19} sw={1.9} /></div>
        </div>

        <div style={{ padding: '0 20px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="avatar" style={{ width: 60, height: 60, borderRadius: 20, fontSize: 24 }}>{initials}</div>
            <div>
              <div className="h-md">{displayName}</div>
              <div className="body" style={{ fontSize: 14 }}>{email}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 12px' }}>
            <span className="h-md">Mijn recepten</span>
            <span className="num" style={{ fontSize: 13, color: 'var(--dim)' }}>{mine.length}</span>
          </div>
          {mine.length ? (
            <div className="rail">
              {mine.map(r => (
                <RecipeRailCard key={r.id} r={r} onOpen={x => nav.go('detail', { id: x.id })} w={168} h={120} />
              ))}
            </div>
          ) : (
            <div style={{ margin: '0 20px', padding: 20, borderRadius: 18, border: '1.5px dashed var(--line-strong)', textAlign: 'center' }}>
              <div className="body" style={{ marginBottom: 12 }}>Je hebt nog geen eigen recepten.</div>
              <button className="btn btn-primary" onClick={() => nav.go('add')} style={{ padding: '11px 18px', fontSize: 15 }}>
                <Icon name="plus" size={17} sw={2.4} /> Maak je eerste recept
              </button>
            </div>
          )}
        </div>

        {favRecipes.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ padding: '0 20px 12px' }}><span className="h-md">Opgeslagen</span></div>
            <div className="rail">
              {favRecipes.map(r => (
                <RecipeRailCard key={r.id} r={r} onOpen={x => nav.go('detail', { id: x.id })} w={168} h={120} />
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '0 20px' }}>
          <div className="label" style={{ marginBottom: 10 }}>Instellingen</div>
          <div className="card" style={{ borderRadius: 18, overflow: 'hidden' }}>
            <SectionHeader icon="user" label="Account" open={openSection === 'account'} onToggle={() => toggle('account')} />
            {openSection === 'account' && (
              <AccountPanel user={user} onSaved={setDisplayName} />
            )}
            <div style={{ borderTop: '1px solid var(--line)' }} />
            <SectionHeader icon="bookmark" label="Voorkeuren" open={openSection === 'voorkeuren'} onToggle={() => toggle('voorkeuren')} />
            {openSection === 'voorkeuren' && (
              <VoorkeurenPanel user={user} />
            )}
          </div>
          <button className="btn btn-ghost btn-block" onClick={onLogout} style={{ marginTop: 16, color: 'var(--danger)' }}>
            Uitloggen
          </button>
        </div>
      </div>
    </div>
  )
}
