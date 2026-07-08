// Akhals Spice & More — canonical spice catalogue.
// Order & grouping drive the recipe dashboard filters.

export type SpiceGroup = "Everyday" | "Seafood" | "Braai & Grill" | "Curry & Masala" | "Signature";

export interface Spice {
  slug: string;
  name: string;
  tagline: string;
  group: SpiceGroup;
  heatLevel: number; // 0 mild .. 5 fiery
  accent: string; // hex, used for card + filter theming
}

export const SPICES: Spice[] = [
  { slug: "all-in-one-masala", name: "All-in-One Masala", tagline: "The everyday workhorse blend", group: "Everyday", heatLevel: 2, accent: "#B8341F" },
  { slug: "chicken-tikka-spice", name: "Chicken Tikka Spice", tagline: "Charred tandoori warmth", group: "Curry & Masala", heatLevel: 2, accent: "#C4471C" },
  { slug: "special-mix-masala", name: "Special Mix Masala", tagline: "Balanced house blend", group: "Everyday", heatLevel: 2, accent: "#A8481E" },
  { slug: "mix-masala", name: "Mix Masala", tagline: "Classic all-round masala", group: "Everyday", heatLevel: 2, accent: "#9C3B18" },
  { slug: "mother-in-law-masala", name: "Mother-in-Law Masala", tagline: "Seriously, seriously hot", group: "Signature", heatLevel: 5, accent: "#8B1A0E" },
  { slug: "fish-masala", name: "Fish Masala", tagline: "Bright, coastal, aromatic", group: "Seafood", heatLevel: 2, accent: "#C98A2B" },
  { slug: "fried-fish-masala", name: "Fried Fish Masala", tagline: "Crisp golden coating spice", group: "Seafood", heatLevel: 2, accent: "#D89A2E" },
  { slug: "fish-prawn-masala", name: "Fish & Prawn Masala", tagline: "For the full seafood platter", group: "Seafood", heatLevel: 3, accent: "#C77A26" },
  { slug: "seafood-masala", name: "Seafood Masala", tagline: "Ocean-deep flavour", group: "Seafood", heatLevel: 3, accent: "#B86A22" },
  { slug: "prawn-masala", name: "Prawn Masala", tagline: "Rich, buttery, coastal heat", group: "Seafood", heatLevel: 3, accent: "#CC5A20" },
  { slug: "braai-spice", name: "Braai Spice", tagline: "South Africa on the coals", group: "Braai & Grill", heatLevel: 1, accent: "#7A3B1D" },
  { slug: "bbq-spice", name: "BBQ Spice", tagline: "Smoky-sweet rub", group: "Braai & Grill", heatLevel: 1, accent: "#8A4520" },
  { slug: "steak-chops-spice", name: "Steak & Chops Spice", tagline: "Big, bold, beefy", group: "Braai & Grill", heatLevel: 1, accent: "#6E3218" },
  { slug: "pepper-steak-spice", name: "Pepper Steak Spice", tagline: "Cracked-pepper punch", group: "Braai & Grill", heatLevel: 2, accent: "#5C4033" },
  { slug: "potjiekos-spice", name: "Potjiekos Spice", tagline: "Slow-cooked pot magic", group: "Braai & Grill", heatLevel: 1, accent: "#8B5A2B" },
  { slug: "chicken-curry-masala", name: "Chicken Curry Masala", tagline: "The Durban Sunday classic", group: "Curry & Masala", heatLevel: 3, accent: "#A82D14" },
  { slug: "kashmiri-masala", name: "Kashmiri Masala", tagline: "Deep colour, gentle heat", group: "Curry & Masala", heatLevel: 2, accent: "#9E2A1A" },
  { slug: "wet-masala", name: "Wet Masala", tagline: "Fresh ground aromatic base", group: "Curry & Masala", heatLevel: 2, accent: "#7C8B2B" },
  { slug: "wet-biryani-masala", name: "Wet Biryani Masala", tagline: "Layered festive rice spice", group: "Signature", heatLevel: 3, accent: "#C98A2B" },
  { slug: "durban-special", name: "Durban Special", tagline: "That famous KZN fire", group: "Signature", heatLevel: 4, accent: "#9E1F0F" },
  { slug: "tandoori-special", name: "Tandoori Special", tagline: "Clay-oven crimson", group: "Curry & Masala", heatLevel: 2, accent: "#B33218" },
  { slug: "fine-ginger-garlic-masala", name: "Fine Ginger Garlic Masala", tagline: "The flavour foundation", group: "Everyday", heatLevel: 1, accent: "#9A7B3B" },
  { slug: "mutton-masala", name: "Mutton Masala", tagline: "For slow, rich lamb", group: "Curry & Masala", heatLevel: 3, accent: "#8A2A14" },
  { slug: "pickled-fish-masala", name: "Pickled Fish Masala", tagline: "Cape Malay Easter tradition", group: "Seafood", heatLevel: 2, accent: "#C99A2B" },
  { slug: "braising-spice", name: "Braising Spice", tagline: "The pot-starter blend", group: "Everyday", heatLevel: 1, accent: "#7A4B28" },
  { slug: "5-spice-whole", name: "5 Spice Whole", tagline: "Whole spices, ready to bloom", group: "Everyday", heatLevel: 0, accent: "#6B4A2E" },
];

export const SPICE_GROUPS: SpiceGroup[] = [
  "Everyday",
  "Curry & Masala",
  "Seafood",
  "Braai & Grill",
  "Signature",
];

export const spiceBySlug = (slug: string): Spice | undefined =>
  SPICES.find((s) => s.slug === slug);
