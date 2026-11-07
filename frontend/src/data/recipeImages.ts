/**
 * Curated high-resolution food photography from Unsplash for recipes.
 * Provides instant, reliable imagery matching dish titles, ingredients, and cuisines.
 */

export const RECIPE_IMAGE_CATALOG: Record<string, string> = {
  // 16 Indian Starter Recipes
  poha: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&auto=format&fit=crop&q=80',
  'dal-rice': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  'egg-bhurji': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
  'besan-chilla': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
  'curd-rice': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
  'vegetable-pulao': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
  'paneer-bhurji': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
  'oats-upma': 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&auto=format&fit=crop&q=80',
  'bread-omelette': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
  'aloo-sabzi': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
  'tomato-rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80',
  'masala-omelette': 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop&q=80',
  'anda-curry': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
  'palak-dal': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  'aloo-paratha': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80',
  'maggi-masala': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=80',
  'rajma-chawal': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  'chana-masala': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
  'paneer-butter-masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
  'butter-chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
  'chicken-curry': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
  'masala-dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
  'sambar': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  'lemon-rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80',
  'chicken-biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
  'dal-tadka': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  'palak-paneer': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
  'pav-bhaji': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&auto=format&fit=crop&q=80',
  'chole-bhature': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80',
  'kadai-paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
  'jeera-rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80',
  'dal-makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  'baingan-bharta': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
  'kheer': 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&auto=format&fit=crop&q=80',
};

// Keyword / dish type fallback photography
const KEYWORD_IMAGE_CATALOG: Array<{ pattern: RegExp; url: string }> = [
  { pattern: /poha/i, url: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&auto=format&fit=crop&q=80' },
  { pattern: /paratha|roti|naan|flatbread/i, url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80' },
  { pattern: /paneer/i, url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80' },
  { pattern: /curd rice|thayir/i, url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80' },
  { pattern: /bhurji|scramble/i, url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80' },
  { pattern: /omelette|omelet|egg/i, url: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop&q=80' },
  { pattern: /chilla|dosa|crepe|pancake/i, url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80' },
  { pattern: /upma|khichdi|porridge/i, url: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&auto=format&fit=crop&q=80' },
  { pattern: /biryani|pulao|fried rice/i, url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
  { pattern: /tomato rice/i, url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80' },
  { pattern: /dal|lentil|sambar|soup/i, url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80' },
  { pattern: /maggi|noodle|ramen|pasta/i, url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=80' },
  { pattern: /sabzi|curry|masala/i, url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80' },
  { pattern: /salad/i, url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80' },
  { pattern: /sandwich|toast|burger/i, url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80' },
  { pattern: /chicken|meat/i, url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80' },
  { pattern: /rice/i, url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80' },
];

export const DEFAULT_RECIPE_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';

export interface RecipeImageLookupTarget {
  image_url?: string | null;
  external_id?: string | null;
  title?: string | null;
  cuisine?: string | null;
}

/**
 * Returns a high-quality dish image URL for a given recipe.
 * Uses recipe.image_url if valid; otherwise resolves matching dish photo by external_id or title.
 */
export function getRecipeImageUrl(recipe?: RecipeImageLookupTarget | null): string {
  if (!recipe) return DEFAULT_RECIPE_IMAGE;

  // 1. If a valid URL is already provided, use it
  if (recipe.image_url && typeof recipe.image_url === 'string' && recipe.image_url.trim().length > 0) {
    const trimmed = recipe.image_url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
  }

  // 2. Direct lookup by external_id
  if (recipe.external_id && RECIPE_IMAGE_CATALOG[recipe.external_id]) {
    return RECIPE_IMAGE_CATALOG[recipe.external_id];
  }

  // 3. Match by recipe title keywords
  const title = (recipe.title || '').trim().toLowerCase();
  if (title) {
    // Check known IDs inside title
    for (const [key, url] of Object.entries(RECIPE_IMAGE_CATALOG)) {
      const normalizedKey = key.replace(/-/g, ' ');
      if (title.includes(normalizedKey) || title.includes(key)) {
        return url;
      }
    }

    // Pattern matches
    for (const { pattern, url } of KEYWORD_IMAGE_CATALOG) {
      if (pattern.test(title)) {
        return url;
      }
    }
  }

  // 4. Fallback to default gourmet food presentation
  return DEFAULT_RECIPE_IMAGE;
}
