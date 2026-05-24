'use client'
import { useState } from 'react'
import { Plus, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import NutrientGapChart from './NutrientGapChart'
import FoodSearchInput, { type FoodResult } from '@/components/FoodSearchInput'
import type { IntakeLog, NutritionGoals, NutritionActual, NutrientGap } from '@/types'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

function scale(per100: number | undefined, qty: number): number | undefined {
  return per100 != null ? Math.round((per100 * qty / 100) * 10) / 10 : undefined
}

export default function IntakeLogClient({ initialLogs, goals, actual, gaps, userId }: {
  initialLogs: IntakeLog[]
  goals: NutritionGoals | null
  actual: NutritionActual
  gaps: NutrientGap[]
  userId: string
}) {
  const supabase = createClient()
  const [logs, setLogs] = useState<IntakeLog[]>(initialLogs)
  const [showForm, setShowForm] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodResult | null>(null)
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>('breakfast')
  const [quantity, setQuantity] = useState('100')
  const [unit, setUnit] = useState('g')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [overrides, setOverrides] = useState<Record<string, string>>({})

  function handleFoodSelect(food: FoodResult) {
    setSelectedFood(food)
    setOverrides({})
  }

  function nutrientValue(key: string, per100Key: keyof FoodResult): string {
    if (key in overrides) return overrides[key]
    const per100 = selectedFood?.[per100Key] as number | undefined
    const val = scale(per100, Number(quantity))
    return val != null ? String(val) : ''
  }

  async function logFood() {
    if (!selectedFood) return
    const qty = Number(quantity)

    const get = (per100Key: keyof FoodResult, overrideKey: string) => {
      if (overrideKey in overrides) return overrides[overrideKey] ? Number(overrides[overrideKey]) : null
      return scale(selectedFood[per100Key] as number | undefined, qty) ?? null
    }

    const { data, error } = await supabase.from('intake_logs').insert({
      user_id: userId,
      meal_type: mealType,
      food_name: selectedFood.name,
      quantity: qty,
      unit,
      calories: get('calories_per_100g', 'calories'),
      protein_g: get('protein_per_100g', 'protein_g'),
      carbs_g: get('carbs_per_100g', 'carbs_g'),
      fat_g: get('fat_per_100g', 'fat_g'),
      fiber_g: get('fiber_per_100g', 'fiber_g'),
      sugar_g: get('sugar_per_100g', 'sugar_g'),
      saturated_fat_g: get('saturated_fat_per_100g', 'saturated_fat_g'),
      sodium_mg: get('sodium_per_100g', 'sodium_mg'),
      potassium_mg: get('potassium_per_100g', 'potassium_mg'),
      calcium_mg: get('calcium_per_100g', 'calcium_mg'),
      iron_mg: get('iron_per_100g', 'iron_mg'),
      magnesium_mg: get('magnesium_per_100g', 'magnesium_mg'),
      zinc_mg: get('zinc_per_100g', 'zinc_mg'),
      vitamin_a_mcg: get('vitamin_a_per_100g', 'vitamin_a_mcg'),
      vitamin_c_mg: get('vitamin_c_per_100g', 'vitamin_c_mg'),
      vitamin_d_mcg: get('vitamin_d_per_100g', 'vitamin_d_mcg'),
    }).select().single()

    if (!error && data) {
      setLogs(prev => [...prev, data as IntakeLog])
      setShowForm(false)
      setSelectedFood(null)
      setQuantity('100')
      setOverrides({})
    }
  }

  const byMeal = MEAL_TYPES.map(t => ({ type: t, items: logs.filter(l => l.meal_type === t) }))
  const qty = Number(quantity)

  return (
    <div className="space-y-6">
      {/* Macro summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Calories', val: actual.calories.toFixed(0), goal: goals?.calories, unit: 'kcal' },
          { label: 'Protein',  val: actual.protein_g.toFixed(1), goal: goals?.protein_g, unit: 'g' },
          { label: 'Carbs',    val: actual.carbs_g.toFixed(1),   goal: goals?.carbs_g,   unit: 'g' },
          { label: 'Fat',      val: actual.fat_g.toFixed(1),     goal: goals?.fat_g,     unit: 'g' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs font-medium text-gray-500">{m.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{m.val}<span className="text-xs font-normal text-gray-500 ml-1">{m.unit}</span></p>
            {m.goal && <p className="text-xs text-gray-400">/ {m.goal}{m.unit}</p>}
          </div>
        ))}
      </div>

      {gaps.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Nutrient breakdown</h3>
          <NutrientGapChart gaps={gaps} />
        </div>
      )}

      <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
        <Plus size={14} /> Log food
      </button>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
          {/* Meal type */}
          <div className="flex gap-2">
            {MEAL_TYPES.map(t => (
              <button key={t} onClick={() => setMealType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${mealType === t ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 text-gray-600 hover:border-emerald-400'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Food search with barcode */}
          <FoodSearchInput onSelect={handleFoodSelect} placeholder="Search food or scan barcode…" />

          {/* Quantity + unit */}
          {selectedFood && (
            <>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="w-28">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Unit</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900">
                    {['g', 'ml', 'unit', 'tbsp', 'tsp', 'cup', 'oz'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Auto-filled nutrient preview */}
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-4 gap-3 text-center border border-gray-100">
                {[
                  { label: 'Calories', val: scale(selectedFood.calories_per_100g, qty), unit: 'kcal' },
                  { label: 'Protein',  val: scale(selectedFood.protein_per_100g, qty),  unit: 'g' },
                  { label: 'Carbs',    val: scale(selectedFood.carbs_per_100g, qty),    unit: 'g' },
                  { label: 'Fat',      val: scale(selectedFood.fat_per_100g, qty),      unit: 'g' },
                ].map(n => (
                  <div key={n.label}>
                    <p className="text-xs text-gray-500">{n.label}</p>
                    <p className="text-sm font-bold text-gray-900">{n.val ?? '—'}<span className="text-xs font-normal text-gray-400 ml-0.5">{n.unit}</span></p>
                  </div>
                ))}
              </div>

              {/* Advanced overrides toggle */}
              <button type="button" onClick={() => setShowAdvanced(v => !v)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showAdvanced ? 'Hide' : 'Show'} all nutrients / override values
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['calories',        'calories_per_100g',        'Calories (kcal)'],
                    ['protein_g',       'protein_per_100g',         'Protein (g)'],
                    ['carbs_g',         'carbs_per_100g',           'Carbs (g)'],
                    ['fat_g',           'fat_per_100g',             'Fat (g)'],
                    ['fiber_g',         'fiber_per_100g',           'Fibre (g)'],
                    ['sugar_g',         'sugar_per_100g',           'Sugar (g)'],
                    ['saturated_fat_g', 'saturated_fat_per_100g',   'Saturated fat (g)'],
                    ['sodium_mg',       'sodium_per_100g',          'Sodium (mg)'],
                    ['potassium_mg',    'potassium_per_100g',       'Potassium (mg)'],
                    ['calcium_mg',      'calcium_per_100g',         'Calcium (mg)'],
                    ['iron_mg',         'iron_per_100g',            'Iron (mg)'],
                    ['magnesium_mg',    'magnesium_per_100g',       'Magnesium (mg)'],
                    ['zinc_mg',         'zinc_per_100g',            'Zinc (mg)'],
                    ['vitamin_a_mcg',   'vitamin_a_per_100g',       'Vitamin A (mcg)'],
                    ['vitamin_c_mg',    'vitamin_c_per_100g',       'Vitamin C (mg)'],
                    ['vitamin_d_mcg',   'vitamin_d_per_100g',       'Vitamin D (mcg)'],
                  ].map(([key, per100Key, label]) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
                      <input
                        type="number"
                        value={nutrientValue(key, per100Key as keyof FoodResult)}
                        onChange={e => setOverrides(o => ({ ...o, [key]: e.target.value }))}
                        placeholder="—"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex gap-2">
            <button onClick={logFood} disabled={!selectedFood} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-40">
              Save
            </button>
            <button onClick={() => { setShowForm(false); setSelectedFood(null) }} className="px-5 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Meal timeline */}
      <div className="space-y-4">
        {byMeal.filter(m => m.items.length > 0).map(({ type, items }) => (
          <div key={type} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Clock size={11} /> {type}
            </div>
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 border-t border-gray-50 first:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-900">{item.food_name}</span>
                  <span className="text-xs text-gray-400 ml-2">{item.quantity}{item.unit}</span>
                </div>
                <span className="text-xs text-gray-500">{item.calories ? `${item.calories} kcal` : ''}</span>
              </div>
            ))}
          </div>
        ))}
        {logs.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Nothing logged yet today.</p>}
      </div>
    </div>
  )
}
