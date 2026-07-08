// Akhals Spice & More — seed recipe content.
// Source: the Akhals family recipe notebook (transcribed July 2026).
// Quantities and methods are faithful to the handwritten originals;
// descriptions, times and servings were added editorially.
// The Prisma seed inserts these, and the read layer falls back to this
// data when no database is reachable.

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface IngredientGroup {
  group?: string;
  items: string[];
}

export interface InstructionStep {
  title: string;
  body: string;
}

export interface Recipe {
  slug: string;
  title: string;
  description: string;
  spiceSlug: string;
  difficulty: Difficulty;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  heroImage: string;
  ingredients: IngredientGroup[];
  instructions: InstructionStep[];
  tips: string[];
  tags: string[];
  spiceProducts: string[];
  featured: boolean;
  views: number;
  publishedAt: string; // ISO
}

const img = (name: string) => `/img/recipes/${name}.png`;

export const RECIPES: Recipe[] = [
  {
    slug: "akhals-chicken-curry",
    title: "Akhals Chicken Curry",
    description:
      "The house chicken curry — chicken pieces simmered in browned onion, tomato and Special Mix Masala until the oil rises and the gravy hugs every piece. Weeknight simple, Sunday good.",
    spiceSlug: "special-mix-masala",
    difficulty: "EASY",
    prepMinutes: 15,
    cookMinutes: 45,
    servings: 4,
    heroImage: img("durban-chicken-curry"),
    ingredients: [
      {
        items: [
          "1 kg chicken pieces",
          "2 tblsp Akhals Special Mix Masala",
          "2 onions, chopped fine or grated",
          "3 tomatoes, grated or liquidised",
          "3 tblsp ginger & garlic paste",
          "2 tblsp ghee",
          "¼ cup oil",
          "Salt to taste",
        ],
      },
    ],
    instructions: [
      { title: "Brown the onions", body: "Heat the oil and ghee together and brown the onions until deep golden." },
      { title: "Ginger & garlic", body: "Add the ginger & garlic paste and cook for a minute until fragrant." },
      { title: "Add the chicken", body: "Add the chicken pieces with a cup of water and cook until the oil comes to the surface." },
      { title: "Tomatoes & masala", body: "Add the grated tomatoes, the Akhals Special Mix Masala and salt. Cook until the chicken is tender and the gravy has thickened." },
      { title: "Finish", body: "Stir through chopped coriander and serve with rice, roti or pap." },
    ],
    tips: ["Grating the onions instead of chopping gives a smoother, richer gravy."],
    tags: ["chicken", "curry", "weeknight", "family"],
    spiceProducts: ["Special Mix Masala"],
    featured: true,
    views: 0,
    publishedAt: "2026-07-09T09:00:00.000Z",
  },
  {
    slug: "akhals-veg-curry",
    title: "Akhals Veg Curry",
    description:
      "Whatever the garden or the fridge offers — potatoes, beans, carrots, marrows — folded into a Special Mix Masala gravy. Meat-free as written, happy to take chicken or lamb.",
    spiceSlug: "special-mix-masala",
    difficulty: "EASY",
    prepMinutes: 15,
    cookMinutes: 30,
    servings: 4,
    heroImage: img("veg-curry"),
    ingredients: [
      {
        items: [
          "500 g vegetables of your choice, cut into pieces",
          "1 large onion, chopped fine or grated",
          "2 tomatoes, chopped into pieces",
          "2 tblsp ginger & garlic paste",
          "2 tblsp Akhals Special Mix Masala",
          "2 tblsp ghee",
          "¼ cup oil",
          "Salt to taste",
        ],
      },
    ],
    instructions: [
      { title: "Brown the onion", body: "Heat the oil and ghee and brown the onion until golden." },
      { title: "Ginger & garlic", body: "Add the ginger & garlic paste and cook for a minute." },
      { title: "Build the gravy", body: "Add the chopped tomatoes, the Special Mix Masala and salt; cook until the oil surfaces." },
      { title: "Add the vegetables", body: "Add the vegetables with a splash of water, cover, and simmer until tender." },
      { title: "Serve", body: "Finish with coriander and serve with rice or rotis." },
    ],
    tips: ["Optional — chicken or lamb can be added with the veg; brown it before the vegetables go in."],
    tags: ["vegetarian", "curry", "weeknight"],
    spiceProducts: ["Special Mix Masala"],
    featured: false,
    views: 0,
    publishedAt: "2026-07-09T09:00:00.000Z",
  },
  {
    slug: "fiery-chicken-lamb-curry",
    title: "Fiery Chicken & Lamb Curry",
    description:
      "The notebook says it plainly: Warning — seriously HOT!! Mother-in-Law Masala, whole spices and potatoes in a gravy that means business. Rice, roti or pap on the side, and something cold to drink.",
    spiceSlug: "mother-in-law-masala",
    difficulty: "MEDIUM",
    prepMinutes: 20,
    cookMinutes: 60,
    servings: 4,
    heroImage: img("fiery-mutton-curry"),
    ingredients: [
      {
        items: [
          "1 kg chicken or mutton",
          "2 large onions, chopped fine or grated",
          "3 tomatoes, grated or liquidised",
          "3 tblsp ginger & garlic paste",
          "2 tblsp Akhals Mother-in-Law Masala",
          "4 potatoes, cut into quarters",
          "3 tblsp ghee",
          "¼ cup oil",
          "Salt to taste",
        ],
      },
      {
        group: "Akhals whole spices",
        items: ["3 cloves", "3 cardamom pods", "2 cinnamon sticks"],
      },
    ],
    instructions: [
      { title: "Brown onions with whole spices", body: "Brown the onions in the oil and ghee with the whole spices." },
      { title: "Ginger & garlic", body: "Add in the ginger garlic paste and cook for a minute." },
      { title: "Meat, potatoes, water", body: "Add in the chicken or lamb with the potatoes and 3 cups of water. Cook until the oil comes to the surface." },
      { title: "Tomatoes & salt", body: "Add in the tomatoes and salt. Cook until the potatoes are soft and the meat is tender." },
      { title: "Finish", body: "Add chopped coriander. Serve with rice, roti or pap." },
    ],
    tips: ["Warning — seriously HOT!! Halve the Mother-in-Law Masala for a gentler pot."],
    tags: ["hot", "chicken", "lamb", "curry"],
    spiceProducts: ["Mother-in-Law Masala"],
    featured: true,
    views: 0,
    publishedAt: "2026-07-09T09:00:00.000Z",
  },
  {
    slug: "fish-prawn-masala-curry",
    title: "Fish & Prawn Masala Curry",
    description:
      "Firm fish, plump prawns or both — braised whole spices, a deep tomato masala, whole red chillies and a squeeze of lemon. Five minutes on high heat and it's done.",
    spiceSlug: "fish-prawn-masala",
    difficulty: "MEDIUM",
    prepMinutes: 20,
    cookMinutes: 25,
    servings: 4,
    heroImage: img("fish-prawn-curry"),
    ingredients: [
      {
        items: [
          "1 kg firm fish cut into pieces, or large prawns (or both)",
          "2 onions, chopped fine",
          "3 tomatoes, grated",
          "3 tblsp ginger & garlic paste",
          "Juice of 1 lemon",
          "1 tblsp Akhals 5 Spice Whole",
          "2–3 whole red chillies",
          "¼ cup oil",
          "Salt to taste",
          "Tamarind paste (optional)",
        ],
      },
    ],
    instructions: [
      { title: "Braise the onions", body: "Braise the onions in the oil with the Akhals 5 Spice Whole until golden brown." },
      { title: "Build the masala", body: "Add in the ginger & garlic paste with the tomatoes and the Akhals Fish & Prawn Masala. Cook for 5 minutes." },
      { title: "Add the seafood", body: "Add in the fish or prawns (or both) with 1 cup of water. Add the salt and whole chillies." },
      { title: "High heat", body: "Cook for 5 minutes on high heat — no longer, or the seafood toughens." },
      { title: "Finish", body: "Add chopped coriander and curry leaves, the lemon juice, and tamarind if using. Serve with rice." },
    ],
    tips: ["Tamarind gives the gravy a gentle sour edge — the coastal way."],
    tags: ["seafood", "fish", "prawns", "curry"],
    spiceProducts: ["Fish & Prawn Masala", "5 Spice Whole", "Seafood Masala"],
    featured: true,
    views: 0,
    publishedAt: "2026-07-09T09:00:00.000Z",
  },
  {
    slug: "beans-lentil-curry",
    title: "Beans & Lentil Curry",
    description:
      "Sugar beans or lentils in a thick, slow-bodied gravy built on Braising Spice and Wet Masala. The notebook's own verdict: excellent for bunny chow or served with rotis.",
    spiceSlug: "braising-spice",
    difficulty: "EASY",
    prepMinutes: 10,
    cookMinutes: 40,
    servings: 4,
    heroImage: img("beans-lentil-curry"),
    ingredients: [
      {
        items: [
          "2 cups beans or lentils, boiled until soft",
          "100 g Akhals Braising Spice",
          "2 tomatoes, chopped",
          "1 whole green chilli (can add more)",
          "1 tblsp Akhals Wet Masala mix",
          "2 tsp ginger & garlic paste",
          "¼ cup oil",
          "2 tsp ghee",
          "Salt to taste",
        ],
      },
    ],
    instructions: [
      { title: "Fry the braising spice", body: "Fry the braising spice in the oil and ghee for a minute." },
      { title: "Ginger, garlic, wet masala", body: "Add in the ginger & garlic paste together with the Akhals Wet Masala mix. Fry until the aroma rises." },
      { title: "Tomatoes", body: "Add in the chopped tomatoes and cook until the oil surfaces." },
      { title: "Beans in", body: "Add in the green chilli, salt and the beans or lentils. Add 1 cup of water and cook until thick." },
      { title: "Finish", body: "Add chopped coriander leaves if desired. Excellent for bunny chow or serve with rotis." },
    ],
    tips: ["Boil the beans until properly soft before they meet the gravy — they won't soften much after."],
    tags: ["vegetarian", "beans", "lentils", "bunny-chow"],
    spiceProducts: ["Braising Spice", "Wet Masala"],
    featured: false,
    views: 0,
    publishedAt: "2026-07-09T09:00:00.000Z",
  },
  {
    slug: "akhals-fiery-mutton-curry",
    title: "Akhals Fiery Mutton Curry",
    description:
      "Lamb on the bone, braising spice, a full hand of whole spices and Durban Special — simmered until the meat gives. Made for bunny chows.",
    spiceSlug: "durban-special",
    difficulty: "MEDIUM",
    prepMinutes: 20,
    cookMinutes: 90,
    servings: 4,
    heroImage: img("fiery-mutton-curry"),
    ingredients: [
      {
        items: [
          "1 kg lamb, cut into pieces",
          "100 g Akhals Braising Spice",
          "2 tblsp Akhals Durban Special Masala",
          "2 tomatoes, grated",
          "3 tblsp ginger & garlic paste",
          "4 potatoes, cut in quarters",
          "¼ cup oil",
          "3 tblsp ghee",
          "Salt to taste",
        ],
      },
      {
        group: "Akhals whole spices",
        items: ["2 cardamom pods", "5 cloves", "1 tsp whole black peppercorns", "3 cinnamon sticks"],
      },
    ],
    instructions: [
      { title: "Fry the braising spice", body: "Fry the braising spice in the oil and ghee." },
      { title: "Whole spices & ginger garlic", body: "Add in the whole spices and the ginger garlic paste. Fry for a minute." },
      { title: "Lamb & potatoes", body: "Add in the lamb with the potatoes and 3 cups of water. Cook until the meat is soft." },
      { title: "Masala & tomatoes", body: "Add in the Durban Special Masala, the tomatoes and salt. Simmer until the gravy thickens." },
      { title: "Finish", body: "When done, add in chopped coriander leaves. Serve with rice or rotis — excellent for bunny chows." },
    ],
    tips: ["Want it even hotter? Swap the Durban Special for Mother-in-Law Masala — the notebook approves either way."],
    tags: ["lamb", "mutton", "hot", "curry", "bunny-chow"],
    spiceProducts: ["Durban Special", "Braising Spice", "5 Spice Whole"],
    featured: true,
    views: 0,
    publishedAt: "2026-07-09T09:00:00.000Z",
  },
  {
    slug: "braai-chops-spare-ribs",
    title: "Chops & Spare Ribs for the Braai",
    description:
      "A sticky, peppery marinade — BBQ Spice, Steak & Chops Spice, honey, vinegar and peri-peri — over lamb chops or spare ribs, finished over hot coals.",
    spiceSlug: "bbq-spice",
    difficulty: "EASY",
    prepMinutes: 15,
    cookMinutes: 30,
    servings: 6,
    heroImage: img("braai-chops-ribs"),
    ingredients: [
      {
        items: [
          "2 kg chops or ribs, washed",
          "3 tsp fresh crushed garlic",
          "½ cup Akhals BBQ Spice",
          "¼ cup Akhals Steak & Chops Spice",
          "½ cup honey or sweet chilli sauce",
          "¼ cup oil",
          "¼ cup brown vinegar",
          "½ cup Steers peri-peri sauce or similar",
        ],
      },
    ],
    instructions: [
      { title: "Mix the marinade", body: "Mix all the ingredients together into a loose, sticky marinade." },
      { title: "Coat the meat", body: "Add in the chops or ribs and turn until every piece is coated. Let them sit while the fire burns down." },
      { title: "Braai", body: "Braai over hot coals — or grill in the oven — turning until charred at the edges and cooked through." },
    ],
    tips: ["Coals ready = glowing with light grey ash. Flames burn the honey before the meat cooks."],
    tags: ["braai", "ribs", "chops", "marinade"],
    spiceProducts: ["BBQ Spice", "Steak & Chops Spice"],
    featured: false,
    views: 0,
    publishedAt: "2026-07-09T09:00:00.000Z",
  },
  {
    slug: "chicken-tikka-masala",
    title: "Chicken Tikka Masala",
    description:
      "One chicken, one masala, one hot oven. Marinated in Akhals Chicken Tikka Masala with lemon — grilled until properly charred. Chips, salad and hot naan alongside.",
    spiceSlug: "chicken-tikka-spice",
    difficulty: "EASY",
    prepMinutes: 15,
    cookMinutes: 40,
    servings: 4,
    heroImage: img("chicken-tikka"),
    ingredients: [
      {
        items: [
          "1 chicken, cut into pieces",
          "2 tblsp Akhals Chicken Tikka Masala",
          "Juice of 1 lemon",
          "½ cup oil",
          "Optional: ½ cup Greek yoghurt",
        ],
      },
    ],
    instructions: [
      { title: "Marinate", body: "Marinate the chicken in the tikka masala, lemon juice, oil — and the yoghurt if using. Longer is better; overnight is best." },
      { title: "Grill", body: "Lay into a flat pan and grill in the oven until charred at the edges and cooked through." },
      { title: "Serve", body: "Serve with chips, baked potatoes, salad and hot naan bread." },
    ],
    tips: ["The yoghurt is optional in the notebook — it tenderises and softens the heat."],
    tags: ["chicken", "tikka", "grill", "family"],
    spiceProducts: ["Chicken Tikka Spice"],
    featured: false,
    views: 0,
    publishedAt: "2026-07-09T09:00:00.000Z",
  },
];

export const recipeBySlug = (slug: string) => RECIPES.find((r) => r.slug === slug);
export const recipesBySpice = (spiceSlug: string) => RECIPES.filter((r) => r.spiceSlug === spiceSlug);
