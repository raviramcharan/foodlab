import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { SEED_RECIPES } from './data/seed'
import Icon from './components/Icon'
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import DetailScreen from './screens/DetailScreen'
import AddScreen from './screens/AddScreen'
import FiltersScreen, { ResultsScreen } from './screens/FiltersScreen'
import RecommendScreen from './screens/RecommendScreen'
import DagschemaScreen from './screens/DagschemaScreen'
import ProfielScreen from './screens/ProfielScreen'

const DEFAULT_GOALS = { kcal: 2100, eiwit: 140, vet: 70, kh: 210 }
const TAB_SCREENS = ['home', 'dagschema', 'recommend', 'profiel']
const NAV = [
  { id: 'dagschema', label: 'Dagschema', icon: 'cal' },
  { id: 'home', label: 'Recepten', icon: 'bowl' },
  { id: 'recommend', label: 'Ontdek', icon: 'spark' },
  { id: 'profiel', label: 'Profiel', icon: 'user' },
]

function BottomNav({ current, onTab }) {
  return (
    <div className="nav">
      {NAV.map(n => (
        <div key={n.id} className={'navitem' + (current === n.id ? ' on' : '')} onClick={() => onTab(n.id)}>
          <Icon name={n.icon} size={23} sw={current === n.id ? 2.1 : 1.8} fill={n.id === 'spark' && current === n.id} />
          {n.label}
        </div>
      ))}
    </div>
  )
}

function Toast({ message }) {
  return <div className="toast">{message}</div>
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [stack, setStack] = useState([{ screen: 'home', params: {} }])
  const [recipes, setRecipes] = useState(SEED_RECIPES)
  const [favorites, setFavorites] = useState(new Set())
  const [plan, setPlan] = useState({ Ontbijt: 'r2', Lunch: 'r4', Tussendoor: 'r10' })
  const [goals, setGoals] = useState(DEFAULT_GOALS)
  const [toast, setToast] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(window.__toastTimer)
    window.__toastTimer = setTimeout(() => setToast(null), 1900)
  }, [])

  // Auth state listener
  useEffect(() => {
    const hasCredentials = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

    if (!hasCredentials) {
      setAuthLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load data when user is set (only with real Supabase credentials)
  useEffect(() => {
    const hasCredentials = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
    if (user && hasCredentials) loadData()
  }, [user])

  const loadData = async () => {
    setDataLoading(true)
    try {
      const [recipesRes, favsRes, goalsRes, planRes] = await Promise.all([
        supabase.from('recipes').select('*').order('created_at', { ascending: true }),
        supabase.from('favorites').select('recipe_id').eq('user_id', user.id),
        supabase.from('macro_goals').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('day_plans').select('*').eq('user_id', user.id).eq('date', todayStr()),
      ])

      if (recipesRes.data) {
        setRecipes(recipesRes.data.map(normalizeRecipe))
      }
      if (favsRes.data) {
        setFavorites(new Set(favsRes.data.map(f => f.recipe_id)))
      }
      if (goalsRes.data) {
        setGoals(goalsRes.data)
      }
      if (planRes.data?.length) {
        const p = {}
        planRes.data.forEach(row => { p[row.meal] = row.recipe_id })
        setPlan(p)
      }
    } catch (err) {
      console.error('loadData error', err)
    }
    setDataLoading(false)
  }

  const todayStr = () => {
    const d = new Date()
    return d.toISOString().slice(0, 10)
  }

  const normalizeRecipe = (r) => ({
    ...r,
    // ingredients stored as jsonb array of [amount, name]
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    steps: Array.isArray(r.steps) ? r.steps : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
  })

  // Navigation
  const nav = {
    go: (screen, params = {}) => setStack(s => [...s, { screen, params }]),
    back: () => setStack(s => s.length > 1 ? s.slice(0, -1) : s),
    tab: (screen) => setStack([{ screen, params: {} }]),
  }

  const cur = stack[stack.length - 1]
  const showNav = TAB_SCREENS.includes(cur.screen)

  const onAddToPlan = async (r) => {
    const newPlan = { ...plan, [r.cat]: r.id }
    setPlan(newPlan)
    showToast('Toegevoegd aan ' + r.cat.toLowerCase())

    if (user) {
      await supabase.from('day_plans').upsert({
        user_id: user.id,
        date: todayStr(),
        meal: r.cat,
        recipe_id: r.id,
      })
    }
  }

  const onPlanChange = async (newPlan) => {
    const removed = Object.keys(plan).filter(meal => !newPlan[meal])
    setPlan(newPlan)
    if (user) {
      for (const meal of removed) {
        await supabase.from('day_plans')
          .delete()
          .eq('user_id', user.id)
          .eq('date', todayStr())
          .eq('meal', meal)
      }
    }
  }

  const onSaveRecipe = async (rec, imgFile) => {
    // Upload image if provided
    let imgUrl = rec.img
    if (imgFile && user) {
      const ext = imgFile.name.split('.').pop()
      const path = `${user.id}/${rec.id}.${ext}`
      const { data } = await supabase.storage.from('recipe-images').upload(path, imgFile, { upsert: true })
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('recipe-images').getPublicUrl(path)
        imgUrl = publicUrl
      }
    }

    const row = {
      id: rec.id,
      user_id: user?.id,
      name: rec.name,
      cat: rec.cat,
      kcal: rec.kcal,
      eiwit: rec.eiwit,
      vet: rec.vet,
      kh: rec.kh,
      time: rec.time,
      servings: rec.servings,
      diff: rec.diff,
      img: imgUrl,
      tags: rec.tags,
      ingredients: rec.ingredients,
      steps: rec.steps,
    }

    const { data, error } = await supabase.from('recipes').upsert(row).select().single()
    if (data) {
      setRecipes(prev => {
        const idx = prev.findIndex(r => r.id === data.id)
        const normalized = normalizeRecipe(data)
        if (idx >= 0) return prev.map(r => r.id === data.id ? normalized : r)
        return [normalized, ...prev]
      })
    }
    if (!error) {
      nav.tab('home')
      showToast('Recept opgeslagen')
    }
  }

  const onToggleFav = async (recipeId) => {
    const isFav = favorites.has(recipeId)
    const next = new Set(favorites)
    if (isFav) {
      next.delete(recipeId)
      if (user) await supabase.from('favorites').delete().eq('user_id', user.id).eq('recipe_id', recipeId)
    } else {
      next.add(recipeId)
      if (user) await supabase.from('favorites').insert({ user_id: user.id, recipe_id: recipeId })
      showToast('Bewaard')
    }
    setFavorites(next)
  }

  const onLogout = async () => {
    await supabase.auth.signOut()
    setStack([{ screen: 'home', params: {} }])
    setPlan({})
    setFavorites(new Set())
  }

  if (authLoading) {
    return (
      <div className="app-shell">
        <div className="app">
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>
              Food<span style={{ color: 'var(--accent)' }}>lab</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const hasCredentials = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

  const onDemoAuth = () => {
    setUser({ id: 'demo', email: 'demo@foodlab.nl', user_metadata: { full_name: 'Sanne de Vries' } })
    nav.tab('home')
  }

  let body
  if (!user) {
    body = <LoginScreen onAuth={hasCredentials ? () => {} : onDemoAuth} demoMode={!hasCredentials} />
  } else {
    switch (cur.screen) {
      case 'home':
        body = <HomeScreen key="home" nav={nav} recipes={recipes} user={user} />
        break
      case 'detail':
        body = <DetailScreen key={cur.params.id} nav={nav} params={cur.params} recipes={recipes} onAddToPlan={onAddToPlan} favorites={favorites} onToggleFav={onToggleFav} />
        break
      case 'add':
        body = <AddScreen key="add" nav={nav} onSave={onSaveRecipe} editRecipe={cur.params.recipe} />
        break
      case 'filters':
        body = <FiltersScreen key="filters" nav={nav} params={cur.params} recipes={recipes} />
        break
      case 'results':
        body = <ResultsScreen key="results" nav={nav} params={cur.params} recipes={recipes} />
        break
      case 'recommend':
        body = <RecommendScreen key="recommend" nav={nav} recipes={recipes} onSaveRecipe={r => { onToggleFav(r.id) }} />
        break
      case 'dagschema':
        body = <DagschemaScreen key="dag" nav={nav} plan={plan} onPlanChange={onPlanChange} goals={goals} recipes={recipes} />
        break
      case 'profiel':
        body = <ProfielScreen key="profiel" nav={nav} goals={goals} onLogout={onLogout} recipes={recipes} favorites={favorites} user={user} />
        break
      default:
        body = <HomeScreen nav={nav} recipes={recipes} user={user} />
    }
  }

  return (
    <div className="app-shell">
      <div className="app">
        {body}
        {user && cur.screen === 'home' && (
          <button className="fab" onClick={() => nav.go('add')} aria-label="Recept toevoegen">
            <Icon name="plus" size={26} sw={2.4} />
          </button>
        )}
        {user && showNav && <BottomNav current={cur.screen} onTab={nav.tab} />}
        {toast && <Toast message={toast} />}
      </div>
    </div>
  )
}
