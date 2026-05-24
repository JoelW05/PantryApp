'use client'
import { useState } from 'react'
import { Clock, BookmarkCheck, BookOpen, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import RecipeModal from '@/components/meals/RecipeModal'
import type { SavedAIRecipe, AIRecipe } from '@/types'

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

function toAIRecipe(r: SavedAIRecipe): AIRecipe {
  return {
    id: r.recipe_id,
    title: r.title,
    emoji: r.emoji,
    readyInMinutes: r.ready_in_minutes ?? 30,
    servings: r.servings ?? 2,
    calories: r.calories ?? 0,
    protein_g: r.protein_g ?? 0,
    carbs_g: r.carbs_g ?? 0,
    fat_g: r.fat_g ?? 0,
    ingredients: r.ingredients ?? [],
    steps: r.steps ?? [],
    usedPantryItems: r.used_pantry_items ?? [],
  }
}

export default function RecipeLibraryClient({ savedAIRecipes: initial, userId }: { savedAIRecipes: SavedAIRecipe[]; userId: string }) {
  const supabase = createClient()
  const [recipes, setRecipes] = useState<SavedAIRecipe[]>(initial)
  const [selected, setSelected] = useState<SavedAIRecipe | null>(null)

  async function remove(r: SavedAIRecipe) {
    await supabase.from('saved_ai_recipes').delete().eq('user_id', userId).eq('recipe_id', r.recipe_id)
    setRecipes(prev => prev.filter(x => x.recipe_id !== r.recipe_id))
    if (selected?.recipe_id === r.recipe_id) setSelected(null)
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-24 text-gray-400">
        <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
        <p className="text-sm font-medium text-gray-600 mb-1">Your library is empty</p>
        <p className="text-xs text-gray-400 mb-5">Hover over any meal card and click the bookmark to save it here.</p>
        <a href="/meals"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-full transition-colors shadow-sm">
          <Sparkles size={14} /> Go to Meal Ideas
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">{recipes.length} saved recipe{recipes.length !== 1 ? 's' : ''}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recipes.map(r => (
          <div key={r.id}
            className="relative group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
            onClick={() => setSelected(r)}>
            {/* Gradient image */}
            <div className={`w-full h-40 bg-gradient-to-br ${gradientFor(r.recipe_id)} flex items-center justify-center`}>
              <span className="text-5xl drop-shadow-sm group-hover:scale-110 transition-transform">{r.emoji}</span>
              {/* Unsave button */}
              <button
                onClick={e => { e.stopPropagation(); remove(r) }}
                title="Remove from library"
                className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-red-500/80 backdrop-blur-sm rounded-full transition-colors opacity-0 group-hover:opacity-100">
                <BookmarkCheck size={14} className="text-white drop-shadow" />
              </button>
            </div>
            {/* Info */}
            <div className="p-3">
              <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{r.title}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                {r.ready_in_minutes && <span className="flex items-center gap-1"><Clock size={10} />{r.ready_in_minutes} min</span>}
                {r.calories && <span>{Math.round(r.calories)} kcal</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <RecipeModal
          recipe={toAIRecipe(selected)}
          userId={userId}
          initialSaved={true}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
