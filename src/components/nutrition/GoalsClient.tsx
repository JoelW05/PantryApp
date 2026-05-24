'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NUTRIENT_META } from '@/lib/nutrition'
import type { NutritionGoals, FoodPreferences } from '@/types'

const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'ketogenic', 'paleo']
const CUISINE_OPTIONS = ['Italian', 'Asian', 'Indian', 'Mexican', 'British', 'Mediterranean', 'American', 'Middle Eastern']

// UK 14 major allergens (Food Information Regulations 2014)
const ALLERGEN_OPTIONS = [
  { id: 'gluten',       label: 'Gluten',        emoji: '🌾' },
  { id: 'crustaceans',  label: 'Crustaceans',   emoji: '🦐' },
  { id: 'eggs',         label: 'Eggs',           emoji: '🥚' },
  { id: 'fish',         label: 'Fish',           emoji: '🐟' },
  { id: 'peanuts',      label: 'Peanuts',        emoji: '🥜' },
  { id: 'soybeans',     label: 'Soy',            emoji: '🫘' },
  { id: 'milk',         label: 'Milk / Dairy',   emoji: '🥛' },
  { id: 'nuts',         label: 'Tree Nuts',      emoji: '🌰' },
  { id: 'celery',       label: 'Celery',         emoji: '🌿' },
  { id: 'mustard',      label: 'Mustard',        emoji: '🌭' },
  { id: 'sesame',       label: 'Sesame',         emoji: '🫙' },
  { id: 'sulphites',    label: 'Sulphites',      emoji: '🍷' },
  { id: 'lupin',        label: 'Lupin',          emoji: '🌼' },
  { id: 'molluscs',     label: 'Molluscs',       emoji: '🐚' },
]

// UK NHS reference values as defaults
const UK_DEFAULTS: Partial<NutritionGoals> = {
  calories: 2000, protein_g: 50, carbs_g: 260, fat_g: 70, fiber_g: 30,
  sugar_g: 90, saturated_fat_g: 20, cholesterol_mg: 300,
  sodium_mg: 2300, potassium_mg: 3500, calcium_mg: 700, iron_mg: 14,
  magnesium_mg: 300, phosphorus_mg: 550, zinc_mg: 9.5, copper_mg: 1.2,
  manganese_mg: 3, selenium_mcg: 75, iodine_mcg: 150,
  vitamin_a_mcg: 700, vitamin_c_mg: 40, vitamin_d_mcg: 10, vitamin_e_mg: 12,
  vitamin_k_mcg: 75, vitamin_b1_mg: 0.8, vitamin_b2_mg: 1.1, vitamin_b3_mg: 13,
  vitamin_b5_mg: 5, vitamin_b6_mg: 1.4, vitamin_b7_mcg: 30,
  vitamin_b9_mcg: 200, vitamin_b12_mcg: 1.5,
}

const groups = ['Macros', 'Minerals', 'Vitamins'] as const

export default function GoalsClient({ initialGoals, initialPrefs, userId }: {
  initialGoals: NutritionGoals | null
  initialPrefs: FoodPreferences | null
  userId: string
}) {
  const supabase = createClient()
  const [goals, setGoals] = useState<Partial<NutritionGoals>>(initialGoals ?? UK_DEFAULTS)
  const [prefs, setPrefs] = useState<FoodPreferences>(initialPrefs ?? { cuisine_types: [], dietary_flags: [], disliked_ingredients: [], max_cook_time_mins: 60, allergens: [] })
  const [saved, setSaved] = useState(false)

  async function save() {
    await Promise.all([
      supabase.from('nutrition_goals').upsert({ user_id: userId, ...goals }),
      supabase.from('food_preferences').upsert({ user_id: userId, ...prefs }),
    ])
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function fillDefaults() {
    setGoals(UK_DEFAULTS)
  }

  function toggleFlag(flag: string, key: 'dietary_flags' | 'cuisine_types') {
    setPrefs(p => ({ ...p, [key]: p[key].includes(flag) ? p[key].filter(f => f !== flag) : [...p[key], flag] }))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Pre-filled with UK NHS reference daily values.</p>
        <button onClick={fillDefaults} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50">
          Reset to UK defaults
        </button>
      </div>

      {groups.map(group => {
        const nutrients = NUTRIENT_META.filter(n => n.group === group)
        return (
          <section key={group} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">{group}</h2>
            <div className="grid grid-cols-2 gap-3">
              {nutrients.map(({ key, label, unit }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    {label}
                    <span className="text-gray-400 font-normal ml-1">({unit})</span>
                  </label>
                  <input
                    type="number"
                    value={goals[key] ?? ''}
                    onChange={e => setGoals(g => ({ ...g, [key]: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder={UK_DEFAULTS[key] != null ? String(UK_DEFAULTS[key]) : '—'}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>
          </section>
        )
      })}

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Dietary preferences</h2>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map(flag => (
            <button key={flag} onClick={() => toggleFlag(flag, 'dietary_flags')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${prefs.dietary_flags.includes(flag) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 text-gray-600 bg-white hover:border-emerald-400'}`}>
              {flag}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Favourite cuisines</h2>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map(c => (
            <button key={c} onClick={() => toggleFlag(c, 'cuisine_types')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${prefs.cuisine_types.includes(c) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-600 bg-white hover:border-blue-400'}`}>
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Allergens</h2>
          <p className="text-xs text-gray-400 mt-0.5">Select any allergens — AI suggestions will never include these ingredients.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map(({ id, label, emoji }) => {
            const active = (prefs.allergens ?? []).includes(id)
            return (
              <button key={id}
                onClick={() => setPrefs(p => ({
                  ...p,
                  allergens: (p.allergens ?? []).includes(id)
                    ? (p.allergens ?? []).filter(a => a !== id)
                    : [...(p.allergens ?? []), id],
                }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${active ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 text-gray-600 bg-white hover:border-red-300 hover:text-red-600'}`}>
                <span>{emoji}</span> {label}
                {active && <span className="ml-0.5 opacity-80 text-[10px]">✕</span>}
              </button>
            )
          })}
        </div>
        {(prefs.allergens ?? []).length > 0 && (
          <p className="text-xs text-red-500">
            ⚠ {(prefs.allergens ?? []).length} allergen{(prefs.allergens ?? []).length !== 1 ? 's' : ''} active — meals and shopping suggestions will avoid these.
          </p>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Cooking preferences</h2>
        <div className="max-w-xs">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Max cook time (minutes)</label>
          <input type="number" value={prefs.max_cook_time_mins}
            onChange={e => setPrefs(p => ({ ...p, max_cook_time_mins: Number(e.target.value) }))}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500" />
        </div>
      </section>

      <button onClick={save} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
        {saved ? '✓ Saved' : 'Save goals'}
      </button>
    </div>
  )
}
