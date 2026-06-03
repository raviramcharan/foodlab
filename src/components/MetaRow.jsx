import Icon from './Icon'

export default function MetaRow({ r, color = 'var(--dim)' }) {
  return (
    <div style={{ display: 'flex', gap: 16, color, fontSize: 13.5, fontWeight: 600 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon name="clock" size={16} sw={2} />{r.time} min
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon name="users" size={16} sw={2} />{r.servings} pers.
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon name="gauge" size={16} sw={2} />{r.diff}
      </span>
    </div>
  )
}
