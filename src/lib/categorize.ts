export const PANTRY_CATEGORIES = [
  'Dairy & Eggs',
  'Meat & Fish',
  'Vegetables',
  'Fruit',
  'Bread & Grains',
  'Tins & Dried',
  'Drinks',
  'Condiments & Sauces',
  'Seasonings',
  'Snacks & Treats',
  'Other',
] as const

export type PantryCategory = typeof PANTRY_CATEGORIES[number]

export const CATEGORY_EMOJI: Record<string, string> = {
  'Dairy & Eggs':       '🥛',
  'Meat & Fish':        '🥩',
  'Vegetables':         '🥦',
  'Fruit':              '🍎',
  'Bread & Grains':     '🌾',
  'Tins & Dried':       '🥫',
  'Drinks':             '🥤',
  'Condiments & Sauces':'🫙',
  'Seasonings':         '🧂',
  'Snacks & Treats':    '🍪',
  'Other':              '📦',
}

const RULES: { category: PantryCategory; keywords: string[] }[] = [
  { category: 'Dairy & Eggs',        keywords: ['milk','cheese','butter','yogurt','yoghurt','cream','egg','eggs','cheddar','mozzarella','brie','parmesan','ricotta','feta','gouda','halloumi','crème fraîche','clotted','double cream','single cream','spreadable','lurpak'] },
  { category: 'Meat & Fish',         keywords: ['chicken','beef','pork','lamb','turkey','salmon','tuna','cod','fish','bacon','sausage','mince','steak','ham','prawn','shrimp','haddock','mackerel','sardine','anchovy','duck','venison','pepperoni','salami','chorizo','deli','breast','thigh','fillet','loin'] },
  { category: 'Vegetables',          keywords: ['tomato','onion','garlic','carrot','spinach','broccoli','pepper','courgette','cucumber','lettuce','potato','mushroom','celery','leek','asparagus','peas','sweetcorn','corn','aubergine','cabbage','kale','spring onion','avocado','chilli','ginger','radish','parsnip','swede','turnip','fennel','artichoke','okra','pak choi'] },
  { category: 'Fruit',               keywords: ['apple','banana','orange','lemon','lime','strawberry','blueberry','mango','grape','pear','peach','raspberry','cherry','watermelon','melon','pineapple','kiwi','plum','nectarine','apricot','fig','date','passion fruit','pomegranate','clementine','satsuma','grapefruit','coconut'] },
  { category: 'Bread & Grains',      keywords: ['bread','pasta','rice','flour','oat','cereal','noodle','couscous','quinoa','bagel','tortilla','wrap','fusilli','spaghetti','penne','rigatoni','tagliatelle','orzo','loaf','pitta','sourdough','baguette','ciabatta','croissant','crumpet','porridge','cornflake','weetabix','granola','muesli','brioche','focaccia','roti','chapati','roll','bap','bun'] },
  { category: 'Tins & Dried',        keywords: ['tin','canned','can','lentil','chickpea','kidney bean','butter bean','black bean','cannellini','baked bean','soup','stock','chopped tomato','plum tomato','coconut milk','dried','lentils','beans','split pea','haricot','borlotti','pearl barley','bulgar','polenta','cornmeal','cassava','dried pasta','dried fruit'] },
  { category: 'Drinks',              keywords: ['juice','water','coffee','tea','beer','wine','spirits','squash','smoothie','cola','lemonade','oat milk','almond milk','soy milk','rice milk','cordial','tonic','prosecco','champagne','whisky','gin','vodka','rum','kombucha','kefir','milkshake','hot chocolate','energy drink','flavoured water','tempranillo','doom bar','ale','lager','cider'] },
  { category: 'Condiments & Sauces', keywords: ['oil','vinegar','sauce','ketchup','mustard','mayo','mayonnaise','dressing','soy sauce','worcestershire','pesto','honey','jam','spread','marmite','chutney','relish','sriracha','tabasco','fish sauce','oyster sauce','hoisin','teriyaki','tzatziki','houmous','hummus','tahini','miso','curry paste','stock cube','gravy','bouillon'] },
  { category: 'Seasonings',          keywords: ['spice','herb','seasoning','salt','pepper','paprika','cumin','turmeric','coriander seed','oregano','basil','thyme','rosemary','cinnamon','nutmeg','chilli flakes','mixed spice','garam masala','cardamom','cloves','star anise','bay leaf','bay leaves','sage','tarragon','dill','parsley','mint','chives','chilli powder','cayenne','five spice','curry powder','tandoori','smoked paprika','garlic powder','onion powder','allspice','sumac','za\'atar','ras el hanout','vanilla extract','vanilla pod','saffron','fenugreek','mustard seeds','black onion seeds','nigella','poppy seeds','fennel seeds'] },
  { category: 'Snacks & Treats',     keywords: ['crisp','biscuit','chocolate','digestive','bar','cake','cookie','brownie','popcorn','pretzel','cracker','nut','raisin','dried fruit','candy','sweet','gummy','crisps','chips','flapjack','shortbread','wafer','malt loaf','hot cross bun','doughnut','cereal bar','protein bar','rice cake','oatcake','breadstick','tortilla chip','peanut','almond','cashew','walnut','pistachio','hazelnut','trail mix'] },
]

export function autoCategory(name: string): PantryCategory {
  const lower = name.toLowerCase()
  for (const { category, keywords } of RULES) {
    if (keywords.some(k => lower.includes(k))) return category
  }
  return 'Other'
}
