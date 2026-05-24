export interface NutritionGoals {
  // Macros
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  sugar_g?: number
  saturated_fat_g?: number
  unsaturated_fat_g?: number
  trans_fat_g?: number
  cholesterol_mg?: number
  // Minerals
  sodium_mg?: number
  potassium_mg?: number
  calcium_mg?: number
  iron_mg?: number
  magnesium_mg?: number
  phosphorus_mg?: number
  zinc_mg?: number
  copper_mg?: number
  manganese_mg?: number
  selenium_mcg?: number
  iodine_mcg?: number
  // Vitamins
  vitamin_a_mcg?: number
  vitamin_c_mg?: number
  vitamin_d_mcg?: number
  vitamin_e_mg?: number
  vitamin_k_mcg?: number
  vitamin_b1_mg?: number
  vitamin_b2_mg?: number
  vitamin_b3_mg?: number
  vitamin_b5_mg?: number
  vitamin_b6_mg?: number
  vitamin_b7_mcg?: number
  vitamin_b9_mcg?: number
  vitamin_b12_mcg?: number
}

export interface NutritionActual extends Partial<NutritionGoals> {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
}

export interface PantryItem {
  id: string
  name: string
  brand?: string
  quantity: number
  unit: string
  category?: string
  calories_per_100g?: number
  protein_per_100g?: number
  carbs_per_100g?: number
  fat_per_100g?: number
  fiber_per_100g?: number
  open_food_facts_id?: string
  expiry_date?: string
  added_at: string
}

export interface IntakeLog {
  id: string
  logged_at: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name: string
  quantity: number
  unit: string
  // Macros
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  fiber_g?: number
  sugar_g?: number
  saturated_fat_g?: number
  cholesterol_mg?: number
  // Minerals
  sodium_mg?: number
  potassium_mg?: number
  calcium_mg?: number
  iron_mg?: number
  magnesium_mg?: number
  phosphorus_mg?: number
  zinc_mg?: number
  selenium_mcg?: number
  // Vitamins
  vitamin_a_mcg?: number
  vitamin_c_mg?: number
  vitamin_d_mcg?: number
  vitamin_e_mg?: number
  vitamin_b6_mg?: number
  vitamin_b9_mcg?: number
  vitamin_b12_mcg?: number
  recipe_id?: string
  notes?: string
}

export interface ScheduleBlock {
  id: string
  start_time: string
  end_time: string
  label?: string
  is_cooking_window: boolean
}

export interface SleepLog {
  id: string
  sleep_start: string
  sleep_end: string
  quality?: number
  notes?: string
}

export interface FoodPreferences {
  cuisine_types: string[]
  dietary_flags: string[]
  disliked_ingredients: string[]
  max_cook_time_mins: number
  allergens: string[]
  // AI suggestion cache (added by migration_ai_cache.sql)
  meal_suggestions?: AIRecipe[] | null
  shopping_suggestions?: ShoppingSuggestion[] | null
  dismissed_meal_ids?: string[]
  dismissed_shopping_names?: string[]
  shopping_budget?: number
  // Pantry hash + timestamp for smart cache invalidation (legacy unified cache)
  pantry_hash?: string | null
  meal_suggestions_generated_at?: string | null
  // Per-meal-type suggestions + daily generation timestamps
  breakfast_suggestions?: AIRecipe[] | null
  lunch_suggestions?: AIRecipe[] | null
  dinner_suggestions?: AIRecipe[] | null
  breakfast_generated_at?: string | null
  lunch_generated_at?: string | null
  dinner_generated_at?: string | null
}


export interface ShoppingSuggestion {
  name: string
  quantity: string
  category: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  estimatedPrice: number
}

export interface ShoppingItem {
  id: string
  name: string
  quantity?: string
  category?: string
  price?: number
  checked: boolean
  added_at: string
}

export interface ScannedItem {
  name: string
  quantity: number
  unit: string
}

export interface SavedAIRecipe {
  id: string
  recipe_id: string
  title: string
  emoji: string
  ready_in_minutes?: number
  servings?: number
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  ingredients: string[]
  steps: string[]
  used_pantry_items: string[]
  saved_at: string
}

export interface AIRecipe {
  id: string
  title: string
  emoji: string
  readyInMinutes: number
  servings: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  ingredients: string[]
  steps: string[]
  usedPantryItems: string[]
}

export interface NutrientGap {
  key: keyof NutritionGoals
  label: string
  goal: number
  actual: number
  pct: number
  unit: string
  status: 'low' | 'good' | 'over'
}
