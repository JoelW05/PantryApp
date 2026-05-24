import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIRecipe, ScannedItem, ShoppingSuggestion } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

// Model priority list — tried in order on 503 overload
const MODEL_FALLBACKS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite']

function getModel(modelName: string) {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: 'application/json' },
  })
}

function isOverloaded(err: unknown): boolean {
  const msg = String(err)
  return msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('overloaded')
}

/** Call generateContent with automatic model fallback on 503 overload */
async function generateWithFallback(
  contentFn: (modelName: string) => Parameters<ReturnType<typeof getModel>['generateContent']>[0]
): Promise<string> {
  for (let i = 0; i < MODEL_FALLBACKS.length; i++) {
    const modelName = MODEL_FALLBACKS[i]
    try {
      const result = await getModel(modelName).generateContent(contentFn(modelName))
      return result.response.text()
    } catch (err) {
      if (isOverloaded(err) && i < MODEL_FALLBACKS.length - 1) {
        console.warn(`[gemini] ${modelName} overloaded, trying ${MODEL_FALLBACKS[i + 1]}`)
        continue
      }
      throw err
    }
  }
  throw new Error('All Gemini models unavailable — please try again in a moment')
}

function parseJSON<T>(text: string): T {
  try { return JSON.parse(text) }
  catch {
    const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('No JSON found in response')
  }
}

// ─── Receipt scanning ──────────────────────────────────────────────────────────

const RECEIPT_PROMPT = `You are reading a UK supermarket receipt. Extract every food item as a JSON array.

CRITICAL — receipt lines have this format:
  <qty_bought>  <Product Name> <package_size>  <price>
  Example: "1  Fusilli Pasta 500g  £0.60"

The number at the START of the line is HOW MANY PACKS were bought (usually 1).
DO NOT include this leading number in the quantity. Use ONLY the package size.

WRONG → "1  Fusilli Pasta 500g" → quantity: 1500  ← NEVER DO THIS
RIGHT → "1  Fusilli Pasta 500g" → quantity: 500, unit: "g"

WRONG → "1  Cheddar Cheese 220g" → quantity: 1220  ← NEVER DO THIS
RIGHT → "1  Cheddar Cheese 220g" → quantity: 220, unit: "g"

More examples:
"1  Whole Milk 1.131/2 Pints" → {"name":"Semi Skimmed Milk","quantity":2,"unit":"unit"}
"1  Braeburn Apples 5 Pack"   → {"name":"Braeburn Apples","quantity":5,"unit":"unit"}
"1  White Wine 75cl"          → {"name":"White Wine","quantity":750,"unit":"ml"}
"2  Chicken Breast 300g"      → {"name":"Chicken Breast","quantity":300,"unit":"g"}

Output format — JSON array only, no markdown:
[{"name":"Clean Product Name","quantity":<package size only>,"unit":"g|kg|ml|L|unit"}]

Additional rules:
- Convert cl → ml (×10), pints → use "unit" count
- Drop store-brand prefixes like "Tesco", "Sainsbury's" unless it IS the brand
- Skip non-food items: bleach, washing up liquid, toiletries, magazines`

export async function scanReceiptWithGemini(imageBase64: string, mimeType: string): Promise<ScannedItem[]> {
  const text = await generateWithFallback(() => [
    { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } },
    RECEIPT_PROMPT,
  ])
  return parseJSON<ScannedItem[]>(text)
}

// ─── Meal suggestions ──────────────────────────────────────────────────────────

interface SuggestOpts {
  pantryItems: string[]
  mealType?: 'breakfast' | 'lunch' | 'dinner'
  maxTime?: number
  cuisine?: string
  diet?: string
  allergens?: string[]
  caloriesNeeded?: number
  proteinNeeded?: number
  count?: number
  dismissed?: string[]
  expiringItems?: string[]
}

const MEAL_TYPE_CONTEXT: Record<string, string> = {
  breakfast: 'These are BREAKFAST ideas — think eggs, oats, toast, smoothies, yoghurt, pancakes, cereals, fruit, quick morning meals.',
  lunch: 'These are LUNCH ideas — think sandwiches, wraps, salads, soups, light pasta, grain bowls, leftovers-friendly meals.',
  dinner: 'These are DINNER ideas — think hearty main courses, roasts, stir-fries, curries, pasta bakes, family meals.',
}

export async function suggestMealsWithGemini(opts: SuggestOpts): Promise<AIRecipe[]> {
  const pantryList = opts.pantryItems.length
    ? opts.pantryItems.join(', ')
    : 'common kitchen staples (flour, eggs, butter, onions, garlic, pasta, rice, canned tomatoes)'

  const mealTypeNote = opts.mealType ? MEAL_TYPE_CONTEXT[opts.mealType] : null

  const constraints = [
    mealTypeNote,
    opts.maxTime ? `Ready in ${opts.maxTime} minutes or less` : null,
    opts.cuisine && opts.cuisine !== 'Any' ? `Cuisine style: ${opts.cuisine}` : null,
    opts.diet ? `Dietary requirement: ${opts.diet}` : null,
    opts.allergens?.length ? `STRICT ALLERGEN RULE — user is allergic to: ${opts.allergens.join(', ')}. NEVER include these or derivatives.` : null,
    opts.caloriesNeeded ? `Roughly ${opts.caloriesNeeded} kcal per serving` : null,
    opts.proteinNeeded ? `At least ${Math.round(opts.proteinNeeded * 0.3)}g protein per serving` : null,
    opts.dismissed?.length ? `Do NOT suggest: ${opts.dismissed.join(', ')}` : null,
    opts.expiringItems?.length ? `PRIORITY — use these expiring items in at least half the recipes: ${opts.expiringItems.join(', ')}` : null,
  ].filter(Boolean).join('\n')

  const prompt = `Suggest ${opts.count ?? 6} varied ${opts.mealType ?? 'meal'} ideas for a home cook using: ${pantryList}.
${constraints ? `\nConstraints:\n${constraints}` : ''}

Return a JSON array. Each item:
{"id":"kebab-slug","title":"Recipe Name","emoji":"🍝","readyInMinutes":30,"servings":2,"calories":450,"protein_g":28,"carbs_g":52,"fat_g":14,"ingredients":["200g pasta","2 cloves garlic"],"steps":["Step 1.","Step 2."],"usedPantryItems":["pasta","garlic"]}

Vary ingredients and cook times. Realistic nutrition per serving.`

  const text = await generateWithFallback(() => prompt)
  return parseJSON<AIRecipe[]>(text)
}

// ─── Shopping suggestions ──────────────────────────────────────────────────────

interface ShoppingOpts {
  pantryItems: string[]
  lowNutrients: string[]
  cuisine?: string
  diet?: string
  allergens?: string[]
  dismissed?: string[]
}

export async function suggestShoppingWithGemini(opts: ShoppingOpts): Promise<ShoppingSuggestion[]> {
  const prompt = `UK nutritionist and personal shopper. Suggest 15–20 grocery items to buy.

Pantry: ${opts.pantryItems.length ? opts.pantryItems.join(', ') : 'nothing yet'}
Nutrient gaps: ${opts.lowNutrients.length ? opts.lowNutrients.join(', ') : 'none'}
${opts.cuisine ? `Cuisine: ${opts.cuisine}` : ''}${opts.diet ? `\nDiet: ${opts.diet}` : ''}
${opts.allergens?.length ? `ALLERGEN RULE — never suggest: ${opts.allergens.join(', ')} or derivatives` : ''}
${opts.dismissed?.length ? `Skip these (dismissed): ${opts.dismissed.join(', ')}` : ''}

Focus: 1) fix nutrient gaps  2) complement pantry  3) missing staples

JSON array: [{"name":"Chicken Breast","quantity":"500g","category":"Meat & Fish","reason":"High protein — addresses gap","priority":"high","estimatedPrice":3.50}]

priority: "high"=fixes gap or essential missing staple | "medium"=useful complement | "low"=nice addition
estimatedPrice: UK Tesco/Sainsbury's price, number only (no £)
Categories: "Meat & Fish","Dairy & Eggs","Vegetables","Fruit","Grains & Pasta","Tinned & Dried","Condiments & Oils","Snacks & Breakfast"`

  const text = await generateWithFallback(() => prompt)
  return parseJSON<ShoppingSuggestion[]>(text)
}
