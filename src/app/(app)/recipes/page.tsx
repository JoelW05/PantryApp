import { createClient } from '@/lib/supabase/server'
import RecipeLibraryClient from '@/components/recipes/RecipeLibraryClient'
import type { SavedAIRecipe } from '@/types'

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('saved_ai_recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recipe Library</h1>
        <p className="text-gray-500 mt-1 text-sm">Your saved AI meal ideas. Hover any card in Meal Ideas to save it here.</p>
      </div>
      <RecipeLibraryClient savedAIRecipes={(data ?? []) as SavedAIRecipe[]} userId={user.id} />
    </div>
  )
}
