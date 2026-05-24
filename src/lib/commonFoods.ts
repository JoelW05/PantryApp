/** Curated bank of common UK grocery / pantry items, organised by category */
export interface CommonFoodEntry {
  name: string
  category: string
}

const FOOD_BANK: { category: string; emoji: string; items: string[] }[] = [
  {
    category: 'Fruit', emoji: '🍎',
    items: [
      // Apples & Pears
      'Apple', 'Braeburn Apple', 'Gala Apple', 'Granny Smith Apple', 'Fuji Apple',
      'Pink Lady Apple', 'Cox Apple', 'Bramley Apple', 'Golden Delicious Apple',
      'Pear', 'Conference Pear', 'Williams Pear', 'Comice Pear',
      // Citrus
      'Orange', 'Navel Orange', 'Blood Orange', 'Clementine', 'Satsuma',
      'Mandarin', 'Tangerine', 'Lemon', 'Lime', 'Grapefruit', 'Pink Grapefruit',
      'Yuzu', 'Bergamot', 'Pomelo', 'Ugli Fruit',
      // Berries
      'Strawberry', 'Blueberry', 'Raspberry', 'Blackberry', 'Cranberry',
      'Gooseberry', 'Redcurrant', 'Blackcurrant', 'Whitecurrant', 'Elderberry',
      'Loganberry', 'Tayberry', 'Boysenberry', 'Mulberry',
      // Tropical
      'Banana', 'Mango', 'Pineapple', 'Papaya', 'Passion Fruit', 'Guava',
      'Lychee', 'Rambutan', 'Dragon Fruit', 'Star Fruit', 'Jackfruit',
      'Durian', 'Tamarind', 'Kumquat', 'Physalis', 'Feijoa',
      'Sapodilla', 'Soursop', 'Cherimoya',
      // Stone fruits
      'Peach', 'Nectarine', 'Plum', 'Victoria Plum', 'Greengage',
      'Apricot', 'Cherry', 'Morello Cherry', 'Damson',
      // Melons & Grapes
      'Watermelon', 'Cantaloupe', 'Honeydew Melon', 'Galia Melon', 'Charentais Melon',
      'Grapes', 'Red Grapes', 'Green Grapes', 'Black Grapes', 'Seedless Grapes',
      // Other
      'Avocado', 'Hass Avocado', 'Kiwi', 'Golden Kiwi', 'Kiwi Berry',
      'Fig', 'Fresh Fig', 'Pomegranate', 'Persimmon', 'Quince',
      'Coconut', 'Coconut Flesh', 'Plantain', 'Banana Plantain',
      // Dried
      'Raisin', 'Sultana', 'Currant', 'Dried Apricot', 'Dried Mango',
      'Dried Cranberry', 'Dried Blueberry', 'Dried Cherry', 'Dried Fig',
      'Dried Date', 'Medjool Date', 'Prune', 'Dried Pineapple',
      'Dried Strawberry', 'Dried Papaya', 'Dried Coconut',
    ],
  },
  {
    category: 'Vegetables', emoji: '🥦',
    items: [
      // Brassicas
      'Broccoli', 'Tenderstem Broccoli', 'Purple Sprouting Broccoli',
      'Cauliflower', 'Romanesco', 'Cabbage', 'Savoy Cabbage', 'Red Cabbage',
      'White Cabbage', 'Green Cabbage', 'Pointed Cabbage', 'Hispi Cabbage',
      'Brussels Sprouts', 'Kale', 'Curly Kale', 'Cavolo Nero', 'Kohlrabi',
      'Pak Choi', 'Bok Choy', 'Chinese Cabbage', 'Napa Cabbage',
      'Watercress', 'Rocket', 'Mustard Leaves', 'Spring Greens',
      // Leafy greens
      'Spinach', 'Baby Spinach', 'Chard', 'Rainbow Chard', 'Swiss Chard',
      'Lettuce', 'Iceberg Lettuce', 'Romaine Lettuce', 'Butterhead Lettuce',
      'Little Gem Lettuce', 'Lollo Rosso', 'Oak Leaf Lettuce', 'Lamb\'s Lettuce',
      'Endive', 'Radicchio', 'Chicory',
      // Alliums
      'Onion', 'White Onion', 'Brown Onion', 'Red Onion', 'Spanish Onion',
      'Spring Onion', 'Shallot', 'Banana Shallot', 'Leek', 'Baby Leek',
      'Garlic', 'Elephant Garlic', 'Wild Garlic', 'Garlic Scapes',
      'Chives',
      // Root vegetables
      'Carrot', 'Chantenay Carrot', 'Parsnip', 'Turnip', 'Swede', 'Celeriac',
      'Beetroot', 'Candy Beetroot', 'Radish', 'Mooli', 'Daikon',
      'Horseradish', 'Salsify', 'Jerusalem Artichoke',
      // Potatoes & tubers
      'Potato', 'Maris Piper Potato', 'King Edward Potato', 'Desiree Potato',
      'New Potato', 'Jersey Royal Potato', 'Baby Potato', 'Sweet Potato',
      'Purple Sweet Potato', 'Yam', 'Cassava', 'Taro',
      // Squash & pumpkin
      'Butternut Squash', 'Pumpkin', 'Acorn Squash', 'Delicata Squash',
      'Crown Prince Squash', 'Spaghetti Squash', 'Courgette', 'Yellow Courgette',
      'Patty Pan Squash', 'Marrow',
      // Tomatoes & peppers
      'Tomato', 'Cherry Tomato', 'Plum Tomato', 'Beef Tomato', 'Vine Tomato',
      'Roma Tomato', 'Heirloom Tomato', 'Sun-dried Tomato',
      'Red Pepper', 'Green Pepper', 'Yellow Pepper', 'Orange Pepper',
      'Chilli', 'Red Chilli', 'Green Chilli', 'Bird\'s Eye Chilli',
      'Scotch Bonnet', 'Jalapeño', 'Serrano', 'Habanero', 'Padron Pepper',
      'Poblano Pepper',
      // Cucumbers & aubergine
      'Cucumber', 'Mini Cucumber', 'Ridge Cucumber', 'Aubergine', 'Baby Aubergine',
      // Stalks & stems
      'Celery', 'Celery Hearts', 'Fennel', 'Asparagus', 'Globe Artichoke',
      'Rhubarb',
      // Mushrooms
      'Mushroom', 'Chestnut Mushroom', 'Portobello Mushroom', 'Button Mushroom',
      'Shiitake Mushroom', 'Oyster Mushroom', 'King Oyster Mushroom',
      'Enoki Mushroom', 'Chanterelle', 'Porcini', 'Morel',
      'Dried Mushroom', 'Dried Porcini', 'Dried Shiitake',
      // Beans & peas (fresh)
      'Peas', 'Petit Pois', 'Mangetout', 'Sugar Snap Peas', 'Broad Beans',
      'Green Beans', 'Fine Beans', 'Bobby Beans', 'Runner Beans', 'Edamame',
      'Sweetcorn', 'Baby Sweetcorn',
      // Asian vegetables
      'Bean Sprouts', 'Bamboo Shoots', 'Water Chestnuts', 'Lotus Root',
      'Mooli', 'Bitter Melon', 'Okra', 'Drumstick',
      // Herbs (fresh)
      'Fresh Basil', 'Fresh Coriander', 'Fresh Parsley', 'Fresh Mint',
      'Fresh Thyme', 'Fresh Rosemary', 'Fresh Dill', 'Fresh Tarragon',
      'Fresh Chives', 'Fresh Sage', 'Fresh Oregano', 'Fresh Bay Leaves',
      'Lemongrass', 'Kaffir Lime Leaves', 'Curry Leaves',
      'Ginger', 'Fresh Ginger', 'Galangal', 'Turmeric Root',
    ],
  },
  {
    category: 'Meat & Fish', emoji: '🥩',
    items: [
      // Chicken
      'Chicken Breast', 'Chicken Thigh', 'Chicken Drumstick', 'Chicken Wing',
      'Whole Chicken', 'Chicken Fillet', 'Chicken Mini Fillets',
      'Chicken Mince', 'Chicken Liver', 'Chicken Heart',
      'Cooked Chicken', 'Rotisserie Chicken',
      // Turkey
      'Turkey Breast', 'Turkey Mince', 'Turkey Thigh', 'Whole Turkey',
      'Turkey Escalope', 'Turkey Rashers',
      // Beef
      'Beef Mince', 'Lean Beef Mince', 'Extra Lean Beef Mince',
      'Beef Steak', 'Sirloin Steak', 'Ribeye Steak', 'Rump Steak',
      'Fillet Steak', 'T-bone Steak', 'Bavette Steak', 'Flat Iron Steak',
      'Beef Stewing Steak', 'Beef Braising Steak', 'Beef Brisket',
      'Beef Short Rib', 'Beef Shin', 'Beef Cheek', 'Oxtail',
      'Beef Roasting Joint', 'Topside', 'Silverside', 'Rib of Beef',
      // Lamb
      'Lamb Mince', 'Lamb Chop', 'Lamb Loin Chop', 'Lamb Cutlet',
      'Lamb Shoulder', 'Lamb Leg', 'Leg of Lamb', 'Rack of Lamb',
      'Lamb Shank', 'Lamb Neck', 'Lamb Breast', 'Lamb Kofta',
      // Pork
      'Pork Mince', 'Pork Chop', 'Pork Loin Chop', 'Pork Belly',
      'Pork Loin', 'Pork Shoulder', 'Pork Fillet', 'Pork Tenderloin',
      'Pork Ribs', 'Pulled Pork', 'Pork Roasting Joint',
      // Bacon & cured
      'Bacon', 'Smoked Bacon', 'Unsmoked Bacon', 'Streaky Bacon',
      'Back Bacon', 'Pancetta', 'Lardons', 'Guanciale', 'Prosciutto',
      'Parma Ham', 'Serrano Ham', 'Iberico Ham', 'Coppa',
      'Ham', 'Gammon', 'Gammon Steak', 'Gammon Joint',
      // Sausages & cured meats
      'Sausage', 'Pork Sausage', 'Cumberland Sausage', 'Chipolata',
      'Merguez', 'Toulouse Sausage', 'Bratwurst', 'Frankfurter',
      'Chorizo', 'Cooking Chorizo', 'Salami', 'Milano Salami',
      'Pepperoni', 'Mortadella', 'Bresaola', 'Pastrami',
      'Corned Beef', 'Spam', 'Pâté', 'Chicken Liver Pâté',
      // Offal
      'Lamb Liver', 'Chicken Liver', 'Beef Liver', 'Kidney', 'Lamb Kidney',
      // Game
      'Duck Breast', 'Duck Leg', 'Whole Duck', 'Confit Duck',
      'Venison', 'Venison Mince', 'Venison Steak',
      'Rabbit', 'Pheasant', 'Partridge', 'Quail', 'Pigeon Breast',
      'Wild Boar',
      // White fish
      'Cod', 'Cod Fillet', 'Haddock', 'Haddock Fillet',
      'Pollock', 'Coley', 'Whiting', 'Plaice', 'Sole',
      'Lemon Sole', 'Turbot', 'Halibut', 'Monkfish',
      'Sea Bass', 'Sea Bream', 'Red Mullet', 'John Dory',
      'Tilapia', 'Pangasius', 'Catfish', 'Basa',
      // Oily fish
      'Salmon', 'Salmon Fillet', 'Salmon Steak', 'Side of Salmon',
      'Smoked Salmon', 'Hot Smoked Salmon', 'Gravlax',
      'Trout', 'Rainbow Trout', 'Smoked Trout',
      'Mackerel', 'Smoked Mackerel', 'Sardine',
      'Tuna', 'Tuna Steak', 'Swordfish', 'Mahi-mahi',
      'Herring', 'Kipper', 'Rollmop Herring',
      'Anchovy', 'Sprat', 'Pilchard',
      // Shellfish
      'Prawns', 'King Prawns', 'Tiger Prawns', 'Raw Prawns',
      'Cooked Prawns', 'Langoustine', 'Lobster', 'Crab',
      'Brown Crab', 'Dressed Crab', 'Crab Meat',
      'Scallop', 'King Scallop', 'Queen Scallop',
      'Mussels', 'Clams', 'Oyster', 'Cockles', 'Whelks',
      'Squid', 'Calamari', 'Cuttlefish', 'Octopus',
      // Tinned fish
      'Canned Tuna', 'Tuna in Brine', 'Tuna in Spring Water', 'Tuna in Oil',
      'Canned Salmon', 'Canned Sardines', 'Canned Mackerel',
      'Canned Anchovies', 'Canned Pilchards', 'Canned Crab', 'Canned Prawns',
    ],
  },
  {
    category: 'Dairy & Eggs', emoji: '🥛',
    items: [
      // Milk
      'Whole Milk', 'Semi-skimmed Milk', 'Skimmed Milk', 'Full-fat Milk',
      'Organic Milk', 'Filtered Milk', 'Longlife Milk', 'Evaporated Milk',
      'Condensed Milk', 'Powdered Milk', 'Goat\'s Milk',
      // Plant milks
      'Oat Milk', 'Almond Milk', 'Soy Milk', 'Coconut Milk Drink',
      'Rice Milk', 'Hemp Milk', 'Cashew Milk', 'Hazelnut Milk',
      'Macadamia Milk', 'Pea Milk', 'Oat Barista Milk',
      // Butter & spreads
      'Butter', 'Unsalted Butter', 'Salted Butter', 'Spreadable Butter',
      'Lurpak', 'Kerrygold', 'Clarified Butter', 'Ghee',
      'Margarine', 'Dairy-free Spread', 'Vegan Butter',
      // Cheese — hard
      'Cheddar', 'Mature Cheddar', 'Extra Mature Cheddar', 'Mild Cheddar',
      'Red Leicester', 'Double Gloucester', 'Colby', 'Gouda',
      'Edam', 'Emmental', 'Gruyère', 'Comté', 'Manchego',
      'Parmesan', 'Grana Padano', 'Pecorino', 'Aged Pecorino',
      'Jarlsberg', 'Raclette', 'Appenzeller',
      // Cheese — semi-hard
      'Mozzarella', 'Buffalo Mozzarella', 'Provolone', 'Havarti',
      'Wensleydale', 'Lancashire', 'Cheshire', 'Caerphilly',
      'Halloumi', 'Paneer',
      // Cheese — soft
      'Brie', 'Camembert', 'Normandy Brie', 'Coulommiers',
      'Cream Cheese', 'Philadelphia', 'Mascarpone', 'Ricotta',
      'Cottage Cheese', 'Fromage Frais', 'Quark',
      // Cheese — blue
      'Stilton', 'Gorgonzola', 'Roquefort', 'Danish Blue', 'Dolcelatte',
      // Cheese — fresh/other
      'Feta', 'Greek Feta', 'Labneh', 'Burrata',
      // Cream
      'Double Cream', 'Single Cream', 'Whipping Cream', 'Clotted Cream',
      'Soured Cream', 'Crème Fraîche', 'Half-fat Crème Fraîche',
      'Squirty Cream', 'Aerosol Cream',
      // Yoghurt
      'Greek Yoghurt', 'Natural Yoghurt', 'Low-fat Yoghurt', 'Full-fat Yoghurt',
      'Skyr', 'Kefir', 'Drinking Yoghurt', 'Activia Yoghurt',
      'Soy Yoghurt', 'Coconut Yoghurt', 'Oat Yoghurt',
      // Eggs
      'Egg', 'Free-range Egg', 'Organic Egg', 'Medium Egg', 'Large Egg',
      'Quail Egg', 'Duck Egg', 'Goose Egg',
      'Egg White', 'Liquid Egg White', 'Egg Yolk',
    ],
  },
  {
    category: 'Bread & Grains', emoji: '🌾',
    items: [
      // Rice
      'White Rice', 'Brown Rice', 'Basmati Rice', 'Jasmine Rice',
      'Arborio Rice', 'Carnaroli Rice', 'Long-grain Rice', 'Short-grain Rice',
      'Wild Rice', 'Red Rice', 'Black Rice', 'Sushi Rice',
      'Rice Flakes', 'Puffed Rice',
      // Pasta
      'Spaghetti', 'Linguine', 'Tagliatelle', 'Fettuccine', 'Pappardelle',
      'Penne', 'Rigatoni', 'Paccheri', 'Macaroni', 'Fusilli',
      'Farfalle', 'Conchiglie', 'Orecchiette', 'Casarecce', 'Gemelli',
      'Orzo', 'Risoni', 'Ditalini', 'Tubetti',
      'Lasagne Sheets', 'Cannelloni', 'Gnocchi',
      'Wholemeal Pasta', 'Gluten-free Pasta', 'Chickpea Pasta', 'Lentil Pasta',
      // Noodles
      'Egg Noodles', 'Rice Noodles', 'Udon Noodles', 'Soba Noodles',
      'Ramen Noodles', 'Glass Noodles', 'Vermicelli', 'Pad Thai Noodles',
      // Other grains
      'Couscous', 'Giant Couscous', 'Bulgur Wheat', 'Quinoa', 'Red Quinoa',
      'Freekeh', 'Farro', 'Spelt', 'Kamut', 'Einkorn',
      'Polenta', 'Fine Polenta', 'Ready-made Polenta',
      'Pearl Barley', 'Pot Barley', 'Buckwheat', 'Millet', 'Amaranth',
      'Teff', 'Sorghum',
      // Oats
      'Rolled Oats', 'Porridge Oats', 'Jumbo Oats', 'Steel-cut Oats',
      'Instant Oats', 'Quick-cook Oats',
      // Flour
      'Plain Flour', 'Self-raising Flour', 'Wholemeal Flour', 'Spelt Flour',
      'Strong White Bread Flour', 'Strong Wholemeal Bread Flour',
      'Cornflour', 'Semolina', 'Gram Flour', 'Rice Flour',
      'Almond Flour', 'Coconut Flour', 'Oat Flour', 'Buckwheat Flour',
      'Gluten-free Flour', 'Tapioca Flour', 'Arrowroot',
      // Bread
      'White Bread', 'Wholemeal Bread', 'Granary Bread', 'Seeded Bread',
      'Sourdough', 'Rye Bread', 'Dark Rye Bread', 'Pumpernickel',
      'Ciabatta', 'Focaccia', 'Baguette', 'Bloomer', 'Farmhouse Loaf',
      'Pitta Bread', 'Wholemeal Pitta', 'Flatbread', 'Naan',
      'Garlic Naan', 'Chapati', 'Roti', 'Paratha',
      'Tortilla Wraps', 'Corn Tortillas', 'Flour Tortillas',
      'Bagel', 'Sesame Bagel', 'Everything Bagel',
      'English Muffin', 'Crumpet', 'Brioche', 'Brioche Bun',
      'Burger Bun', 'Hot Dog Roll', 'Crusty Roll', 'Sub Roll',
      'Croissant', 'Pain au Chocolat', 'Danish Pastry',
      // Pulses & legumes
      'Chickpeas', 'Red Lentils', 'Green Lentils', 'Puy Lentils',
      'Brown Lentils', 'Black Lentils', 'Beluga Lentils',
      'Black Beans', 'Kidney Beans', 'Cannellini Beans', 'Butter Beans',
      'Haricot Beans', 'Borlotti Beans', 'Flageolet Beans',
      'Edamame', 'Split Peas', 'Yellow Split Peas', 'Green Split Peas',
      'Mung Beans', 'Adzuki Beans', 'Black-eyed Peas',
      'Soya Beans', 'Fava Beans',
    ],
  },
  {
    category: 'Seasonings', emoji: '🧂',
    items: [
      // Salt
      'Salt', 'Table Salt', 'Sea Salt', 'Fine Sea Salt', 'Coarse Sea Salt',
      'Flaky Sea Salt', 'Maldon Salt', 'Himalayan Pink Salt', 'Kosher Salt',
      'Smoked Salt', 'Celery Salt', 'Garlic Salt', 'Onion Salt',
      // Pepper
      'Black Pepper', 'White Pepper', 'Green Pepper', 'Pink Peppercorns',
      'Cracked Black Pepper', 'Whole Black Peppercorns', 'Whole White Peppercorns',
      'Szechuan Pepper', 'Long Pepper', 'Grains of Paradise',
      // Dried herbs
      'Dried Basil', 'Dried Oregano', 'Dried Thyme', 'Dried Rosemary',
      'Dried Sage', 'Dried Parsley', 'Dried Coriander Leaf', 'Dried Mint',
      'Dried Dill', 'Dried Tarragon', 'Dried Chives', 'Dried Marjoram',
      'Dried Bay Leaves', 'Dried Lavender', 'Dried Lemon Verbena',
      'Dried Lemongrass', 'Dried Kaffir Lime Leaves',
      // Individual spices — warm
      'Cinnamon', 'Ground Cinnamon', 'Cinnamon Sticks', 'Cassia',
      'Nutmeg', 'Ground Nutmeg', 'Whole Nutmeg', 'Mace',
      'Cloves', 'Ground Cloves', 'Whole Cloves',
      'Cardamom', 'Ground Cardamom', 'Cardamom Pods', 'Black Cardamom',
      'Star Anise', 'Whole Star Anise',
      'Allspice', 'Ground Allspice', 'Whole Allspice',
      'Vanilla Extract', 'Vanilla Bean Paste', 'Vanilla Pod',
      // Individual spices — savoury
      'Cumin', 'Ground Cumin', 'Cumin Seeds',
      'Coriander Seeds', 'Ground Coriander',
      'Turmeric', 'Ground Turmeric',
      'Paprika', 'Sweet Paprika', 'Smoked Paprika', 'Hot Smoked Paprika',
      'Chilli Flakes', 'Chilli Powder', 'Mild Chilli Powder', 'Hot Chilli Powder',
      'Cayenne Pepper',
      'Fenugreek Seeds', 'Ground Fenugreek', 'Fenugreek Leaves',
      'Mustard Seeds', 'Yellow Mustard Seeds', 'Black Mustard Seeds', 'Brown Mustard Seeds',
      'Fennel Seeds',
      'Nigella Seeds', 'Black Onion Seeds', 'Kalonji',
      'Poppy Seeds', 'White Poppy Seeds', 'Blue Poppy Seeds',
      'Sesame Seeds', 'Toasted Sesame Seeds', 'Black Sesame Seeds',
      'Caraway Seeds',
      'Celery Seeds',
      'Dill Seeds',
      'Anise Seeds',
      'Juniper Berries',
      'Asafoetida', 'Hing',
      'Sumac',
      'Saffron',
      'Dried Rose Petals', 'Dried Rose Buds',
      'Mahlab',
      // Powders
      'Garlic Powder', 'Garlic Granules',
      'Onion Powder', 'Onion Granules',
      'Ginger Powder', 'Ground Ginger',
      'Wasabi Powder', 'Horseradish Powder',
      'Mushroom Powder',
      'Tomato Powder',
      'Chipotle Powder',
      'Ancho Chilli Powder',
      'Guajillo Chilli Powder',
      'Espelette Pepper',
      // Blends
      'Garam Masala',
      'Curry Powder', 'Mild Curry Powder', 'Medium Curry Powder', 'Hot Curry Powder',
      'Madras Curry Powder', 'Korma Powder',
      'Chinese Five Spice',
      'Mixed Spice',
      'Tandoori Masala', 'Tandoori Spice',
      'Ras El Hanout',
      "Za'atar",
      'Dukkah',
      'Baharat',
      'Harissa Powder',
      'Berbere',
      'Chermoula Spice',
      'Jerk Seasoning',
      'Cajun Seasoning',
      'Creole Seasoning',
      'Old Bay Seasoning',
      'Fajita Seasoning',
      'Taco Seasoning',
      'Italian Seasoning', 'Mixed Italian Herbs',
      'Herbs de Provence',
      'Bouquet Garni',
      'Poultry Seasoning',
      'Chicken Seasoning',
      'Fish Seasoning',
      'Steak Seasoning', 'Steak Rub',
      'BBQ Rub', 'BBQ Seasoning',
      'Lemon Pepper Seasoning',
      'Celery Salt',
      'Pumpkin Spice',
      'Chai Spice',
      'Pickling Spice',
      'Mulled Wine Spice',
      'Everything Bagel Seasoning',
      'Shawarma Spice',
      'Piri Piri Seasoning',
      'Nando\'s Seasoning',
    ],
  },
  {
    category: 'Condiments & Sauces', emoji: '🫙',
    items: [
      // Oils
      'Olive Oil', 'Extra Virgin Olive Oil', 'Light Olive Oil',
      'Vegetable Oil', 'Sunflower Oil', 'Rapeseed Oil', 'Groundnut Oil',
      'Coconut Oil', 'Sesame Oil', 'Toasted Sesame Oil',
      'Walnut Oil', 'Avocado Oil', 'Flaxseed Oil', 'Hemp Oil',
      'Truffle Oil', 'Chilli Oil', 'Garlic Oil', 'Herb-infused Oil',
      // Vinegars
      'White Wine Vinegar', 'Red Wine Vinegar', 'Balsamic Vinegar',
      'Aged Balsamic Vinegar', 'Balsamic Glaze', 'Apple Cider Vinegar',
      'Malt Vinegar', 'Rice Wine Vinegar', 'Sherry Vinegar', 'Champagne Vinegar',
      // Asian sauces
      'Soy Sauce', 'Dark Soy Sauce', 'Light Soy Sauce', 'Tamari',
      'Coconut Aminos', 'Fish Sauce', 'Oyster Sauce', 'Hoisin Sauce',
      'Teriyaki Sauce', 'Ponzu Sauce', 'Mirin', 'Sake', 'Rice Wine',
      'Shaoxing Wine', 'Plum Sauce', 'Sweet Chilli Sauce',
      'Pad Thai Sauce', 'Satay Sauce', 'Nuoc Cham',
      // Western sauces
      'Worcestershire Sauce', 'Henderson\'s Relish',
      'Tomato Ketchup', 'Tomato Sauce',
      'Brown Sauce', 'HP Brown Sauce', 'A1 Sauce',
      'Mayonnaise', 'Light Mayonnaise', 'Hellmann\'s Mayo',
      'Dijon Mustard', 'Wholegrain Mustard', 'English Mustard', 'French Mustard',
      'Yellow Mustard', 'American Mustard', 'Honey Mustard',
      'Sriracha', 'Tabasco', 'Hot Sauce', 'Frank\'s Hot Sauce', 'Cholula',
      'Harissa', 'Rose Harissa', 'Sambal Oelek',
      'Horseradish Sauce', 'Creamed Horseradish',
      'Mint Sauce', 'Mint Jelly', 'Redcurrant Jelly', 'Cranberry Sauce',
      'Apple Sauce', 'Bread Sauce',
      // Pesto & pasta sauces
      'Pesto', 'Green Pesto', 'Red Pesto', 'Sun-dried Tomato Pesto',
      'Basil Pesto', 'Walnut Pesto', 'Truffle Pesto',
      'Tomato Pasta Sauce', 'Arrabbiata Sauce', 'Bolognese Sauce',
      'Carbonara Sauce', 'Alfredo Sauce', 'Tomato & Basil Sauce',
      // Tomato products
      'Tomato Purée', 'Double Concentrate Tomato Purée', 'Sun-dried Tomato Purée', 'Passata',
      // Curry pastes
      'Curry Paste', 'Tikka Masala Paste', 'Korma Paste',
      'Balti Paste', 'Rogan Josh Paste', 'Jalfrezi Paste',
      'Red Curry Paste', 'Green Curry Paste', 'Yellow Curry Paste',
      'Massaman Curry Paste',
      // Spreads
      'Peanut Butter', 'Crunchy Peanut Butter', 'Smooth Peanut Butter',
      'Almond Butter', 'Cashew Butter', 'Sunflower Seed Butter',
      'Hazelnut Spread', 'Nutella', 'Chocolate Spread',
      'Marmite', 'Vegemite', 'Bovril', 'Peanut Butter Powder',
      // Sweet condiments
      'Honey', 'Clear Honey', 'Set Honey', 'Manuka Honey', 'Acacia Honey',
      'Maple Syrup', 'Golden Syrup', 'Treacle', 'Molasses', 'Agave Syrup',
      'Date Syrup', 'Rice Syrup', 'Coconut Nectar',
      // Jams & preserves
      'Strawberry Jam', 'Raspberry Jam', 'Blackcurrant Jam', 'Apricot Jam',
      'Marmalade', 'Thick Cut Marmalade', 'Lemon Curd', 'Lime Curd',
      'Quince Jelly', 'Fig Jam', 'Cherry Jam', 'Blueberry Jam',
      // Pastes & other
      'Miso Paste', 'White Miso', 'Red Miso', 'Brown Miso',
      'Tahini', 'Hummus', 'Baba Ganoush',
      'Black Bean Paste', 'Gochujang', 'Doenjang', 'Dobanjiang',
      'Doubanjiang', 'Fermented Black Beans',
      // Dressings
      'Caesar Dressing', 'Ranch Dressing', 'French Dressing',
      'Italian Dressing', 'Thousand Island Dressing', 'Blue Cheese Dressing',
      'Balsamic Dressing', 'Honey Mustard Dressing', 'Vinaigrette',
      // Stock & gravy
      'Chicken Stock Cube', 'Vegetable Stock Cube', 'Beef Stock Cube', 'Fish Stock Cube',
      'Chicken Stock', 'Vegetable Stock', 'Beef Stock', 'Fish Stock',
      'Bouillon Powder', 'Miso Soup Sachets',
      'Gravy Granules', 'Bisto Gravy', 'Onion Gravy Mix',
    ],
  },
  {
    category: 'Tins & Dried', emoji: '🥫',
    items: [
      // Tinned tomatoes
      'Chopped Tomatoes', 'Plum Tomatoes', 'Cherry Tomatoes Tin',
      'Whole Peeled Tomatoes', 'Crushed Tomatoes', 'Tomato Passata',
      // Tinned beans & pulses
      'Chickpeas Tin', 'Kidney Beans Tin', 'Cannellini Beans Tin',
      'Butter Beans Tin', 'Black Beans Tin', 'Borlotti Beans Tin',
      'Haricot Beans Tin', 'Flageolet Beans Tin', 'Baked Beans',
      'Heinz Baked Beans', 'Lentils Tin', 'Green Lentils Tin', 'Puy Lentils Tin',
      // Tinned vegetables
      'Sweetcorn Tin', 'Peas Tin', 'Mushy Peas', 'Petit Pois Tin',
      'Artichoke Hearts', 'Beetroot Tin', 'Asparagus Tin',
      'Bamboo Shoots Tin', 'Water Chestnuts Tin', 'Jackfruit Tin',
      'Sliced Mushrooms Tin',
      // Tinned fruit
      'Peaches Tin', 'Pineapple Tin', 'Mandarin Segments', 'Pear Halves Tin',
      'Cherry Compote', 'Plum Compote', 'Mixed Fruit Tin',
      // Coconut
      'Coconut Milk Tin', 'Coconut Cream Tin', 'Creamed Coconut',
      // Soup
      'Tomato Soup', 'Minestrone Soup', 'Chicken Soup',
      'Lentil Soup', 'Mushroom Soup', 'Pea Soup',
      // Nuts
      'Almonds', 'Blanched Almonds', 'Flaked Almonds', 'Ground Almonds',
      'Cashews', 'Whole Cashews', 'Cashew Pieces',
      'Walnuts', 'Walnut Halves', 'Walnut Pieces',
      'Pecans', 'Brazil Nuts', 'Hazelnuts', 'Blanched Hazelnuts',
      'Pistachios', 'Macadamia Nuts', 'Pine Nuts', 'Chestnuts',
      'Peanuts', 'Dry Roasted Peanuts', 'Salted Peanuts', 'Mixed Nuts',
      // Seeds
      'Sunflower Seeds', 'Pumpkin Seeds', 'Chia Seeds', 'Flaxseed',
      'Hemp Seeds', 'Sesame Seeds', 'Poppy Seeds',
      'Linseeds', 'Mixed Seeds',
      // Baking
      'Caster Sugar', 'Granulated Sugar', 'Icing Sugar', 'Soft Brown Sugar',
      'Dark Brown Sugar', 'Demerara Sugar', 'Muscovado Sugar', 'Golden Caster Sugar',
      'Coconut Sugar', 'Xylitol', 'Erythritol', 'Stevia',
      'Baking Powder', 'Bicarbonate of Soda', 'Cream of Tartar',
      'Dried Yeast', 'Fast-action Yeast', 'Fresh Yeast', 'Sourdough Starter',
      'Cocoa Powder', 'Dutch-processed Cocoa', 'Raw Cacao Powder',
      'Dark Chocolate', '70% Dark Chocolate', '85% Dark Chocolate',
      'Milk Chocolate', 'White Chocolate', 'Chocolate Chips',
      'Dark Chocolate Chips', 'Milk Chocolate Chips', 'White Chocolate Chips',
      'Desiccated Coconut', 'Toasted Coconut Flakes', 'Coconut Flakes',
      'Breadcrumbs', 'Panko Breadcrumbs', 'Dried Breadcrumbs',
      'Gelatine', 'Agar Agar', 'Pectin', 'Arrowroot',
      'Suet', 'Lard', 'Dripping',
      // Dried fruit
      'Raisins', 'Sultanas', 'Currants', 'Dried Cranberries',
      'Dried Apricots', 'Dried Mango', 'Dried Pineapple', 'Dried Blueberries',
      'Dried Cherries', 'Dried Figs', 'Prunes', 'Medjool Dates',
      'Dates', 'Dried Coconut', 'Crystallised Ginger',
      'Mixed Dried Fruit', 'Glace Cherries', 'Mixed Peel',
    ],
  },
  {
    category: 'Drinks', emoji: '🥤',
    items: [
      // Coffee
      'Coffee', 'Instant Coffee', 'Ground Coffee', 'Decaf Coffee',
      'Espresso Beans', 'Coffee Beans', 'Filter Coffee',
      'Nespresso Pods', 'Dolce Gusto Pods', 'Cold Brew Coffee',
      // Tea
      'Tea', 'English Breakfast Tea', 'Earl Grey', 'Darjeeling', 'Assam',
      'Green Tea', 'Matcha', 'White Tea', 'Oolong Tea',
      'Chamomile Tea', 'Peppermint Tea', 'Ginger Tea',
      'Lemon and Ginger Tea', 'Fennel Tea', 'Nettle Tea',
      'Rooibos', 'Redbush Tea', 'Echinacea Tea', 'Turmeric Tea',
      'Liquorice Tea', 'Rosehip Tea', 'Hibiscus Tea',
      'Herbal Tea', 'Fruit Tea',
      // Hot drinks
      'Hot Chocolate', 'Drinking Chocolate', 'Cocoa', 'Ovaltine', 'Horlicks',
      'Chai Latte Mix', 'Turmeric Latte Mix', 'Golden Milk Mix',
      'Barley Cup', 'Chicory Coffee',
      // Juice
      'Orange Juice', 'Apple Juice', 'Cloudy Apple Juice',
      'Pineapple Juice', 'Cranberry Juice', 'Mango Juice',
      'Grapefruit Juice', 'Tomato Juice', 'Pomegranate Juice',
      'Grape Juice', 'Carrot Juice', 'Beetroot Juice',
      'Cherry Juice', 'Elderflower Cordial',
      // Squash & cordial
      'Orange Squash', 'Blackcurrant Squash', 'Apple & Blackcurrant Squash',
      'Summer Fruits Squash', 'Elderflower Cordial', 'Lime Cordial',
      'Ribena', 'Robinsons Squash',
      // Water & soft drinks
      'Sparkling Water', 'Still Water', 'Coconut Water',
      'Cola', 'Diet Cola', 'Lemonade', 'Ginger Beer', 'Ginger Ale',
      'Tonic Water', 'Slim-line Tonic', 'Soda Water',
      'Energy Drink', 'Sports Drink', 'Kombucha', 'Kefir Water',
      // Alcohol
      'Red Wine', 'White Wine', 'Rosé Wine', 'Sparkling Wine',
      'Prosecco', 'Champagne', 'Cava',
      'Beer', 'Lager', 'Ale', 'Stout', 'Porter',
      'Cider', 'Dry Cider', 'Rum', 'White Rum', 'Dark Rum',
      'Vodka', 'Gin', 'Whisky', 'Bourbon', 'Tequila', 'Brandy', 'Cognac',
      'Baileys', 'Kahlua', 'Amaretto', 'Cointreau',
      // Dairy drinks
      'Milkshake', 'Chocolate Milkshake', 'Strawberry Milkshake',
      'Protein Shake', 'Meal Replacement Shake',
    ],
  },
  {
    category: 'Snacks & Treats', emoji: '🍪',
    items: [
      // Crisps & savoury snacks
      'Crisps', 'Ready Salted Crisps', 'Salt & Vinegar Crisps',
      'Cheese & Onion Crisps', 'Prawn Cocktail Crisps',
      'Lightly Salted Crisps', 'Kettle Chips', 'Pringles',
      'Tortilla Chips', 'Doritos', 'Popcorn', 'Salted Popcorn',
      'Sweet Popcorn', 'Butter Popcorn',
      'Pretzels', 'Crackers', 'Rice Cakes', 'Corn Cakes',
      'Oatcakes', 'Cheese Crackers', 'Ritz Crackers', 'Water Biscuits',
      'Breadsticks', 'Grissini', 'Pork Scratchings', 'Salted Nuts',
      // Sweet biscuits
      'Digestive Biscuits', 'Chocolate Digestives',
      'Hobnobs', 'Chocolate Hobnobs', 'Rich Tea Biscuits',
      'Shortbread', 'Shortbread Fingers', 'Custard Creams',
      'Bourbon Biscuits', 'Oreos', 'Jammie Dodgers',
      'Ginger Nuts', 'Garibaldi', 'Party Rings', 'Nice Biscuits',
      // Cereal & energy bars
      'Cereal Bar', 'Nutrigrain Bar', 'Fibre One Bar',
      'Granola Bar', 'Flapjack', 'Oat Bar',
      'Protein Bar', 'Kind Bar', 'Nakd Bar', 'Trek Bar',
      'Müller Corner', 'Rice Krispie Squares',
      // Chocolate & sweets
      'Milk Chocolate Bar', 'Dark Chocolate Bar', 'White Chocolate Bar',
      'Kit Kat', 'Twix', 'Snickers', 'Bounty', 'Mars Bar',
      'Wispa', 'Cadbury Dairy Milk', 'Green & Black\'s',
      'Lindt Bar', 'Toblerone', 'Galaxy',
      'Haribo', 'Jelly Beans', 'Wine Gums', 'Jelly Babies',
      'Fruit Pastilles', 'Starburst', 'Skittles',
      // Cakes & pastries
      'Muffin', 'Chocolate Muffin', 'Blueberry Muffin',
      'Croissant', 'Pain au Chocolat',
      'Cake', 'Brownie', 'Chocolate Brownie',
      'Scone', 'Fruit Scone', 'Cheese Scone',
    ],
  },
  {
    category: 'Frozen', emoji: '🧊',
    items: [
      'Frozen Peas', 'Frozen Sweetcorn', 'Frozen Spinach', 'Frozen Edamame',
      'Frozen Broccoli', 'Frozen Cauliflower', 'Frozen Mixed Vegetables',
      'Frozen Roasting Vegetables', 'Frozen Stir-fry Vegetables',
      'Frozen Chips', 'Frozen Sweet Potato Fries', 'Frozen Hash Browns',
      'Frozen Berries', 'Frozen Mixed Berries', 'Frozen Mango',
      'Frozen Raspberries', 'Frozen Strawberries', 'Frozen Blueberries',
      'Frozen Banana', 'Frozen Pineapple Chunks',
      'Frozen Chicken Breasts', 'Frozen Chicken Thighs',
      'Frozen Fish Fillets', 'Frozen Salmon Fillets', 'Frozen Cod Fillets',
      'Frozen Prawns', 'Frozen King Prawns', 'Frozen Scallops',
      'Frozen Pizza', 'Frozen Ready Meal',
      'Ice Cream', 'Vanilla Ice Cream', 'Chocolate Ice Cream',
      'Frozen Yoghurt', 'Sorbet', 'Gelato',
    ],
  },
]

/** Flat list of all common foods with their category attached */
export const COMMON_FOODS_WITH_CATEGORY: CommonFoodEntry[] = FOOD_BANK.flatMap(
  ({ category, items }) => items.map(name => ({ name, category }))
)

/** Flat list of just names (for backward compatibility) */
export const COMMON_FOODS: string[] = COMMON_FOODS_WITH_CATEGORY.map(f => f.name)

/**
 * Search common foods by query. Returns entries sorted by match quality.
 * Prefix matches come before mid-word matches.
 */
export function searchCommonFoods(query: string, limit = 8): CommonFoodEntry[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return COMMON_FOODS_WITH_CATEGORY
    .filter(f => f.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const ai = a.name.toLowerCase().indexOf(q)
      const bi = b.name.toLowerCase().indexOf(q)
      if (ai !== bi) return ai - bi
      return a.name.localeCompare(b.name)
    })
    .slice(0, limit)
}

/** Get the emoji for a given category */
export function categoryEmoji(category: string): string {
  const found = FOOD_BANK.find(b => b.category === category)
  if (found) return found.emoji
  if (category === 'Branded Products') return '🏷️'
  return '🍽️'
}
