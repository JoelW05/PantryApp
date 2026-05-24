'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Plus, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { SavedAIRecipe } from '@/types'

// ─── Types ─────────────────────────────────────────────────────────────────────

type MealType = 'breakfast' | 'lunch' | 'dinner'

interface PlanEntry {
  id: string
  plan_date: string
  meal_type: MealType
  title: string
  emoji: string
  calories: number | null
  recipe_id: string | null
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const MEAL_TYPES: { type: MealType; label: string; emoji: string }[] = [
  { type: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { type: 'lunch',     label: 'Lunch',     emoji: '☀️' },
  { type: 'dinner',    label: 'Dinner',    emoji: '🌙' },
]

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function formatShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function MealPlanClient({
  userId,
  weekStart,
  initialPlan,
  savedRecipes,
}: {
  userId: string
  weekStart: string
  initialPlan: PlanEntry[]
  savedRecipes: SavedAIRecipe[]
}) {
  const supabase = createClient()
  const [weekOffset, setWeekOffset] = useState(0)
  const [plan, setPlan] = useState<PlanEntry[]>(initialPlan)
  const [picker, setPicker] = useState<{ date: string; meal: MealType } | null>(null)
  const [search, setSearch] = useState('')
  const [loadingCell, setLoadingCell] = useState<string | null>(null)

  // Derived week
  const currentStart = (() => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + weekOffset * 7)
    return d.toISOString().split('T')[0]
  })()

  const days = Array.from({ length: 7 }, (_, i) => addDays(currentStart, i))
  const today = new Date().toISOString().split('T')[0]

  function getEntry(date: string, meal: MealType): PlanEntry | undefined {
    return plan.find(p => p.plan_date === date && p.meal_type === meal)
  }

  function dailyCalories(date: string): number {
    return plan
      .filter(p => p.plan_date === date)
      .reduce((sum, p) => sum + (p.calories ?? 0), 0)
  }

  async function assignRecipe(recipe: SavedAIRecipe) {
    if (!picker) return
    const key = `${picker.date}-${picker.meal}`
    setLoadingCell(key)

    const row = {
      user_id: userId,
      plan_date: picker.date,
      meal_type: picker.meal,
      title: recipe.title,
      emoji: recipe.emoji,
      calories: recipe.calories ?? null,
      recipe_id: recipe.recipe_id,
    }

    const existing = getEntry(picker.date, picker.meal)
    let saved: PlanEntry | null = null

    if (existing) {
      const { data } = await supabase
        .from('meal_plans')
        .update(row)
        .eq('id', existing.id)
        .select()
        .single()
      saved = data as PlanEntry
      if (saved) setPlan(prev => prev.map(p => p.id === existing.id ? saved! : p))
    } else {
      const { data } = await supabase
        .from('meal_plans')
        .insert(row)
        .select()
        .single()
      saved = data as PlanEntry
      if (saved) setPlan(prev => [...prev, saved!])
    }

    setLoadingCell(null)
    setPicker(null)
    setSearch('')
  }

  async function removeEntry(entry: PlanEntry) {
    await supabase.from('meal_plans').delete().eq('id', entry.id)
    setPlan(prev => prev.filter(p => p.id !== entry.id))
  }

  async function loadWeek(offset: number) {
    setWeekOffset(offset)
    const start = (() => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + offset * 7)
      return d.toISOString().split('T')[0]
    })()
    const end = addDays(start, 6)
    const { data } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .gte('plan_date', start)
      .lte('plan_date', end)
    if (data) setPlan(data as PlanEntry[])
  }

  const filteredRecipes = search
    ? savedRecipes.filter(r => r.title.toLowerCase().includes(search.toLowerCase()))
    : savedRecipes

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => loadWeek(weekOffset - 1)}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div className="text-sm font-semibold text-gray-700">
          {weekOffset === 0 ? 'This week' : weekOffset === 1 ? 'Next week' : weekOffset === -1 ? 'Last week' : null}
          <span className="text-gray-400 font-normal ml-2">
            {formatShort(currentStart)} – {formatShort(addDays(currentStart, 6))}
          </span>
        </div>
        <button onClick={() => loadWeek(weekOffset + 1)}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-gray-100">
          <div className="py-3 px-3 text-xs font-medium text-gray-400" />
          {days.map((date, i) => (
            <div key={date} className={`py-3 px-2 text-center border-l border-gray-100 ${date === today ? 'bg-emerald-50' : ''}`}>
              <p className={`text-xs font-semibold ${date === today ? 'text-emerald-600' : 'text-gray-500'}`}>{DAY_LABELS[i]}</p>
              <p className={`text-sm font-bold mt-0.5 ${date === today ? 'text-emerald-700' : 'text-gray-700'}`}>
                {new Date(date).getDate()}
              </p>
              {dailyCalories(date) > 0 && (
                <p className="text-xs text-gray-400 flex items-center justify-center gap-0.5 mt-0.5">
                  <Flame size={9} className="text-orange-400" />{dailyCalories(date)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Meal rows */}
        {MEAL_TYPES.map(({ type, label, emoji }) => (
          <div key={type} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0 min-h-[80px]">
            {/* Row label */}
            <div className="flex flex-col items-center justify-center py-3 px-2 bg-gray-50 border-r border-gray-100">
              <span className="text-base leading-none">{emoji}</span>
              <span className="text-xs text-gray-500 font-medium mt-1">{label}</span>
            </div>

            {/* Day cells */}
            {days.map(date => {
              const entry = getEntry(date, type)
              const key = `${date}-${type}`
              const isLoading = loadingCell === key

              return (
                <div key={date}
                  className={`relative border-l border-gray-100 p-1.5 ${date === today ? 'bg-emerald-50/40' : ''}`}>
                  {entry ? (
                    <div className="h-full rounded-lg bg-white border border-gray-200 p-1.5 flex flex-col gap-1 shadow-sm group">
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-sm leading-none">{entry.emoji}</span>
                        <button
                          onClick={() => removeEntry(entry)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 shrink-0">
                          <X size={10} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-700 font-medium leading-tight line-clamp-2">{entry.title}</p>
                      {entry.calories && <p className="text-xs text-gray-400">{entry.calories} kcal</p>}
                    </div>
                  ) : (
                    <button
                      onClick={() => { setPicker({ date, meal: type }); setSearch('') }}
                      disabled={isLoading}
                      className="h-full w-full min-h-[64px] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-emerald-300 hover:text-emerald-400 transition-colors">
                      {isLoading
                        ? <span className="text-xs text-gray-300">…</span>
                        : <Plus size={14} />}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Saved recipes (below calendar on mobile, useful reference) */}
      {savedRecipes.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No saved recipes yet. Save recipes from Meal Ideas to add them to your plan.
        </div>
      )}

      {/* Picker modal */}
      {picker && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400">
                  {MEAL_TYPES.find(m => m.type === picker.meal)?.emoji} {MEAL_TYPES.find(m => m.type === picker.meal)?.label} · {formatShort(picker.date)}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">Choose a recipe</p>
              </div>
              <button onClick={() => setPicker(null)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-gray-100">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search saved recipes…"
                autoFocus
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="overflow-y-auto max-h-80 divide-y divide-gray-50">
              {filteredRecipes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No saved recipes found.</p>
              ) : (
                filteredRecipes.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => assignRecipe(recipe)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left">
                    <span className="text-2xl shrink-0">{recipe.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{recipe.title}</p>
                      <p className="text-xs text-gray-400">
                        {recipe.ready_in_minutes && `${recipe.ready_in_minutes} min · `}
                        {recipe.calories && `${Math.round(recipe.calories)} kcal`}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
