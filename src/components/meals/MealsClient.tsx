'use client'
import { useState } from 'react'
import { Clock, ChefHat, Sparkles, X, Bookmark, BookmarkCheck, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import RecipeModal from './RecipeModal'
import type { AIRecipe, ScheduleBlock } from '@/types'

// ─── Types ─────────────────────────────────────────────────────────────────────

type MealType = 'breakfast' | 'lunch' | 'dinner'

interface MealTypeData {
  recipes: AIRecipe[]
  generatedAt: string | null
  usedToday: boolean
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const MEAL_TABS: { type: MealType; label: string; emoji: string }[] = [
  { type: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { type: 'lunch',     label: 'Lunch',     emoji: '☀️' },
  { type: 'dinner',    label: 'Dinner',    emoji: '🌙' },
]

const GRADIENTS = [
  'from-orange-400 to-amber-500',
  'from-emerald-400 to-teal-500',
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-rose-400 to-pink-500',
  'from-yellow-400 to-orange-400',
]

function gradientFor(id: string) {
  let hash = 0
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return GRADIENTS[hash % GRADIENTS.length]
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function MealsClient({
  cookingWindows,
  userId,
  initialBreakfast,
  initialLunch,
  initialDinner,
  initialDismissed,
  initialSavedIds,
}: {
  cookingWindows: ScheduleBlock[]
  userId: string
  initialBreakfast: MealTypeData
  initialLunch: MealTypeData
  initialDinner: MealTypeData
  initialDismissed: string[]
  initialSavedIds: string[]
}) {
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<MealType>('breakfast')
  const [mealData, setMealData] = useState<Record<MealType, MealTypeData>>({
    breakfast: initialBreakfast,
    lunch:     initialLunch,
    dinner:    initialDinner,
  })
  const [dismissed, setDismissed] = useState<string[]>(initialDismissed)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds))
  const [loading, setLoading] = useState<MealType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [maxTime, setMaxTime] = useState<number | null>(null)
  const [selected, setSelected] = useState<AIRecipe | null>(null)

  // ── Derived ────────────────────────────────────────────────────────────────

  const current = mealData[activeTab]
  const filtered = maxTime
    ? current.recipes.filter(r => r.readyInMinutes <= maxTime)
    : current.recipes

  const nextWindow = cookingWindows[0]
  const windowMins = nextWindow
    ? Math.round(
        (new Date(nextWindow.end_time).getTime() - new Date(nextWindow.start_time).getTime()) / 60000
      )
    : null

  // ── Actions ────────────────────────────────────────────────────────────────

  async function generate() {
    setLoading(activeTab)
    setError(null)
    try {
      const params = new URLSearchParams({ mealType: activeTab })
      if (maxTime) params.set('maxTime', String(maxTime))
      if (dismissed.length) params.set('dismissed', dismissed.join(','))
      const res = await fetch('/api/meals/suggest?' + params.toString())
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? `Server error ${res.status}`)
      setMealData(prev => ({
        ...prev,
        [activeTab]: {
          recipes: Array.isArray(data.recipes) ? data.recipes : [],
          generatedAt: data.generatedAt ?? null,
          usedToday: data.usedToday ?? false,
        },
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function dismissMeal(recipe: AIRecipe) {
    const next = [...dismissed, recipe.id]
    setDismissed(next)
    setMealData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        recipes: prev[activeTab].recipes.filter(r => r.id !== recipe.id),
      },
    }))
    await supabase
      .from('food_preferences')
      .upsert({ user_id: userId, dismissed_meal_ids: next }, { onConflict: 'user_id' })
  }

  async function toggleSave(recipe: AIRecipe, e: React.MouseEvent) {
    e.stopPropagation()
    if (savedIds.has(recipe.id)) {
      await supabase
        .from('saved_ai_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipe.id)
      setSavedIds(prev => { const next = new Set(prev); next.delete(recipe.id); return next })
    } else {
      await supabase.from('saved_ai_recipes').upsert({
        user_id: userId,
        recipe_id: recipe.id,
        title: recipe.title,
        emoji: recipe.emoji,
        ready_in_minutes: recipe.readyInMinutes,
        servings: recipe.servings,
        calories: recipe.calories,
        protein_g: recipe.protein_g,
        carbs_g: recipe.carbs_g,
        fat_g: recipe.fat_g,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        used_pantry_items: recipe.usedPantryItems,
      }, { onConflict: 'user_id,recipe_id' })
      setSavedIds(prev => new Set([...prev, recipe.id]))
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Meal type tabs */}
      <div className="flex gap-2">
        {MEAL_TABS.map(({ type, label, emoji }) => {
          const data = mealData[type]
          const isActive = activeTab === type
          const hasRecipes = data.recipes.length > 0
          return (
            <button
              key={type}
              onClick={() => { setActiveTab(type); setError(null) }}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm font-medium transition-all
                ${isActive
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
            >
              <span className="text-xl leading-none">{emoji}</span>
              <span>{label}</span>
              {hasRecipes && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal
                  ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {data.recipes.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Filter bar + generate button */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-600">Max cook time:</span>
        {[null, 15, 30, 45, 60].map(t => (
          <button key={t ?? 'any'} onClick={() => setMaxTime(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              maxTime === t
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-gray-300 text-gray-600 bg-white hover:border-emerald-400 hover:text-emerald-600'
            }`}>
            {t ? `${t} min` : 'Any'}
          </button>
        ))}
        {windowMins && (
          <button onClick={() => setMaxTime(windowMins)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              maxTime === windowMins
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100'
            }`}>
            <Clock size={10} className="inline mr-1" />Fits your schedule ({windowMins} min)
          </button>
        )}

        {/* Generate / used-today button */}
        {current.usedToday ? (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-600 select-none">
            <CheckCircle size={12} />
            Generated today
          </div>
        ) : (
          <button
            onClick={generate}
            disabled={loading === activeTab}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-300 text-gray-600 bg-white hover:border-emerald-400 hover:text-emerald-600 transition-colors disabled:opacity-50">
            <Sparkles size={11} className={loading === activeTab ? 'animate-pulse' : ''} />
            {loading === activeTab ? 'Generating…' : `Generate ${MEAL_TABS.find(t => t.type === activeTab)!.label}`}
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Dismissed count */}
      {dismissed.length > 0 && (
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <X size={11} />
          {dismissed.length} meal{dismissed.length !== 1 ? 's' : ''} hidden
          <button
            onClick={async () => {
              setDismissed([])
              await supabase
                .from('food_preferences')
                .upsert({ user_id: userId, dismissed_meal_ids: [] }, { onConflict: 'user_id' })
            }}
            className="underline text-emerald-600 ml-1">Clear</button>
        </p>
      )}

      {/* Loading skeletons */}
      {loading === activeTab && (
        <div className="space-y-3">
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Sparkles size={14} className="animate-pulse text-emerald-500" />
            AI is generating personalised {activeTab} ideas…
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-52 animate-pulse border border-gray-200" />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {loading !== activeTab && current.recipes.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <ChefHat size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium text-gray-600 mb-1">No {activeTab} ideas yet</p>
          <p className="text-xs text-gray-400 mb-5">Add items to your pantry, then generate ideas.</p>
          {!current.usedToday && (
            <button
              onClick={generate}
              disabled={loading === activeTab}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-full transition-colors shadow-sm disabled:opacity-50">
              <Sparkles size={14} />
              Get {MEAL_TABS.find(t => t.type === activeTab)!.label} Ideas
            </button>
          )}
        </div>
      )}

      {/* No results for current filter */}
      {loading !== activeTab && current.recipes.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No {activeTab} meals under {maxTime} min in your current suggestions.</p>
          <button onClick={() => setMaxTime(null)} className="mt-2 text-emerald-600 text-sm underline">
            Clear filter
          </button>
        </div>
      )}

      {/* Recipe grid */}
      {loading !== activeTab && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(recipe => {
            const isSaved = savedIds.has(recipe.id)
            return (
              <div key={recipe.id} className="relative group">
                {/* Dismiss button */}
                <button
                  onClick={() => dismissMeal(recipe)}
                  title="Don't suggest this again"
                  className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} />
                </button>

                {/* Save button */}
                <button
                  onClick={e => toggleSave(recipe, e)}
                  title={isSaved ? 'Remove from library' : 'Save to library'}
                  className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                    isSaved
                      ? 'bg-white/90 opacity-100'
                      : 'bg-black/30 hover:bg-white/90 opacity-0 group-hover:opacity-100'
                  }`}>
                  {isSaved
                    ? <BookmarkCheck size={14} className="text-emerald-600" />
                    : <Bookmark size={14} className="text-white" />}
                </button>

                <button
                  onClick={() => setSelected(recipe)}
                  className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden text-left hover:border-emerald-400 hover:shadow-md transition-all shadow-sm">
                  <div className={`w-full h-40 bg-gradient-to-br ${gradientFor(recipe.id)} flex items-center justify-center`}>
                    <span className="text-5xl drop-shadow-sm group-hover:scale-110 transition-transform">{recipe.emoji}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{recipe.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={10} />{recipe.readyInMinutes} min</span>
                      <span>{Math.round(recipe.calories)} kcal</span>
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <RecipeModal
          recipe={selected}
          userId={userId}
          initialSaved={savedIds.has(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
