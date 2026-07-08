// Akhals Spice & More — seed recipe content.
// This is the canonical source of truth. The Prisma seed inserts these,
// and the read layer falls back to this data when no database is reachable.

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
    slug: "durban-chicken-curry",
    title: "Durban Chicken Curry",
    description:
      "The Sunday-lunch icon of KwaZulu-Natal — chicken on the bone simmered in a fiery, tomato-rich masala until the gravy clings to every piece. Serve with rice, roti or a hollowed loaf for bunny chow.",
    spiceSlug: "chicken-curry-masala",
    difficulty: "MEDIUM",
    prepMinutes: 20,
    cookMinutes: 45,
    servings: 4,
    heroImage: img("durban-chicken-curry"),
    ingredients: [
      {
        items: [
          "1.2 kg chicken pieces, on the bone",
          "3 tbsp oil or ghee",
          "2 large onions, finely chopped",
          "1 tbsp Akhals Fine Ginger Garlic Masala",
          "3 tbsp Akhals Chicken Curry Masala",
          "1 tsp turmeric",
          "3 ripe tomatoes, grated",
          "2 medium potatoes, quartered",
          "1 sprig curry leaves",
          "2 cardamom pods, 1 cinnamon stick, 2 cloves",
          "Salt to taste",
          "Fresh coriander to finish",
        ],
      },
    ],
    instructions: [
      { title: "Bloom the whole spices", body: "Heat the oil over medium heat and fry the cinnamon, cardamom, cloves and curry leaves for 30 seconds until fragrant." },
      { title: "Soften the onions", body: "Add the onions and cook slowly for 8–10 minutes until deep golden — this is the backbone of the gravy." },
      { title: "Build the masala", body: "Stir in the ginger garlic masala, then the Chicken Curry Masala and turmeric. Fry for 1 minute, adding a splash of water so the spices don't catch." },
      { title: "Add tomato", body: "Pour in the grated tomato and cook down for 5–6 minutes until the oil rises to the surface." },
      { title: "Simmer the chicken", body: "Add the chicken and salt, coat well, cover and cook 15 minutes. Add potatoes and a cup of water; simmer 20 minutes until tender." },
      { title: "Finish", body: "Rest off the heat 5 minutes, then scatter with fresh coriander. Serve with rice or roti." },
    ],
    tips: [
      "For bunny chow, hollow out a quarter loaf and spoon the curry inside.",
      "Let the curry rest — the gravy thickens and the flavour deepens as it stands.",
    ],
    tags: ["chicken", "curry", "dinner", "south-african"],
    spiceProducts: ["Chicken Curry Masala", "Fine Ginger Garlic Masala"],
    featured: true,
    views: 4120,
    publishedAt: "2026-06-02T09:00:00.000Z",
  },
  {
    slug: "lamb-biryani",
    title: "Cape Lamb Biryani",
    description:
      "A celebration in a pot — spiced lamb, fragrant saffron rice and crisp fried onions layered and steamed together. Worth every minute for a festive table.",
    spiceSlug: "wet-biryani-masala",
    difficulty: "HARD",
    prepMinutes: 40,
    cookMinutes: 75,
    servings: 6,
    heroImage: img("lamb-biryani"),
    ingredients: [
      { group: "Lamb", items: ["1 kg lamb, cubed", "3 tbsp Akhals Wet Biryani Masala", "1 cup yoghurt", "1 tbsp Akhals Fine Ginger Garlic Masala", "1 tsp turmeric", "2 tomatoes, grated", "3 onions, sliced & fried", "Salt"] },
      { group: "Rice", items: ["3 cups basmati rice", "Pinch of saffron in warm milk", "4 cardamom pods, 1 cinnamon stick", "1 cup cooked lentils (optional)"] },
    ],
    instructions: [
      { title: "Marinate", body: "Combine lamb with yoghurt, biryani masala, ginger garlic, turmeric and salt. Rest at least 2 hours (overnight is best)." },
      { title: "Fry the onions", body: "Slowly fry the sliced onions until deep brown and crisp. Set half aside for layering." },
      { title: "Cook the lamb", body: "Braise the marinated lamb with grated tomato and half the onions until almost tender, about 40 minutes." },
      { title: "Par-boil rice", body: "Boil the basmati with whole spices until 70% cooked, then drain." },
      { title: "Layer", body: "Layer lamb, rice, saffron milk and fried onions in a heavy pot. Repeat, finishing with rice." },
      { title: "Steam (dum)", body: "Cover tightly, steam on the lowest heat for 25–30 minutes. Fold gently before serving." },
    ],
    tips: ["A tight lid — sealed with foil or dough — traps the steam that makes biryani.", "Don't over-stir; fold from the bottom to keep grains intact."],
    tags: ["lamb", "rice", "festive", "biryani"],
    spiceProducts: ["Wet Biryani Masala", "Fine Ginger Garlic Masala"],
    featured: true,
    views: 3860,
    publishedAt: "2026-06-05T09:00:00.000Z",
  },
  {
    slug: "chicken-tikka-skewers",
    title: "Charred Chicken Tikka Skewers",
    description:
      "Yoghurt-marinated chicken with a deep tandoori crust and blistered edges. A grill or hot oven does the work; the spice does the talking.",
    spiceSlug: "chicken-tikka-spice",
    difficulty: "EASY",
    prepMinutes: 25,
    cookMinutes: 18,
    servings: 4,
    heroImage: img("chicken-tikka"),
    ingredients: [
      { items: ["800 g chicken breast or thigh, cubed", "3 tbsp Akhals Chicken Tikka Spice", "1 cup thick yoghurt", "1 tbsp Akhals Fine Ginger Garlic Masala", "2 tbsp lemon juice", "2 tbsp oil", "Salt", "Red onion & lemon to serve"] },
    ],
    instructions: [
      { title: "Make the marinade", body: "Whisk yoghurt, tikka spice, ginger garlic, lemon, oil and salt until smooth." },
      { title: "Marinate", body: "Fold in the chicken and coat well. Rest at least 30 minutes, ideally 2–3 hours." },
      { title: "Skewer", body: "Thread onto skewers, leaving a little space between pieces for the heat to catch." },
      { title: "Grill", body: "Cook over hot coals or under a hot grill 8–9 minutes a side until charred and cooked through." },
      { title: "Rest & serve", body: "Rest 3 minutes. Serve with sliced red onion, lemon and mint chutney." },
    ],
    tips: ["Soak wooden skewers first so they don't burn.", "A squeeze of lemon at the table lifts the whole plate."],
    tags: ["chicken", "grill", "starter", "tandoori"],
    spiceProducts: ["Chicken Tikka Spice", "Fine Ginger Garlic Masala"],
    featured: true,
    views: 5210,
    publishedAt: "2026-06-10T09:00:00.000Z",
  },
  {
    slug: "cape-malay-pickled-fish",
    title: "Cape Malay Pickled Fish",
    description:
      "The Easter tradition of the Cape — firm fish under a golden, sweet-sour turmeric-and-onion sauce. Made a day ahead so the flavours settle in.",
    spiceSlug: "pickled-fish-masala",
    difficulty: "MEDIUM",
    prepMinutes: 30,
    cookMinutes: 30,
    servings: 6,
    heroImage: img("cape-malay-pickled-fish"),
    ingredients: [
      { items: ["1 kg firm white fish (hake or kingklip)", "4 large onions, sliced into rings", "3 tbsp Akhals Pickled Fish Masala", "1 tsp turmeric", "1 cup brown vinegar", "3 tbsp sugar or apricot jam", "6 bay leaves, 6 allspice berries", "Oil for frying", "Salt & flour for dusting"] },
    ],
    instructions: [
      { title: "Fry the fish", body: "Season and lightly flour the fish, then fry until golden. Drain and layer in a deep dish." },
      { title: "Cook the onions", body: "Soften the onion rings in oil until just tender, not browned." },
      { title: "Make the sauce", body: "Add pickled fish masala, turmeric, bay and allspice; fry 1 minute. Add vinegar, sugar and a splash of water; simmer 8 minutes." },
      { title: "Pickle", body: "Pour the hot sauce over the fish, making sure it's covered. Cool, then refrigerate." },
      { title: "Wait", body: "Rest at least 24 hours before serving — this is non-negotiable for the flavour." },
    ],
    tips: ["Serve cold or at room temperature with fresh bread and butter.", "It keeps beautifully for up to a week in the fridge."],
    tags: ["fish", "make-ahead", "cape-malay", "easter"],
    spiceProducts: ["Pickled Fish Masala"],
    featured: false,
    views: 2740,
    publishedAt: "2026-06-12T09:00:00.000Z",
  },
  {
    slug: "braai-tbone-steak",
    title: "Braai T-Bone with Braai Spice",
    description:
      "Nothing fancy — a thick T-bone, a generous crust of braai spice, and patient coals. The South African weekend on a plate.",
    spiceSlug: "braai-spice",
    difficulty: "EASY",
    prepMinutes: 10,
    cookMinutes: 15,
    servings: 2,
    heroImage: img("braai-tbone-steak"),
    ingredients: [
      { items: ["2 thick T-bone steaks (400 g each)", "3 tbsp Akhals Braai Spice", "1 tbsp oil", "Rosemary sprigs", "Flaky salt & butter to finish"] },
    ],
    instructions: [
      { title: "Temper", body: "Take the steaks out of the fridge 30 minutes before cooking so they cook evenly." },
      { title: "Season", body: "Rub with oil and a generous coat of braai spice. Press it in and let it sit 10 minutes." },
      { title: "Sear", body: "Cook over hot coals 4–5 minutes a side for medium-rare, turning once." },
      { title: "Rest", body: "Rest under foil with a knob of butter and rosemary for 5 minutes." },
      { title: "Serve", body: "Finish with flaky salt. Serve with pap, chakalaka or a fresh salad." },
    ],
    tips: ["Hot coals with a light grey ash are ready — flames will burn the spice.", "Resting is what keeps the steak juicy; don't skip it."],
    tags: ["beef", "braai", "grill", "quick"],
    spiceProducts: ["Braai Spice", "Steak & Chops Spice"],
    featured: false,
    views: 3990,
    publishedAt: "2026-06-15T09:00:00.000Z",
  },
  {
    slug: "coconut-prawn-curry",
    title: "Coconut Prawn Curry",
    description:
      "Plump prawns in a glossy coconut-tomato masala with curry leaves and green chilli. Fast enough for a weeknight, rich enough for guests.",
    spiceSlug: "prawn-masala",
    difficulty: "EASY",
    prepMinutes: 15,
    cookMinutes: 20,
    servings: 4,
    heroImage: img("coconut-prawn-curry"),
    ingredients: [
      { items: ["600 g prawns, cleaned & deveined", "3 tbsp Akhals Prawn Masala", "1 onion, finely chopped", "1 tbsp Akhals Fine Ginger Garlic Masala", "1 sprig curry leaves", "2 tomatoes, grated", "400 ml coconut milk", "2 green chillies, slit", "Fresh coriander, salt"] },
    ],
    instructions: [
      { title: "Start the base", body: "Fry the onion and curry leaves until soft, then add ginger garlic masala." },
      { title: "Spice it", body: "Stir in the prawn masala and grated tomato; cook until the oil separates, about 5 minutes." },
      { title: "Simmer", body: "Pour in the coconut milk and green chilli; simmer gently 5 minutes to thicken." },
      { title: "Add prawns", body: "Add the prawns and cook just 3–4 minutes until pink and curled — no more, or they toughen." },
      { title: "Finish", body: "Season, scatter with coriander and serve with rice or roti." },
    ],
    tips: ["Prawns cook in minutes — add them last.", "A squeeze of lime at the end brightens the coconut richness."],
    tags: ["seafood", "prawns", "curry", "quick"],
    spiceProducts: ["Prawn Masala", "Seafood Masala"],
    featured: true,
    views: 3120,
    publishedAt: "2026-06-18T09:00:00.000Z",
  },
  {
    slug: "butter-chicken",
    title: "All-in-One Butter Chicken",
    description:
      "Silky, mildly spiced and family-friendly — charred chicken folded into a tomato-fenugreek gravy finished with cream. Our All-in-One Masala does the heavy lifting.",
    spiceSlug: "all-in-one-masala",
    difficulty: "MEDIUM",
    prepMinutes: 20,
    cookMinutes: 35,
    servings: 4,
    heroImage: img("butter-chicken"),
    ingredients: [
      { items: ["800 g chicken thigh, cubed", "3 tbsp Akhals All-in-One Masala", "1 cup yoghurt", "1 tbsp Akhals Fine Ginger Garlic Masala", "400 g tomato passata", "50 g butter", "150 ml cream", "1 tsp dried fenugreek (methi)", "1 tsp sugar, salt"] },
    ],
    instructions: [
      { title: "Marinate", body: "Coat chicken in yoghurt, half the All-in-One Masala and ginger garlic. Rest 30 minutes." },
      { title: "Char the chicken", body: "Sear in a hot pan until browned on the edges; set aside (it finishes in the sauce)." },
      { title: "Make the gravy", body: "Melt butter, add remaining masala, then passata and sugar. Simmer 10 minutes until deepened." },
      { title: "Bring together", body: "Return the chicken, cover and simmer 12–15 minutes until cooked through." },
      { title: "Finish", body: "Stir in cream and crushed fenugreek. Warm through and serve with naan or rice." },
    ],
    tips: ["Crush the dried fenugreek between your palms to release its aroma.", "For a smoky note, rest a lit coal in a bowl on top for 2 minutes, covered."],
    tags: ["chicken", "curry", "mild", "family"],
    spiceProducts: ["All-in-One Masala", "Fine Ginger Garlic Masala"],
    featured: false,
    views: 4460,
    publishedAt: "2026-06-20T09:00:00.000Z",
  },
  {
    slug: "lamb-potjiekos",
    title: "Lamb Potjiekos",
    description:
      "The slow art of the potjie — lamb, vegetables and Potjiekos Spice built in layers and left to their own devices over low coals. You don't stir a potjie; you trust it.",
    spiceSlug: "potjiekos-spice",
    difficulty: "MEDIUM",
    prepMinutes: 25,
    cookMinutes: 150,
    servings: 6,
    heroImage: img("lamb-potjiekos"),
    ingredients: [
      { items: ["1.2 kg lamb knuckle & shin", "3 tbsp Akhals Potjiekos Spice", "2 onions, chopped", "4 carrots, 3 potatoes, chunked", "1 cup baby marrow & green beans", "2 cups stock", "1 cup red wine (optional)", "Oil, salt"] },
    ],
    instructions: [
      { title: "Brown the meat", body: "In a cast-iron potjie over coals, brown the lamb well in oil, then remove." },
      { title: "Sweat onions", body: "Soften the onions in the pot, stir in the Potjiekos Spice for 1 minute." },
      { title: "Layer", body: "Return the meat. Add stock and wine, cover and simmer gently 60 minutes." },
      { title: "Add vegetables", body: "Layer the vegetables on top by cooking time — hardest at the bottom. Do not stir." },
      { title: "Slow cook", body: "Cover and cook 60–90 minutes over low coals until everything is tender." },
      { title: "Serve", body: "Fold through once, just before serving, with rice or bread." },
    ],
    tips: ["Keep the coals low and steady — a potjie should whisper, not boil.", "Layering by cooking time is the whole trick; resist stirring."],
    tags: ["lamb", "slow-cook", "potjie", "braai"],
    spiceProducts: ["Potjiekos Spice"],
    featured: false,
    views: 2210,
    publishedAt: "2026-06-22T09:00:00.000Z",
  },
  {
    slug: "tandoori-roast-chicken",
    title: "Tandoori Roast Chicken",
    description:
      "A whole chicken lacquered in crimson tandoori marinade and roasted until the skin crackles. High-drama, low-effort.",
    spiceSlug: "tandoori-special",
    difficulty: "EASY",
    prepMinutes: 20,
    cookMinutes: 70,
    servings: 4,
    heroImage: img("tandoori-roast-chicken"),
    ingredients: [
      { items: ["1 whole chicken (1.5 kg), slashed", "4 tbsp Akhals Tandoori Special", "1 cup yoghurt", "1 tbsp Akhals Fine Ginger Garlic Masala", "2 tbsp lemon juice", "2 tbsp oil", "Salt", "Lemon & onion to serve"] },
    ],
    instructions: [
      { title: "Slash & marinate", body: "Cut deep slashes in the chicken. Rub with the yoghurt-tandoori marinade, working it into the cuts." },
      { title: "Rest", body: "Marinate at least 3 hours, ideally overnight, for colour and depth." },
      { title: "Roast", body: "Roast at 200°C for 60–70 minutes, basting once, until the juices run clear." },
      { title: "Crisp", body: "Blast under the grill for 3–4 minutes for charred edges." },
      { title: "Rest & serve", body: "Rest 10 minutes. Serve with lemon, onion rings and flatbread." },
    ],
    tips: ["Deep slashes let the marinade and heat reach the bone.", "A wire rack over the tray keeps the underside from steaming."],
    tags: ["chicken", "roast", "tandoori", "sunday"],
    spiceProducts: ["Tandoori Special", "Fine Ginger Garlic Masala"],
    featured: false,
    views: 2980,
    publishedAt: "2026-06-24T09:00:00.000Z",
  },
  {
    slug: "pepper-steak-potjie-pie",
    title: "Pepper Steak & Mushroom",
    description:
      "Seared beef strips in a peppery, glossy gravy with mushrooms and onions. Cracked-pepper punch from our Pepper Steak Spice, ready in half an hour.",
    spiceSlug: "pepper-steak-spice",
    difficulty: "EASY",
    prepMinutes: 15,
    cookMinutes: 20,
    servings: 4,
    heroImage: img("chicken-tikka"),
    ingredients: [
      { items: ["600 g rump or sirloin, sliced", "3 tbsp Akhals Pepper Steak Spice", "250 g mushrooms, sliced", "1 onion, sliced", "1 tbsp Worcestershire sauce", "1 cup beef stock", "2 tbsp cream", "Oil, salt"] },
    ],
    instructions: [
      { title: "Sear the beef", body: "Toss the beef with half the Pepper Steak Spice and sear hard in batches. Set aside." },
      { title: "Cook the veg", body: "Soften onions and mushrooms in the same pan until golden." },
      { title: "Build the gravy", body: "Add remaining spice, Worcestershire and stock; simmer 5 minutes to reduce." },
      { title: "Finish", body: "Return the beef, stir in cream, warm through 2 minutes." },
      { title: "Serve", body: "Spoon over rice, mash or into a roll." },
    ],
    tips: ["Sear in batches so the beef browns instead of stewing.", "Slice the beef against the grain for tenderness."],
    tags: ["beef", "quick", "weeknight"],
    spiceProducts: ["Pepper Steak Spice", "Steak & Chops Spice"],
    featured: false,
    views: 1980,
    publishedAt: "2026-06-26T09:00:00.000Z",
  },
  {
    slug: "kashmiri-lamb-curry",
    title: "Kashmiri Lamb Curry",
    description:
      "Deep ruby colour, warming aromatics and a gentle heat — a slow-simmered lamb curry that leans on fragrance rather than fire.",
    spiceSlug: "kashmiri-masala",
    difficulty: "MEDIUM",
    prepMinutes: 20,
    cookMinutes: 90,
    servings: 4,
    heroImage: img("durban-chicken-curry"),
    ingredients: [
      { items: ["900 g lamb, cubed", "3 tbsp Akhals Kashmiri Masala", "1 tbsp Akhals Fine Ginger Garlic Masala", "2 onions, finely chopped", "1 cup yoghurt", "4 cardamom, 1 cinnamon, 3 cloves", "2 tomatoes, grated", "Oil, salt, coriander"] },
    ],
    instructions: [
      { title: "Whole spices", body: "Fry the cardamom, cinnamon and cloves in oil until fragrant." },
      { title: "Onion base", body: "Add onions and cook to deep gold, then stir in ginger garlic masala." },
      { title: "Spice & tomato", body: "Add Kashmiri Masala and grated tomato; cook until the oil rises." },
      { title: "Yoghurt", body: "Lower the heat and whisk in the yoghurt slowly so it doesn't split." },
      { title: "Slow simmer", body: "Add the lamb and a little water; cover and simmer 75–90 minutes until spoon-tender." },
      { title: "Finish", body: "Rest, garnish with coriander, serve with basmati or naan." },
    ],
    tips: ["Whisk yoghurt in off the boil to keep the gravy smooth.", "Low and slow is what makes the lamb melt."],
    tags: ["lamb", "curry", "mild", "aromatic"],
    spiceProducts: ["Kashmiri Masala", "Mutton Masala", "Fine Ginger Garlic Masala"],
    featured: false,
    views: 2560,
    publishedAt: "2026-06-28T09:00:00.000Z",
  },
  {
    slug: "crispy-fried-fish",
    title: "Golden Fried Fish",
    description:
      "A crisp, spiced coating on flaky white fish — the quick coastal supper. Fried Fish Masala gives colour, crunch and just enough kick.",
    spiceSlug: "fried-fish-masala",
    difficulty: "EASY",
    prepMinutes: 15,
    cookMinutes: 12,
    servings: 4,
    heroImage: img("cape-malay-pickled-fish"),
    ingredients: [
      { items: ["800 g hake fillets", "3 tbsp Akhals Fried Fish Masala", "1 cup flour or semolina", "1 tsp turmeric", "1 lemon", "Oil for shallow frying", "Salt"] },
    ],
    instructions: [
      { title: "Season the fish", body: "Pat the fillets dry, rub with lemon, salt and half the Fried Fish Masala. Rest 10 minutes." },
      { title: "Make the coating", body: "Mix flour, turmeric and the remaining masala on a plate." },
      { title: "Coat", body: "Dredge each fillet, pressing the coating on firmly." },
      { title: "Fry", body: "Shallow-fry in hot oil 3 minutes a side until deep golden and crisp." },
      { title: "Drain & serve", body: "Drain on paper, serve with lemon wedges and a fresh salad." },
    ],
    tips: ["Dry fish fries crisper — pat it well before coating.", "Semolina in the coating adds extra crunch."],
    tags: ["fish", "fried", "quick", "coastal"],
    spiceProducts: ["Fried Fish Masala", "Fish Masala"],
    featured: false,
    views: 2330,
    publishedAt: "2026-06-30T09:00:00.000Z",
  },
];

export const recipeBySlug = (slug: string) => RECIPES.find((r) => r.slug === slug);
export const recipesBySpice = (spiceSlug: string) => RECIPES.filter((r) => r.spiceSlug === spiceSlug);
