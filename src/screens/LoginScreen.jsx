import { useState } from 'react'
import Icon, { GoogleLogo } from '../components/Icon'
import { supabase } from '../lib/supabase'

function LoginForm({ onAuth, demoMode, loading, setLoading }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const sendLink = async () => {
    if (!email.trim()) return
    if (demoMode) { onAuth(); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  const signInWithOAuth = async (provider) => {
    if (demoMode) { onAuth(); return }
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })
  }

  const SocialBtn = ({ icon, label, provider, isGoogle }) => (
    <button className="btn btn-ghost btn-block" onClick={() => signInWithOAuth(provider)} disabled={loading} style={{ justifyContent: 'center' }}>
      {isGoogle ? <GoogleLogo size={20} /> : <Icon name={icon} size={20} fill={icon === 'apple'} />}
      {label}
    </button>
  )

  return (
    <>
      {!sent ? (
        <>
          <div className="label" style={{ marginBottom: 8 }}>Log in met een magische link</div>
          <div className="search" style={{ marginBottom: 12 }}>
            <Icon name="mail" size={19} style={{ color: 'var(--faint)' }} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendLink()}
              placeholder="jij@email.nl"
            />
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>{error}</div>}
          <button className="btn btn-primary btn-block" onClick={sendLink} disabled={loading || !email.trim()}>
            {loading ? 'Bezig…' : 'Stuur me een link'}
          </button>
        </>
      ) : (
        <div className="card screen-in" style={{ padding: 18, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 15, background: 'var(--surface-3)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Icon name="mail" size={24} />
          </div>
          <div className="h-sm" style={{ marginBottom: 5 }}>Check je mail</div>
          <div className="body" style={{ marginBottom: 14 }}>We stuurden een link naar {email}.</div>
          <button className="btn btn-primary btn-block" onClick={onAuth}>Ik heb de link geopend →</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div className="hr" style={{ flex: 1 }} /><span className="label">of</span><div className="hr" style={{ flex: 1 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SocialBtn icon="apple" label="Doorgaan met Apple" provider="apple" />
        <SocialBtn isGoogle label="Doorgaan met Google" provider="google" />
      </div>
    </>
  )
}

export default function LoginScreen({ onAuth, demoMode = false, isDesktop = false }) {
  const [loading, setLoading] = useState(false)

  if (isDesktop) {
    return (
      <div className="login-shell">
        <div className="login-brand">
          <div className="login-brand-logo">Food<span>lab</span></div>
          <div className="login-brand-tagline">Jouw persoonlijke<br />receptendatabase</div>
          <div className="login-brand-sub">Sla recepten op, plan maaltijden en ontdek nieuwe gerechten — samen met iedereen die jij uitnodigt.</div>
          <div className="login-brand-features">
            {[
              { icon: 'bowl', text: 'Recepten opslaan en organiseren' },
              { icon: 'cal', text: 'Dagelijkse maaltijdplanning' },
              { icon: 'spark', text: 'Nieuwe recepten ontdekken' },
              { icon: 'users', text: 'Gedeeld met meerdere gebruikers' },
            ].map(f => (
              <div key={f.icon} className="login-brand-feat">
                <div className="login-brand-feat-icon"><Icon name={f.icon} size={20} sw={1.8} /></div>
                <span style={{ fontSize: 15, color: 'var(--dim)', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="login-form-panel">
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.5px', marginBottom: 6 }}>Inloggen</div>
            <div className="body">Welkom terug bij Foodlab.</div>
          </div>
          <LoginForm onAuth={onAuth} demoMode={demoMode} loading={loading} setLoading={setLoading} />
          <div className="body" style={{ textAlign: 'center', fontSize: 13, marginTop: 28 }}>
            Nog geen account? <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Registreer gratis</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen screen-in" style={{ justifyContent: 'center', padding: '0 28px 40px' }}>
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1px' }}>
          Food<span style={{ color: 'var(--accent)' }}>lab</span>
        </div>
        <div className="body" style={{ marginTop: 6 }}>Jouw persoonlijke receptendatabase</div>
      </div>
      <div style={{ flex: 1 }} />
      <LoginForm onAuth={onAuth} demoMode={demoMode} loading={loading} setLoading={setLoading} />
      <div style={{ flex: 1 }} />
      <div className="body" style={{ textAlign: 'center', fontSize: 13 }}>
        Nog geen account? <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Registreer</span>
      </div>
    </div>
  )
}
