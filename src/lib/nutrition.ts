import type { IntakeLog, NutritionGoals, NutritionActual, NutrientGap } from '@/types'

export function sumIntake(logs: IntakeLog[]): NutritionActual {
  const sum = (key: keyof IntakeLog) =>
    logs.reduce((acc, l) => acc + ((l[key] as number) ?? 0), 0)

  return {
    calories: sum('calories'),
    protein_g: sum('protein_g'),
    carbs_g: sum('carbs_g'),
    fat_g: sum('fat_g'),
    fiber_g: sum('fiber_g'),
    sugar_g: sum('sugar_g'),
    saturated_fat_g: sum('saturated_fat_g'),
    cholesterol_mg: sum('cholesterol_mg'),
    sodium_mg: sum('sodium_mg'),
    potassium_mg: sum('potassium_mg'),
    calcium_mg: sum('calcium_mg'),
    iron_mg: sum('iron_mg'),
    magnesium_mg: sum('magnesium_mg'),
    phosphorus_mg: sum('phosphorus_mg'),
    zinc_mg: sum('zinc_mg'),
    selenium_mcg: sum('selenium_mcg'),
    vitamin_a_mcg: sum('vitamin_a_mcg'),
    vitamin_c_mg: sum('vitamin_c_mg'),
    vitamin_d_mcg: sum('vitamin_d_mcg'),
    vitamin_e_mg: sum('vitamin_e_mg'),
    vitamin_b6_mg: sum('vitamin_b6_mg'),
    vitamin_b9_mcg: sum('vitamin_b9_mcg'),
    vitamin_b12_mcg: sum('vitamin_b12_mcg'),
  }
}

export const NUTRIENT_META: { key: keyof NutritionGoals; label: string; unit: string; group: string }[] = [
  // Macros
  { key: 'calories',          label: 'Calories',          unit: 'kcal', group: 'Macros' },
  { key: 'protein_g',         label: 'Protein',           unit: 'g',    group: 'Macros' },
  { key: 'carbs_g',           label: 'Carbs',             unit: 'g',    group: 'Macros' },
  { key: 'fat_g',             label: 'Fat',               unit: 'g',    group: 'Macros' },
  { key: 'fiber_g',           label: 'Fibre',             unit: 'g',    group: 'Macros' },
  { key: 'sugar_g',           label: 'Sugar',             unit: 'g',    group: 'Macros' },
  { key: 'saturated_fat_g',   label: 'Saturated Fat',     unit: 'g',    group: 'Macros' },
  { key: 'unsaturated_fat_g', label: 'Unsaturated Fat',   unit: 'g',    group: 'Macros' },
  { key: 'trans_fat_g',       label: 'Trans Fat',         unit: 'g',    group: 'Macros' },
  { key: 'cholesterol_mg',    label: 'Cholesterol',       unit: 'mg',   group: 'Macros' },
  // Minerals
  { key: 'sodium_mg',         label: 'Sodium',            unit: 'mg',   group: 'Minerals' },
  { key: 'potassium_mg',      label: 'Potassium',         unit: 'mg',   group: 'Minerals' },
  { key: 'calcium_mg',        label: 'Calcium',           unit: 'mg',   group: 'Minerals' },
  { key: 'iron_mg',           label: 'Iron',              unit: 'mg',   group: 'Minerals' },
  { key: 'magnesium_mg',      label: 'Magnesium',         unit: 'mg',   group: 'Minerals' },
  { key: 'phosphorus_mg',     label: 'Phosphorus',        unit: 'mg',   group: 'Minerals' },
  { key: 'zinc_mg',           label: 'Zinc',              unit: 'mg',   group: 'Minerals' },
  { key: 'copper_mg',         label: 'Copper',            unit: 'mg',   group: 'Minerals' },
  { key: 'manganese_mg',      label: 'Manganese',         unit: 'mg',   group: 'Minerals' },
  { key: 'selenium_mcg',      label: 'Selenium',          unit: 'mcg',  group: 'Minerals' },
  { key: 'iodine_mcg',        label: 'Iodine',            unit: 'mcg',  group: 'Minerals' },
  // Vitamins
  { key: 'vitamin_a_mcg',     label: 'Vitamin A',         unit: 'mcg',  group: 'Vitamins' },
  { key: 'vitamin_c_mg',      label: 'Vitamin C',         unit: 'mg',   group: 'Vitamins' },
  { key: 'vitamin_d_mcg',     label: 'Vitamin D',         unit: 'mcg',  group: 'Vitamins' },
  { key: 'vitamin_e_mg',      label: 'Vitamin E',         unit: 'mg',   group: 'Vitamins' },
  { key: 'vitamin_k_mcg',     label: 'Vitamin K',         unit: 'mcg',  group: 'Vitamins' },
  { key: 'vitamin_b1_mg',     label: 'B1 Thiamine',       unit: 'mg',   group: 'Vitamins' },
  { key: 'vitamin_b2_mg',     label: 'B2 Riboflavin',     unit: 'mg',   group: 'Vitamins' },
  { key: 'vitamin_b3_mg',     label: 'B3 Niacin',         unit: 'mg',   group: 'Vitamins' },
  { key: 'vitamin_b5_mg',     label: 'B5 Pantothenic',    unit: 'mg',   group: 'Vitamins' },
  { key: 'vitamin_b6_mg',     label: 'B6 Pyridoxine',     unit: 'mg',   group: 'Vitamins' },
  { key: 'vitamin_b7_mcg',    label: 'B7 Biotin',         unit: 'mcg',  group: 'Vitamins' },
  { key: 'vitamin_b9_mcg',    label: 'B9 Folate',         unit: 'mcg',  group: 'Vitamins' },
  { key: 'vitamin_b12_mcg',   label: 'B12 Cobalamin',     unit: 'mcg',  group: 'Vitamins' },
]

export function computeGaps(goals: NutritionGoals, actual: NutritionActual): NutrientGap[] {
  return NUTRIENT_META
    .filter(({ key }) => goals[key] != null)
    .map(({ key, label, unit }) => {
      const goal = goals[key] as number
      const a = (actual[key as keyof NutritionActual] as number | undefined) ?? 0
      const pct = goal > 0 ? (a / goal) * 100 : 0
      return {
        key, label, goal, actual: a, pct, unit,
        status: pct < 80 ? 'low' : pct > 120 ? 'over' : 'good',
      }
    })
}

export function remainingNutrients(goals: NutritionGoals, actual: NutritionActual) {
  return {
    minCalories: Math.max(0, goals.calories - actual.calories),
    minProtein: Math.max(0, goals.protein_g - actual.protein_g),
    minCarbs: Math.max(0, goals.carbs_g - actual.carbs_g),
    maxFat: goals.fat_g,
  }
}
