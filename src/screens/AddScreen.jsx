import { useState, useRef } from 'react'
import Icon from '../components/Icon'

const CATEGORIES = ['Ontbijt', 'Lunch', 'Diner', 'Tussendoor', 'Desserts']
const DIETS = ['Vega', 'Veganistisch', 'High-protein', 'Glutenvrij', 'Meal-prep']

function Labeled({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="label">{label}</div>
      {children}
    </div>
  )
}

export default function AddScreen({ nav, onSave, editRecipe }) {
  const r = editRecipe || {}
  const [name, setName] = useState(r.name || '')
  const [cat, setCat] = useState(r.cat || 'Diner')
  const [time, setTime] = useState(r.time ? String(r.time) : '')
  const [servings, setServings] = useState(r.servings ? String(r.servings) : '2')
  const [macro, setMacro] = useState({ kcal: r.kcal ? String(r.kcal) : '', eiwit: r.eiwit ? String(r.eiwit) : '', vet: r.vet ? String(r.vet) : '', kh: r.kh ? String(r.kh) : '' })
  const [tags, setTags] = useState(r.tags || [])
  const [img, setImg] = useState(r.img || null)
  const [imgFile, setImgFile] = useState(null)
  const [ings, setIngs] = useState(r.ingredients?.length ? r.ingredients.map(i => ({ amount: i[0], name: i[1] })) : [{ amount: '', name: '' }, { amount: '', name: '' }])
  const [steps, setSteps] = useState(r.steps?.length ? [...r.steps] : [''])
  const hasMacros = r.kcal || r.eiwit || r.vet || r.kh
  const [showMacros, setShowMacros] = useState(!!hasMacros)
  const [err, setErr] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const toggleTag = t => setTags(a => a.includes(t) ? a.filter(x => x !== t) : [...a, t])
  const onFile = e => {
    const f = e.target.files[0]
    if (f) { setImg(URL.createObjectURL(f)); setImgFile(f) }
  }

  const setIng = (i, k, v) => setIngs(a => a.map((x, j) => j === i ? { ...x, [k]: v } : x))
  const setStep = (i, v) => setSteps(a => a.map((x, j) => j === i ? v : x))

  const save = async () => {
    if (!name.trim()) { setErr(true); return }
    setSaving(true)
    const rec = {
      id: editRecipe?.id || 'u' + Date.now(),
      name: name.trim(),
      cat,
      kcal: +macro.kcal || 0,
      eiwit: +macro.eiwit || 0,
      vet: +macro.vet || 0,
      kh: +macro.kh || 0,
      time: +time || 0,
      servings: +servings || 1,
      diff: 'Eigen recept',
      img,
      tags,
      ingredients: ings.filter(i => i.name.trim()).map(i => [i.amount, i.name]),
      steps: steps.filter(s => s.trim()),
    }
    await onSave(rec, imgFile)
    setSaving(false)
  }

  const macroField = (k, ph) => (
    <input
      className="field"
      inputMode="numeric"
      placeholder={ph}
      value={macro[k]}
      onChange={e => setMacro(m => ({ ...m, [k]: e.target.value.replace(/[^\d]/g, '') }))}
      style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 700, padding: '12px 6px' }}
    />
  )

  return (
    <div className="screen screen-in">
      <div className="screen-hdr">
        <div className="iconbtn" onClick={() => nav.back()}><Icon name="x" size={20} sw={2.2} /></div>
        <div className="h-sm">{editRecipe ? 'Recept bewerken' : 'Nieuw recept'}</div>
        <button className="btn btn-primary" style={{ padding: '9px 16px', fontSize: 14 }} onClick={save} disabled={saving}>
          {saving ? 'Bezig…' : 'Opslaan'}
        </button>
      </div>

      <div className="scroll" style={{ padding: '4px 20px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          onClick={() => fileRef.current.click()}
          style={{ position: 'relative', height: 168, borderRadius: 20, overflow: 'hidden', border: '1.5px dashed var(--line-strong)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--dim)' }}
        >
          {img && <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          {!img && <><Icon name="camera" size={28} sw={1.6} /><span style={{ fontSize: 14, fontWeight: 600 }}>Foto toevoegen</span></>}
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
        </div>

        <Labeled label="Titel">
          <input
            className="field"
            placeholder="bv. Kip curry met mango"
            value={name}
            onChange={e => { setName(e.target.value); setErr(false) }}
            style={err ? { borderColor: 'var(--danger)' } : null}
          />
          {err && <span style={{ color: 'var(--danger)', fontSize: 13 }}>Geef je recept een titel.</span>}
        </Labeled>

        <Labeled label="Maaltijdtype">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <span key={c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</span>
            ))}
          </div>
        </Labeled>

        <div style={{ display: 'flex', gap: 12 }}>
          <Labeled label="Tijd (min)" style={{ flex: 1 }}>
            <input className="field" inputMode="numeric" placeholder="25" value={time} onChange={e => setTime(e.target.value.replace(/[^\d]/g, ''))} />
          </Labeled>
          <Labeled label="Porties" style={{ flex: 1 }}>
            <input className="field" inputMode="numeric" placeholder="2" value={servings} onChange={e => setServings(e.target.value.replace(/[^\d]/g, ''))} />
          </Labeled>
        </div>

        <div>
          {showMacros ? (
            <Labeled label="Macro's (per portie)">
              <div style={{ display: 'flex', gap: 8 }}>
                {[['kcal', 'kcal', 'kcal'], ['eiwit', 'g', 'eiwit'], ['vet', 'g', 'vet'], ['kh', 'g', 'koolh.']].map(([k, ph, label]) => (
                  <div key={k} style={{ flex: 1 }}>
                    {macroField(k, ph)}
                    <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
              <span
                className="chip"
                style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--faint)' }}
                onClick={() => { setShowMacros(false); setMacro({ kcal: '', eiwit: '', vet: '', kh: '' }) }}
              >
                <Icon name="x" size={14} sw={2} /> Macro's verbergen
              </span>
            </Labeled>
          ) : (
            <span
              className="chip"
              style={{ fontSize: 13 }}
              onClick={() => setShowMacros(true)}
            >
              <Icon name="plus" size={14} sw={2.4} /> Macro's toevoegen
            </span>
          )}
        </div>

        <Labeled label="Dieet">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DIETS.map(d => (
              <span key={d} className={'chip' + (tags.includes(d) ? ' on' : '')} onClick={() => toggleTag(d)}>{d}</span>
            ))}
          </div>
        </Labeled>

        <Labeled label="Ingrediënten">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {ings.map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="field" placeholder="200 g" value={ing.amount} onChange={e => setIng(i, 'amount', e.target.value)} style={{ width: 88, flexShrink: 0, textAlign: 'center' }} />
                <input className="field" placeholder="ingrediënt" value={ing.name} onChange={e => setIng(i, 'name', e.target.value)} />
                <div className="iconbtn" style={{ width: 38, height: 38 }} onClick={() => setIngs(a => a.filter((_, j) => j !== i))}>
                  <Icon name="x" size={16} sw={2.2} style={{ color: 'var(--faint)' }} />
                </div>
              </div>
            ))}
          </div>
          <span className="chip" style={{ alignSelf: 'flex-start', marginTop: 2 }} onClick={() => setIngs(a => [...a, { amount: '', name: '' }])}>
            <Icon name="plus" size={15} sw={2.4} /> Ingrediënt
          </span>
        </Labeled>

        <Labeled label="Bereiding">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 14 }}>{i + 1}</div>
                <textarea className="field" rows={2} placeholder="Beschrijf de stap…" value={s} onChange={e => setStep(i, e.target.value)} style={{ resize: 'none', fontFamily: 'var(--sans)', lineHeight: 1.4 }} />
                <div className="iconbtn" style={{ width: 38, height: 38 }} onClick={() => setSteps(a => a.filter((_, j) => j !== i))}>
                  <Icon name="x" size={16} sw={2.2} style={{ color: 'var(--faint)' }} />
                </div>
              </div>
            ))}
          </div>
          <span className="chip" style={{ alignSelf: 'flex-start', marginTop: 2 }} onClick={() => setSteps(a => [...a, ''])}>
            <Icon name="plus" size={15} sw={2.4} /> Stap
          </span>
        </Labeled>

        <button className="btn btn-primary btn-block" onClick={save} disabled={saving} style={{ marginTop: 6 }}>
          <Icon name="check" size={19} sw={2.4} /> {editRecipe ? 'Wijzigingen opslaan' : 'Recept opslaan'}
        </button>
      </div>
    </div>
  )
}
