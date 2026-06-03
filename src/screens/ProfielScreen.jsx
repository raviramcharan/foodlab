import Icon from '../components/Icon'
import Macros from '../components/Macros'
import { RecipeRailCard } from './HomeScreen'

function SettingRow({ icon, label, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--line)', cursor: 'pointer' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={17} sw={1.8} />
      </div>
      <span style={{ flex: 1, fontSize: 15.5 }}>{label}</span>
      <Icon name="fwd" size={16} style={{ color: 'var(--faint)' }} />
    </div>
  )
}

export default function ProfielScreen({ nav, goals, onLogout, recipes, favorites, user }) {
  const mine = recipes.filter(r => r.user_id === user?.id)
  const favRecipes = recipes.filter(r => favorites.has(r.id))

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Gebruiker'
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const email = user?.email || ''

  return (
    <div className="screen screen-in">
      <div className="scroll" style={{ paddingBottom: 120 }}>
        <div className="topbar" style={{ paddingBottom: 14 }}>
          <div className="h-xl">Profiel</div>
          <div className="iconbtn"><Icon name="edit" size={19} sw={1.9} /></div>
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

        <div style={{ padding: '0 20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="label">Mijn macro-doelen</span>
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Wijzig</span>
          </div>
          <Macros r={{ kcal: goals.kcal, eiwit: goals.eiwit, vet: goals.vet, kh: goals.kh }} />
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
            <div style={{ padding: '0 20px 12px' }}><span className="h-md">Favorieten</span></div>
            <div className="rail">
              {favRecipes.map(r => (
                <RecipeRailCard key={r.id} r={r} onOpen={x => nav.go('detail', { id: x.id })} w={168} h={120} />
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '0 20px' }}>
          <div className="label" style={{ marginBottom: 4 }}>Instellingen</div>
          <SettingRow icon="user" label="Account" />
          <SettingRow icon="gauge" label="Macro-doelen" />
          <SettingRow icon="bookmark" label="Voorkeuren" last />
          <button className="btn btn-ghost btn-block" onClick={onLogout} style={{ marginTop: 18, color: 'var(--danger)' }}>
            Uitloggen
          </button>
        </div>
      </div>
    </div>
  )
}
