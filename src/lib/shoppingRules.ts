/**
 * Rule-based shopping suggestion engine.
 * Replaces Gemini for shopping suggestions — same quality, zero AI cost.
 *
 * Logic:
 *  1. Essential staples not already in pantry
 *  2. Foods that directly address active nutrient gaps (high priority)
 *  3. Foods that complement existing pantry contents (medium priority)
 *  4. Filtered by diet + allergen constraints
 */

import type { ShoppingSuggestion } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RuleItem {
  name: string
  quantity: string
  category: string
  reason: string
  estimatedPrice: number
  /** Nutrient gap labels this addresses, e.g. ['Protein', 'Vitamin B12'] */
  nutrients?: string[]
  /** Pantry keywords that make this item more relevant as a complement */
  pairsWithPantry?: string[]
  /** If true, always suggest when not in pantry */
  isStaple?: boolean
  /** False for all vegetarians/vegans */
  isVegan?: boolean
  /** False for vegans only */
  isVegetarian?: boolean
  /** Keywords in this item's name / common allergen names */
  allergenTags?: string[]
}

// ─── Item database ────────────────────────────────────────────────────────────

const ITEMS: RuleItem[] = [
  // ── Protein sources ──────────────────────────────────────────────────────────
  { name: 'Chicken Breast', quantity: '500g', category: 'Meat & Fish',  reason: 'Lean protein — ideal for hitting your protein goal',           estimatedPrice: 3.50, nutrients: ['Protein'], isVegan: false, isVegetarian: false },
  { name: 'Greek Yoghurt',  quantity: '500g', category: 'Dairy & Eggs', reason: 'High protein and probiotic-rich',                              estimatedPrice: 1.20, nutrients: ['Protein', 'Calcium'], isVegan: false },
  { name: 'Eggs',           quantity: '6 pack', category: 'Dairy & Eggs', reason: 'Complete protein with every essential amino acid',           estimatedPrice: 1.50, nutrients: ['Protein', 'Vitamin D', 'Vitamin B12'], isVegan: false, isStaple: true },
  { name: 'Canned Tuna',    quantity: '4 pack', category: 'Tins & Dried', reason: 'Convenient high-protein staple',                             estimatedPrice: 2.50, nutrients: ['Protein', 'Vitamin D'], isVegan: false, isVegetarian: false },
  { name: 'Salmon Fillet',  quantity: '2 pack', category: 'Meat & Fish',  reason: 'Rich in protein and omega-3 fatty acids',                    estimatedPrice: 4.50, nutrients: ['Protein', 'Vitamin D', 'Vitamin B12'], isVegan: false, isVegetarian: false },
  { name: 'Red Lentils',    quantity: '500g', category: 'Bread & Grains', reason: 'Plant-based protein and fibre combined',                     estimatedPrice: 1.00, nutrients: ['Protein', 'Fibre', 'Iron'], isVegan: true, isVegetarian: true },
  { name: 'Chickpeas',      quantity: '400g tin', category: 'Tins & Dried', reason: 'High in plant protein and fibre',                          estimatedPrice: 0.65, nutrients: ['Protein', 'Fibre'], isVegan: true, isVegetarian: true, isStaple: true },
  { name: 'Firm Tofu',      quantity: '280g', category: 'Dairy & Eggs', reason: 'Complete plant-based protein',                                 estimatedPrice: 1.80, nutrients: ['Protein', 'Calcium'], isVegan: true, isVegetarian: true, allergenTags: ['soy'] },
  { name: 'Cottage Cheese', quantity: '300g', category: 'Dairy & Eggs', reason: 'High protein, low calorie dairy',                              estimatedPrice: 1.20, nutrients: ['Protein', 'Calcium'], isVegan: false },
  { name: 'Beef Mince',     quantity: '500g', category: 'Meat & Fish',  reason: 'Versatile protein source rich in iron and zinc',               estimatedPrice: 3.20, nutrients: ['Protein', 'Iron', 'Zinc'], isVegan: false, isVegetarian: false },

  // ── Fibre sources ─────────────────────────────────────────────────────────────
  { name: 'Rolled Oats',    quantity: '1kg',  category: 'Bread & Grains', reason: 'Excellent source of soluble fibre and slow-release energy',  estimatedPrice: 1.50, nutrients: ['Fibre'], isVegan: true, isStaple: true },
  { name: 'Broccoli',       quantity: '400g', category: 'Vegetables',     reason: 'High in fibre, vitamin C, and vitamin K',                    estimatedPrice: 0.65, nutrients: ['Fibre', 'Vitamin C', 'Vitamin K'], isVegan: true, isStaple: true },
  { name: 'Kidney Beans',   quantity: '400g tin', category: 'Tins & Dried', reason: 'High-fibre, filling plant-based staple',                   estimatedPrice: 0.65, nutrients: ['Fibre', 'Protein', 'Iron'], isVegan: true },
  { name: 'Wholemeal Bread',quantity: '800g loaf', category: 'Bread & Grains', reason: 'More fibre and nutrients than white bread',             estimatedPrice: 1.10, nutrients: ['Fibre'], isVegan: true },
  { name: 'Brown Rice',     quantity: '1kg',  category: 'Bread & Grains', reason: 'Higher fibre alternative to white rice',                     estimatedPrice: 1.40, nutrients: ['Fibre', 'Magnesium'], isVegan: true },
  { name: 'Flaxseed',       quantity: '200g', category: 'Tins & Dried',   reason: 'Rich in fibre and omega-3 fatty acids',                      estimatedPrice: 1.50, nutrients: ['Fibre'], isVegan: true },
  { name: 'Chia Seeds',     quantity: '250g', category: 'Tins & Dried',   reason: 'Packed with fibre, protein, and omega-3s',                   estimatedPrice: 2.50, nutrients: ['Fibre', 'Protein'], isVegan: true },

  // ── Calcium sources ───────────────────────────────────────────────────────────
  { name: 'Semi-skimmed Milk', quantity: '2 litres', category: 'Dairy & Eggs', reason: 'Best dietary source of calcium',                        estimatedPrice: 1.20, nutrients: ['Calcium', 'Vitamin D', 'Protein'], isVegan: false, isStaple: true },
  { name: 'Cheddar Cheese', quantity: '400g', category: 'Dairy & Eggs',   reason: 'High in calcium and protein',                               estimatedPrice: 2.50, nutrients: ['Calcium', 'Protein'], isVegan: false },
  { name: 'Natural Yoghurt', quantity: '500g', category: 'Dairy & Eggs',  reason: 'Good source of calcium and probiotics',                      estimatedPrice: 0.80, nutrients: ['Calcium', 'Protein'], isVegan: false },
  { name: 'Almonds',        quantity: '200g', category: 'Tins & Dried',   reason: 'Plant-based calcium and healthy fats',                       estimatedPrice: 2.20, nutrients: ['Calcium', 'Vitamin E'], isVegan: true, allergenTags: ['nuts'] },
  { name: 'Oat Milk',       quantity: '1 litre', category: 'Drinks',      reason: 'Fortified with calcium — great dairy-free alternative',      estimatedPrice: 1.40, nutrients: ['Calcium', 'Vitamin D'], isVegan: true },
  { name: 'Kale',           quantity: '200g', category: 'Vegetables',     reason: 'One of the best plant sources of calcium',                   estimatedPrice: 0.80, nutrients: ['Calcium', 'Vitamin K', 'Vitamin C'], isVegan: true },

  // ── Iron sources ──────────────────────────────────────────────────────────────
  { name: 'Spinach',        quantity: '200g', category: 'Vegetables',     reason: 'Iron-rich leafy green, also high in folate',                 estimatedPrice: 0.80, nutrients: ['Iron', 'B9 Folate', 'Vitamin K'], isVegan: true, isStaple: true },
  { name: 'Lentils',        quantity: '500g', category: 'Bread & Grains', reason: 'Excellent plant source of iron and protein',                 estimatedPrice: 1.00, nutrients: ['Iron', 'Protein', 'Fibre'], isVegan: true },
  { name: 'Pumpkin Seeds',  quantity: '150g', category: 'Tins & Dried',   reason: 'Rich in iron, zinc, and magnesium',                          estimatedPrice: 1.50, nutrients: ['Iron', 'Zinc', 'Magnesium'], isVegan: true },
  { name: 'Fortified Cereal', quantity: '500g', category: 'Snacks & Treats', reason: 'Iron-fortified for easy absorption',                      estimatedPrice: 2.00, nutrients: ['Iron', 'Vitamin B12', 'B9 Folate'], isVegan: true },
  { name: 'Dark Chocolate', quantity: '100g', category: 'Tins & Dried',   reason: 'Surprisingly high in iron and antioxidants',                 estimatedPrice: 1.50, nutrients: ['Iron'], isVegan: true },

  // ── Vitamin D sources ─────────────────────────────────────────────────────────
  { name: 'Mackerel',       quantity: '2 fillets', category: 'Meat & Fish', reason: 'One of the richest dietary sources of vitamin D',          estimatedPrice: 2.50, nutrients: ['Vitamin D', 'Protein'], isVegan: false, isVegetarian: false },
  { name: 'Smoked Salmon',  quantity: '100g', category: 'Meat & Fish',    reason: 'High in vitamin D and omega-3 fatty acids',                  estimatedPrice: 2.50, nutrients: ['Vitamin D', 'Protein'], isVegan: false, isVegetarian: false },
  { name: 'Fortified Orange Juice', quantity: '1 litre', category: 'Drinks', reason: 'Fortified with vitamin D and vitamin C',                  estimatedPrice: 1.50, nutrients: ['Vitamin D', 'Vitamin C'], isVegan: true },

  // ── Vitamin C sources ─────────────────────────────────────────────────────────
  { name: 'Red Pepper',     quantity: '3 pack', category: 'Vegetables',   reason: 'Highest vitamin C content of any common vegetable',          estimatedPrice: 1.00, nutrients: ['Vitamin C'], isVegan: true, isStaple: true },
  { name: 'Orange',         quantity: '5 pack', category: 'Fruit',        reason: 'Classic vitamin C source, also high in folate',              estimatedPrice: 1.20, nutrients: ['Vitamin C', 'B9 Folate'], isVegan: true },
  { name: 'Strawberries',   quantity: '400g', category: 'Fruit',          reason: 'Exceptionally high in vitamin C',                            estimatedPrice: 2.00, nutrients: ['Vitamin C'], isVegan: true },
  { name: 'Kiwi',           quantity: '6 pack', category: 'Fruit',        reason: 'One of the highest vitamin C fruits per 100g',               estimatedPrice: 1.50, nutrients: ['Vitamin C'], isVegan: true },

  // ── Vitamin A sources ─────────────────────────────────────────────────────────
  { name: 'Carrot',         quantity: '1kg', category: 'Vegetables',      reason: 'Excellent source of beta-carotene (vitamin A)',              estimatedPrice: 0.60, nutrients: ['Vitamin A'], isVegan: true, isStaple: true },
  { name: 'Sweet Potato',   quantity: '750g', category: 'Vegetables',     reason: 'Rich in vitamin A, fibre, and potassium',                    estimatedPrice: 1.20, nutrients: ['Vitamin A', 'Fibre', 'Potassium'], isVegan: true },
  { name: 'Butternut Squash', quantity: '1 whole', category: 'Vegetables', reason: 'High in beta-carotene and fibre',                           estimatedPrice: 1.00, nutrients: ['Vitamin A', 'Fibre'], isVegan: true },

  // ── Vitamin B12 sources ───────────────────────────────────────────────────────
  { name: 'Beef Liver',     quantity: '200g', category: 'Meat & Fish',    reason: 'Highest natural source of vitamin B12',                      estimatedPrice: 2.00, nutrients: ['Vitamin B12', 'Iron', 'Vitamin A'], isVegan: false, isVegetarian: false },
  { name: 'Nutritional Yeast', quantity: '100g', category: 'Seasonings',  reason: 'B12-fortified vegan staple with cheesy flavour',             estimatedPrice: 3.50, nutrients: ['Vitamin B12', 'Protein'], isVegan: true },

  // ── Folate (B9) sources ───────────────────────────────────────────────────────
  { name: 'Edamame',        quantity: '400g', category: 'Vegetables',     reason: 'High in folate, protein, and fibre',                         estimatedPrice: 1.50, nutrients: ['B9 Folate', 'Protein'], isVegan: true },
  { name: 'Avocado',        quantity: '2 pack', category: 'Fruit',        reason: 'Rich in folate and healthy monounsaturated fats',            estimatedPrice: 1.80, nutrients: ['B9 Folate'], isVegan: true },

  // ── Magnesium sources ─────────────────────────────────────────────────────────
  { name: 'Dark Leafy Greens Mix', quantity: '200g', category: 'Vegetables', reason: 'Packed with magnesium, iron, and vitamins',               estimatedPrice: 1.20, nutrients: ['Magnesium', 'Iron', 'Vitamin K'], isVegan: true },
  { name: 'Banana',         quantity: '5 pack', category: 'Fruit',        reason: 'Good source of magnesium and potassium',                     estimatedPrice: 0.70, nutrients: ['Magnesium', 'Potassium'], isVegan: true, isStaple: true },
  { name: 'Cashews',        quantity: '200g', category: 'Tins & Dried',   reason: 'Rich in magnesium and healthy fats',                         estimatedPrice: 2.50, nutrients: ['Magnesium', 'Zinc'], isVegan: true, allergenTags: ['nuts'] },

  // ── Potassium sources ─────────────────────────────────────────────────────────
  { name: 'Potato',         quantity: '2.5kg', category: 'Vegetables',    reason: 'High in potassium and a versatile everyday staple',          estimatedPrice: 1.50, nutrients: ['Potassium'], isVegan: true, isStaple: true },

  // ── Zinc sources ──────────────────────────────────────────────────────────────
  { name: 'Sunflower Seeds', quantity: '200g', category: 'Tins & Dried',  reason: 'Rich in zinc, vitamin E, and healthy fats',                  estimatedPrice: 1.20, nutrients: ['Zinc', 'Vitamin E'], isVegan: true },

  // ── Omega-3 / fat ─────────────────────────────────────────────────────────────
  { name: 'Walnuts',        quantity: '200g', category: 'Tins & Dried',   reason: 'Best plant source of omega-3 fatty acids',                   estimatedPrice: 2.50, nutrients: ['Fat'], isVegan: true, allergenTags: ['nuts'] },
  { name: 'Extra Virgin Olive Oil', quantity: '500ml', category: 'Condiments & Sauces', reason: 'Heart-healthy fats — an essential cooking oil',estimatedPrice: 3.50, nutrients: ['Fat'], isVegan: true, isStaple: true },

  // ── Carb / energy sources ─────────────────────────────────────────────────────
  { name: 'Basmati Rice',   quantity: '1kg',  category: 'Bread & Grains', reason: 'Versatile carbohydrate staple for many dishes',              estimatedPrice: 1.50, nutrients: ['Carbs', 'Calories'], isVegan: true, isStaple: true },
  { name: 'Pasta',          quantity: '500g', category: 'Bread & Grains', reason: 'Quick and filling carbohydrate staple',                      estimatedPrice: 0.80, nutrients: ['Carbs', 'Calories'], isVegan: true, isStaple: true },

  // ── Essential cooking staples ─────────────────────────────────────────────────
  { name: 'Onion',          quantity: '1kg',  category: 'Vegetables',     reason: 'Flavour base for almost every savoury dish',                 estimatedPrice: 0.65, isStaple: true, isVegan: true },
  { name: 'Garlic',         quantity: '3 bulbs', category: 'Vegetables',  reason: 'Essential flavour base — used in most cuisines',             estimatedPrice: 0.50, isStaple: true, isVegan: true },
  { name: 'Chopped Tomatoes', quantity: '4 tins', category: 'Tins & Dried', reason: 'Versatile tin — base for sauces, stews and soups',         estimatedPrice: 1.20, isStaple: true, isVegan: true },
  { name: 'Vegetable Stock Cubes', quantity: '12 pack', category: 'Condiments & Sauces', reason: 'Essential for adding depth to soups and stews', estimatedPrice: 0.75, isStaple: true, isVegan: true },
  { name: 'Tomato Purée',   quantity: '200g', category: 'Condiments & Sauces', reason: 'Concentrated flavour base for sauces and soups',        estimatedPrice: 0.45, isStaple: true, isVegan: true },
  { name: 'Plain Flour',    quantity: '1.5kg', category: 'Bread & Grains', reason: 'Multi-use staple for baking, batters, and thickening',      estimatedPrice: 1.00, isStaple: true, isVegan: true },
  { name: 'Butter',         quantity: '250g', category: 'Dairy & Eggs',   reason: 'Essential cooking fat for baking and frying',               estimatedPrice: 1.60, isStaple: true, isVegan: false },

  // ── Pantry-complement items (suggested when user has related items) ────────────
  { name: 'Parmesan',       quantity: '100g', category: 'Dairy & Eggs',   reason: 'Perfect with pasta dishes',                                  estimatedPrice: 2.00, pairsWithPantry: ['pasta', 'spaghetti', 'penne', 'fettuccine'], isVegan: false },
  { name: 'Coconut Milk',   quantity: '400ml tin', category: 'Tins & Dried', reason: 'Perfect for curries with your spices',                     estimatedPrice: 1.00, pairsWithPantry: ['curry', 'turmeric', 'cumin', 'coriander', 'garam masala'], isVegan: true },
  { name: 'Soy Sauce',      quantity: '150ml', category: 'Condiments & Sauces', reason: 'Great with rice and stir-fry ingredients',             estimatedPrice: 1.20, pairsWithPantry: ['rice', 'noodle', 'ginger', 'garlic'], isVegan: true },
  { name: 'Lemon',          quantity: '4 pack', category: 'Fruit',        reason: 'Adds freshness to fish, salads, and sauces',                 estimatedPrice: 0.60, pairsWithPantry: ['fish', 'salmon', 'cod', 'chicken', 'pasta'], isVegan: true },
  { name: 'Cream',          quantity: '300ml', category: 'Dairy & Eggs',  reason: 'Needed for creamy sauces with your pasta',                   estimatedPrice: 1.50, pairsWithPantry: ['pasta', 'mushroom', 'chicken'], isVegan: false },
  { name: 'Ginger',         quantity: '1 root', category: 'Vegetables',   reason: 'Pairs with your Asian pantry ingredients',                   estimatedPrice: 0.40, pairsWithPantry: ['soy sauce', 'rice', 'noodle', 'turmeric', 'curry'], isVegan: true },
  { name: 'Chorizo',        quantity: '225g', category: 'Meat & Fish',    reason: 'Adds smoky depth to rice and bean dishes',                   estimatedPrice: 1.80, pairsWithPantry: ['rice', 'chickpea', 'bean', 'potato'], isVegan: false, isVegetarian: false },
  { name: 'Fresh Coriander',quantity: '30g', category: 'Vegetables',      reason: 'Finishing herb for curries and Mexican dishes',              estimatedPrice: 0.55, pairsWithPantry: ['curry', 'cumin', 'turmeric', 'lime', 'chilli'], isVegan: true },
  { name: 'Mozzarella',     quantity: '125g', category: 'Dairy & Eggs',   reason: 'Great with tomatoes and pasta',                              estimatedPrice: 1.00, pairsWithPantry: ['tomato', 'pasta', 'basil'], isVegan: false },
]

// ─── Main function ────────────────────────────────────────────────────────────

interface RuleOpts {
  pantryItems: string[]
  lowNutrients: string[]      // gap labels, e.g. ['Protein', 'Fibre']
  diet?: string
  allergens?: string[]
  dismissed?: string[]
}

export function generateShoppingSuggestions(opts: RuleOpts): ShoppingSuggestion[] {
  const pantryLower = opts.pantryItems.map(n => n.toLowerCase())
  const dismissedLower = (opts.dismissed ?? []).map(n => n.toLowerCase())
  const allergenLower = (opts.allergens ?? []).map(a => a.toLowerCase())
  const isVegan = opts.diet === 'vegan'
  const isVegetarian = isVegan || opts.diet === 'vegetarian'

  function isExcluded(item: RuleItem): boolean {
    const nameLower = item.name.toLowerCase()
    // Already in pantry
    if (pantryLower.some(p => nameLower.includes(p) || p.includes(nameLower))) return true
    // User dismissed
    if (dismissedLower.includes(nameLower)) return true
    // Diet
    if (isVegan && item.isVegan === false) return true
    if (isVegetarian && item.isVegetarian === false) return true
    // Allergens
    if (allergenLower.length > 0 && item.allergenTags?.some(t => allergenLower.some(a => t.includes(a) || a.includes(t)))) return true
    return false
  }

  const results: Array<ShoppingSuggestion & { _score: number }> = []
  const added = new Set<string>()

  function add(item: RuleItem, priority: ShoppingSuggestion['priority'], scoreBoost = 0) {
    if (added.has(item.name) || isExcluded(item)) return
    added.add(item.name)
    results.push({ name: item.name, quantity: item.quantity, category: item.category, reason: item.reason, priority, estimatedPrice: item.estimatedPrice, _score: scoreBoost })
  }

  // 1. Nutrient gap items — high priority, scored by how many gaps they address
  for (const item of ITEMS) {
    if (!item.nutrients) continue
    const matchingGaps = item.nutrients.filter(n => opts.lowNutrients.includes(n))
    if (matchingGaps.length > 0) {
      add(item, 'high', matchingGaps.length * 10)
    }
  }

  // 2. Pantry complement items — medium priority
  for (const item of ITEMS) {
    if (!item.pairsWithPantry) continue
    const matches = item.pairsWithPantry.filter(kw => pantryLower.some(p => p.includes(kw)))
    if (matches.length > 0) {
      add(item, 'medium', matches.length * 5)
    }
  }

  // 3. Essential staples not in pantry — low/medium priority
  for (const item of ITEMS) {
    if (!item.isStaple) continue
    add(item, 'low', 1)
  }

  // Sort: high first, then by score descending
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  results.sort((a, b) => {
    if (a.priority !== b.priority) return priorityOrder[a.priority] - priorityOrder[b.priority]
    return b._score - a._score
  })

  // Return top 18, stripping the internal score field
  return results.slice(0, 18).map(({ _score: _s, ...rest }) => rest)
}
