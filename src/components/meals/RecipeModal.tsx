'use client'
import { useState } from 'react'
import { X, Clock, Users, UtensilsCrossed, Bookmark, BookmarkCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PantryDeductionPrompt from '@/components/pantry/PantryDeductionPrompt'
import type { AIRecipe } from '@/types'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const
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

export default function RecipeModal({
  recipe,
  userId,
  onClose,
  initialSaved = false,
}: {
  recipe: AIRecipe
  userId: string
  onClose: () => void
  initialSaved?: boolean
}) {
  const supabase = createClient()
  const [showLog, setShowLog] = useState(false)
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>('dinner')
  const [servings, setServings] = useState(recipe.servings)
  const [logged, setLogged] = useState(false)
  const [showDeduct, setShowDeduct] = useState(false)
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [saving, setSaving] = useState(false)

  const ratio = servings / (recipe.servings || 1)

  async function logMeal() {
    const { error } = await supabase.from('intake_logs').insert({
      user_id: userId,
      meal_type: mealType,
      food_name: recipe.title,
      quantity: servings,
      unit: 'serving',
      calories: Math.round(recipe.calories * ratio),
      protein_g: Math.round(recipe.protein_g * ratio * 10) / 10,
      carbs_g: Math.round(recipe.carbs_g * ratio * 10) / 10,
      fat_g: Math.round(recipe.fat_g * ratio * 10) / 10,
    })
    if (!error) {
      setLogged(true)
      setShowDeduct(true)
    }
  }

  async function toggleSave() {
    if (saving) return
    setSaving(true)
    if (isSaved) {
      await supabase.from('saved_ai_recipes').delete().eq('user_id', userId).eq('recipe_id', recipe.id)
      setIsSaved(false)
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
      setIsSaved(true)
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl">
        {/* Hero */}
        <div className={`relative w-full h-40 bg-gradient-to-br ${gradientFor(recipe.id)} flex items-center justify-center rounded-t-2xl`}>
          <span className="text-7xl drop-shadow-sm">{recipe.emoji}</span>
          {/* Save to library button */}
          <button
            onClick={toggleSave}
            title={isSaved ? 'Remove from library' : 'Save to library'}
            className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full transition-colors">
            {isSaved
              ? <BookmarkCheck size={18} className="text-white drop-shadow" />
              : <Bookmark size={18} className="text-white drop-shadow" />}
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-snug">{recipe.title}</h2>
              {isSaved && (
                <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                  <BookmarkCheck size={11} /> Saved to your library
                </p>
              )}
            </div>
            <button onClick={onClose} className="shrink-0 text-gray-400 hover:text-gray-700 mt-0.5"><X size={18} /></button>
          </div>

          {/* Meta */}
          <div className="flex gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Clock size={13} />{recipe.readyInMinutes} min</span>
            <span className="flex items-center gap-1.5"><Users size={13} />{recipe.servings} servings</span>
          </div>

          {/* Nutrition */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Calories', value: recipe.calories, unit: 'kcal' },
              { label: 'Protein', value: recipe.protein_g, unit: 'g' },
              { label: 'Carbs', value: recipe.carbs_g, unit: 'g' },
              { label: 'Fat', value: recipe.fat_g, unit: 'g' },
            ].map(n => (
              <div key={n.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="text-xs text-gray-500">{n.label}</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{Math.round(n.value)}<span className="text-xs font-normal text-gray-400 ml-0.5">{n.unit}</span></p>
              </div>
            ))}
          </div>

          {/* Pantry match tags */}
          {recipe.usedPantryItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.usedPantryItems.map(item => (
                <span key={item} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5">{item}</span>
              ))}
            </div>
          )}

          {/* Log this meal */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setShowLog(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-2"><UtensilsCrossed size={14} className="text-emerald-600" />Log this meal</span>
              <span className="text-xs text-gray-400">{showLog ? '▲' : '▼'}</span>
            </button>
            {showLog && (
              <div className="px-4 py-4 space-y-3 border-t border-gray-100">
                {logged ? (
                  <>
                    <p className="text-sm text-emerald-600 font-medium">✓ Logged as {mealType}!</p>
                    {showDeduct && (
                      <PantryDeductionPrompt
                        userId={userId}
                        ingredients={recipe.ingredients}
                        loggedServings={servings}
                        recipeServings={recipe.servings}
                        onDone={() => setShowDeduct(false)}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex gap-3 items-end">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Meal</label>
                        <select value={mealType} onChange={e => setMealType(e.target.value as typeof MEAL_TYPES[number])}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white capitalize">
                          {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Servings</label>
                        <input type="number" min="0.5" step="0.5" value={servings}
                          onChange={e => setServings(Number(e.target.value))}
                          className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" />
                      </div>
                      <button onClick={logMeal} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">Log</button>
                    </div>
                    <p className="text-xs text-gray-400">
                      {Math.round(recipe.calories * ratio)} kcal · {Math.round(recipe.protein_g * ratio * 10) / 10}g protein · {Math.round(recipe.carbs_g * ratio * 10) / 10}g carbs for {servings} serving{servings !== 1 ? 's' : ''}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Ingredients</h3>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-gray-300 mt-0.5">•</span>{ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Instructions</h3>
            <ol className="space-y-4">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
